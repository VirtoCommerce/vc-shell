# VcCheckbox

A checkbox component supporting boolean toggling, array-based multi-selection, indeterminate state, and three size variants.

## When to Use

- Single boolean toggle with an inline label (e.g., "I agree to terms")
- Multi-select from a set of options (bind an array to `v-model` with `value` prop)
- "Select all" patterns using the `indeterminate` prop
- When NOT to use: on/off feature toggle (use [VcSwitch](../vc-switch/)), mutually exclusive choices (use [VcRadioButton](../vc-radio-button/))

## Basic Usage

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

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| T[]` | `undefined` | Bound value via `v-model`. Boolean for single, array for multi-select |
| `value` | `T` | -- | Value added to the array when checked (multi-select mode) |
| `label` | `string` | -- | Label text displayed above the checkbox |
| `size` | `"s" \| "m" \| "l"` | `"s"` | Checkbox size (16px / 20px / 24px) |
| `indeterminate` | `boolean` | `false` | Shows the indeterminate (dash) state |
| `disabled` | `boolean` | `false` | Disables the checkbox |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and message |
| `required` | `boolean` | `false` | Shows required indicator |

## Common Patterns

### Multi-select Group

```vue
<VcInputGroup label="Delivery options">
  <VcCheckbox v-model="selected" value="courier">Courier delivery</VcCheckbox>
  <VcCheckbox v-model="selected" value="pickup">Store pickup</VcCheckbox>
  <VcCheckbox v-model="selected" value="postal">Postal service</VcCheckbox>
</VcInputGroup>
```

Where `selected` is `ref<string[]>([])`.

### Select All with Indeterminate

```vue
<VcCheckbox
  :model-value="allSelected"
  :indeterminate="someSelected && !allSelected"
  @update:model-value="toggleAll"
>
  Select all
</VcCheckbox>
```

### With Validation

```vue
<VcCheckbox
  v-model="accepted"
  required
  :error="!accepted"
  error-message="You must accept this checkbox"
>
  I accept the privacy policy
</VcCheckbox>
```

## Slots

| Slot | Description |
|------|-------------|
| `default` | Inline text/content next to the checkbox |
| `icon` | Replace the check/indeterminate icon |
| `error` | Custom error message markup |

## Accessibility

- Uses a native hidden `<input type="checkbox">` for form semantics
- `aria-invalid`, `aria-required`, `aria-describedby` set appropriately
- Focus ring on `:focus-visible` via the custom checkbox visual
- Keyboard: Space toggles, Tab navigates
- Animated check/indeterminate icon transitions

## CSS Variables

- `--checkbox-size-s` / `--checkbox-size-m` / `--checkbox-size-l` -- size variants
- `--checkbox-checked-bg-color`, `--checkbox-checked-border-color`
- `--checkbox-indeterminate-bg-color`, `--checkbox-indeterminate-line-color`
- `--checkbox-error-border-color`, `--checkbox-error-ring-color`
- `--checkbox-focus-ring-color`

## Related Components

- [VcSwitch](../vc-switch/) -- toggle switch for on/off settings
- [VcRadioButton](../vc-radio-button/) -- mutually exclusive single selection
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping checkboxes
