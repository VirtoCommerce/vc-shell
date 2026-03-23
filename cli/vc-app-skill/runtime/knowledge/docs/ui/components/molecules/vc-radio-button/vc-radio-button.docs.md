# VcRadioButton

A radio button component for selecting a single option from a group. Supports string, number, and boolean value types.

## Overview

Radio buttons are the standard UI pattern for selecting exactly one option from a small, visible set. Unlike dropdowns (VcSelect), radio buttons show all options simultaneously, making them ideal when there are 2-6 choices and the user benefits from seeing everything at once.

`VcRadioButton` renders a styled native `<input type="radio">` with custom CSS, ensuring full keyboard accessibility and screen reader support while matching the vc-shell design system. Multiple radio buttons sharing the same `v-model` and `name` attribute form a group where only one can be selected at a time.

The component also supports a `binary` mode for simple true/false toggles, where clicking the radio button toggles between `true` and `false` instead of comparing against a fixed `value`.

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

Wrap radio buttons in a `VcInputGroup` with horizontal orientation for inline display:

```vue
<VcInputGroup label="Size" role="radiogroup" orientation="horizontal">
  <VcRadioButton v-model="size" value="S" label="Small" name="size" />
  <VcRadioButton v-model="size" value="M" label="Medium" name="size" />
  <VcRadioButton v-model="size" value="L" label="Large" name="size" />
</VcInputGroup>
```

### With Numeric Values

```vue
<template>
  <VcInputGroup label="Priority" role="radiogroup">
    <VcRadioButton v-model="priority" :value="1" label="Low" name="priority" />
    <VcRadioButton v-model="priority" :value="2" label="Medium" name="priority" />
    <VcRadioButton v-model="priority" :value="3" label="High" name="priority" />
  </VcInputGroup>
</template>

<script setup lang="ts">
const priority = ref(2);
</script>
```

### Binary Mode

In binary mode, clicking toggles between `true` and `false` rather than comparing to a `value`. This is useful for standalone boolean options:

```vue
<VcRadioButton v-model="accepted" :binary="true" label="I accept the terms" />
```

### With Validation Error

```vue
<VcInputGroup label="Payment Method" role="radiogroup">
  <VcRadioButton
    v-model="payment"
    value="card"
    label="Credit Card"
    name="payment"
    :error="!!validationError"
  />
  <VcRadioButton
    v-model="payment"
    value="bank"
    label="Bank Transfer"
    name="payment"
    :error="!!validationError"
    :error-message="validationError"
  />
</VcInputGroup>
```

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

## Tip: Always Set the name Attribute

All radio buttons in the same group must share the same `name` attribute. This is required for native keyboard navigation (arrow keys) and form semantics. Without a shared `name`, arrow keys will not move between options:

```vue
<!-- Good: same name groups them -->
<VcRadioButton v-model="size" value="S" label="Small" name="size" />
<VcRadioButton v-model="size" value="M" label="Medium" name="size" />

<!-- Bad: missing name means no keyboard group navigation -->
<VcRadioButton v-model="size" value="S" label="Small" />
<VcRadioButton v-model="size" value="M" label="Medium" />
```

## Common Mistake

Do not mix `binary` mode with regular `value` comparison in the same group. Binary mode toggles a boolean, while normal mode compares against a specific value. Using both in one group produces unpredictable behavior:

```vue
<!-- Bad: mixing binary and value modes -->
<VcRadioButton v-model="choice" :binary="true" label="Yes" name="choice" />
<VcRadioButton v-model="choice" value="no" label="No" name="choice" />

<!-- Good: all use value mode -->
<VcRadioButton v-model="choice" value="yes" label="Yes" name="choice" />
<VcRadioButton v-model="choice" value="no" label="No" name="choice" />
```

## Related Components

- [VcCheckbox](../vc-checkbox/) -- for multi-select or boolean toggles
- [VcSwitch](../vc-switch/) -- for on/off toggles
- [VcInputGroup](../vc-input-group/) -- semantic wrapper with `role="radiogroup"`
- [VcSelect](../vc-select/) -- dropdown for larger option sets
