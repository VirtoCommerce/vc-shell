---
title: DraggableDashboard
category: composables
group: utilities
internal: true
---

# DraggableDashboard

Gridstack.js-powered dashboard container that renders registered widgets in a drag-and-drop grid layout. Automatically persists layout changes to localStorage and supports widget resizing. This is the main dashboard component used as the landing page in vc-shell applications, providing a customizable overview with KPI widgets, charts, quick actions, and data summaries.

## When to Use

- Use as the main dashboard view for a shell application
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

| Prop              | Type      | Default                  | Description                                |
| ----------------- | --------- | ------------------------ | ------------------------------------------ |
| `showDragHandles` | `boolean` | `false`                  | Shows visible drag handle icons on widgets |
| `resizable`       | `boolean` | `false`                  | Enables widget resize handles              |
| `ariaLabel`       | `string`  | `"Dashboard widgets..."` | Accessible label for the grid container    |

## Exposed Methods

| Method                  | Description                            |
| ----------------------- | -------------------------------------- |
| `rearrangeWidgets()`    | Re-layout all widgets to fill gaps     |
| `recalculateLayout()`   | Recalculate grid dimensions            |
| `saveLayout()`          | Persist current layout to localStorage |
| `useBuiltInPositions()` | Reset to default widget positions      |

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
    <DraggableDashboard
      ref="dashboardRef"
      :resizable="true"
    />
  </div>
</template>
```

## Details

- **Grid system**: Uses Gridstack.js under the hood, which provides a 12-column responsive grid. Widget `size.width` is in grid columns (1-12), `size.height` is in grid rows.
- **Layout persistence**: When the user rearranges or resizes widgets, the new layout — position **and** size — is automatically saved to localStorage. On next visit, the persisted layout is restored. A widget's declared `size` is only the default: once the grid reports a live size, that is what is stored and restored.
- **Widget registration**: Widgets must be registered via `useDashboard().registerWidget()` before the dashboard mounts. The component reads the widget registry and creates grid items for each.
- **markRaw requirement**: Widget components must be wrapped in `markRaw()` when registering to prevent Vue from making them reactive (which would cause performance issues with the grid system).
- **Responsive behavior**: On mobile viewports, widgets stack vertically in a single column. Drag-and-drop is disabled on touch devices for better usability.
- **Module-ready gate**: When the host injects `ModulesReadyKey` (provided by `@vc-shell/mf-host`'s `registerRemoteModules`), the grid is held back until remote modules finish installing. This prevents widgets from mounting before their owning module's `defineAppModule.install` has merged its locales into vue-i18n — which would render translation keys instead of translated strings. Hosts without Module Federation (or tests/Storybook) inject nothing, and a fallback `ref(true)` keeps behavior unchanged.
- **Loading skeletons**: While `ModulesReadyKey` is `false`, the dashboard renders a CSS-grid of pulsing placeholder cards instead of an empty container. Card sizes are restored from the last persisted layout in `localStorage` (so returning users see placeholders matching their real widgets); first-time visitors get a default layout of four 6×6 placeholders. Animations respect `prefers-reduced-motion`.

## Tips

- Always use `markRaw()` when passing component references to `registerWidget()`. Without it, Vue's reactivity system wraps the component, causing unnecessary overhead and potential rendering issues.
- Widget `position` values define the initial placement. Once the user rearranges widgets, the persisted layout takes precedence over the registered positions.
- Use `recalculateLayout()` after dynamically adding or removing widgets at runtime to ensure the grid adjusts properly.
- The 12-column grid means common widget widths are: 3 (quarter), 4 (third), 6 (half), and 12 (full width).
- Register widgets during module `install()` before the dashboard component mounts. Late registrations may not be picked up.

## Accessibility

Widgets can be rearranged without a pointer, which WCAG 2.5.7 Dragging Movements requires:

| Key                 | Action                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `Tab`               | Move focus between widgets (each one is in the tab order)                 |
| `Enter` / `Space`   | Pick the focused widget up, and drop it again                             |
| Arrow keys          | While picked up, move the widget one grid cell                            |
| `Shift` + arrow key | While picked up, resize by one cell (needs `resizable`)                   |
| `Escape`            | Cancel the move and restore the position **and size** it was picked up at |

Every step is announced through the component's `aria-live` region, and the picked-up widget is outlined so the state is visible to sighted keyboard users. Moves are clamped at the grid edges and at the 2×2 minimum widget size, and the layout is persisted when the widget is dropped — the same as after a mouse drag.

Announcements report where the widget actually ended up rather than the cell it was asked to move to: Gridstack compacts rows, so the two can differ. Repeated resizes accumulate (6 → 7 → 8 cells), and a keypress the minimum span refuses is not announced as a change.

!!! note "The widget itself is the control"
There is no separate "move" button. Gridstack only implements pointer dragging, so the widget is focusable and handles the keys directly. If you render your own interactive elements inside a widget, they keep working — the arrow keys only act while the widget has been explicitly picked up.

## Advanced / Exports

Besides the `DraggableDashboard` component, `draggable-dashboard/index.ts` re-exports these symbols through the framework root, for building a custom Gridstack dashboard:

| Export                    | Kind       | Description                                                 |
| ------------------------- | ---------- | ----------------------------------------------------------- |
| `useGridstack`            | composable | Low-level Gridstack integration for a custom dashboard      |
| `UseGridstackOptions`     | type       | Options for `useGridstack`                                  |
| `UseGridstackReturn`      | type       | Return shape of `useGridstack`                              |
| `DashboardWidgetSize`     | type       | Widget size shape: `{ width, height }`                      |
| `DashboardWidgetPosition` | type       | Widget position shape: `{ x, y }`                           |
| `DashboardDragEvent`      | type       | Payload emitted on widget drag/reorder                      |
| `DashboardGridConfig`     | type       | Grid configuration options                                  |
| `toGridstackWidget`       | function   | Maps an `IDashboardWidget` to a Gridstack widget descriptor |
| `fromGridstackNode`       | function   | Maps a Gridstack node back to layout data                   |
| `loadLayoutFromStorage`   | function   | Reads persisted layout from localStorage                    |
| `saveLayoutToStorage`     | function   | Writes layout to localStorage                               |
| `mergeLayoutWithWidgets`  | function   | Merges a persisted layout onto the registered widget set    |
| `clearLayoutStorage`      | function   | Clears the persisted layout                                 |
| `LAYOUT_STORAGE_KEY`      | constant   | localStorage key used for layout persistence                |

## Related Components

- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) -- card container for widget content
- [DashboardCharts](../dashboard-charts/dashboard-charts.docs.md) -- chart components for widgets
