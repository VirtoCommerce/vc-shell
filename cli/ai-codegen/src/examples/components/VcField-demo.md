---
id: component-VcField-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcField Demo"
description: "VcField Demo component example"
---

# VcField Demo

**IMPORTANT**: VcField is for **displaying** read-only data, NOT for form inputs!  
For forms, use `Field` from vee-validate + VcInput/VcSelect.

## Read-Only Data Display (VcField)

```vue
<template>
  <VcCard :header="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TITLE')">
    <div class="tw-p-4 tw-space-y-4">
      <!-- Basic text field -->
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.ORDER_REF')"
        :model-value="item?.number || item?.id"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        copyable
        type="text"
      />

      <!-- Date field -->
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.CREATED_DATE')"
        :model-value="createdDate"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
      />

      <!-- Field with tooltip -->
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.STORE')"
        :model-value="item?.storeId"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
        :tooltip="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.STORE_TOOLTIP')"
      />

      <!-- Money field -->
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TOTAL')"
        :model-value="withCurrency(item?.total)"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
        class="tw-font-semibold"
      />

      <!-- Email field (copyable) -->
      <VcField
        :model-value="address.email"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="email"
        copyable
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import moment from "moment";

const createdDate = computed(() => {
  const date = new Date(item.value?.createdDate ?? "");
  return moment(date).locale(currentLocale.value).format("L LT");
});

function withCurrency(value?: number) {
  return value ? `${value} ${currency}` : "-";
}
</script>
```

## Form Inputs with Validation (Field from vee-validate)

```vue
<template>
  <VcForm class="tw-space-y-4">
    <!-- Text Input with Validation -->
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

    <!-- Select with Validation -->
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
        option-value="value"
        option-label="label"
        @update:model-value="handleChange"
      />
    </Field>

    <!-- Number Input with Validation -->
    <Field
      v-slot="{ field, errorMessage, handleChange, errors }"
      :model-value="item.inStockQuantity"
      name="availqty"
      rules="required|bigint|min_value:0"
    >
      <VcInput
        v-bind="field"
        v-model="item.inStockQuantity"
        type="number"
        :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER')"
        :disabled="readonly || !offer.trackInventory"
        required
        :label="item.fulfillmentCenterName"
        clearable
        :error="!!errors.length"
        :error-message="errorMessage"
        @update:model-value="handleChange"
      />
    </Field>

    <!-- Searchable Select -->
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
        <!-- Custom templates for select options -->
        <template #selected-item="{ opt }">
          <ProductSelectTemplate :opt="opt" />
        </template>
        <template #option="{ opt }">
          <ProductSelectTemplate :opt="opt" />
        </template>
      </VcSelect>
    </Field>

    <!-- SKU with async validation -->
    <Field
      v-slot="{ errorMessage, handleChange, errors }"
      :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
      :model-value="offer.sku"
      rules="required|min:3"
      name="sku"
    >
      <VcInput
        v-model="offer.sku"
        class="tw-grow tw-basis-0"
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
            validateSku(e, 'sku');
          }
        "
      />
    </Field>
  </VcForm>
</template>

<script setup lang="ts">
import { Field, useForm } from "vee-validate";
import { useDebounceFn } from "@vueuse/core";

const { meta, setFieldError, errorBag } = useForm({
  validateOnMount: false,
});

const isSkuValidating = ref(false);

const validateSku = (value: string, property: string) => {
  isSkuValidating.value = true;

  const debouncedValidation = useDebounceFn(async () => {
    const offerErrors = await validateOffer({ ...offer.value, sku: value });
    const errors = offerErrors?.filter((error) => error.propertyName?.toLowerCase() === "sku");
    setFieldError(
      property,
      errors
        .map((error) => t(`OFFERS.PAGES.DETAILS.ERRORS.${error?.errorCode}`))
        .concat(errorBag.value[property] ?? [])
        .join("\n"),
    );
    isSkuValidating.value = false;
  }, 1000);

  debouncedValidation();
};
</script>
```

## Key Differences

### VcField (Read-Only Display)
- **Purpose**: Display data, not input
- **Props**: `model-value`, `orientation`, `aspect-ratio`, `copyable`, `type`
- **Types**: `text`, `email`, etc.
- **Usage**: Order summaries, product details, read-only forms

### Field (vee-validate + Input)
- **Purpose**: Form inputs with validation
- **Component**: From `vee-validate`
- **Props**: `name`, `rules`, `model-value`
- **Slot props**: `errorMessage`, `handleChange`, `errors`, `field`
- **Usage**: Any editable form

## Form Validation Setup

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";

const { meta, setFieldError, errorBag } = useForm({
  validateOnMount: false,
});

// Check if form is valid before save
const isDisabled = computed(() => {
  return !meta.value.dirty || !meta.value.valid;
});
</script>
```
