---
id: component-VcInput-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcInput Demo"
description: "VcInput Demo component example"
---

# VcInput Demo

Real-world input examples from vendor-portal. Always use with `Field` from vee-validate for forms!

## Text Input with Validation

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    rules="required|min:3"
    :label="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
    :model-value="offer.name"
    name="name"
  >
    <VcInput
      v-model="offer.name"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
      required
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { Field } from "vee-validate";
</script>
```

## Number Input

```vue
<template>
  <Field
    v-slot="{ field, errorMessage, handleChange, errors }"
    :model-value="item.inStockQuantity"
    name="quantity"
    rules="required|bigint|min_value:0"
  >
    <VcInput
      v-bind="field"
      v-model="item.inStockQuantity"
      type="number"
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER')"
      :disabled="readonly"
      required
      :label="item.fulfillmentCenterName"
      clearable
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>
```

## Date Input (in Filters)

```vue
<template>
  <VcInput
    v-model="stagedFilters.startDate"
    type="date"
    :label="$t('ORDERS.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
    @update:model-value="(value) => toggleFilter('startDate', String(value || ''), true)"
  />
</template>
```

## Input with Loading State

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="offer.sku"
    rules="required|min:3"
    name="sku"
  >
    <VcInput
      v-model="offer.sku"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
      :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
      :disabled="readonly"
      required
      maxlength="61"
      :loading="isSkuValidating"
      clearable
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="
        (e: string) => {
          handleChange(e);
          validateSku(e);
        }
      "
    />
  </Field>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";

const isSkuValidating = ref(false);

const validateSku = (value: string) => {
  isSkuValidating.value = true;
  
  const debouncedValidation = useDebounceFn(async () => {
    const errors = await validateOfferSku(value);
    setFieldError("sku", errors);
    isSkuValidating.value = false;
  }, 1000);
  
  debouncedValidation();
};
</script>
```

## Input with v-bind Field

```vue
<template>
  <!-- Using v-bind="field" for full vee-validate integration -->
  <Field
    v-slot="{ field, errorMessage, errors }"
    :model-value="item.inStockQuantity"
    name="quantity"
    rules="required|min_value:0"
  >
    <VcInput
      v-bind="field"
      v-model="item.inStockQuantity"
      type="number"
      :error="!!errors.length"
      :error-message="errorMessage"
    />
  </Field>
</template>
```

## Key Props

### Required Props
- `v-model`: Value binding
- `label`: Field label (i18n)
- `name`: Field name for validation

### Validation Props (from Field slot)
- `:error`: Boolean, `!!errors.length`
- `:error-message`: String from Field slot
- `@update:model-value`: Call `handleChange` from Field slot

### Optional Props
- `required`: Show asterisk
- `placeholder`: Placeholder text (i18n)
- `disabled`: Disable input
- `readonly`: Read-only mode
- `maxlength`: Maximum character length
- `clearable`: Show clear button
- `loading`: Show loading spinner
- `type`: Input type (`text`, `number`, `date`, `email`, etc.)

## Common Patterns

### Required Field with Min Length
```vue
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  rules="required|min:3"
  :model-value="value"
  name="fieldName"
>
  <VcInput
    v-model="value"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Number Field with Min Value
```vue
<Field
  v-slot="{ field, errorMessage, errors }"
  rules="required|min_value:0"
  :model-value="value"
  name="quantity"
>
  <VcInput
    v-bind="field"
    v-model="value"
    type="number"
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>
```

### Async Validation
```vue
<VcInput
  v-model="sku"
  :loading="isValidating"
  @update:model-value="(e) => {
    handleChange(e);
    debouncedValidate(e);
  }"
/>
```
