# VcInputGroup

A semantic `<fieldset>` wrapper that groups related form controls under a shared label, error state, and ARIA context. Propagates `disabled` and `name` to child controls via provide/inject.

## When to Use

- Grouping related form fields with a shared section label (e.g., "Billing details", "Shipping address")
- Wrapping radio buttons with `role="radiogroup"` for proper semantics
- Wrapping a set of checkboxes under a shared label
- Applying group-level disabled or error state
- When NOT to use: a single standalone field (use the field's own `label`), layout-only wrapping (use plain `<div>`)

## Basic Usage

```vue
<template>
  <VcInputGroup label="Customer profile" hint="All fields in this section are related">
    <VcInput v-model="firstName" label="First name" />
    <VcInput v-model="lastName" label="Last name" />
  </VcInputGroup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInputGroup, VcInput } from "@vc-shell/framework";

const firstName = ref("");
const lastName = ref("");
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Group label rendered as a `<legend>` |
| `tooltip` | `string` | -- | Tooltip on the label's info icon |
| `hint` | `string` | -- | Helper text below the group |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction for child controls |
| `role` | `"group" \| "radiogroup"` | `"group"` | ARIA role for the fieldset |
| `disabled` | `boolean` | `false` | Disables all controls in the group |
| `error` / `errorMessage` | `boolean` / `string` | -- | Group-level error styling and message |
| `required` | `boolean` | `false` | Shows required indicator on the label |
| `name` | `string` | -- | Shared `name` propagated to child controls |

## Common Patterns

### Radio Group

```vue
<VcInputGroup label="Payment method" role="radiogroup" orientation="horizontal" name="payment">
  <VcRadioButton v-model="payment" value="card" label="Card" />
  <VcRadioButton v-model="payment" value="invoice" label="Invoice" />
  <VcRadioButton v-model="payment" value="cash" label="Cash" />
</VcInputGroup>
```

### Checkbox Group with Error

```vue
<VcInputGroup
  label="Features"
  :error="selectedFeatures.length === 0"
  error-message="Select at least one feature"
>
  <VcCheckbox v-model="selectedFeatures" value="search">Search</VcCheckbox>
  <VcCheckbox v-model="selectedFeatures" value="filters">Filters</VcCheckbox>
  <VcCheckbox v-model="selectedFeatures" value="export">Export</VcCheckbox>
</VcInputGroup>
```

### Horizontal Input Layout

```vue
<VcInputGroup label="Dimensions" orientation="horizontal">
  <VcInput v-model="width" label="Width" type="number" />
  <VcInput v-model="height" label="Height" type="number" />
</VcInputGroup>
```

## Slots

| Slot | Description |
|------|-------------|
| `default` | The grouped form controls |
| `error` | Custom error message markup |
| `hint` | Custom hint text markup |

## Accessibility

- Renders a native `<fieldset>` with `<legend>` for screen readers
- `aria-labelledby` on the fieldset points to the legend
- `aria-describedby` links to hint or error text
- `aria-invalid` set when the group is in error state
- `disabled` attribute on `<fieldset>` natively disables all form controls inside

## CSS Variables

- `--input-group-gap` -- vertical gap between controls
- `--input-group-horizontal-gap` -- horizontal gap in horizontal orientation
- `--input-group-legend-spacing` -- space below the legend

## Related Components

- [VcCheckbox](../vc-checkbox/) -- checkbox controls to group
- [VcRadioButton](../vc-radio-button/) -- radio buttons to group
- [VcInput](../vc-input/) -- text inputs to group
- [VcSelect](../vc-select/) -- selects to group
