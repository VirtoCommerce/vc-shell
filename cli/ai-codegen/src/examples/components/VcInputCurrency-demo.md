---
id: component-VcInputCurrency-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","input","currency","form","number"]
title: "VcInputCurrency Demo"
description: "Currency input field with formatting"
componentRole: form-input
bladeContext: ["details"]
---

# VcInputCurrency Demo

Real-world currency input examples with multi-currency support and formatting.

## Basic Currency Input

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        {{ $t("PRODUCTS.PRICE") }}
      </VcLabel>
      <VcInputCurrency
        v-model="price"
        :currency="currency"
        :placeholder="$t('PRODUCTS.PRICE_PLACEHOLDER')"
      />
    </div>

    <div class="tw-text-sm tw-text-[var(--neutrals-600)]">
      {{ $t("PRODUCTS.ENTERED_AMOUNT") }}: <strong>{{ formatCurrency(price, currency) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcInputCurrency } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const price = ref(0);
const currency = ref("USD");

function formatCurrency(amount: number, curr: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
  }).format(amount);
}
</script>
```

## Currency Input with Currency Selector

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
      <div>
        <VcLabel :required="true">
          {{ $t("PRODUCTS.PRICE") }}
        </VcLabel>
        <VcInputCurrency
          v-model="product.price"
          :currency="product.currency"
          :placeholder="$t('PRODUCTS.PRICE_PLACEHOLDER')"
        />
      </div>

      <div>
        <VcLabel :required="true">
          {{ $t("PRODUCTS.CURRENCY") }}
        </VcLabel>
        <VcSelect
          v-model="product.currency"
          :options="currencies"
          :placeholder="$t('PRODUCTS.SELECT_CURRENCY')"
        />
      </div>
    </div>

    <!-- Price in other currencies -->
    <VcCard :header="$t('PRODUCTS.PRICE_IN_OTHER_CURRENCIES')">
      <div class="tw-space-y-2">
        <div
          v-for="curr in otherCurrencies"
          :key="curr"
          class="tw-flex tw-items-center tw-justify-between tw-p-2 tw-border tw-rounded"
        >
          <span class="tw-text-sm tw-font-medium">{{ curr }}</span>
          <span class="tw-text-sm">
            {{ convertCurrency(product.price, product.currency, curr) }}
          </span>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { VcLabel, VcInputCurrency, VcSelect, VcCard } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const product = reactive({
  price: 0,
  currency: "USD",
});

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

const otherCurrencies = computed(() => 
  currencies.filter(curr => curr !== product.currency)
);

// Simplified conversion (in real app, use actual exchange rates)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
};

function convertCurrency(amount: number, from: string, to: string): string {
  const inUSD = amount / exchangeRates[from];
  const converted = inUSD * exchangeRates[to];
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: to,
  }).format(converted);
}
</script>
```

## Pricing Form with Multiple Currencies

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-6">
      <!-- Regular Price -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("PRODUCTS.REGULAR_PRICE") }}</h3>
        
        <div class="tw-grid tw-grid-cols-3 tw-gap-4">
          <div>
            <VcLabel :required="true">
              {{ $t("PRODUCTS.AMOUNT") }}
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="regularPrice" :rules="priceRules">
              <VcInputCurrency
                v-bind="field"
                :error-message="errorMessage"
                :currency="pricing.currency"
                :placeholder="$t('PRODUCTS.ENTER_PRICE')"
              />
            </Field>
          </div>

          <div>
            <VcLabel :required="true">
              {{ $t("PRODUCTS.CURRENCY") }}
            </VcLabel>
            <VcSelect
              v-model="pricing.currency"
              :options="currencies"
            />
          </div>

          <div>
            <VcLabel :required="false">
              {{ $t("PRODUCTS.TAX_INCLUDED") }}
            </VcLabel>
            <VcSwitch v-model="pricing.taxIncluded" />
          </div>
        </div>
      </div>

      <!-- Sale Price -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <h3 class="tw-font-bold">{{ $t("PRODUCTS.SALE_PRICE") }}</h3>
          <VcSwitch v-model="pricing.hasSalePrice" />
        </div>

        <div v-if="pricing.hasSalePrice" class="tw-space-y-4">
          <div>
            <VcLabel :required="true">
              {{ $t("PRODUCTS.SALE_AMOUNT") }}
            </VcLabel>
            <VcInputCurrency
              v-model="pricing.salePrice"
              :currency="pricing.currency"
              :placeholder="$t('PRODUCTS.ENTER_SALE_PRICE')"
            />
            <VcHint v-if="pricing.salePrice > pricing.regularPrice" class="tw-text-[var(--danger-500)]">
              {{ $t("PRODUCTS.SALE_PRICE_WARNING") }}
            </VcHint>
          </div>

          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <VcLabel>{{ $t("PRODUCTS.SALE_START") }}</VcLabel>
              <VcInput
                v-model="pricing.saleStartDate"
                type="date"
              />
            </div>
            <div>
              <VcLabel>{{ $t("PRODUCTS.SALE_END") }}</VcLabel>
              <VcInput
                v-model="pricing.saleEndDate"
                type="date"
              />
            </div>
          </div>

          <!-- Discount calculation -->
          <div v-if="pricing.regularPrice > 0 && pricing.salePrice > 0" class="tw-bg-[var(--success-50)] tw-p-3 tw-rounded">
            <div class="tw-text-sm">
              {{ $t("PRODUCTS.DISCOUNT") }}: 
              <strong class="tw-text-[var(--success-700)]">
                {{ calculateDiscount() }}%
              </strong>
              ({{ $t("PRODUCTS.SAVE") }} {{ formatSavings() }})
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Price (for margin calculation) -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("PRODUCTS.COST_PRICE") }}</h3>
        
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <VcLabel :required="false">
              {{ $t("PRODUCTS.COST") }}
            </VcLabel>
            <VcInputCurrency
              v-model="pricing.costPrice"
              :currency="pricing.currency"
              :placeholder="$t('PRODUCTS.ENTER_COST')"
            />
          </div>

          <div v-if="pricing.costPrice > 0" class="tw-flex tw-items-end">
            <div class="tw-w-full tw-p-3 tw-bg-[var(--info-50)] tw-rounded">
              <div class="tw-text-xs tw-text-[var(--neutrals-600)] tw-mb-1">
                {{ $t("PRODUCTS.MARGIN") }}
              </div>
              <div class="tw-text-lg tw-font-bold tw-text-[var(--info-700)]">
                {{ calculateMargin() }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="onCancel">
          {{ $t("COMMON.CANCEL") }}
        </VcButton>
        <VcButton type="submit" variant="primary">
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  VcLabel,
  VcInputCurrency,
  VcSelect,
  VcSwitch,
  VcInput,
  VcHint,
  VcForm,
  VcButton,
} from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const pricing = reactive({
  regularPrice: 0,
  currency: "USD",
  taxIncluded: false,
  hasSalePrice: false,
  salePrice: 0,
  saleStartDate: "",
  saleEndDate: "",
  costPrice: 0,
});

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD"];

function priceRules(value: number) {
  if (!value || value <= 0) return t("VALIDATION.PRICE_REQUIRED");
  return true;
}

function calculateDiscount(): number {
  if (pricing.regularPrice <= 0 || pricing.salePrice <= 0) return 0;
  return Math.round(
    ((pricing.regularPrice - pricing.salePrice) / pricing.regularPrice) * 100
  );
}

function formatSavings(): string {
  const savings = pricing.regularPrice - pricing.salePrice;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pricing.currency,
  }).format(savings);
}

function calculateMargin(): number {
  if (pricing.regularPrice <= 0 || pricing.costPrice <= 0) return 0;
  return Math.round(
    ((pricing.regularPrice - pricing.costPrice) / pricing.regularPrice) * 100
  );
}

function onSubmit() {
  console.log("Pricing saved:", pricing);
}

function onCancel() {
  console.log("Cancelled");
}
</script>
```

## Currency Input in Table

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-justify-between tw-items-center">
      <h3 class="tw-font-bold">{{ $t("PRODUCTS.PRICE_LIST") }}</h3>
      <VcButton variant="primary" @click="addProduct">
        <VcIcon icon="material-add" class="tw-mr-2" />
        {{ $t("PRODUCTS.ADD") }}
      </VcButton>
    </div>

    <VcTable
      :items="products"
      :columns="columns"
    >
      <template #item_price="{ item }">
        <VcInputCurrency
          v-model="item.price"
          :currency="item.currency"
          size="s"
          @blur="updateProduct(item)"
        />
      </template>

      <template #item_currency="{ item }">
        <VcSelect
          v-model="item.currency"
          :options="currencies"
          size="s"
          @change="updateProduct(item)"
        />
      </template>

      <template #item_formatted="{ item }">
        <span class="tw-font-medium">
          {{ formatCurrency(item.price, item.currency) }}
        </span>
      </template>

      <template #item_actions="{ item }">
        <VcButton
          size="s"
          text
          variant="danger"
          @click="removeProduct(item.id)"
        >
          <VcIcon icon="material-delete" size="s" />
        </VcButton>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  VcButton,
  VcIcon,
  VcTable,
  VcInputCurrency,
  VcSelect,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
}

const products = ref<Product[]>([
  { id: "1", name: "Product A", price: 29.99, currency: "USD" },
  { id: "2", name: "Product B", price: 49.99, currency: "EUR" },
  { id: "3", name: "Product C", price: 19.99, currency: "GBP" },
]);

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD"];

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "price", title: t("PRODUCTS.PRICE"), align: "center" },
  { id: "currency", title: t("PRODUCTS.CURRENCY"), align: "center" },
  { id: "formatted", title: t("PRODUCTS.FORMATTED"), align: "right" },
  { id: "actions", title: t("COMMON.ACTIONS"), align: "center" },
]);

function addProduct() {
  products.value.push({
    id: Date.now().toString(),
    name: `Product ${products.value.length + 1}`,
    price: 0,
    currency: "USD",
  });
}

function updateProduct(product: Product) {
  console.log("Product updated:", product);
}

function removeProduct(id: string) {
  const index = products.value.findIndex(p => p.id === id);
  if (index !== -1) {
    products.value.splice(index, 1);
  }
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
</script>
```

## Key Points

### Props
- `v-model` - Number binding for the amount
- `currency` - Currency code (USD, EUR, GBP, etc.)
- `placeholder` - Placeholder text
- `disabled` - Disable input
- `error-message` - Show error message

### Currency Formatting
```typescript
// Format with Intl.NumberFormat
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(29.99);
// Output: "$29.99"
```

### Common Use Cases

1. **Product Price**: Simple price input
```vue
<VcInputCurrency
  v-model="product.price"
  :currency="product.currency"
/>
```

2. **Multi-Currency**: With currency selector
```vue
<VcInputCurrency v-model="price" :currency="currency" />
<VcSelect v-model="currency" :options="currencies" />
```

3. **Sale Price**: Regular + sale price
```vue
<VcInputCurrency v-model="regularPrice" :currency="currency" />
<VcInputCurrency v-model="salePrice" :currency="currency" />
```

### Best Practices

- Always pair with currency selector for multi-currency support
- Validate that sale price is less than regular price
- Show discount percentage calculation
- Calculate profit margin from cost price
- Format display values with proper currency symbols
- Use consistent currency across related fields
- Handle decimal precision based on currency (JPY has no decimals)
- Show converted values in other currencies
- Store amounts as numbers (not formatted strings)
- Use validation rules for minimum/maximum values

