# VcDatePicker

A date/datetime picker wrapping the VueDatePicker library with the standard form field chrome (label, hint, error, focus ring). Formats dates using the browser's locale.

## When to Use

- Selecting a date or date + time value
- When consistent locale-aware date formatting is needed
- When NOT to use: free-form text entry (use [VcInput](../vc-input/)), time-only input (use `VcInput` with `type="time"`)

> **Note:** `VcInput` with `type="date"` or `type="datetime-local"` automatically delegates to this component. You can also use `VcDatePicker` directly for more explicit control.

## Basic Usage

```vue
<template>
  <VcDatePicker v-model="date" label="Delivery date" placeholder="Pick a date..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcDatePicker } from "@vc-shell/framework";

const date = ref<Date | null>(null);
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Date \| string \| null` | `undefined` | Bound value via `v-model` |
| `type` | `"date" \| "datetime-local"` | `"date"` | Date only or date + time |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | auto (localized) | Placeholder text |
| `clearable` | `boolean` | `false` | Shows a clear button when a date is selected |
| `size` | `"default" \| "small"` | `"default"` | Field height variant |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and validation message |
| `datePickerOptions` | `VueDatePickerProps` | -- | Pass-through options to the underlying VueDatePicker |
| `disabled` | `boolean` | `false` | Disables the date picker |

## Common Patterns

### DateTime Picker

```vue
<VcDatePicker
  v-model="scheduledAt"
  type="datetime-local"
  label="Schedule"
  placeholder="Pick date and time..."
  clearable
/>
```

### With Validation

```vue
<VcDatePicker
  v-model="startDate"
  label="Start date"
  required
  :error="!startDate"
  error-message="Start date is required"
/>
```

### Custom Date Picker Options

```vue
<VcDatePicker
  v-model="date"
  label="Booking date"
  :date-picker-options="{ minDate: new Date(), noDisabledRange: true }"
/>
```

## Accessibility

- Label linked via `aria-labelledby`
- Hint/error linked via `aria-describedby`
- `aria-invalid` set in error state
- Clear button has `aria-label="Clear date"`
- On mobile, the picker teleports to center for better usability
- Auto-detects 12h/24h format from browser locale

## CSS Variables

Uses the same `--input-*` variables as VcInput for consistent styling across all input molecules.

## Related Components

- [VcInput](../vc-input/) -- general-purpose input (delegates to VcDatePicker for date types)
- [VcMultivalue](../vc-multivalue/) -- can handle multiple date values with `type="date"`
