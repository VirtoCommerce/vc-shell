# VcCheckbox

A checkbox component supporting boolean toggling, array-based multi-selection, indeterminate state, three size variants, and animated check/uncheck transitions. Works as both a standalone boolean toggle and a member of a multi-select group.

## When to Use

- Single boolean toggle with an inline label (e.g., "I agree to terms")
- Multi-select from a set of options (bind an array to `v-model` with a `value` prop)
- "Select all" patterns using the `indeterminate` prop
- Table row selection indicators

**When NOT to use:**

- On/off feature toggle that applies immediately -- use [VcSwitch](../vc-switch/)
- Mutually exclusive single choice -- use [VcRadioButton](../vc-radio-button/)

## Quick Start

```vue
<template>
  <VcCheckbox v-model="agreed">I agree to the terms and conditions</VcCheckbox>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckbox } from "@vc-shell/framework";

const agreed = ref(false);
</script>
```

## Features

### Boolean Mode vs. Array Mode

**Boolean mode** -- bind a `boolean` ref to `v-model`. The checkbox toggles between `trueValue` (default `true`) and `falseValue` (default `false`).

```vue
<VcCheckbox v-model="isActive">Active</VcCheckbox>
```

**Array mode** -- bind an array ref to `v-model` and provide a `value` prop. Checking adds the value to the array; unchecking removes it.

```vue
<script setup lang="ts">
import { ref } from "vue";
const selected = ref<string[]>([]);
</script>

<template>
  <VcCheckbox v-model="selected" value="express">Express shipping</VcCheckbox>
  <VcCheckbox v-model="selected" value="insurance">Shipping insurance</VcCheckbox>
  <VcCheckbox v-model="selected" value="gift">Gift wrapping</VcCheckbox>
  <!-- selected.value might be ["express", "gift"] -->
</template>
```

### Size Variants

Three sizes are available via the `size` prop:

| Size | Value | Pixel dimension |
|------|-------|-----------------|
| Small | `"s"` (default) | 16 x 16 px |
| Medium | `"m"` | 20 x 20 px |
| Large | `"l"` | 24 x 24 px |

```vue
<VcCheckbox v-model="val" size="s">Small checkbox</VcCheckbox>
<VcCheckbox v-model="val" size="m">Medium checkbox</VcCheckbox>
<VcCheckbox v-model="val" size="l">Large checkbox</VcCheckbox>
```

### Indeterminate State (Select All)

The `indeterminate` prop renders a horizontal dash instead of a checkmark. This is commonly used for "select all" checkboxes where only some children are selected.

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const allOptions = ["A", "B", "C"];
const selected = ref<string[]>(["A"]);

const allSelected = computed(() => selected.value.length === allOptions.length);
const someSelected = computed(() => selected.value.length > 0 && !allSelected.value);

function toggleAll(checked: boolean) {
  selected.value = checked ? [...allOptions] : [];
}
</script>

<template>
  <VcCheckbox
    :model-value="allSelected"
    :indeterminate="someSelected"
    @update:model-value="toggleAll"
  >
    Select all
  </VcCheckbox>

  <VcCheckbox v-model="selected" value="A">Option A</VcCheckbox>
  <VcCheckbox v-model="selected" value="B">Option B</VcCheckbox>
  <VcCheckbox v-model="selected" value="C">Option C</VcCheckbox>
</template>
```

> **Tip:** The `indeterminate` state is visual only -- it does not affect the `modelValue`. The native `<input>` element's `indeterminate` property is set programmatically via a watcher.

### Validation with vee-validate Field

Connect the checkbox to vee-validate for form validation:

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.acceptPrivacy"
    name="acceptPrivacy"
    :rules="(val: boolean) => val === true || 'You must accept the privacy policy'"
  >
    <VcCheckbox
      v-model="form.acceptPrivacy"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    >
      I accept the privacy policy
    </VcCheckbox>
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcCheckbox } from "@vc-shell/framework";

const form = reactive({
  acceptPrivacy: false,
});
</script>
```

### States

```vue
<!-- Required without a label (asterisk shown inline) -->
<VcCheckbox v-model="val" required>Accept terms</VcCheckbox>

<!-- Required with a label (asterisk shown on label) -->
<VcCheckbox v-model="val" label="Agreement" required>I agree to the terms</VcCheckbox>

<!-- Disabled -->
<VcCheckbox :model-value="true" disabled>Cannot be changed</VcCheckbox>

<!-- Error -->
<VcCheckbox
  v-model="val"
  :error="true"
  error-message="This field is required"
>
  I have read the disclaimer
</VcCheckbox>
```

## Recipes

### Multi-select Group with VcInputGroup

Use `VcInputGroup` to add a shared label and semantic grouping:

```vue
<template>
  <VcInputGroup label="Delivery options">
    <VcCheckbox v-model="deliveryOptions" value="courier">Courier delivery</VcCheckbox>
    <VcCheckbox v-model="deliveryOptions" value="pickup">Store pickup</VcCheckbox>
    <VcCheckbox v-model="deliveryOptions" value="postal">Postal service</VcCheckbox>
  </VcInputGroup>
</template>

<script setup lang="ts">
import { ref } from "vue";
const deliveryOptions = ref<string[]>([]);
</script>
```

### Custom Content in the Default Slot

The default slot accepts any markup, not just plain text:

```vue
<VcCheckbox v-model="premiumPlan" size="m">
  <div>
    <span class="tw-font-bold">Premium Plan</span>
    <p class="tw-text-sm tw-text-[color:var(--neutrals-500)]">
      Includes priority support and advanced analytics
    </p>
  </div>
</VcCheckbox>
```

## Common Mistakes

### 1. Forgetting to wire handleChange with vee-validate

```vue
<!-- ❌ Validation never triggers -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.agree" name="agree">
  <VcCheckbox v-model="form.agree" :error="!!errors.length" :error-message="errorMessage">
    I agree
  </VcCheckbox>
</Field>

<!-- ✅ Always call handleChange -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.agree" name="agree">
  <VcCheckbox
    v-model="form.agree"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  >
    I agree
  </VcCheckbox>
</Field>
```

### 2. Using boolean mode when array mode is needed

```vue
<!-- ❌ Multiple checkboxes all toggle the same boolean -->
const val = ref(false);
<VcCheckbox v-model="val">Option A</VcCheckbox>
<VcCheckbox v-model="val">Option B</VcCheckbox>

<!-- ✅ Use an array ref and provide value props -->
const selected = ref<string[]>([]);
<VcCheckbox v-model="selected" value="a">Option A</VcCheckbox>
<VcCheckbox v-model="selected" value="b">Option B</VcCheckbox>
```

### 3. Controlling indeterminate without managing modelValue separately

```vue
<!-- ❌ indeterminate is visual-only; clicking sets modelValue to true/false, not "indeterminate" -->
<VcCheckbox v-model="val" indeterminate>Select all</VcCheckbox>

<!-- ✅ Use a computed + handler to manage the select-all logic -->
<VcCheckbox
  :model-value="allSelected"
  :indeterminate="someSelected && !allSelected"
  @update:model-value="toggleAll"
>
  Select all
</VcCheckbox>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| T[]` | `undefined` | Bound value via `v-model`. Boolean for single, array for multi-select. |
| `value` | `T` | -- | Value added to the array when checked (array mode only) |
| `label` | `string` | -- | Label text displayed above the checkbox |
| `tooltip` | `string` | -- | Tooltip on the label info icon |
| `size` | `"s" \| "m" \| "l"` | `"s"` | Checkbox size variant |
| `indeterminate` | `boolean` | `false` | Shows the indeterminate (dash) visual state |
| `trueValue` | `boolean` | `true` | Value emitted when checked (boolean mode) |
| `falseValue` | `boolean` | `false` | Value emitted when unchecked (boolean mode) |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `required` | `boolean` | `false` | Shows a required indicator |
| `error` | `boolean` | `false` | Enables error styling |
| `errorMessage` | `string` | -- | Error message displayed below the checkbox |
| `name` | `string` | `"Field"` | HTML name attribute |
| `outline` | `boolean` | `false` | Applies outline style variant |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean \| T[]` | Emitted when the checkbox is toggled |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Inline text or content displayed next to the checkbox |
| `icon` | Replace the check/indeterminate icon with custom markup |
| `error` | Custom error message markup |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--checkbox-size-s` | `16px` | Small variant size |
| `--checkbox-size-m` | `20px` | Medium variant size |
| `--checkbox-size-l` | `24px` | Large variant size |
| `--checkbox-border-color` | `var(--neutrals-300)` | Default border color |
| `--checkbox-border-color-hover` | `var(--neutrals-400)` | Border color on hover |
| `--checkbox-bg-color` | `var(--additional-50)` | Unchecked background |
| `--checkbox-checked-bg-color` | `var(--primary-500)` | Checked background color |
| `--checkbox-checked-border-color` | `var(--primary-500)` | Checked border color |
| `--checkbox-indeterminate-bg-color` | `var(--primary-500)` | Indeterminate background |
| `--checkbox-indeterminate-line-color` | `var(--additional-50)` | Indeterminate dash color |
| `--checkbox-error-border-color` | `var(--danger-500)` | Error state border |
| `--checkbox-error-ring-color` | `var(--danger-100)` | Error ring color |
| `--checkbox-focus-ring-color` | `var(--primary-100)` | Focus ring color |
| `--checkbox-border-radius` | `4px` | Corner radius |
| `--checkbox-disabled-opacity` | `0.5` | Opacity when disabled |
| `--checkbox-transition-duration` | `200ms` | Animation duration |

## Accessibility

- Uses a native hidden `<input type="checkbox">` for full form semantics
- `aria-invalid`, `aria-required`, and `aria-describedby` are set appropriately
- Focus ring appears on `:focus-visible` via the custom checkbox visual
- Keyboard: Space toggles the checkbox, Tab navigates between fields
- Check and indeterminate icons have animated enter/leave transitions
- When `indeterminate` is set, the native `input.indeterminate` property is synced

## Related Components

- [VcSwitch](../vc-switch/) -- toggle switch for on/off settings
- [VcRadioButton](../vc-radio-button/) -- mutually exclusive single selection
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping checkboxes or radio buttons

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component renders a skeleton placeholder matching its shape — a control indicator and label block. No configuration needed.

