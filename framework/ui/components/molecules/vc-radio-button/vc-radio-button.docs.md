# VcRadioButton

A radio button component for selecting a single option from a group. Supports string, number, and boolean value types.

## When to Use

- Choosing exactly one option from a small set (2-6 options)
- When the user needs to see all options at once
- When NOT to use: many options (use [VcSelect](../vc-select/)), multi-select (use [VcCheckbox](../vc-checkbox/) group), on/off toggle (use [VcSwitch](../vc-switch/))

## Basic Usage

```vue
<template>
  <VcInputGroup label="Shipping method" role="radiogroup">
    <VcRadioButton v-model="method" value="standard" label="Standard" name="shipping" />
    <VcRadioButton v-model="method" value="express" label="Express" name="shipping" />
    <VcRadioButton v-model="method" value="overnight" label="Overnight" name="shipping" />
  </VcInputGroup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRadioButton, VcInputGroup } from "@vc-shell/framework";

const method = ref("standard");
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T` | `undefined` | Bound value via `v-model` (shared across the group) |
| `value` | `T` | -- | This radio button's value. Selected when `modelValue === value` |
| `label` | `string` | -- | Text label next to the radio circle |
| `name` | `string` | `"RadioField"` | HTML `name` attribute (must be shared within a group) |
| `binary` | `boolean` | `false` | Enables boolean toggle mode (clicking toggles `true`/`false`) |
| `disabled` | `boolean` | `false` | Disables this radio button |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and message |

## Common Patterns

### Horizontal Layout

```vue
<VcInputGroup label="Size" role="radiogroup" orientation="horizontal">
  <VcRadioButton v-model="size" value="S" label="Small" name="size" />
  <VcRadioButton v-model="size" value="M" label="Medium" name="size" />
  <VcRadioButton v-model="size" value="L" label="Large" name="size" />
</VcInputGroup>
```

### Binary Mode

```vue
<VcRadioButton v-model="accepted" :binary="true" label="I accept the terms" />
```

In binary mode, clicking toggles between `true` and `false` rather than comparing to a `value`.

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error message markup |

## Accessibility

- Uses a native `<input type="radio">` with custom CSS styling
- `aria-invalid`, `aria-required`, `aria-describedby` set appropriately
- Focus ring on `:focus-visible`
- Keyboard: Arrow keys navigate within a group (same `name`), Space selects

## CSS Variables

- `--radio-size` / `--radio-dot-size` -- circle and dot dimensions
- `--radio-border-color`, `--radio-active` -- border and selected colors
- `--radio-focus-ring-color`, `--radio-error-ring-color`
- `--radio-disabled-opacity`

## Related Components

- [VcCheckbox](../vc-checkbox/) -- for multi-select or boolean toggles
- [VcSwitch](../vc-switch/) -- for on/off toggles
- [VcInputGroup](../vc-input-group/) -- semantic wrapper with `role="radiogroup"`
- [VcSelect](../vc-select/) -- dropdown for larger option sets
