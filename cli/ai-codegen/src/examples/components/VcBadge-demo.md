---
id: component-VcBadge-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","badge","label","display"]
title: "VcBadge Demo"
description: "Badge component for labels and counts"
componentRole: display
bladeContext: ["details","list","general"]
---

# VcBadge Demo

Real-world badge examples from vendor-portal application.

## Notification Badge on Icon

```vue
<template>
  <div class="tw-flex tw-items-center tw-gap-4">
    <!-- Unread messages badge -->
    <VcBadge 
      :content="unreadCount" 
      variant="primary"
    >
      <VcButton 
        icon="material-mail" 
        text
        @click="openMessages"
      />
    </VcBadge>

    <!-- Notifications badge -->
    <VcBadge 
      :content="notificationCount" 
      variant="danger"
    >
      <VcButton 
        icon="material-notifications" 
        text
        @click="openNotifications"
      />
    </VcBadge>

    <!-- Cart items badge -->
    <VcBadge 
      :content="cartItemsCount" 
      variant="success"
    >
      <VcButton 
        icon="material-shopping_cart" 
        text
        @click="openCart"
      />
    </VcBadge>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge, VcButton } from "@vc-shell/framework";

const unreadCount = ref(12);
const notificationCount = ref(3);
const cartItemsCount = ref(5);

function openMessages() {
  // Navigate to messages
  console.log("Opening messages");
}

function openNotifications() {
  // Navigate to notifications
  console.log("Opening notifications");
}

function openCart() {
  // Navigate to cart
  console.log("Opening cart");
}
</script>
```

## Dot Badge for Status Indicators

```vue
<template>
  <div class="tw-space-y-3">
    <!-- Active status with dot -->
    <div class="tw-flex tw-items-center tw-gap-3">
      <VcBadge is-dot variant="success">
        <span class="tw-text-sm">{{ $t("SERVICES.STATUS.ACTIVE") }}</span>
      </VcBadge>
      <span class="tw-text-[var(--neutrals-500)]">
        {{ activeServices }} {{ $t("SERVICES.ACTIVE_COUNT") }}
      </span>
    </div>

    <!-- Inactive status with dot -->
    <div class="tw-flex tw-items-center tw-gap-3">
      <VcBadge is-dot variant="danger">
        <span class="tw-text-sm">{{ $t("SERVICES.STATUS.INACTIVE") }}</span>
      </VcBadge>
      <span class="tw-text-[var(--neutrals-500)]">
        {{ inactiveServices }} {{ $t("SERVICES.INACTIVE_COUNT") }}
      </span>
    </div>

    <!-- Pending status with dot -->
    <div class="tw-flex tw-items-center tw-gap-3">
      <VcBadge is-dot variant="warning">
        <span class="tw-text-sm">{{ $t("SERVICES.STATUS.PENDING") }}</span>
      </VcBadge>
      <span class="tw-text-[var(--neutrals-500)]">
        {{ pendingServices }} {{ $t("SERVICES.PENDING_COUNT") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const activeServices = ref(45);
const inactiveServices = ref(8);
const pendingServices = ref(12);
</script>
```

## Badge in Table Cell

```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :items="orders"
    :columns="columns"
    @item-click="onItemClick"
  >
    <!-- Stock count badge -->
    <template #item_stock="{ item }">
      <VcBadge
        :content="item.stock"
        :variant="getStockVariant(item.stock)"
      />
    </template>

    <!-- New items indicator -->
    <template #item_name="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <span>{{ item.name }}</span>
        <VcBadge
          v-if="item.isNew"
          content="NEW"
          variant="success"
          size="s"
        />
      </div>
    </template>

    <!-- Unread count -->
    <template #item_messages="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon icon="material-mail" />
        <VcBadge
          v-if="item.unreadMessages > 0"
          :content="item.unreadMessages"
          variant="primary"
          size="s"
        />
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcBadge, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const orders = ref([
  { id: "1", name: "Product A", stock: 150, isNew: true, unreadMessages: 3 },
  { id: "2", name: "Product B", stock: 8, isNew: false, unreadMessages: 0 },
  { id: "3", name: "Product C", stock: 45, isNew: true, unreadMessages: 1 },
]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME"), sortable: true },
  { id: "stock", title: t("PRODUCTS.STOCK"), align: "center" },
  { id: "messages", title: t("PRODUCTS.MESSAGES"), align: "center" },
]);

function getStockVariant(stock: number): string {
  if (stock > 50) return "success";
  if (stock > 10) return "warning";
  return "danger";
}

function onItemClick(item: any) {
  console.log("Item clicked:", item.id);
}
</script>
```

## Badge with Custom Positioning

```vue
<template>
  <div class="tw-grid tw-grid-cols-2 tw-gap-4">
    <!-- Top-right badge on image -->
    <div class="tw-relative">
      <VcBadge
        content="50%"
        variant="danger"
        :custom-position="true"
        top="10px"
        right="10px"
      >
        <VcImage
          src="https://example.com/product.jpg"
          size="xl"
          bordered
        />
      </VcBadge>
    </div>

    <!-- Badge on card -->
    <VcCard header="Special Offer">
      <VcBadge
        content="LIMITED"
        variant="warning"
        :custom-position="true"
        top="15px"
        right="15px"
      >
        <div class="tw-p-4">
          <h3 class="tw-font-bold tw-mb-2">Premium Plan</h3>
          <p class="tw-text-sm tw-text-[var(--neutrals-500)]">
            Get 50% off for the first 3 months
          </p>
        </div>
      </VcBadge>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { VcBadge, VcImage, VcCard } from "@vc-shell/framework";
</script>
```

## Clickable Badges

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Filter badges -->
    <div class="tw-flex tw-flex-wrap tw-gap-2">
      <VcBadge
        v-for="category in categories"
        :key="category.id"
        :content="category.name"
        :variant="selectedCategory === category.id ? 'primary' : 'secondary'"
        :active="selectedCategory === category.id"
        clickable
        @click="selectCategory(category.id)"
      />
    </div>

    <!-- Selected filters -->
    <div class="tw-flex tw-flex-wrap tw-gap-2">
      <span class="tw-text-sm tw-font-medium">
        {{ $t("FILTERS.ACTIVE") }}:
      </span>
      <VcBadge
        v-for="filter in activeFilters"
        :key="filter.id"
        :content="filter.label"
        variant="info"
        clickable
        @click="removeFilter(filter.id)"
      >
        <template #default>
          <span class="tw-flex tw-items-center tw-gap-1">
            {{ filter.label }}
            <VcIcon icon="material-close" size="xs" />
          </span>
        </template>
      </VcBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBadge, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const categories = ref([
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "home", name: "Home & Garden" },
  { id: "books", name: "Books" },
]);

const selectedCategory = ref("electronics");

const activeFilters = ref([
  { id: "price-range", label: "$100-$500" },
  { id: "brand", label: "Brand: Samsung" },
  { id: "rating", label: "4+ Stars" },
]);

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId;
  console.log("Selected category:", categoryId);
}

function removeFilter(filterId: string) {
  activeFilters.value = activeFilters.value.filter(f => f.id !== filterId);
  console.log("Removed filter:", filterId);
}
</script>
```

## Badge Sizes

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Small badges -->
    <div class="tw-flex tw-items-center tw-gap-3">
      <span class="tw-text-sm tw-w-20">Small:</span>
      <VcBadge content="99+" variant="primary" size="s" />
      <VcBadge content="NEW" variant="success" size="s" />
      <VcBadge is-dot variant="warning" size="s">
        <span class="tw-text-xs">Status</span>
      </VcBadge>
    </div>

    <!-- Medium badges (default) -->
    <div class="tw-flex tw-items-center tw-gap-3">
      <span class="tw-text-sm tw-w-20">Medium:</span>
      <VcBadge content="99+" variant="primary" size="m" />
      <VcBadge content="NEW" variant="success" size="m" />
      <VcBadge is-dot variant="warning" size="m">
        <span class="tw-text-sm">Status</span>
      </VcBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcBadge } from "@vc-shell/framework";
</script>
```

## Key Points

### Content Types
- **Number badges**: Use `content` prop with number (e.g., `content="5"`)
- **Text badges**: Use `content` prop with text (e.g., `content="NEW"`)
- **Dot badges**: Use `is-dot` prop for status indicators without text

### Variants
- `primary` - Blue, for general notifications
- `success` - Green, for positive states
- `warning` - Yellow/Orange, for warnings
- `danger` - Red, for errors or critical items
- `info` - Light blue, for informational badges
- `secondary` - Gray, for inactive/neutral badges

### Common Use Cases

1. **Notification counts**: Wrap icon/button with badge showing count
```vue
<VcBadge :content="unreadCount" variant="primary">
  <VcButton icon="material-notifications" />
</VcBadge>
```

2. **Status indicators**: Use dot variant for service status
```vue
<VcBadge is-dot variant="success">
  <span>Active</span>
</VcBadge>
```

3. **Table cells**: Display stock, counts, or status in tables
```vue
<template #item_stock="{ item }">
  <VcBadge :content="item.stock" :variant="getVariant(item.stock)" />
</template>
```

4. **New/Featured labels**: Mark new items or special content
```vue
<VcBadge v-if="item.isNew" content="NEW" variant="success" size="s" />
```

5. **Filter tags**: Show active filters with clickable badges
```vue
<VcBadge
  :content="filter.label"
  clickable
  @click="removeFilter(filter.id)"
/>
```

### Best Practices

- Use `size="s"` for inline badges in text or compact spaces
- Set appropriate `variant` based on context (success=positive, danger=critical)
- Use `is-dot` for status without needing text labels
- For custom positioning, use `:custom-position="true"` with `top`/`right` props
- Make badges clickable only when they have an action (filters, removable items)
- Keep badge content short (numbers or 1-2 words)
- Use in table cells for quick visual scanning of counts/status

