# Dashboard Service Documentation

The Dashboard Service is a core component of the VC-Shell framework that manages and organizes dashboard widgets. It provides functionality for registering widgets, updating their positions, and retrieving widgets based on user permissions.

## Overview

The Dashboard Service enables the creation of dynamic, customizable dashboards by managing a collection of widgets and their layout positions. It supports permission-based visibility and position persistence.

## File Path
`/framework/core/services/dashboard-service.ts`

## Core Interfaces

### DashboardWidget

```typescript
export interface DashboardWidget {
  id: string;
  name: string;
  component: Component;
  size: DashboardWidgetSize;
  position?: DashboardWidgetPosition;
  permissions?: string[];
  props?: Record<string, unknown>;
}
```

### DashboardWidgetSize

```typescript
export interface DashboardWidgetSize {
  width: number;
  height: number;
}
```

### DashboardWidgetPosition

```typescript
export interface DashboardWidgetPosition {
  x: number;
  y: number;
}
```

### IDashboardService

```typescript
export interface IDashboardService {
  registerWidget: (widget: DashboardWidget) => void;
  getWidgets: () => DashboardWidget[];
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void;
  getLayout: () => Map<string, DashboardWidgetPosition>;
}
```

## Primary Features

### Widget Registration

The service allows registering dashboard widgets with specific sizes and optional positions. Widgets can be registered before the service is initialized (pre-registration) or afterward.

```typescript
// Register a dashboard widget
dashboardService.registerWidget({
  id: 'sales-widget',
  name: 'Sales Overview',
  component: SalesWidgetComponent,
  size: { width: 2, height: 1 },
  position: { x: 0, y: 0 }
});
```

### Permission-Based Widget Visibility

Widgets can specify permission requirements, and the service will only return widgets that the current user has access to.

```typescript
// Register a widget with permission requirements
dashboardService.registerWidget({
  id: 'admin-stats',
  name: 'Administrative Statistics',
  component: AdminStatsComponent,
  size: { width: 3, height: 2 },
  permissions: ['admin', 'analytics']
});
```

### Widget Layout Management

The service maintains the position of each widget and provides methods to update positions as widgets are moved around the dashboard.

```typescript
// Update a widget's position
dashboardService.updateWidgetPosition('sales-widget', { x: 1, y: 2 });

// Get the current layout
const layout = dashboardService.getLayout();
```

## Usage in a Component

The Dashboard Service is typically accessed through the `useDashboard` composable. Here's a real-world example from the `DraggableDashboard` component:

```typescript
// From framework/shared/components/draggable-dashboard/DraggableDashboard.vue
<script setup lang="ts">
import { ref, onMounted, defineExpose } from "vue";
import { useDashboard } from "../../../core/composables/useDashboard";
import { useDashboardGrid } from "./composables/useDashboardGrid";
import { useDashboardDragAndDrop } from "./composables/useDashboardDragAndDrop";

// Initialize Grid
const dashboard = useDashboard();
const {
  widgets,
  layout,
  GRID_COLUMNS,
  getGridRows,
  arrangeWidgetsInRows,
  initializeLayout,
  saveLayoutToLocalStorage,
  loadLayoutFromLocalStorage,
  initializeWithBuiltInPositions,
} = useDashboardGrid();

// Initialize Drag & Drop
const {
  draggedWidget,
  previewPosition,
  displacedWidgets,
  isDragging,
  handleMouseDown,
  setGridContainer,
  isWidgetDisplaced,
  getDisplacedPosition,
} = useDashboardDragAndDrop(dashboard.updateWidgetPosition, getGridRows);

// Public method for rearranging widgets
const rearrangeWidgets = () => {
  arrangeWidgetsInRows(widgets.value);
};

onMounted(() => {
  initializeLayout();
  // Initial size calculation
  getCellSize();
});

// Export public methods
defineExpose({
  rearrangeWidgets,
  recalculateLayout,
  saveLayout,
  useBuiltInPositions,
});
</script>
```

The implementation heavily integrates with specialized composables for dashboard grid management and drag-and-drop functionality:

### Dashboard Grid Integration

The `useDashboardGrid` composable handles the grid layout, widget arrangement, and layout persistence:

```typescript
// From framework/shared/components/draggable-dashboard/composables/useDashboardGrid.ts
export function useDashboardGrid() {
  const dashboard = useDashboard();
  const widgets = computed(() => dashboard.getWidgets());
  const layout = ref(new Map<string, DashboardWidgetPosition>());
  
  // Initialize layout from localStorage or built-in positions
  const initializeLayout = () => {
    // Logic to load layout from localStorage or use built-in positions
    // ...
    
    // Update the reactive layout map
    layout.value = new Map(dashboard.getLayout());
  };
  
  // Save current layout to localStorage
  const saveLayoutToLocalStorage = () => {
    // Logic to save layout to localStorage
    // ...
  };
  
  return {
    widgets,
    layout,
    GRID_COLUMNS,
    getGridRows,
    arrangeWidgetsInRows,
    initializeLayout,
    saveLayoutToLocalStorage,
    loadLayoutFromLocalStorage,
    initializeWithBuiltInPositions,
  };
}
```

### Drag and Drop Integration

The `useDashboardDragAndDrop` composable leverages the Dashboard Service to handle widget dragging and position updates:

```typescript
// From framework/shared/components/draggable-dashboard/composables/useDashboardDragAndDrop.ts
export function useDashboardDragAndDrop(
  updatePosition: (widgetId: string, position: DashboardWidgetPosition) => void,
  getGridRows: () => number
) {
  const dashboard = useDashboard();
  // Drag state management
  const draggedWidget = ref<DashboardWidget | null>(null);
  const previewPosition = ref<DashboardWidgetPosition | null>(null);
  
  // Handle widget position updates when dragging ends
  const handleDragEnd = () => {
    if (draggedWidget.value && previewPosition.value) {
      // Update the widget position in the dashboard service
      updatePosition(draggedWidget.value.id, previewPosition.value);
    }
    
    // Reset drag state
    draggedWidget.value = null;
    previewPosition.value = null;
  };
  
  return {
    draggedWidget,
    previewPosition,
    displacedWidgets,
    isDragging,
    handleMouseDown,
    setGridContainer,
    isWidgetDisplaced,
    getDisplacedPosition,
    // Additional methods...
  };
}
```

## Template Rendering

Here's how the dashboard widgets are rendered in the template:

```vue
<!-- From framework/shared/components/draggable-dashboard/DraggableDashboard.vue -->
<template>
  <VcContainer
    no-padding
    class="vc-dashboard-grid"
  >
    <div
      ref="gridContainerRef"
      class="vc-dashboard-grid__container"
    >
      <!-- Position indicator with smooth animation -->
      <div
        v-if="draggedWidget && previewPosition"
        class="vc-dashboard-grid__position-preview"
        :class="{
          'is-animating': isDragging,
        }"
        :style="widgetStyles.getPreviewStyles(draggedWidget, previewPosition)"
      ></div>

      <!-- Widgets -->
      <DashboardWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        :style="getWidgetStylesWithState(widget)"
        :is-dragging="draggedWidget?.id === widget.id"
        :class="{
          'is-dragging': draggedWidget?.id === widget.id,
          'is-displaced': isWidgetDisplaced(widget.id),
          'is-animating': isDragging && (draggedWidget?.id === widget.id || isWidgetDisplaced(widget.id)),
        }"
        :data-id="widget.id"
        @drag="(e: MouseEvent | TouchEvent) => handleMouseDown(e, widget, e.target as HTMLElement)"
      />
    </div>
  </VcContainer>
</template>
```

## Best Practices

1. **Widget Identification**: Always use unique, descriptive IDs for dashboard widgets to avoid conflicts.

2. **Component Optimization**: Use `markRaw` for widget components to prevent unnecessary reactivity.

3. **Size Considerations**: Design widgets with responsive sizing in mind, considering different screen sizes.

4. **Permission Planning**: Structure widget permissions to align with your application's permission model.

5. **Position Management**: Consider whether to use built-in positions, allow user customization, or a combination of both.

6. **Layout Persistence**: Implement a strategy for saving and restoring widget layouts, such as using localStorage or a backend API.

## Related Composables

- `useDashboard`: Provides access to the Dashboard Service within Vue components.
- `provideDashboardService`: Creates and provides the Dashboard Service to the component tree.
- `registerDashboardWidget`: Utility function to pre-register dashboard widgets before service initialization. 
