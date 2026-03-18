# VcInputCurrency

A specialized currency input that combines locale-aware number formatting (grouping separators, decimal precision) with a dropdown for selecting the currency. Built on top of [vue-currency-input](https://dm4t2.github.io/vue-currency-input/) and [VcInputDropdown](../vc-input-dropdown/).

## When to Use

- Entering monetary values with currency selection (e.g., product prices, order totals, shipping costs)
- When locale-aware thousand separators and decimal formatting are needed
- When the user must be able to switch between currencies within the same field

**When NOT to use:**

- Plain numbers without formatting -- use [VcInput](../vc-input/) with `type="number"`
- Monetary values without currency selection -- use [VcInput](../vc-input/) with a prefix/suffix
- Selecting a currency without entering a value -- use [VcSelect](../vc-select/)

## Quick Start

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

## Features

### Dual v-model Binding

The component uses two `v-model` bindings:

- **`v-model`** (or `v-model:modelValue`) -- the numeric amount (type `number | null`)
- **`v-model:option`** -- the selected currency code (type `string`)

```vue
<VcInputCurrency
  v-model="amount"
  v-model:option="selectedCurrency"
  :options="currencyList"
  option-label="title"
  option-value="value"
  label="Total"
/>
```

The dropdown portion renders the available currencies. Use `optionLabel` and `optionValue` to map your data structure to display labels and values.

### Precision Control

The `precision` prop controls the number of decimal places (0--15). The formatting engine rounds and pads the value accordingly.

```vue
<!-- No decimals (e.g., JPY) -->
<VcInputCurrency v-model="amount" v-model:option="currency" :options="currencies" :precision="0" label="Amount (JPY)" />

<!-- Standard 2 decimals (default) -->
<VcInputCurrency v-model="amount" v-model:option="currency" :options="currencies" :precision="2" label="Amount (USD)" />

<!-- High precision (e.g., crypto or wholesale) -->
<VcInputCurrency v-model="amount" v-model:option="currency" :options="currencies" :precision="4" label="Unit price" />
```

> **Tip:** When switching currencies, consider updating `precision` dynamically. For example, JPY uses 0 decimals while USD uses 2.

### Currency Display Mode

The `currencyDisplay` prop controls how the currency symbol appears inside the input field:

| Value | Example | Description |
|-------|---------|-------------|
| `"hidden"` (default) | `1,234.56` | No currency symbol shown |
| `"symbol"` | `$1,234.56` | Locale currency symbol |
| `"code"` | `USD 1,234.56` | ISO currency code |
| `"name"` | `1,234.56 US dollars` | Full currency name |

```vue
<VcInputCurrency
  v-model="amount"
  v-model:option="currency"
  :options="currencies"
  currency-display="symbol"
  label="Price"
/>
```

### Prefix and Suffix

Add static text decorations before or after the input value:

```vue
<VcInputCurrency
  v-model="amount"
  v-model:option="currency"
  :options="currencies"
  prefix="$"
  label="Price with prefix"
/>

<VcInputCurrency
  v-model="amount"
  v-model:option="currency"
  :options="currencies"
  suffix="per unit"
  label="Unit price"
/>
```

### Validation with vee-validate Field

Connect to vee-validate for form-level validation:

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.price"
    name="price"
    rules="required|min_value:0.01"
  >
    <VcInputCurrency
      v-model="form.price"
      v-model:option="form.currency"
      label="Product price"
      :options="currencies"
      option-label="title"
      option-value="value"
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
import { VcInputCurrency } from "@vc-shell/framework";

const currencies = [
  { title: "USD", value: "USD" },
  { title: "EUR", value: "EUR" },
];

const form = reactive({
  price: null as number | null,
  currency: "USD",
});
</script>
```

### States

```vue
<!-- Required -->
<VcInputCurrency v-model="price" v-model:option="currency" :options="currencies" label="Price" required />

<!-- Disabled -->
<VcInputCurrency v-model="price" v-model:option="currency" :options="currencies" label="Price" disabled />

<!-- Loading -->
<VcInputCurrency v-model="price" v-model:option="currency" :options="currencies" label="Price" loading />

<!-- Clearable -->
<VcInputCurrency v-model="price" v-model:option="currency" :options="currencies" label="Price" clearable />

<!-- Error -->
<VcInputCurrency
  v-model="price"
  v-model:option="currency"
  :options="currencies"
  label="Price"
  :error="true"
  error-message="Please enter a valid amount"
/>
```

## Recipes

### Product Price Editor in a Blade

A common pattern in e-commerce blade forms:

```vue
<template>
  <VcBlade title="Edit Product">
    <VcContainer>
      <VcRow>
        <VcCol size="4">
          <Field
            v-slot="{ errorMessage, handleChange, errors }"
            :model-value="product.listPrice"
            name="listPrice"
            rules="required|min_value:0.01"
          >
            <VcInputCurrency
              v-model="product.listPrice"
              v-model:option="product.currency"
              label="List price"
              required
              :options="availableCurrencies"
              option-label="title"
              option-value="value"
              :precision="2"
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            />
          </Field>
        </VcCol>
        <VcCol size="4">
          <VcInputCurrency
            v-model="product.salePrice"
            v-model:option="product.currency"
            label="Sale price"
            :options="availableCurrencies"
            option-label="title"
            option-value="value"
            :precision="2"
            clearable
            hint="Leave empty for no discount"
          />
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>
```

### Searchable Currency Dropdown

When working with many currencies, enable the dropdown search:

```vue
<VcInputCurrency
  v-model="amount"
  v-model:option="currency"
  :options="allWorldCurrencies"
  option-label="name"
  option-value="code"
  searchable
  label="Payment amount"
/>
```

## Common Mistakes

### 1. Forgetting to wire handleChange with vee-validate

```vue
<!-- ❌ Validation never triggers -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.price" name="price" rules="required">
  <VcInputCurrency v-model="form.price" v-model:option="form.currency" :options="currencies"
    :error="!!errors.length" :error-message="errorMessage" />
</Field>

<!-- ✅ Always call handleChange -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.price" name="price" rules="required">
  <VcInputCurrency
    v-model="form.price"
    v-model:option="form.currency"
    :options="currencies"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 2. Binding a string instead of a number

```vue
<!-- ❌ modelValue must be number | null — string binding causes formatting issues -->
const price = ref("100.00");

<!-- ✅ Use a number ref -->
const price = ref<number | null>(100);
```

### 3. Trying to enter negative values

```vue
<!-- ❌ Negative values are blocked — minus key and "e" key are prevented -->
<!-- The component is designed for non-negative monetary values only -->

<!-- ✅ If you need negative values, use VcInput with type="number" instead -->
<VcInput v-model="adjustment" type="number" label="Price adjustment" />
```

> **Important:** The component blocks the minus key (`-`) and the exponential notation key (`e`) at the keyboard level. Pasting negative numbers is also prevented. This is intentional for currency inputs where negative values are not valid.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | -- | Numeric value via `v-model` |
| `option` | `string` | -- | Selected currency code via `v-model:option` |
| `options` | `unknown[]` | `[]` | Available currency options for the dropdown |
| `optionValue` | `string \| Function` | `"id"` | Property or function to extract the option value |
| `optionLabel` | `string \| Function` | `"title"` | Property or function to extract the option label |
| `precision` | `0-15` | `2` | Number of decimal places |
| `currencyDisplay` | `"symbol" \| "code" \| "name" \| "hidden"` | `"hidden"` | How the currency symbol is displayed |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | -- | Placeholder text |
| `hint` | `string` | -- | Helper text below the field |
| `tooltip` | `string` | -- | Tooltip on the label info icon |
| `prefix` | `string` | -- | Static text before the input value |
| `suffix` | `string` | -- | Static text after the input value |
| `clearable` | `boolean` | `false` | Shows a clear button |
| `loading` | `boolean` | `false` | Shows a spinning loader |
| `disabled` | `boolean` | `false` | Disables the entire component |
| `required` | `boolean` | `false` | Shows a required indicator |
| `error` | `boolean` | `false` | Enables error styling |
| `errorMessage` | `string` | -- | Error message below the field |
| `name` | `string` | -- | HTML name attribute |
| `autofocus` | `boolean` | `false` | Focus on mount |
| `maxlength` | `string \| number` | `1024` | Maximum input length |
| `debounce` | `string \| number` | `0` | Debounce for search input (ms) |
| `searchable` | `boolean` | `false` | Enable search in the currency dropdown |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:model-value` | `number \| null` | Emitted when the numeric value changes |
| `update:option` | `unknown` | Emitted when the currency selection changes |
| `change` | `number \| null` | Emitted on value change (alias) |
| `blur` | `Event` | Emitted when the input loses focus |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--input-curr-toggle-color` | `var(--primary-500)` | Dropdown toggle accent color |

Additionally inherits all `--input-*` CSS variables from VcInput/VcInputDropdown.

## Accessibility

- Inherits all accessibility features from VcInputDropdown and VcInput
- Keyboard: Tab navigates between the number input and the dropdown toggle
- Enter key in the input blurs the field and moves focus to the next tabbable element
- Negative values are blocked at the keyboard level (minus and "e" keys prevented)
- Pasting negative numbers is prevented

## Related Components

- [VcInputDropdown](../vc-input-dropdown/) -- the underlying composite input + dropdown component
- [VcInput](../vc-input/) -- plain input for non-currency numbers
- [VcSelect](../vc-select/) -- standalone dropdown selection
