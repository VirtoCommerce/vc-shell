# VcInputCurrency

A specialized currency input that combines locale-aware number formatting (grouping separators, decimal precision) with a dropdown for selecting the currency. Built on top of `vue-currency-input` and `VcInputDropdown`.

## When to Use

- Entering monetary values with currency selection (e.g., product prices, order totals)
- When locale-aware thousand separators and decimal formatting are needed
- When NOT to use: plain numbers without formatting (use [VcInput](../vc-input/) with `type="number"`), values without currency selection (use [VcInput](../vc-input/))

## Basic Usage

```vue
<template>
  <VcInputCurrency
    v-model="price"
    v-model:option="currency"
    label="Price"
    placeholder="Enter amount"
    :options="currencies"
    option-label="title"
    option-value="value"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInputCurrency } from "@vc-shell/framework";

const price = ref<number | null>(0);
const currency = ref("USD");
const currencies = [
  { title: "USD", value: "USD" },
  { title: "EUR", value: "EUR" },
  { title: "GBP", value: "GBP" },
];
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | -- | Numeric value via `v-model` |
| `option` | `string` | -- | Selected currency code via `v-model:option` |
| `options` | `unknown[]` | `[]` | Available currency options for the dropdown |
| `optionValue` / `optionLabel` | `string \| Function` | `"id"` / `"title"` | Option value/label property |
| `precision` | `0-15` | `2` | Number of decimal places |
| `currencyDisplay` | `"symbol" \| "code" \| "name" \| "hidden"` | `"hidden"` | How the currency symbol is displayed in the input |
| `clearable` | `boolean` | `false` | Shows a clear button |
| `prefix` / `suffix` | `string` | -- | Static text decorations |

## Common Patterns

### With Different Precisions

```vue
<VcInputCurrency
  v-model="amount"
  v-model:option="currency"
  label="Amount (no decimals)"
  :options="currencies"
  :precision="0"
/>
```

### With Validation

```vue
<VcInputCurrency
  v-model="price"
  v-model:option="currency"
  label="Product price"
  :options="currencies"
  required
  :error="price === null"
  error-message="Price is required"
/>
```

## Accessibility

- Inherits all accessibility features from VcInputDropdown and VcInput
- Keyboard: Tab navigates between input and dropdown toggle, Enter moves to next field
- Negative values are blocked (minus key prevented)

## Related Components

- [VcInputDropdown](../vc-input-dropdown/) -- the underlying composite component
- [VcInput](../vc-input/) -- plain input for non-currency numbers
- [VcSelect](../vc-select/) -- standalone dropdown selection
