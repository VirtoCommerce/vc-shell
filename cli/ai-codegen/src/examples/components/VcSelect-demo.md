---
id: component-VcSelect-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","select","dropdown","form","input"]
title: "VcSelect Demo"
description: "Dropdown select component for forms with search and async support"
componentRole: form-input
bladeContext: ["details"]
---

# VcSelect Demo

Real-world select examples from vendor-portal. Always use with `Field` from vee-validate for forms!

> Slot scope reminder: `#option` exposes `{ opt, index, selected, toggleOption }` (use `opt`, **not** `option`).

## Basic Select with Validation

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    rules="required"
    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE')"
    :model-value="offer.productType"
    name="productType"
  >
    <VcSelect
      v-model="offer.productType"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE')"
      required
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.PLACEHOLDER')"
      :disabled="!!offer.id"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="productTypeOptions"
      :tooltip="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TOOLTIP')"
      option-value="value"
      option-label="label"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { Field } from "vee-validate";

const productTypeOptions = ref([
  { label: "Physical", value: "Physical" },
  { label: "Digital", value: "Digital" },
]);
</script>
```

## Searchable Select with Custom Templates

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
    :model-value="offer.productId"
    name="product"
    rules="required"
  >
    <VcSelect
      v-model="offer.productId"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.TITLE')"
      required
      searchable
      :loading="fetchProductsLoading"
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT.PLACEHOLDER')"
      :options="fetchProducts"
      option-value="id"
      option-label="name"
      :disabled="!!props.param"
      :error="!!errors.length"
      :error-message="errorMessage"
      :clearable="false"
      @update:model-value="
        (e) => {
          handleChange(e);
          getProductItem();
        }
      "
    >
      <!-- Custom template for selected item -->
      <template #selected-item="{ opt }">
        <ProductSelectTemplate
          :opt="opt"
          slot-name="selected-item"
        />
      </template>
      
      <!-- Custom template for dropdown options -->
      <template #option="{ opt }">
        <ProductSelectTemplate
          :opt="opt"
          slot-name="option"
        />
      </template>
    </VcSelect>
  </Field>
</template>

<script setup lang="ts">
const fetchProductsLoading = ref(false);

async function fetchProducts(keyword?: string) {
  fetchProductsLoading.value = true;
  try {
    const results = await api.searchProducts({ keyword });
    return results.items;
  } finally {
    fetchProductsLoading.value = false;
  }
}
</script>
```

## Select with Tooltip

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    rules="required"
    :model-value="offer.productType"
    name="productType"
  >
    <VcSelect
      v-model="offer.productType"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE')"
      required
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.PLACEHOLDER')"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="productTypeOptions"
      :tooltip="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TOOLTIP')"
      option-value="value"
      option-label="label"
      @update:model-value="handleChange"
    />
  </Field>
</template>
```

## Disabled Select

```vue
<template>
  <VcSelect
    v-model="offer.productType"
    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.TITLE')"
    :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.PLACEHOLDER')"
    :disabled="!!offer.id"
    :options="productTypeOptions"
    option-value="value"
    option-label="label"
  />
</template>
```

## Select for Translated Options

```vue
<template>
  <VcSelect
    v-model="selectedType"
    :options="productTypeOptions"
    option-value="value"
    option-label="label"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productTypeOptions = computed(() =>
  productTypes.value?.map((x) => ({
    label: t(`OFFERS.PAGES.DETAILS.FIELDS.PRODUCT_TYPE.${x}`, x),
    value: x,
  }))
);
</script>
```

## Key Props

### Required Props
- `v-model`: Value binding
- `label`: Field label (i18n)
- `:options`: Array of options or async function
- `option-value`: Key for option value (e.g., "id")
- `option-label`: Key for option label (e.g., "name")

### Validation Props (from Field slot)
- `:error`: Boolean, `!!errors.length`
- `:error-message`: String from Field slot
- `@update:model-value`: Call `handleChange` from Field slot

### Optional Props
- `required`: Show asterisk
- `placeholder`: Placeholder text (i18n)
- `disabled`: Disable select
- `searchable`: Enable search/filter
- `loading`: Show loading spinner
- `clearable`: Allow clearing selection (default true, set false to prevent)
- `tooltip`: Help text tooltip

### Custom Templates
- `#selected-item="{ opt }"`: Template for selected value display
- `#option="{ opt }"`: Template for dropdown options

## Common Patterns

### Static Options
```vue
<VcSelect
  v-model="value"
  :options="[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ]"
  option-value="value"
  option-label="label"
/>
```

### Dynamic/Async Options
```vue
<VcSelect
  v-model="productId"
  searchable
  :loading="loading"
  :options="fetchProducts"
  option-value="id"
  option-label="name"
/>
```

### With Additional Action on Change
```vue
<VcSelect
  v-model="offer.productId"
  :options="products"
  @update:model-value="
    (e) => {
      handleChange(e);
      getProductDetails(e);
    }
  "
/>
```

### Non-Clearable Select
```vue
<VcSelect
  v-model="value"
  :options="options"
  :clearable="false"
/>
```
