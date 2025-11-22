---
id: component-VcForm-demo
type: COMPONENT
complexity: SIMPLE
category: component
componentRole: form-container
bladeContext: ["details"]
tags: ["component","form","container","validation"]
title: "VcForm Demo"
description: "Form container component for details blades, works with vee-validate for validation"
---

# VcForm Demo

**IMPORTANT**: VcForm is the primary container for forms in details blades. Use with vee-validate `Field` component for validation.

## Basic Form with Validation

```vue
<template>
  <VcForm @submit="onSubmit">
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.GENERAL_INFO')">
      <div class="tw-p-4 tw-space-y-4">
        <!-- Product Name -->
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.NAME") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="name" :rules="requiredRule">
            <VcInput
              v-bind="field"
              :error-message="errorMessage"
              :placeholder="$t('OFFERS.FIELDS.NAME_PLACEHOLDER')"
            />
          </Field>
        </div>

        <!-- SKU -->
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.SKU") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="sku" :rules="skuRule">
            <VcInput
              v-bind="field"
              :error-message="errorMessage"
              :placeholder="$t('OFFERS.FIELDS.SKU_PLACEHOLDER')"
            />
          </Field>
        </div>

        <!-- Product Type -->
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.PRODUCT_TYPE") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="productType" :rules="requiredRule">
            <VcSelect
              v-bind="field"
              :error-message="errorMessage"
              :options="productTypeOptions"
            />
          </Field>
        </div>

        <!-- Enable/Disable -->
        <div>
          <VcLabel>
            {{ $t("OFFERS.FIELDS.ENABLED") }}
          </VcLabel>
          <Field v-slot="{ field }" name="isActive">
            <VcSwitch v-bind="field" />
          </Field>
        </div>
      </div>
    </VcCard>

    <!-- Actions -->
    <div class="tw-flex tw-justify-end tw-gap-2 tw-mt-4">
      <VcButton outlined @click="onCancel">
        {{ $t("COMMON.CANCEL") }}
      </VcButton>
      <VcButton type="submit" variant="primary" :disabled="!isValid">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcForm, VcCard, VcLabel, VcInput, VcSelect, VcSwitch, VcButton } from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { isValid } = useForm();

const productTypeOptions = ref([
  { label: "Physical", value: "Physical" },
  { label: "Digital", value: "Digital" },
]);

function requiredRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  return true;
}

function skuRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  if (value.length < 3) return t("VALIDATION.MIN_LENGTH", { min: 3 });
  if (value.length > 61) return t("VALIDATION.MAX_LENGTH", { max: 61 });
  return true;
}

function onSubmit(values: any) {
  console.log("Form submitted:", values);
}

function onCancel() {
  console.log("Form cancelled");
}
</script>
```

## Form with Multiple Cards

```vue
<template>
  <VcForm @submit="onSubmit">
    <!-- General Info Card -->
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.GENERAL_INFO')">
      <div class="tw-p-4 tw-space-y-4">
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.NAME") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="name" :rules="requiredRule">
            <VcInput v-bind="field" :error-message="errorMessage" />
          </Field>
        </div>

        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.SKU") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="sku" :rules="requiredRule">
            <VcInput v-bind="field" :error-message="errorMessage" />
          </Field>
        </div>
      </div>
    </VcCard>

    <!-- Pricing Card -->
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.PRICING')" class="tw-mt-4">
      <div class="tw-p-4 tw-space-y-4">
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.PRICE") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="price" :rules="requiredRule">
            <VcInputCurrency v-bind="field" :error-message="errorMessage" />
          </Field>
        </div>

        <div>
          <VcLabel>
            {{ $t("OFFERS.FIELDS.COMPARE_AT_PRICE") }}
          </VcLabel>
          <Field v-slot="{ field }" name="compareAtPrice">
            <VcInputCurrency v-bind="field" />
          </Field>
        </div>
      </div>
    </VcCard>

    <!-- Inventory Card -->
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.INVENTORY')" class="tw-mt-4">
      <div class="tw-p-4 tw-space-y-4">
        <div>
          <VcLabel>
            {{ $t("OFFERS.FIELDS.TRACK_INVENTORY") }}
          </VcLabel>
          <Field v-slot="{ field }" name="trackInventory">
            <VcSwitch v-bind="field" />
          </Field>
        </div>

        <div v-if="formData.trackInventory">
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.QUANTITY") }}
          </VcLabel>
          <Field v-slot="{ field, errorMessage }" name="quantity" :rules="quantityRule">
            <VcInput v-bind="field" :error-message="errorMessage" type="number" />
          </Field>
        </div>
      </div>
    </VcCard>

    <!-- Actions -->
    <div class="tw-flex tw-justify-end tw-gap-2 tw-mt-4">
      <VcButton outlined @click="onCancel">
        {{ $t("COMMON.CANCEL") }}
      </VcButton>
      <VcButton type="submit" variant="primary" :disabled="!isValid">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  VcForm,
  VcCard,
  VcLabel,
  VcInput,
  VcInputCurrency,
  VcSwitch,
  VcButton,
} from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { isValid } = useForm();

const formData = reactive({
  trackInventory: false,
});

function requiredRule(value: any) {
  if (!value) return t("VALIDATION.REQUIRED");
  return true;
}

function quantityRule(value: number) {
  if (value === undefined || value === null) return t("VALIDATION.REQUIRED");
  if (value < 0) return t("VALIDATION.MIN_VALUE", { min: 0 });
  return true;
}

function onSubmit(values: any) {
  console.log("Form submitted:", values);
}

function onCancel() {
  console.log("Form cancelled");
}
</script>
```

## Form with Async Validation

```vue
<template>
  <VcForm @submit="onSubmit">
    <VcCard :header="$t('OFFERS.PAGES.DETAILS.FORM.TITLE')">
      <div class="tw-p-4 tw-space-y-4">
        <div>
          <VcLabel :required="true">
            {{ $t("OFFERS.FIELDS.SKU") }}
          </VcLabel>
          <Field
            v-slot="{ field, errorMessage }"
            name="sku"
            :rules="validateSkuUnique"
            :validate-on-input="false"
            :validate-on-blur="true"
          >
            <VcInput
              v-bind="field"
              :error-message="errorMessage"
              :placeholder="$t('OFFERS.FIELDS.SKU_PLACEHOLDER')"
            />
          </Field>
          <VcHint>{{ $t("OFFERS.FIELDS.SKU_HINT") }}</VcHint>
        </div>
      </div>
    </VcCard>

    <div class="tw-flex tw-justify-end tw-gap-2 tw-mt-4">
      <VcButton outlined @click="onCancel">
        {{ $t("COMMON.CANCEL") }}
      </VcButton>
      <VcButton type="submit" variant="primary" :disabled="!isValid">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { VcForm, VcCard, VcLabel, VcInput, VcHint, VcButton, useApiClient } from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { isValid } = useForm();
const { getApiClient } = useApiClient();

async function validateSkuUnique(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");

  try {
    const client = await getApiClient();
    const result = await client.validateOffer({ sku: value });

    if (!result.isValid) {
      return t("VALIDATION.SKU_EXISTS");
    }

    return true;
  } catch (error) {
    return t("VALIDATION.VALIDATION_FAILED");
  }
}

function onSubmit(values: any) {
  console.log("Form submitted:", values);
}

function onCancel() {
  console.log("Form cancelled");
}
</script>
```

## Key Points

### Props
- Form has no custom props - use standard HTML form attributes

### Events
- `@submit` - Emitted when form is submitted and validation passes

### Validation
VcForm works with vee-validate for form validation:

1. **Field Component**: Wrap form inputs with vee-validate `Field`
```vue
<Field v-slot="{ field, errorMessage }" name="fieldName" :rules="validationRule">
  <VcInput v-bind="field" :error-message="errorMessage" />
</Field>
```

2. **Validation Rules**: Define validation functions
```ts
function requiredRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  return true;
}
```

3. **Async Validation**: Use async functions for API validation
```ts
async function validateSkuUnique(value: string) {
  const result = await client.validateOffer({ sku: value });
  return result.isValid || t("VALIDATION.SKU_EXISTS");
}
```

4. **Form State**: Access form state with `useForm`
```ts
const { isValid, values, errors } = useForm();
```

### Best Practices

- Always wrap form inputs with vee-validate `Field` for validation
- Use `VcLabel` with `:required="true"` for required fields
- Display error messages with `:error-message` prop on inputs
- Use `VcCard` to group related form fields
- Place form actions (Save, Cancel) at the bottom
- Disable submit button when form is invalid (`:disabled="!isValid"`)
- Use debounce for expensive validations (API calls)
- Validate on blur for better UX (`:validate-on-blur="true"`)
- Show hints below fields with `VcHint` component
- Use proper HTML input types (`type="number"`, `type="email"`, etc.)
- Handle form submission with `@submit` event
- Reset form state on cancel or after successful save

### Common Patterns

1. **Required Field**:
```vue
<VcLabel :required="true">Name</VcLabel>
<Field v-slot="{ field, errorMessage }" name="name" :rules="requiredRule">
  <VcInput v-bind="field" :error-message="errorMessage" />
</Field>
```

2. **Optional Field**:
```vue
<VcLabel>Description</VcLabel>
<Field v-slot="{ field }" name="description">
  <VcInput v-bind="field" />
</Field>
```

3. **Async Validation**:
```vue
<Field
  v-slot="{ field, errorMessage }"
  name="sku"
  :rules="validateSkuUnique"
  :validate-on-blur="true"
>
  <VcInput v-bind="field" :error-message="errorMessage" />
</Field>
```

4. **Conditional Field**:
```vue
<Field v-slot="{ field }" name="trackInventory">
  <VcSwitch v-bind="field" />
</Field>

<div v-if="formData.trackInventory">
  <Field v-slot="{ field, errorMessage }" name="quantity" :rules="requiredRule">
    <VcInput v-bind="field" :error-message="errorMessage" type="number" />
  </Field>
</div>
```
