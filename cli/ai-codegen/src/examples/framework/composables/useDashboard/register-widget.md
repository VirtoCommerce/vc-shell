---
id: useDashboard-register-widget
type: FRAMEWORK_API
category: composable
tags: [composable, dashboard, widgets, registration]
title: "useDashboard - Register Widget"
description: "Register and manage dashboard widgets"
---

# useDashboard - Register Widget

The `useDashboard` composable manages dashboard widgets, their layout, and permission-based visibility.

## Overview

- Register widgets with metadata
- Position widgets in grid layout
- Control visibility with permissions
- Pass props to widget components
- Use pre-registration for early setup

## Basic Widget Registration

Widget registration should be done in module's `index.ts` file using `registerDashboardWidget` helper:

```typescript
// src/modules/offers/index.ts
import { registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";
import * as components from "./components";

// Register dashboard widget for this module
registerDashboardWidget({
  id: "offers-widget",                           // Unique ID
  name: "Offers",                                // Display name
  component: markRaw(components.OffersDashboardCard),  // Vue component (must be markRaw)
  size: { width: 6, height: 6 }                  // Grid size (6x6 is common size)
});
```

**Important:**
- Use `markRaw()` wrapper for component to prevent Vue reactivity on component definition
- Register in module's `index.ts`, NOT in the widget component itself
- Size `{ width: 6, height: 6 }` is the most common widget size in VC-Shell

## Complete Dashboard Page Setup

Dashboard page is extremely simple - it just renders `DraggableDashboard` component:

```vue
<!-- src/pages/Dashboard.vue -->
<template>
  <DraggableDashboard />
</template>

<script lang="ts" setup>
import { DraggableDashboard } from "@vc-shell/framework";
</script>
```

**Important:**
- No manual widget registration in Dashboard page
- Widgets are registered in their respective modules' `index.ts` files
- `DraggableDashboard` automatically picks up all registered widgets
- No need for layout management - handled automatically by the component

## Multiple Widget Registration Example

```typescript
// src/modules/offers/index.ts
import * as pages from "./pages";
import * as locales from "./locales";
import * as components from "./components";
import { createAppModule, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";

// Register dashboard widget
registerDashboardWidget({
  id: "offers-widget",
  name: "Offers",
  component: markRaw(components.OffersDashboardCard),
  size: { width: 6, height: 6 },
});

// Export module
export default createAppModule(pages, locales, components);
```

```typescript
// src/modules/orders/index.ts
import * as pages from "./pages";
import * as composables from "./composables";
import * as components from "./components";
import * as locales from "./locales";
import { createAppModule, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";

// Register dashboard widget
registerDashboardWidget({
  id: "orders-widget",
  name: "Orders",
  component: markRaw(components.OrdersDashboardCard),
  size: { width: 6, height: 6 },
});

// Export module
export default createAppModule(pages, locales, composables, components);
```

## Widget Component Structure

Dashboard widget components use `DashboardWidgetCard` wrapper with specific structure:

```vue
<!-- src/modules/offers/components/OffersDashboardCard.vue -->
<template>
  <DashboardWidgetCard
    :header="$t('OFFERS.WIDGET.TITLE')"
    icon="material-sell"
    :loading="loading"
  >
    <!-- Actions slot for buttons (desktop only) -->
    <template v-if="$isDesktop.value" #actions>
      <vc-button
        small
        variant="secondary"
        @click="addItem"
      >
        {{ $t("OFFERS.WIDGET.ADD") }}
      </vc-button>
      <vc-button
        small
        variant="secondary"
        @click="() => onItemClick()"
      >
        {{ $t("OFFERS.WIDGET.ALL") }}
      </vc-button>
    </template>

    <!-- Content slot for widget body -->
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
  // Open list blade first (replace current blade)
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
      param: args?.id,
    },
    true, // replace = true
  );

  // Then open details blade if item clicked
  if (args?.id) {
    await openBlade({
      blade: resolveBladeByName("Offer"),
      param: args?.id,
    });
  }
}

async function addItem() {
  // Open list blade first
  await openBlade(
    {
      blade: resolveBladeByName("Offers"),
    },
    true,
  );
  // Then open details blade for new item
  await openBlade({
    blade: resolveBladeByName("Offer"),
  });
}
</script>
```

**Key Points:**
- Use `DashboardWidgetCard` wrapper with `header`, `icon`, `loading` props
- Actions slot (`#actions`) for buttons - conditionally shown on desktop with `$isDesktop.value`
- Content slot (`#content`) for widget body
- VcTable with `header="false"`, `footer="false"`, `reorderable-columns="false"`, `resizable-columns="false"`
- Load limited data (e.g., `take: 5` or `slice(0, 5)`)
- Navigation: open list blade with `replace: true`, then open details blade

## Widget with Empty State

Example with conditional rendering and empty state:

```vue
<!-- src/modules/orders/components/OrdersDashboardCard.vue -->
<template>
  <DashboardWidgetCard
    :header="$t('ORDERS.WIDGET.TITLE')"
    icon="material-shopping_cart"
    :loading="loading"
  >
    <template v-if="$isDesktop.value" #actions>
      <VcButton
        size="sm"
        variant="secondary"
        @click="() => onItemClick()"
      >
        {{ $t("ORDERS.WIDGET.ALL") }}
      </VcButton>
    </template>

    <template #content>
      <!-- Show table if there are items -->
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

      <!-- Show empty state if no items -->
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
  // Open list blade first (replace current)
  await openBlade(
    {
      blade: { name: "Orders" },
      param: item?.id,
    },
    true,
  );

  // Then open details blade if item clicked
  if (item?.id) {
    await openBlade({
      blade: { name: "OrderDetails" },
      param: item?.id,
      options: {
        item, // Pass item as option
      },
    });
  }
}
</script>
```

**Key Points:**
- Use `v-if` / `v-else` for conditional table/empty state rendering
- Empty state with centered icon and text
- Load with sort parameter (e.g., `sort: "createdDate:desc"`)
- Pass item data via `options` object when opening details blade
- Use blade name directly (`{ name: "Orders" }`) instead of `resolveBladeByName`

## Common Widget Patterns

### Table Widget with Actions
- Use VcTable with disabled header, footer, reorderable and resizable
- Limit items to 5-10 using `take` parameter or `slice()`
- Add action buttons in `#actions` slot (desktop only)
- Handle item click to open list + details blades

### Empty State
- Use `v-if` / `v-else` for conditional rendering
- Show icon and message when no data
- Center align with utility classes

### Navigation Pattern
```typescript
// 1. Open list blade (replace current dashboard)
await openBlade({ blade: { name: "ListBlade" } }, true);

// 2. Open details blade (if item clicked)
if (itemId) {
  await openBlade({
    blade: { name: "DetailsBlade" },
    param: itemId,
    options: { item } // Pass data via options
  });
}
```

## Widget Registration Interface

```typescript
interface DashboardWidget {
  // Unique identifier (required)
  id: string;

  // Display name (required)
  name: string;

  // Vue component wrapped with markRaw (required)
  component: Component;

  // Widget size in grid units (required)
  // Common size: { width: 6, height: 6 }
  size: DashboardWidgetSize;
}

interface DashboardWidgetSize {
  width: number;  // Grid columns (typically 6)
  height: number; // Grid rows (typically 6)
}
```

**Note:** Position is managed automatically by `DraggableDashboard` - no need to specify initial position.

## Important Notes

### ✅ DO

- Register widgets in module's `index.ts` file
- Use `markRaw()` wrapper for component to prevent reactivity issues
- Use `DashboardWidgetCard` component inside widget for consistent styling
- Use standard size `{ width: 6, height: 6 }` for widgets
- Disable table features: `header`, `footer`, `reorderable-columns`, `resizable-columns`
- Limit data to 5-10 items for widget tables
- Show actions only on desktop: `v-if="$isDesktop.value"`
- Open list blade with `replace: true` before opening details blade
- Handle empty states with conditional rendering

### ❌ DON'T

- Don't use duplicate widget IDs across modules
- Don't forget `markRaw()` wrapper - causes reactivity issues
- Don't register widgets in Dashboard page component
- Don't use `useDashboard()` composable for registration - use `registerDashboardWidget` helper
- Don't specify initial position - managed automatically
- Don't load all data - limit to first 5-10 items
- Don't show all table features - keep widgets simple and clean

## Summary

**Registration Pattern:**
1. Register widget in module's `index.ts` using `registerDashboardWidget`
2. Wrap component with `markRaw()`
3. Use standard size `{ width: 6, height: 6 }`

**Dashboard Page:**
- Simple template with only `<DraggableDashboard />` component
- No manual widget registration needed

**Widget Component:**
- Use `DashboardWidgetCard` wrapper
- Actions slot for buttons (desktop only)
- Content slot for widget body
- VcTable with disabled features
- Load limited data (5-10 items)
- Handle empty states

**Navigation:**
- Open list blade with `replace: true`
- Then open details blade if item clicked
- Pass data via `options` object

**Reference:** [Official VC-Shell Documentation - useDashboard](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useDashboard/)
