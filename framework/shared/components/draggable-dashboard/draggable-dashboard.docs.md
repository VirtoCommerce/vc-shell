# DraggableDashboard

Gridstack.js-powered dashboard container that renders registered widgets in a drag-and-drop grid layout. Automatically persists layout changes to localStorage and supports widget resizing.

## When to Use

- Use as the main dashboard view for the shell or vendor portal
- When you need a customizable widget grid with drag-and-drop rearrangement
- Do NOT use for static, non-rearrangeable layouts

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

## Related Components

- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) -- card container for widget content
- [DashboardCharts](../dashboard-charts/dashboard-charts.docs.md) -- chart components for widgets
