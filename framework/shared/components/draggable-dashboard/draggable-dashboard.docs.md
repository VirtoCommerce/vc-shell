# DraggableDashboard

Gridstack.js-powered dashboard container that renders registered widgets in a drag-and-drop grid layout. Automatically persists layout changes to localStorage and supports widget resizing. This is the main dashboard component used as the landing page in vc-shell applications, providing a customizable overview with KPI widgets, charts, quick actions, and data summaries.

## When to Use

- Use as the main dashboard view for the shell or vendor portal
- When you need a customizable widget grid with drag-and-drop rearrangement
- Do NOT use for static, non-rearrangeable layouts (use a regular grid/flex layout instead)

## Basic Usage

```vue
<script setup lang="ts">
import { DraggableDashboard } from "@vc-shell/framework";
</script>

<template>
  <DraggableDashboard />
</template>
```

Widgets are registered via the dashboard service, not through props:

```ts
import { markRaw } from "vue";
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();

dashboard.registerWidget({
  id: "orders-widget",
  name: "Orders",
  component: markRaw(OrdersWidget),
  size: { width: 4, height: 3 },
  position: { x: 0, y: 0 },
  props: { title: "Orders today" },
});
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showDragHandles` | `boolean` | `false` | Shows visible drag handle icons on widgets |
| `resizable` | `boolean` | `false` | Enables widget resize handles |
| `ariaLabel` | `string` | `"Dashboard widgets..."` | Accessible label for the grid container |

## Exposed Methods

| Method | Description |
|--------|-------------|
| `rearrangeWidgets()` | Re-layout all widgets to fill gaps |
| `recalculateLayout()` | Recalculate grid dimensions |
| `saveLayout()` | Persist current layout to localStorage |
| `useBuiltInPositions()` | Reset to default widget positions |

## Recipe: Registering Dashboard Widgets in a Module

```ts
// orders-module/index.ts
import { markRaw } from "vue";
import { useDashboard } from "@vc-shell/framework";
import OrdersSummaryWidget from "./widgets/OrdersSummaryWidget.vue";
import RevenueChartWidget from "./widgets/RevenueChartWidget.vue";

export default {
  install() {
    const dashboard = useDashboard();

    dashboard.registerWidget({
      id: "orders-summary",
      name: "Orders Summary",
      component: markRaw(OrdersSummaryWidget),
      size: { width: 4, height: 2 },
      position: { x: 0, y: 0 },
    });

    dashboard.registerWidget({
      id: "revenue-chart",
      name: "Revenue",
      component: markRaw(RevenueChartWidget),
      size: { width: 8, height: 4 },
      position: { x: 4, y: 0 },
    });
  },
};
```

## Recipe: Resetting Dashboard Layout

Provide a "Reset layout" button to let users restore the default widget positions:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DraggableDashboard } from "@vc-shell/framework";

const dashboardRef = ref<InstanceType<typeof DraggableDashboard>>();

function resetLayout() {
  dashboardRef.value?.useBuiltInPositions();
  dashboardRef.value?.saveLayout();
}
</script>

<template>
  <div>
    <button @click="resetLayout">Reset Layout</button>
    <DraggableDashboard ref="dashboardRef" :resizable="true" />
  </div>
</template>
```

## Details

- **Grid system**: Uses Gridstack.js under the hood, which provides a 12-column responsive grid. Widget `size.width` is in grid columns (1-12), `size.height` is in grid rows.
- **Layout persistence**: When the user rearranges or resizes widgets, the new layout is automatically saved to localStorage. On next visit, the persisted layout is restored.
- **Widget registration**: Widgets must be registered via `useDashboard().registerWidget()` before the dashboard mounts. The component reads the widget registry and creates grid items for each.
- **markRaw requirement**: Widget components must be wrapped in `markRaw()` when registering to prevent Vue from making them reactive (which would cause performance issues with the grid system).
- **Responsive behavior**: On mobile viewports, widgets stack vertically in a single column. Drag-and-drop is disabled on touch devices for better usability.

## Tips

- Always use `markRaw()` when passing component references to `registerWidget()`. Without it, Vue's reactivity system wraps the component, causing unnecessary overhead and potential rendering issues.
- Widget `position` values define the initial placement. Once the user rearranges widgets, the persisted layout takes precedence over the registered positions.
- Use `recalculateLayout()` after dynamically adding or removing widgets at runtime to ensure the grid adjusts properly.
- The 12-column grid means common widget widths are: 3 (quarter), 4 (third), 6 (half), and 12 (full width).
- Register widgets during module `install()` before the dashboard component mounts. Late registrations may not be picked up.

## Related Components

- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) -- card container for widget content
- [DashboardCharts](../dashboard-charts/dashboard-charts.docs.md) -- chart components for widgets
