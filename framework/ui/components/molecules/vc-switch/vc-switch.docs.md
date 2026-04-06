# VcSwitch

A toggle switch component for binary on/off choices. Renders as a sliding track with a thumb indicator and supports labels, hints, validation, and value inversion.

## When to Use

- Toggling a feature or setting on/off (e.g., "Enable notifications", "Publish product")
- Any boolean preference that takes effect immediately or on form save
- Settings panels where multiple toggles are listed vertically

**When NOT to use:**

- Selecting from more than two options -- use [VcRadioButton](../vc-radio-button/) or [VcSelect](../vc-select/)
- Agreement checkboxes where the user must actively check a box -- use [VcCheckbox](../vc-checkbox/)
- Tri-state or indeterminate logic -- use [VcCheckbox](../vc-checkbox/) with `indeterminate`

## Quick Start

```vue
<template>
  <VcSwitch v-model="isEnabled" label="Enable feature" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSwitch } from "@vc-shell/framework";

const isEnabled = ref(false);
</script>
```

## Features

### Label and Hint Text

The `label` prop renders text above the switch. Use `hint` for helper text below the track, and `labelTooltip` for an info icon on the label itself.

```vue
<VcSwitch
  v-model="settings.darkMode"
  label="Dark mode"
  hint="Changes take effect immediately"
  label-tooltip="Applies to the admin panel only"
/>
```

> **Important:** The `tooltip` prop is deprecated. It previously rendered as hint text below the switch (not as a true tooltip). Use `hint` for text below the switch, or `labelTooltip` for the label info icon. A console warning is emitted in development mode if `tooltip` is used.

### Value Inversion with trueValue / falseValue

By default, `v-model` maps `true` to the checked (on) state and `false` to unchecked (off). The `trueValue` and `falseValue` props let you invert the mapping when your data model uses opposite semantics.

```vue
<!-- Data model: isHidden=true means the item is NOT visible -->
<VcSwitch
  v-model="product.isHidden"
  label="Visible on storefront"
  :true-value="false"
  :false-value="true"
/>
```

When `trueValue` is `false`, the switch shows as "on" when `modelValue` is `false`, which lets you present affirmative labels ("Visible") even when the underlying boolean is negative ("isHidden").

### Validation with vee-validate Field

Use vee-validate's `Field` component to integrate the switch with form validation:

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.acceptTerms"
    name="acceptTerms"
    :rules="(val: boolean) => val === true || 'You must accept the terms'"
  >
    <VcSwitch
      v-model="form.acceptTerms"
      label="Terms and conditions"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcSwitch } from "@vc-shell/framework";

const form = reactive({
  acceptTerms: false,
});
</script>
```

### States

```vue
<!-- Required field -->
<VcSwitch v-model="value" label="Enable feature" required />

<!-- Disabled (on) -->
<VcSwitch :model-value="true" label="Locked setting" disabled />

<!-- Disabled (off) -->
<VcSwitch :model-value="false" label="Unavailable feature" disabled />

<!-- Error state -->
<VcSwitch
  v-model="value"
  label="Accept terms"
  :error="true"
  error-message="You must accept the terms"
/>
```

### In a Settings Form

Switches work well stacked in settings panels:

```vue
<template>
  <VcContainer>
    <VcRow>
      <VcCol size="6">
        <div class="tw-space-y-4">
          <VcSwitch v-model="settings.emailNotifications" label="Email notifications" />
          <VcSwitch v-model="settings.pushNotifications" label="Push notifications" />
          <VcSwitch
            v-model="settings.marketingEmails"
            label="Marketing emails"
            hint="Receive news about promotions and updates"
          />
          <VcSwitch v-model="settings.twoFactorAuth" label="Two-factor authentication" />
        </div>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>
```

## Recipes

### Feature Flag Toggle in a Module Settings Blade

```vue
<template>
  <VcBlade title="Module Settings">
    <VcContainer>
      <VcRow>
        <VcCol size="6">
          <VcSwitch
            v-model="config.enableReviews"
            label="Product reviews"
            hint="Allow customers to leave reviews on product pages"
          />
        </VcCol>
        <VcCol size="6">
          <VcSwitch
            v-model="config.moderateReviews"
            label="Moderate before publishing"
            hint="Reviews require admin approval before they appear"
            :disabled="!config.enableReviews"
          />
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>
```

### Conditional Field Visibility

Use a switch to show or hide additional fields dynamically:

```vue
<VcSwitch v-model="hasExpiration" label="Set expiration date" />

<VcDatePicker
  v-if="hasExpiration"
  v-model="expirationDate"
  label="Expiration date"
  required
/>
```

## Common Mistakes

### 1. Forgetting to wire handleChange with vee-validate

```vue
<!-- ❌ Validation never triggers — Field does not track the change -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.agree" name="agree" rules="required">
  <VcSwitch v-model="form.agree" :error="!!errors.length" :error-message="errorMessage" />
</Field>

<!-- ✅ Always call handleChange so the Field knows about updates -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.agree" name="agree" rules="required">
  <VcSwitch
    v-model="form.agree"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 2. Using the deprecated tooltip prop for hint text

```vue
<!-- ❌ Deprecated — will emit a console warning in dev mode -->
<VcSwitch v-model="value" label="Feature" tooltip="This enables the feature" />

<!-- ✅ Use hint for text below the switch -->
<VcSwitch v-model="value" label="Feature" hint="This enables the feature" />

<!-- ✅ Use labelTooltip for the label info icon -->
<VcSwitch v-model="value" label="Feature" label-tooltip="This enables the feature" />
```

### 3. Binding a non-boolean value

```vue
<!-- ❌ Will not toggle correctly — modelValue must be boolean -->
const status = ref("active");
<VcSwitch v-model="status" label="Active" />

<!-- ✅ Use a boolean ref -->
const isActive = ref(true);
<VcSwitch v-model="isActive" label="Active" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| undefined` | -- | Bound value via `v-model` |
| `label` | `string` | -- | Label text above the switch |
| `hint` | `string` | -- | Helper text displayed below the switch |
| `labelTooltip` | `string` | -- | Tooltip shown on the label info icon |
| `tooltip` | `string` | -- | **Deprecated.** Use `hint` or `labelTooltip` instead |
| `trueValue` | `boolean` | `true` | Value that represents the checked state |
| `falseValue` | `boolean` | `false` | Value that represents the unchecked state |
| `disabled` | `boolean` | `false` | Disables the switch |
| `required` | `boolean` | `false` | Shows a required indicator on the label |
| `error` | `boolean` | `false` | Enables error styling |
| `errorMessage` | `string` | -- | Error message displayed below the switch |
| `name` | `string` | -- | HTML name attribute for the hidden input |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean \| undefined` | Emitted when the switch is toggled |

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error message markup. Replaces the default `VcHint` error. |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--switch-width` | `36px` | Track width |
| `--switch-height` | `20px` | Track height |
| `--switch-thumb-size` | `16px` | Thumb diameter |
| `--switch-translate` | `16px` | Thumb travel distance when checked |
| `--switch-active-color` | `var(--primary-500)` | Track color when checked |
| `--switch-inactive-color` | `var(--neutrals-300)` | Track color when unchecked |
| `--switch-hover-active-color` | `var(--primary-600)` | Hover track color when checked |
| `--switch-hover-inactive-color` | `var(--neutrals-400)` | Hover track color when unchecked |
| `--switch-thumb-color` | `var(--additional-50)` | Thumb background color |
| `--switch-thumb-shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Thumb box shadow |
| `--switch-focus-ring-color` | `var(--primary-100)` | Focus ring color |
| `--switch-error-ring-color` | `var(--danger-100)` | Error ring color |
| `--switch-error-border-color` | `var(--danger-500)` | Error border color |
| `--switch-border-radius` | `9999px` | Track border radius |
| `--switch-disabled-opacity` | `0.5` | Opacity when disabled |

## Accessibility

- Renders a native `<input type="checkbox">` with `role="switch"`
- `aria-checked` reflects the current state
- `aria-invalid` is set when in error state
- `aria-required` is set for required fields
- `aria-describedby` links to hint and error elements
- Keyboard: Space or Enter toggles the switch, Tab navigates focus
- Focus ring appears on `:focus-visible` only (not on mouse click)
- Disabled state applies `pointer-events: none` and reduced opacity

## Related Components

- [VcCheckbox](../vc-checkbox/) -- for checkboxes and checkbox groups
- [VcRadioButton](../vc-radio-button/) -- for mutually exclusive choices
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping form controls

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component renders a skeleton placeholder matching its shape — a control indicator and label block. No configuration needed.

