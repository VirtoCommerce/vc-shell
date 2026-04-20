# DashboardWidgetCard

Modern dashboard widget card with header, optional KPI stats area, action buttons, content body, and footer. Used within the GridStack dashboard layout for displaying metrics, feeds, and charts.

## Overview

The vc-shell dashboard is built as a grid of widget cards, each displaying a specific piece of information: order counts, revenue charts, recent activity feeds, or system status indicators. `DashboardWidgetCard` provides a consistent card layout with structured slots for header, stats, content, and footer areas.

This component is the standard container for all dashboard widgets. It handles the visual chrome (card border, shadow, header styling, loading overlay) while leaving the content entirely to the consumer via slots. The companion components `DashboardStatItem`, `DashboardFeedList`, and `DashboardFeedRow` provide pre-styled building blocks for common widget patterns.

Widget cards are typically placed inside a `DraggableDashboard` grid, where users can resize and reposition them. The card automatically adapts to its container dimensions.

## When to Use

- Use as the container for any dashboard widget (metrics, charts, activity feeds)
- When you need a consistent card layout with header, stats, and content areas
- Do NOT use for non-dashboard card layouts (use VcCard instead)

## Basic Usage

```vue
<script setup lang="ts">
import { DashboardWidgetCard } from "@vc-shell/framework";
</script>

<template>
  <DashboardWidgetCard
    header="Products"
    icon="lucide-package-open"
  >
    <template #content>
      <div class="tw-p-4">Widget body content here</div>
    </template>
  </DashboardWidgetCard>
</template>
```

## Key Props

| Prop      | Type      | Default     | Description                         |
| --------- | --------- | ----------- | ----------------------------------- |
| `header`  | `string`  | `undefined` | Card title text                     |
| `icon`    | `string`  | `undefined` | Icon displayed next to the header   |
| `loading` | `boolean` | `false`     | Shows a loading overlay on the body |

## Slots

| Slot      | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `header`  | Override the entire header area (replaces default icon + title) |
| `actions` | Action buttons in the header row (right side)                   |
| `stats`   | KPI stat items below the header                                 |
| `content` | Main body content                                               |
| `footer`  | Footer area with links or actions                               |

## Common Patterns

### KPI Card with Stats and Feed

```vue
<DashboardWidgetCard header="Orders" icon="lucide-shopping-cart">
  <template #stats>
    <DashboardStatItem :value="48" label="Total" />
    <DashboardStatItem :value="12" label="Today" variant="info" />
    <DashboardStatItem :value="3" label="Pending" variant="warning" />
    <DashboardStatItem :value="1" label="Failed" variant="error" />
  </template>
  <template #content>
    <DashboardFeedList>
      <DashboardFeedRow v-for="order in recentOrders" :key="order.id">
        <template #icon>
          <VcIcon :icon="getOrderIcon(order.status)" size="s" />
        </template>
        <template #title>{{ order.number }}</template>
        <template #subtitle>{{ order.customerName }}</template>
        <template #meta>{{ formatDateRelative(order.createdDate) }}</template>
      </DashboardFeedRow>
    </DashboardFeedList>
  </template>
  <template #footer>
    <a href="#" @click.prevent="openOrdersList">View all orders</a>
  </template>
</DashboardWidgetCard>
```

### Chart Widget

```vue
<DashboardWidgetCard header="Revenue" icon="lucide-trending-up" :loading="isLoading">
  <template #actions>
    <VcSelect
      v-model="period"
      :options="periodOptions"
      size="small"
      class="tw-w-24"
    />
  </template>
  <template #content>
    <DashboardLineChart
      :data="revenueData"
      :config="revenueConfig"
      x-key="month"
      :y-keys="['revenue', 'profit']"
    />
  </template>
</DashboardWidgetCard>
```

### Simple Metric Card (Custom Header)

```vue
<DashboardWidgetCard>
  <template #header>
    <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
      <h3 class="tw-text-lg tw-font-bold">$12,450</h3>
      <span class="tw-text-sm tw-text-green-500">+8.2%</span>
    </div>
  </template>
  <template #content>
    <DashboardBarChart :data="dailySales" :config="salesConfig" x-key="day" :y-keys="['amount']" />
  </template>
</DashboardWidgetCard>
```

### Widget with Loading State

```vue
<script setup lang="ts">
import { DashboardWidgetCard } from "@vc-shell/framework";
import { useAsync } from "@vc-shell/framework";

const { loading, action: loadData } = useAsync(async () => {
  // fetch widget data...
});

onMounted(() => loadData());
</script>

<template>
  <DashboardWidgetCard
    header="System Status"
    icon="lucide-activity"
    :loading="loading"
  >
    <template #content>
      <!-- Content shown when not loading -->
    </template>
  </DashboardWidgetCard>
</template>
```

### Registering a Widget with the Dashboard Service

Widget cards are typically registered as dashboard widgets via `useDashboard()`, not placed in templates directly:

```typescript
import { useDashboard } from "@vc-shell/framework";
import { markRaw } from "vue";
import OrdersWidget from "./OrdersWidget.vue";

const dashboard = useDashboard();

dashboard.register({
  id: "orders-overview",
  component: markRaw(OrdersWidget),
  props: { limit: 10 },
  order: 1,
  layout: { w: 6, h: 4, x: 0, y: 0 },
});
```

## Companion Components

| Component           | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `DashboardStatItem` | Single KPI stat with value, label, and optional color variant   |
| `DashboardFeedList` | Scrollable list container for feed rows                         |
| `DashboardFeedRow`  | Individual feed item with icon, title, subtitle, and meta slots |

## Tip: Set a Minimum Height

When the card content is loaded asynchronously, the card may collapse to zero height during loading. Set a minimum height on the content area to ensure the loading spinner is visible:

```vue
<template #content>
  <div class="tw-min-h-[200px]">
    <!-- async content -->
  </div>
</template>
```

## Related Components

- [DraggableDashboard](../draggable-dashboard/draggable-dashboard.docs.md) -- grid layout container
- [DashboardCharts](../dashboard-charts/dashboard-charts.docs.md) -- chart components for widget content
- [useDashboard](../../../core/composables/useDashboard/) -- dashboard widget registration service
