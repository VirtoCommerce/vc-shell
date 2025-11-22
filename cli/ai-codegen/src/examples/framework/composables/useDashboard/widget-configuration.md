---
id: useDashboard-widget-configuration
type: FRAMEWORK_API
category: composable
tags: [composable, dashboard, widgets, DashboardWidgetCard, VcTable]
title: "useDashboard - Widget Component Patterns"
description: "Real-world dashboard widget component patterns and best practices"
---

# useDashboard - Widget Component Patterns

Common patterns for building dashboard widget components based on production code.

## Overview

- Widget component structure with DashboardWidgetCard
- Table widgets with VcTable
- Empty state handling
- Action buttons and navigation
- Loading states

## Basic Widget Component Structure

All dashboard widgets follow this structure:

```vue
<template>
  <DashboardWidgetCard
    :header="$t('MODULE.WIDGET.TITLE')"
    icon="material-icon-name"
    :loading="loading"
  >
    <!-- Desktop-only actions -->
    <template v-if="$isDesktop.value" #actions>
      <vc-button small variant="secondary" @click="handleAction">
        {{ $t("MODULE.WIDGET.ACTION") }}
      </vc-button>
    </template>

    <!-- Widget content -->
    <template #content>
      <!-- Your widget content here -->
    </template>
  </DashboardWidgetCard>
</template>

<script setup lang="ts">
import { DashboardWidgetCard } from "@vc-shell/framework";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
const loading = ref(false);

onMounted(() => {
  // Load widget data
});
</script>
```

**Key elements:**
- `DashboardWidgetCard` wrapper with `header`, `icon`, `loading`
- Actions slot with `v-if="$isDesktop.value"` guard
- Content slot for widget body
- i18n for all user-facing text
- Loading state management

## Table Widget Pattern (Real Example)

Complete example with VcTable, actions, and navigation:

```vue
<template>
  <DashboardWidgetCard
    :header="$t('OFFERS.WIDGET.TITLE')"
    icon="material-sell"
    :loading="loading"
  >
    <template v-if="$isDesktop.value" #actions>
      <vc-button small variant="secondary" @click="addItem">
        {{ $t("OFFERS.WIDGET.ADD") }}
      </vc-button>
      <vc-button small variant="secondary" @click="() => onItemClick()">
        {{ $t("OFFERS.WIDGET.ALL") }}
      </vc-button>
    </template>

    <template #content>
      <VcTable
        :items="items?.slice(0, 5)"
        :columns="columns"
        :header="false"
        :footer="false"
        :reorderable-columns="false"
        :resizable-columns="false"
        state-key="offers-dashboard-card"
        @item-click="onItemClick"
      />
    </template>
  </DashboardWidgetCard>
</template>

<script setup lang="ts">
import { useBladeNavigation, ITableColumns, DashboardWidgetCard } from "@vc-shell/framework";
import { default as useOffers } from "../composables/useOffers";
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { IOffer } from "@vcmp-vendor-portal/api/marketplacevendor";

const { openBlade, resolveBladeByName } = useBladeNavigation();
const { loadOffers: load, offers: items, loading } = useOffers();
const { t } = useI18n({ useScope: "global" });

const columns: ITableColumns[] = [
  {
    id: "imgSrc",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_IMAGE")),
    type: "image",
  },
  {
    id: "name",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.PRODUCT_NAME")),
  },
  {
    id: "createdDate",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.CREATED_DATE")),
    type: "date-ago",
  },
  {
    id: "sku",
    title: computed(() => t("OFFERS.PAGES.LIST.TABLE.HEADER.SKU")),
  },
];

onMounted(() => {
  load({ take: 5 });
});

async function onItemClick(args?: IOffer) {
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
      param: args?.id,
    },
    true, // replace current blade
  );

  if (args?.id) {
    await openBlade({
      blade: resolveBladeByName("Offer"),
      param: args?.id,
    });
  }
}

async function addItem() {
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
    },
    true,
  );
  await openBlade({
    blade: resolveBladeByName("Offer"),
  });
}
</script>
```

**VcTable Configuration:**
- `:items="items?.slice(0, 5)"` - limit to 5 items
- `:header="false"` - hide table header
- `:footer="false"` - hide pagination footer
- `:reorderable-columns="false"` - disable column reordering
- `:resizable-columns="false"` - disable column resizing
- `state-key` - unique key for table state persistence
- `@item-click` - handle row clicks

**Column Types:**
- `type: "image"` - render as image
- `type: "date-ago"` - render as relative time
- `type: "money"` - render as currency
- No type - render as text

## Empty State Pattern (Real Example)

Widget with conditional rendering and empty state:

```vue
<template>
  <DashboardWidgetCard
    :header="$t('ORDERS.WIDGET.TITLE')"
    icon="material-shopping_cart"
    :loading="loading"
  >
    <template v-if="$isDesktop.value" #actions>
      <VcButton size="sm" variant="secondary" @click="() => onItemClick()">
        {{ $t("ORDERS.WIDGET.ALL") }}
      </VcButton>
    </template>

    <template #content>
      <VcTable
        v-if="items?.length"
        :items="items?.slice(0, 5)"
        :columns="columns"
        :header="false"
        :footer="false"
        :reorderable-columns="false"
        :resizable-columns="false"
        state-key="new-orders-dashboard-card"
        @item-click="onItemClick"
      />

      <div v-else class="tw-text-center tw-py-8">
        <VcIcon
          icon="material-shopping_cart"
          size="xxl"
          class="tw-text-neutral-400 tw-mb-4"
        />
        <p class="tw-text-neutral-600">
          {{ $t("ORDERS.WIDGET.EMPTY") }}
        </p>
      </div>
    </template>
  </DashboardWidgetCard>
</template>

<script setup lang="ts">
import { useBladeNavigation, ITableColumns, DashboardWidgetCard } from "@vc-shell/framework";
import { useOrdersListNew } from "../composables/useOrdersListNew";
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { CustomerOrder } from "@vcmp-vendor-portal/api/marketplacevendor";

const { openBlade } = useBladeNavigation();
const { loadOrders, items, loading } = useOrdersListNew({ pageSize: 10 });
const { t } = useI18n({ useScope: "global" });

onMounted(async () => {
  await loadOrders({ take: 10, sort: "createdDate:desc" });
});

const columns = computed((): ITableColumns[] => [
  {
    id: "lineItemsImg",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.ITEMS_IMG")),
    width: "75px",
  },
  {
    id: "number",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
  },
  {
    id: "customerName",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER")),
  },
  {
    id: "total",
    title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL")),
    type: "money",
  },
]);

async function onItemClick(item?: CustomerOrder) {
  await openBlade(
    {
      blade: { name: "Orders" },
      param: item?.id,
    },
    true,
  );

  if (item?.id) {
    await openBlade({
      blade: { name: "OrderDetails" },
      param: item?.id,
      options: {
        item,
      },
    });
  }
}
</script>
```

**Empty State Pattern:**
- Use `v-if="items?.length"` on VcTable
- Use `v-else` for empty state div
- Center content with `tw-text-center tw-py-8`
- Large icon with `size="xxl"` and neutral color
- Explanatory text below icon

## Important Notes

### ✅ DO

- Use `DashboardWidgetCard` wrapper in all widgets
- Disable VcTable features: header, footer, reorderable, resizable
- Limit data to 5-10 items with `slice()` or `take` parameter
- Guard actions with `v-if="$isDesktop.value"`
- Use i18n for all text
- Handle empty states with conditional rendering
- Load data in `onMounted`
- Open list blade with `replace: true` before details blade
- Use `type: "image"`, `"date-ago"`, `"money"` for table columns
- Pass extra data via `options` object when opening blades

### ❌ DON'T

- Don't show table header/footer in widgets
- Don't load all data - widgets should be lightweight
- Don't show actions on mobile - check `$isDesktop.value`
- Don't hardcode text - use i18n
- Don't forget loading states
- Don't forget empty states
- Don't use `resolveBladeByName` when direct name works (`{ name: "BladeName" }`)
- Don't allow column reordering/resizing in widget tables

## Navigation Pattern

**Opening list + details from widget:**

```typescript
// Pattern 1: Using resolveBladeByName
async function onItemClick(item?: Entity) {
  // 1. Open list blade (replace dashboard)
  await openBlade(
    {
      blade: resolveBladeByName("EntityList"),
      param: item?.id,
    },
    true, // replace = true
  );

  // 2. Open details blade (if item clicked)
  if (item?.id) {
    await openBlade({
      blade: resolveBladeByName("EntityDetails"),
      param: item?.id,
    });
  }
}

// Pattern 2: Using blade name directly
async function onItemClick(item?: Entity) {
  // 1. Open list blade (replace dashboard)
  await openBlade(
    {
      blade: { name: "EntityList" },
      param: item?.id,
    },
    true,
  );

  // 2. Open details blade with data
  if (item?.id) {
    await openBlade({
      blade: { name: "EntityDetails" },
      param: item?.id,
      options: {
        item, // Pass item data
      },
    });
  }
}
```

## Summary

**Widget Structure:**
- `DashboardWidgetCard` wrapper
- Desktop-only actions slot
- Content slot with VcTable or custom content
- Empty state handling

**VcTable in Widgets:**
- Disabled header, footer, reorderable, resizable
- Limited items (5-10)
- Column types: image, date-ago, money, text
- Item click handler for navigation

**Data Loading:**
- Load in `onMounted`
- Use `take: 5` or `slice(0, 5)`
- Handle loading state
- Handle empty state

**Reference:** [Official VC-Shell Documentation - useDashboard](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useDashboard/)
