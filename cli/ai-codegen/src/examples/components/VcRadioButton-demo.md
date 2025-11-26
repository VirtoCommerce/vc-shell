---
id: component-VcRadioButton-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","radio","form","input","choice"]
title: "VcRadioButton Demo"
description: "Radio button group for single choice selection"
componentRole: form-input
bladeContext: ["details"]
---

# VcRadioButton Demo

Real-world radio button examples for filters, settings, and single-choice selections.

## Basic Radio Group

```vue
<template>
  <div class="tw-space-y-4">
    <fieldset class="tw-space-y-2" aria-required="true">
      <legend class="tw-text-sm tw-font-medium">
        {{ $t("SETTINGS.THEME") }}
      </legend>
      <VcRadioButton
        v-model="theme"
        value="light"
        :label="$t('SETTINGS.THEME_LIGHT')"
      />
      <VcRadioButton
        v-model="theme"
        value="dark"
        :label="$t('SETTINGS.THEME_DARK')"
      />
      <VcRadioButton
        v-model="theme"
        value="auto"
        :label="$t('SETTINGS.THEME_AUTO')"
      />
    </fieldset>

    <div class="tw-text-sm tw-text-[var(--neutrals-500)]">
      {{ $t("SETTINGS.SELECTED") }}: <strong>{{ theme }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRadioButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const theme = ref("light");
</script>
```

## Radio Buttons in Filters

```vue
<template>
  <div class="tw-space-y-6">
    <VcCard :header="$t('FILTERS.TITLE')">
      <div class="tw-space-y-6">
        <!-- Status filter -->
        <div>
          <fieldset class="tw-space-y-2">
            <legend class="tw-text-sm tw-font-medium">
              {{ $t("FILTERS.STATUS") }}
            </legend>
            <VcRadioButton
              v-model="filters.status"
              value="all"
              :label="$t('FILTERS.STATUS_ALL')"
            />
            <VcRadioButton
              v-model="filters.status"
              value="active"
              :label="$t('FILTERS.STATUS_ACTIVE')"
            />
            <VcRadioButton
              v-model="filters.status"
              value="inactive"
              :label="$t('FILTERS.STATUS_INACTIVE')"
            />
          </fieldset>
        </div>

        <!-- Price range filter -->
        <div>
          <fieldset class="tw-space-y-2">
            <legend class="tw-text-sm tw-font-medium">
              {{ $t("FILTERS.PRICE_RANGE") }}
            </legend>
            <VcRadioButton
              v-model="filters.priceRange"
              value="any"
              :label="$t('FILTERS.PRICE_ANY')"
            />
            <VcRadioButton
              v-model="filters.priceRange"
              value="0-50"
              :label="$t('FILTERS.PRICE_0_50')"
            />
            <VcRadioButton
              v-model="filters.priceRange"
              value="50-100"
              :label="$t('FILTERS.PRICE_50_100')"
            />
            <VcRadioButton
              v-model="filters.priceRange"
              value="100+"
              :label="$t('FILTERS.PRICE_100_PLUS')"
            />
          </fieldset>
        </div>

        <!-- Sort by filter -->
        <div>
          <fieldset class="tw-space-y-2">
            <legend class="tw-text-sm tw-font-medium">
              {{ $t("FILTERS.SORT_BY") }}
            </legend>
            <VcRadioButton
              v-model="filters.sortBy"
              value="name"
              :label="$t('FILTERS.SORT_NAME')"
            />
            <VcRadioButton
              v-model="filters.sortBy"
              value="price"
              :label="$t('FILTERS.SORT_PRICE')"
            />
            <VcRadioButton
              v-model="filters.sortBy"
              value="date"
              :label="$t('FILTERS.SORT_DATE')"
            />
          </fieldset>
        </div>
      </div>

      <template #actions>
        <VcButton outlined @click="resetFilters">
          {{ $t("FILTERS.RESET") }}
        </VcButton>
        <VcButton variant="primary" @click="applyFilters">
          {{ $t("FILTERS.APPLY") }}
        </VcButton>
      </template>
    </VcCard>

    <!-- @vue-generic {IItem} -->
    <VcTable
      :items="filteredItems"
      :columns="columns"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { VcCard, VcRadioButton, VcButton, VcTable } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const filters = reactive({
  status: "all",
  priceRange: "any",
  sortBy: "name",
});

const items = ref([
  { id: "1", name: "Product A", status: "active", price: 25 },
  { id: "2", name: "Product B", status: "inactive", price: 75 },
  { id: "3", name: "Product C", status: "active", price: 120 },
]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME") },
  { id: "status", title: t("PRODUCTS.STATUS") },
  { id: "price", title: t("PRODUCTS.PRICE") },
]);

const filteredItems = computed(() => {
  let result = [...items.value];

  // Filter by status
  if (filters.status !== "all") {
    result = result.filter(item => item.status === filters.status);
  }

  // Filter by price range
  if (filters.priceRange !== "any") {
    if (filters.priceRange === "0-50") {
      result = result.filter(item => item.price <= 50);
    } else if (filters.priceRange === "50-100") {
      result = result.filter(item => item.price > 50 && item.price <= 100);
    } else if (filters.priceRange === "100+") {
      result = result.filter(item => item.price > 100);
    }
  }

  // Sort
  if (filters.sortBy === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sortBy === "price") {
    result.sort((a, b) => a.price - b.price);
  }

  return result;
});

function resetFilters() {
  filters.status = "all";
  filters.priceRange = "any";
  filters.sortBy = "name";
}

function applyFilters() {
  console.log("Filters applied:", filters);
}
</script>
```

## Radio Buttons for Shipping Method

```vue
<template>
  <div class="tw-space-y-4">
    <fieldset class="tw-space-y-3" aria-required="true">
      <legend class="tw-text-sm tw-font-medium">
        {{ $t("CHECKOUT.SHIPPING_METHOD") }}
      </legend>
      <div
        v-for="method in shippingMethods"
        :key="method.id"
        class="tw-border tw-rounded-lg tw-p-4 tw-cursor-pointer hover:tw-bg-[var(--neutrals-50)] tw-transition"
        :class="{ 'tw-border-[var(--primary-500)] tw-bg-[var(--primary-50)]': selectedShipping === method.id }"
        @click="selectShipping(method.id)"
      >
        <div class="tw-flex tw-items-start tw-gap-3">
          <VcRadioButton
            v-model="selectedShipping"
            :value="method.id"
            :label="''"
          />
          <div class="tw-flex-1">
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-1">
              <div class="tw-font-medium">{{ method.name }}</div>
              <div class="tw-font-bold">${{ method.price }}</div>
            </div>
            <div class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mb-2">
              {{ method.description }}
            </div>
            <div class="tw-flex tw-items-center tw-gap-2">
              <VcIcon icon="material-schedule" size="xs" />
              <span class="tw-text-xs tw-text-[var(--neutrals-600)]">
                {{ method.estimatedTime }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRadioButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const selectedShipping = ref("standard");

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Regular delivery to your doorstep",
    price: 5.99,
    estimatedTime: "5-7 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Faster delivery with tracking",
    price: 12.99,
    estimatedTime: "2-3 business days",
  },
  {
    id: "overnight",
    name: "Overnight",
    description: "Next-day delivery guaranteed",
    price: 24.99,
    estimatedTime: "1 business day",
  },
];

function selectShipping(id: string) {
  selectedShipping.value = id;
}
</script>
```

## Radio Buttons for Payment Method

```vue
<template>
  <div class="tw-space-y-4">
    <fieldset class="tw-space-y-3" aria-required="true">
      <legend class="tw-text-sm tw-font-medium">
        {{ $t("CHECKOUT.PAYMENT_METHOD") }}
      </legend>
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="tw-border tw-rounded-lg tw-p-4"
      >
        <VcRadioButton
          v-model="selectedPayment"
          :value="method.id"
        >
          <template #label>
            <div class="tw-flex tw-items-center tw-gap-3 tw-ml-2">
              <VcIcon :icon="method.icon" size="l" />
              <div>
                <div class="tw-font-medium">{{ method.name }}</div>
                <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
                  {{ method.description }}
                </div>
              </div>
            </div>
          </template>
        </VcRadioButton>

        <!-- Show form for selected method -->
        <div v-if="selectedPayment === method.id" class="tw-mt-4 tw-pl-8 tw-space-y-3">
          <div v-if="method.id === 'card'">
            <VcInput
              :label="$t('PAYMENT.CARD_NUMBER')"
              placeholder="**** **** **** ****"
            />
            <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-mt-3">
              <VcInput
                :label="$t('PAYMENT.EXPIRY')"
                placeholder="MM/YY"
              />
              <VcInput
                :label="$t('PAYMENT.CVV')"
                placeholder="***"
              />
            </div>
          </div>

          <div v-if="method.id === 'paypal'">
            <VcButton variant="primary" class="tw-w-full">
              <VcIcon icon="material-payments" class="tw-mr-2" />
              {{ $t("PAYMENT.LOGIN_PAYPAL") }}
            </VcButton>
          </div>

          <div v-if="method.id === 'bank'">
            <VcInput
              :label="$t('PAYMENT.ACCOUNT_NUMBER')"
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRadioButton, VcIcon, VcInput, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const selectedPayment = ref("card");

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: "material-credit_card",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay securely with your PayPal account",
    icon: "material-payments",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank account transfer",
    icon: "material-account_balance",
  },
];
</script>
```

## Radio Buttons in Settings

```vue
<template>
  <VcCard :header="$t('SETTINGS.PREFERENCES')">
    <div class="tw-space-y-6">
      <!-- Notification preferences -->
      <div>
        <fieldset class="tw-space-y-2">
          <legend class="tw-text-sm tw-font-medium">
            {{ $t("SETTINGS.EMAIL_NOTIFICATIONS") }}
          </legend>
          <VcRadioButton
            v-model="settings.emailNotifications"
            value="all"
            :label="$t('SETTINGS.EMAIL_ALL')"
          />
          <VcRadioButton
            v-model="settings.emailNotifications"
            value="important"
            :label="$t('SETTINGS.EMAIL_IMPORTANT')"
          />
          <VcRadioButton
            v-model="settings.emailNotifications"
            value="none"
            :label="$t('SETTINGS.EMAIL_NONE')"
          />
        </fieldset>
      </div>

      <!-- Date format -->
      <div>
        <fieldset class="tw-space-y-2">
          <legend class="tw-text-sm tw-font-medium">
            {{ $t("SETTINGS.DATE_FORMAT") }}
          </legend>
          <VcRadioButton
            v-model="settings.dateFormat"
            value="MM/DD/YYYY"
          >
            <template #label>
              <div class="tw-flex tw-items-center tw-justify-between tw-flex-1 tw-ml-2">
                <span>MM/DD/YYYY</span>
                <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
                  {{ formatDate(new Date(), "MM/DD/YYYY") }}
                </span>
              </div>
            </template>
          </VcRadioButton>
          <VcRadioButton
            v-model="settings.dateFormat"
            value="DD/MM/YYYY"
          >
            <template #label>
              <div class="tw-flex tw-items-center tw-justify-between tw-flex-1 tw-ml-2">
                <span>DD/MM/YYYY</span>
                <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
                  {{ formatDate(new Date(), "DD/MM/YYYY") }}
                </span>
              </div>
            </template>
          </VcRadioButton>
          <VcRadioButton
            v-model="settings.dateFormat"
            value="YYYY-MM-DD"
          >
            <template #label>
              <div class="tw-flex tw-items-center tw-justify-between tw-flex-1 tw-ml-2">
                <span>YYYY-MM-DD</span>
                <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
                  {{ formatDate(new Date(), "YYYY-MM-DD") }}
                </span>
              </div>
            </template>
          </VcRadioButton>
        </fieldset>
      </div>

      <!-- Language -->
      <div>
        <fieldset class="tw-space-y-2">
          <legend class="tw-text-sm tw-font-medium">
            {{ $t("SETTINGS.LANGUAGE") }}
          </legend>
          <VcRadioButton
            v-for="lang in languages"
            :key="lang.code"
            v-model="settings.language"
            :value="lang.code"
          >
            <template #label>
              <div class="tw-flex tw-items-center tw-gap-2 tw-ml-2">
                <span class="tw-text-2xl">{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
              </div>
            </template>
          </VcRadioButton>
        </fieldset>
      </div>
    </div>

    <template #actions>
      <VcButton outlined @click="cancel">
        {{ $t("COMMON.CANCEL") }}
      </VcButton>
      <VcButton variant="primary" @click="saveSettings">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </template>
  </VcCard>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { VcCard, VcRadioButton, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const settings = reactive({
  emailNotifications: "important",
  dateFormat: "MM/DD/YYYY",
  language: "en",
});

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year.toString());
}

function saveSettings() {
  console.log("Settings saved:", settings);
}

function cancel() {
  console.log("Settings cancelled");
}
</script>
```

## Key Points

### V-Model Binding
- Use `v-model` on the same variable for all radio buttons in a group
- The `value` prop determines which option is selected
- Only one radio button can be selected at a time

### Label Prop
- Use `:label` prop for simple text labels
- Use `#label` slot for custom label content (icons, badges, formatting)

### Common Use Cases

1. **Filters**: Single-choice filter options
```vue
<VcRadioButton
  v-model="filter.status"
  value="active"
  :label="$t('FILTERS.ACTIVE')"
/>
```

2. **Settings**: User preferences
```vue
<VcRadioButton
  v-model="settings.theme"
  value="dark"
  :label="$t('SETTINGS.DARK_MODE')"
/>
```

3. **Checkout**: Shipping/payment method selection
```vue
<VcRadioButton
  v-model="shipping"
  value="express"
  :label="$t('SHIPPING.EXPRESS')"
/>
```

4. **Sort Options**: Table/list sorting
```vue
<VcRadioButton
  v-model="sortBy"
  value="price"
  :label="$t('SORT.PRICE')"
/>
```

### Best Practices

- Group related radio buttons with a shared legend/heading
- Use clear, mutually exclusive options
- Provide at least 2 options (use switch/checkbox for binary choice)
- Set a default selection (`ref` initial value)
- Add spacing between radio button groups (`tw-space-y-2`)
- Use cards/borders for complex selections (shipping, payment methods)
- Show conditional content based on selection
- Keep option labels short and descriptive
- Use i18n for all labels
- Consider using icons for visual identification
- Show preview/example for format selections (dates, numbers)

