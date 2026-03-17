# VcSwitch

A toggle switch component for binary on/off choices. Renders as a sliding track with a thumb indicator.

## When to Use

- Toggling a feature or setting on/off (e.g., "Enable notifications")
- Any boolean preference that takes effect immediately
- When NOT to use: selecting from more than two options (use [VcRadioButton](../vc-radio-button/) group or [VcSelect](../vc-select/)), agreement checkboxes (use [VcCheckbox](../vc-checkbox/))

## Basic Usage

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

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| undefined` | -- | Bound value via `v-model` |
| `label` | `string` | -- | Label text above the switch |
| `hint` | `string` | -- | Helper text displayed below the switch |
| `labelTooltip` | `string` | -- | Tooltip on the label's info icon |
| `disabled` | `boolean` | `false` | Disables the switch |
| `error` / `errorMessage` | `boolean` / `string` | -- | Triggers error styling and validation message |
| `required` | `boolean` | `false` | Shows required indicator on the label |
| `trueValue` / `falseValue` | `boolean` | `true` / `false` | Allows inverting the checked/unchecked meaning |

> **Note:** The `tooltip` prop is deprecated. Use `hint` for text below the switch, or `labelTooltip` for the label info icon.

## Common Patterns

### In a Settings Form

```vue
<VcSwitch v-model="settings.darkMode" label="Dark mode" hint="Changes take effect immediately" />
<VcSwitch v-model="settings.notifications" label="Email notifications" />
```

### With Validation

```vue
<VcSwitch
  v-model="acceptTerms"
  label="Terms and conditions"
  required
  :error="!acceptTerms"
  error-message="You must accept the terms"
/>
```

## Accessibility

- Renders a native `<input type="checkbox">` with `role="switch"`
- `aria-checked` reflects the current state
- `aria-invalid` set when in error state
- `aria-required` and `aria-describedby` for hints/errors
- Keyboard: Space/Enter toggles the switch, Tab navigates, focus ring on `:focus-visible`

## CSS Variables

- `--switch-width` / `--switch-height` -- track dimensions
- `--switch-active-color`, `--switch-inactive-color` -- track colors
- `--switch-thumb-color`, `--switch-thumb-shadow` -- thumb appearance
- `--switch-focus-ring-color`, `--switch-error-ring-color`

## Related Components

- [VcCheckbox](../vc-checkbox/) -- for checkboxes and checkbox groups
- [VcRadioButton](../vc-radio-button/) -- for mutually exclusive choices
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping form controls
