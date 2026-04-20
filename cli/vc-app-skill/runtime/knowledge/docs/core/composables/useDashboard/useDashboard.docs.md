# useDashboard

Accesses the dashboard service for registering and managing dashboard widgets. Widgets are permission-aware, support layout positioning, and can be pre-registered during module setup before the service is initialized.

## When to Use

- Register dashboard widgets during module setup (use standalone `registerDashboardWidget`)
- Read or update widget layout at runtime inside a dashboard view component (use `useDashboard()`)
- When NOT to use: for sidebar navigation items -- use `useMenuService` / `addMenuItem`; for settings-page entries -- use `useSettingsMenu`

## Quick Start

```typescript
import { registerDashboardWidget } from "@vc-shell/framework";
import OrdersSummary from "./components/OrdersSummary.vue";

// In a module's initialize function
registerDashboardWidget({
  id: "orders-summary",
  name: "Orders Summary",
  component: OrdersSummary,
  size: { width: 2, height: 1 },
  permissions: ["order:read"],
});
```

## Pre-Registration vs. Live Service

Like the menu service, the dashboard supports two usage modes.

### Pre-registration (module setup)

Use the standalone `registerDashboardWidget` function during module plugin installation. Items are buffered and flushed when `provideDashboardService()` runs:

```typescript
// modules/orders/index.ts
import { registerDashboardWidget } from "@vc-shell/framework";
import OrdersSummary from "./widgets/OrdersSummary.vue";
import RecentOrders from "./widgets/RecentOrders.vue";

export default {
  install(app) {
    registerDashboardWidget({
      id: "orders-summary",
      name: "Orders Summary",
      component: OrdersSummary,
      size: { width: 2, height: 1 },
      permissions: ["order:read"],
    });

    registerDashboardWidget({
      id: "recent-orders",
      name: "Recent Orders",
      component: RecentOrders,
      size: { width: 2, height: 2 },
      permissions: ["order:read"],
    });
  },
};
```

### Live service (inside components)

Use `useDashboard()` inside a component's `<script setup>` to access the live service:

```typescript
<script setup lang="ts">
import { computed } from "vue";
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();
const widgets = computed(() => dashboard.getWidgets());
</script>
```

> **Important:** Calling `useDashboard()` before `provideDashboardService()` has been called by an ancestor component throws an `InjectionError`. Module setup code should use the standalone `registerDashboardWidget()` function instead.

## Widget Registration

Each widget requires an `id`, `name`, `component`, and `size`. Additional properties control permissions, positioning, and custom props.

```typescript
registerDashboardWidget({
  id: "sales-chart",
  name: "Sales Overview",
  component: SalesChart,
  size: { width: 3, height: 2 },
  position: { x: 0, y: 0 },
  permissions: ["analytics:view"],
  props: {
    dateRange: "last30days",
    currency: "USD",
  },
});
```

### Widget size

The `size` property defines the widget's grid dimensions:

| Property | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| `width`  | `number` | Number of grid columns the widget spans |
| `height` | `number` | Number of grid rows the widget spans    |

### Widget position

The optional `position` property sets the initial grid coordinates:

| Property | Type     | Description            |
| -------- | -------- | ---------------------- |
| `x`      | `number` | Column index (0-based) |
| `y`      | `number` | Row index (0-based)    |

### Custom props

The `props` object is passed directly to the widget component as its props:

```typescript
// Widget registration
registerDashboardWidget({
  id: "inventory-alerts",
  name: "Inventory Alerts",
  component: InventoryAlerts,
  size: { width: 1, height: 1 },
  props: {
    threshold: 10,
    showOutOfStock: true,
  },
});

// InventoryAlerts.vue receives these as component props
```

## Permission-Based Visibility

Widgets accept a `permissions` array. When the dashboard renders, it filters widgets through the current user's permissions via `usePermissions().hasAccess()`:

```typescript
// Only visible to users with analytics:view permission
registerDashboardWidget({
  id: "revenue-chart",
  name: "Revenue",
  component: RevenueChart,
  size: { width: 2, height: 2 },
  permissions: ["analytics:view"],
});

// Visible to users with ANY of these permissions (OR logic)
registerDashboardWidget({
  id: "order-stats",
  name: "Order Statistics",
  component: OrderStats,
  size: { width: 1, height: 1 },
  permissions: ["order:read", "analytics:view"],
});

// No permissions -- visible to everyone
registerDashboardWidget({
  id: "welcome-banner",
  name: "Welcome",
  component: WelcomeBanner,
  size: { width: 3, height: 1 },
});
```

> **Note:** Administrator users always see all widgets, regardless of the `permissions` array.

## Layout Management

The dashboard service tracks widget positions. You can update positions at runtime (e.g., after a user drags a widget):

```typescript
<script setup lang="ts">
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();

function onWidgetDrop(widgetId: string, newX: number, newY: number) {
  dashboard.updateWidgetPosition(widgetId, { x: newX, y: newY });
}

// Read the full layout map
const layout = dashboard.getLayout();
// layout is ReadonlyMap<string, DashboardWidgetPosition>
</script>
```

## Building a Dashboard View

A complete dashboard view that renders all visible widgets:

```typescript
<script setup lang="ts">
import { computed } from "vue";
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();
const widgets = computed(() => dashboard.getWidgets());
</script>

<template>
  <div class="tw-grid tw-grid-cols-4 tw-gap-4 tw-p-4">
    <div
      v-for="widget in widgets"
      :key="widget.id"
      :style="{
        gridColumn: `span ${widget.size.width}`,
        gridRow: `span ${widget.size.height}`,
      }"
    >
      <VcCard :header="widget.name">
        <component :is="widget.component" v-bind="widget.props" />
      </VcCard>
    </div>
  </div>
</template>
```

## Recipes

### Module with Multiple Widgets

```typescript
// modules/analytics/index.ts
import { registerDashboardWidget } from "@vc-shell/framework";
import SalesChart from "./widgets/SalesChart.vue";
import TopProducts from "./widgets/TopProducts.vue";
import CustomerGrowth from "./widgets/CustomerGrowth.vue";

export function registerAnalyticsDashboard() {
  registerDashboardWidget({
    id: "analytics-sales",
    name: "Sales Overview",
    component: SalesChart,
    size: { width: 2, height: 2 },
    position: { x: 0, y: 0 },
    permissions: ["analytics:view"],
  });

  registerDashboardWidget({
    id: "analytics-top-products",
    name: "Top Products",
    component: TopProducts,
    size: { width: 1, height: 2 },
    position: { x: 2, y: 0 },
    permissions: ["analytics:view", "catalog:read"],
  });

  registerDashboardWidget({
    id: "analytics-customers",
    name: "Customer Growth",
    component: CustomerGrowth,
    size: { width: 1, height: 1 },
    position: { x: 3, y: 0 },
    permissions: ["analytics:view"],
  });
}
```

### Widget Component Template

```typescript
<!-- widgets/OrdersSummary.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);
const stats = ref({ pending: 0, shipped: 0, completed: 0 });

const { loading, action: loadStats } = useAsync(async () => {
  const client = await getApiClient();
  const pending = await client.searchOrders({ status: "Pending", take: 0 });
  const shipped = await client.searchOrders({ status: "Shipped", take: 0 });
  const completed = await client.searchOrders({ status: "Completed", take: 0 });
  stats.value = {
    pending: pending.totalCount ?? 0,
    shipped: shipped.totalCount ?? 0,
    completed: completed.totalCount ?? 0,
  };
});

onMounted(() => loadStats());
</script>

<template>
  <div v-if="!loading" class="tw-grid tw-grid-cols-3 tw-gap-4 tw-p-4">
    <div class="tw-text-center">
      <div class="tw-text-2xl tw-font-bold">{{ stats.pending }}</div>
      <div class="tw-text-sm tw-text-gray-500">Pending</div>
    </div>
    <div class="tw-text-center">
      <div class="tw-text-2xl tw-font-bold">{{ stats.shipped }}</div>
      <div class="tw-text-sm tw-text-gray-500">Shipped</div>
    </div>
    <div class="tw-text-center">
      <div class="tw-text-2xl tw-font-bold">{{ stats.completed }}</div>
      <div class="tw-text-sm tw-text-gray-500">Completed</div>
    </div>
  </div>
</template>
```

## Common Mistakes

### Registering duplicate widget IDs

```typescript
// Wrong -- throws "Widget with id orders-summary already registered"
registerDashboardWidget({ id: "orders-summary", name: "A", component: CompA, size: { width: 1, height: 1 } });
registerDashboardWidget({ id: "orders-summary", name: "B", component: CompB, size: { width: 1, height: 1 } });

// Correct -- use unique IDs for each widget
registerDashboardWidget({ id: "orders-summary", name: "Orders", component: CompA, size: { width: 1, height: 1 } });
registerDashboardWidget({ id: "orders-detail", name: "Details", component: CompB, size: { width: 1, height: 1 } });
```

### Calling useDashboard() during module setup

```typescript
// Wrong -- service is not yet provided during plugin install
export default {
  install(app) {
    const dashboard = useDashboard(); // throws InjectionError
    dashboard.registerWidget({ ... });
  },
};

// Correct -- use the standalone function
export default {
  install(app) {
    registerDashboardWidget({ id: "widget", name: "W", component: Comp, size: { width: 1, height: 1 } });
  },
};
```

### Updating position for unregistered widget

```typescript
// Wrong -- throws "Widget with id unknown-widget not found"
dashboard.updateWidgetPosition("unknown-widget", { x: 0, y: 0 });

// Correct -- verify the widget exists or use a known ID
const widgets = dashboard.getWidgets();
if (widgets.some((w) => w.id === "my-widget")) {
  dashboard.updateWidgetPosition("my-widget", { x: 0, y: 0 });
}
```

## API Reference

### useDashboard()

Returns the injected `IDashboardService` instance. Throws `InjectionError` if the service has not been provided.

#### IDashboardService Interface

| Method                 | Type                                                            | Description                                                       |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `registerWidget`       | `(widget: DashboardWidget) => void`                             | Register a widget (throws on duplicate ID)                        |
| `getWidgets`           | `() => DashboardWidget[]`                                       | Get all registered widgets filtered by current user's permissions |
| `updateWidgetPosition` | `(widgetId: string, position: DashboardWidgetPosition) => void` | Update a widget's grid position (throws if widget not found)      |
| `getLayout`            | `() => ReadonlyMap<string, DashboardWidgetPosition>`            | Get the current layout map                                        |

### Standalone Exports

| Function                          | Description                                             |
| --------------------------------- | ------------------------------------------------------- |
| `registerDashboardWidget(widget)` | Pre-register a widget before the service is initialized |
| `provideDashboardService()`       | Create and provide the service in a root component      |

### DashboardWidget

| Property      | Type                                | Required | Description                                    |
| ------------- | ----------------------------------- | -------- | ---------------------------------------------- |
| `id`          | `string`                            | Yes      | Unique widget identifier                       |
| `name`        | `string`                            | Yes      | Display title                                  |
| `component`   | `Component`                         | Yes      | Vue component to render                        |
| `size`        | `{ width: number; height: number }` | Yes      | Grid size (columns x rows)                     |
| `position`    | `{ x: number; y: number }`          | No       | Initial grid position                          |
| `permissions` | `string[]`                          | No       | Required permissions for visibility (OR logic) |
| `props`       | `Record<string, unknown>`           | No       | Props passed to the widget component           |

### DashboardWidgetPosition

| Property | Type     | Description            |
| -------- | -------- | ---------------------- |
| `x`      | `number` | Column index (0-based) |
| `y`      | `number` | Row index (0-based)    |

## Related

- [usePermissions](../usePermissions/) -- permission checks used for widget visibility filtering
- [useMenuService](../useMenuService/) -- similar pre-registration pattern for navigation menu
- [useApiClient](../useApiClient/) -- used within widget components to fetch data
