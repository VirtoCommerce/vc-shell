---
id: component-VcCard-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","card","container","layout"]
title: "VcCard Demo"
description: "Card container for grouping related content with optional header and actions"
componentRole: layout
bladeContext: ["details","list","general"]
---

# VcCard Demo

Real-world card examples.

**IMPORTANT**: VcCard default slot has NO padding. Always add `tw-p-4` for forms or `tw-p-2` for galleries.

## Basic Card with Form Fields

```vue
<template>
  <VcCard 
    :header="$t('PRODUCTS.FORM.BASIC_INFO.TITLE')"
    icon="material-info"
  >
    <!-- CRITICAL: Always add tw-p-4 for padding -->
    <div class="tw-p-4 tw-space-y-4">
      <Field
        v-slot="{ field, errorMessage, handleChange, errors }"
        name="name"
        rules="required"
      >
        <VcInput
          v-bind="field"
          v-model="product.name"
          :label="$t('PRODUCTS.FIELDS.NAME')"
          :placeholder="$t('PRODUCTS.FIELDS.NAME_PLACEHOLDER')"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>

      <Field
        v-slot="{ field, errorMessage, handleChange, errors }"
        name="sku"
        rules="required|min:3"
      >
        <VcInput
          v-bind="field"
          v-model="product.sku"
          :label="$t('PRODUCTS.FIELDS.SKU')"
          :placeholder="$t('PRODUCTS.FIELDS.SKU_PLACEHOLDER')"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>

      <VcSwitch
        v-model="product.isActive"
        :label="$t('PRODUCTS.FIELDS.IS_ACTIVE')"
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field } from "vee-validate";
import { VcCard, VcInput, VcSwitch } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const product = ref({
  name: "",
  sku: "",
  isActive: true,
});
</script>
```

## Inventory Section (from offers-details.vue)

```vue
<template>
  <VcCard :header="$t('OFFERS.PAGES.DETAILS.FIELDS.INVENTORY.TITLE')">
    <div class="tw-p-4 tw-space-y-4">
      <!-- SKU field -->
      <Field
        v-slot="{ field, errorMessage, handleChange, errors }"
        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
        :model-value="offer.sku"
        rules="required|min:3"
        name="sku"
      >
        <VcInput
          v-bind="field"
          v-model="offer.sku"
          :label="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.TITLE')"
          :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.SKU.PLACEHOLDER')"
          required
          maxlength="61"
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>

      <!-- Track inventory switch -->
      <VcSwitch
        v-model="offer.trackInventory"
        :label="$t('OFFERS.PAGES.DETAILS.FIELDS.QTY.TITLE')"
      />

      <!-- Inventory quantities -->
      <VcRow
        v-for="(item, i) in offer.inventory"
        :key="`${item.id}${i}`"
      >
        <VcCol :size="2">
          <Field
            v-slot="{ field, errorMessage, handleChange, errors }"
            :model-value="item.inStockQuantity"
            :name="`availqty_${i}`"
            rules="required|bigint|min_value:0"
          >
            <VcInput
              v-bind="field"
              v-model="item.inStockQuantity"
              type="number"
              :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.AVAIL_QTY.PLACEHOLDER')"
              :disabled="!offer.trackInventory"
              required
              :label="item.fulfillmentCenterName"
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            />
          </Field>
        </VcCol>
      </VcRow>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field } from "vee-validate";
import { VcCard, VcInput, VcSwitch, VcRow, VcCol } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const offer = ref({
  sku: "",
  trackInventory: true,
  inventory: [
    { id: "1", fulfillmentCenterName: "Main Warehouse", inStockQuantity: 100 },
    { id: "2", fulfillmentCenterName: "Store A", inStockQuantity: 50 },
  ],
});
</script>
```

## Collapsible Card with Gallery (from offers-details.vue)

```vue
<template>
  <VcCard
    :header="$t('OFFERS.PAGES.DETAILS.FIELDS.GALLERY.TITLE')"
    :is-collapsable="true"
    :is-collapsed="restoreCollapsed('offer_gallery')"
    @state:collapsed="handleCollapsed('offer_gallery', $event)"
  >
    <VcLoading :active="imageUploading" />
    <!-- Note: Use tw-p-2 for galleries, not tw-p-4 -->
    <div class="tw-p-2">
      <VcGallery
        :images="offer.images"
        :disabled="readonly"
        multiple
        @upload="assetsHandler.upload"
        @sort="assetsHandler.edit"
        @remove="assetsHandler.remove"
        @edit="onGalleryItemEdit"
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcGallery, VcLoading } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const offer = ref({
  images: [
    { url: "https://example.com/image1.jpg", alt: "Product 1" },
    { url: "https://example.com/image2.jpg", alt: "Product 2" },
  ],
});

const readonly = ref(false);
const imageUploading = ref(false);

// Persist collapse state in localStorage
function handleCollapsed(key: string, value: boolean): void {
  localStorage.setItem(key, String(value));
}

function restoreCollapsed(key: string): boolean {
  return localStorage.getItem(key) === "true";
}

const assetsHandler = {
  upload: (files: File[]) => console.log("Upload:", files),
  edit: (images: any[]) => console.log("Sort:", images),
  remove: (image: any) => console.log("Remove:", image),
};

function onGalleryItemEdit(image: any) {
  console.log("Edit image:", image);
}
</script>
```

## Order Information Card (from order-details.vue)

```vue
<template>
  <VcCard :header="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TITLE')">
    <div class="tw-p-4 tw-space-y-4">
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.ORDER_REF')"
        :model-value="item?.number || item?.id"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        copyable
        type="text"
      />
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.CREATED_DATE')"
        :model-value="createdDate"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
      />
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.STORE')"
        :model-value="item?.storeId"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
      />
    </div>

    <!-- Order Totals Section with border -->
    <div class="tw-border-t tw-border-gray-200 tw-p-4 tw-space-y-4">
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.SUBTOTAL')"
        :model-value="withCurrency(item?.subTotal)"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
      />
      <VcField
        :label="$t('ORDERS.PAGES.DETAILS.FORM.ORDER_INFO.TOTAL')"
        :model-value="withCurrency(item?.total)"
        orientation="horizontal"
        :aspect-ratio="[1, 2]"
        type="text"
        class="tw-font-semibold"
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcCard, VcField } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import moment from "moment";

const { t } = useI18n();

const item = ref({
  id: "ORD-12345",
  number: "12345",
  storeId: "Main Store",
  createdDate: new Date().toISOString(),
  subTotal: 150.00,
  total: 165.00,
  currency: "USD",
});

const createdDate = computed(() => 
  moment(item.value.createdDate).format("L LT")
);

function withCurrency(value?: number): string {
  if (!value) return "";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: item.value.currency,
  }).format(value);
}
</script>
```

## Card with Actions in Header

```vue
<template>
  <VcCard :header="$t('SETTINGS.TITLE')">
    <template #actions>
      <VcButton 
        variant="primary" 
        size="sm"
        @click="saveSettings"
      >
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </template>
    
    <div class="tw-p-4 tw-space-y-4">
      <VcSwitch
        v-model="settings.emailNotifications"
        :label="$t('SETTINGS.EMAIL_NOTIFICATIONS')"
      />
      <VcSwitch
        v-model="settings.pushNotifications"
        :label="$t('SETTINGS.PUSH_NOTIFICATIONS')"
      />
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcButton, VcSwitch } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const settings = ref({
  emailNotifications: true,
  pushNotifications: false,
});

function saveSettings() {
  console.log("Saving settings:", settings.value);
}
</script>
```

## Multiple Cards in Details Blade

```vue
<template>
  <VcBlade>
    <VcContainer>
      <VcForm class="tw-space-y-4">
        <!-- Basic Info -->
        <VcCard 
          :header="$t('PRODUCTS.FORM.BASIC.TITLE')"
          icon="material-info"
        >
          <div class="tw-p-4 tw-space-y-4">
            <!-- Form fields -->
          </div>
        </VcCard>

        <!-- Inventory -->
        <VcCard 
          :header="$t('PRODUCTS.FORM.INVENTORY.TITLE')"
          icon="material-warehouse"
        >
          <div class="tw-p-4 tw-space-y-4">
            <!-- Inventory fields -->
          </div>
        </VcCard>

        <!-- Gallery (collapsible) -->
        <VcCard 
          :header="$t('PRODUCTS.FORM.GALLERY.TITLE')"
          icon="material-photo_library"
          :is-collapsable="true"
        >
          <div class="tw-p-2">
            <VcGallery :images="images" />
          </div>
        </VcCard>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade, VcContainer, VcForm, VcCard, VcGallery } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const images = ref([]);
</script>
```

## Key Points

### Critical Rules
- **NO padding by default** - ALWAYS add `tw-p-4` for forms, `tw-p-2` for galleries
- **Add spacing** - Use `tw-space-y-4` inside card content for proper field spacing
- **Icons** - Use `icon` prop for visual identification
- **Collapsible** - Use `is-collapsable` for large forms to reduce clutter

### Props
- `header` - Card title (use i18n)
- `icon` - Material icon name (e.g., "material-info")
- `is-collapsable` - Enable collapse functionality
- `is-collapsed` - Initial collapsed state
- `variant` - "default", "success", "danger" for visual emphasis
- `fill` - Card fills available space

### Events
- `@header:click` - Header clicked
- `@state:collapsed` - Collapse state changed (persist to localStorage)

### Slots
- `default` - Main content (NO padding!)
- `#header` - Custom header content
- `#actions` - Buttons in header

## Common Patterns

### Form Section with Required Fields
```vue
<VcCard header="Basic Information">
  <div class="tw-p-4 tw-space-y-4">
    <Field v-slot="{ field, errors }" name="name" rules="required">
      <VcInput v-bind="field" required :error="!!errors.length" />
    </Field>
  </div>
</VcCard>
```

### Gallery Section (note tw-p-2)
```vue
<VcCard header="Images" :is-collapsable="true">
  <div class="tw-p-2">
    <VcGallery :images="images" />
  </div>
</VcCard>
```

### Persistent Collapse State
```vue
<VcCard
  :is-collapsable="true"
  :is-collapsed="localStorage.getItem('card_state') === 'true'"
  @state:collapsed="(v) => localStorage.setItem('card_state', String(v))"
>
  ...
</VcCard>
```

### Read-only Data Display
```vue
<VcCard header="Order Summary">
  <div class="tw-p-4 tw-space-y-4">
    <VcField label="Order #" :model-value="order.number" type="text" />
    <VcField label="Total" :model-value="order.total" type="text" />
  </div>
</VcCard>
```
