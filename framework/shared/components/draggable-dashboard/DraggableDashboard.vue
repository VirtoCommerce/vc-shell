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

<script setup lang="ts">
/**
 * DraggableDashboard Component
 *
 * A flexible dashboard that allows widgets to be dragged and arranged in a grid layout.
 * Features:
 * - Drag and drop interface for arranging widgets
 * - Automatic layout calculation
 * - Collision detection and displacement
 * - Responsive grid
 * - Layout persistence in localStorage
 * - Support for built-in widget positions
 *
 * Widget positions are automatically saved to localStorage whenever the layout changes
 * and restored when the dashboard is initialized.
 *
 * Position initialization priority:
 * 1. Positions from localStorage (if available)
 * 2. Built-in widget positions (if defined)
 * 3. Automatic arrangement in rows
 */
import { ref, onMounted, onUnmounted, defineExpose, computed, watch } from "vue";
import type { Ref } from "vue";
import type { IDashboardWidget } from "./types";
import { useDashboardGrid } from "./composables/useDashboardGrid";
import { useDashboardDragAndDrop } from "./composables/useDashboardDragAndDrop";
import { useDashboard } from "../../../core/composables/useDashboard";
import { useCellSizeCalculator } from "./composables/useCellSizeCalculator";
import { useWidgetStyles } from "./composables/useWidgetStyles";
import { useResizeObserver } from "./composables/useResizeObserver";
import VcContainer from "../../../ui/components/atoms/vc-container/vc-container.vue";
import DashboardWidget from "./_internal/DashboardWidget.vue";

// Reference to the grid container for coordinate calculations
const gridContainerRef = ref<HTMLElement | null>(null);

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
  handleNewWidget,
} = useDashboardGrid();

// Initialize cellSize calculator
const cellSizeCalculator = useCellSizeCalculator(GRID_COLUMNS);

// Function for getting the cell sizes
const getCellSize = () => {
  return cellSizeCalculator.calculateCellSize(gridContainerRef.value);
};

// Initialize widget styles
const widgetStyles = useWidgetStyles(getCellSize);

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

// Pass grid container reference to the dragging composable
watch(gridContainerRef, (container) => {
  if (container) {
    setGridContainer(container);
  }
});

// Watch for new widgets and handle their placement
watch(
  widgets,
  (newWidgets, oldWidgets) => {
    if (!oldWidgets || newWidgets.length > oldWidgets.length) {
      // New widgets have been added
      const newWidgetIds = newWidgets
        .filter(w => !oldWidgets?.some(ow => ow.id === w.id))
        .map(w => w.id);
      
      newWidgetIds.forEach(widgetId => {
        const widget = newWidgets.find(w => w.id === widgetId);
        if (widget && !layout.value.has(widgetId)) {
          // Widget doesn't have a position yet, find a free one
          handleNewWidget(widget);
        }
      });
    }
  },
  { immediate: false },
);

// Watch for layout changes and save to localStorage
watch(
  layout,
  () => {
    saveLayoutToLocalStorage();
  },
  { deep: true },
);

// Handle container resize with debounce
const handleContainerResize = (entries: ResizeObserverEntry[]) => {
  if (!entries.length || isDragging.value) return;

  const entry = entries[0];
  const container = gridContainerRef.value;

  if (container) {
    cellSizeCalculator.handleContainerResize(container);
  }
};

// Initialize resize observer
const resizeObserver = useResizeObserver(handleContainerResize, { debounceMs: 300 });

// Gets the styles for the widget depending on its state
const getWidgetStylesWithState = (widget: IDashboardWidget) => {
  const position = layout.value.get(widget.id);
  const isDragged = draggedWidget.value?.id === widget.id;
  const displacedPosition = isWidgetDisplaced(widget.id) ? getDisplacedPosition(widget.id) : undefined;

  return widgetStyles.getWidgetStyles(widget, position, isDragged, displacedPosition);
};

// Public method for rearranging widgets
const rearrangeWidgets = () => {
  arrangeWidgetsInRows(widgets.value);
};

// Public method to manually trigger a layout recalculation
const recalculateLayout = () => {
  cellSizeCalculator.clearCache();
  recalculateWidgetPositions();
};

/**
 * Manually saves the current dashboard layout to localStorage
 *
 * The layout is automatically saved when it changes, but this method
 * can be used to trigger a save operation manually if needed.
 */
const saveLayout = () => {
  saveLayoutToLocalStorage();
};

/**
 * Initializes dashboard widgets using their built-in positions
 *
 * This is used to reset the layout to the original widget positions
 * defined when the widgets were registered.
 *
 * @returns {boolean} True if at least one widget had a built-in position
 */
const useBuiltInPositions = () => {
  const result = initializeWithBuiltInPositions();
  return result;
};

// Recalculate widget positions based on new container size
const recalculateWidgetPositions = () => {
  // First recalculate cell size to get updated dimensions
  getCellSize();

  // Update previous width
  if (gridContainerRef.value) {
    cellSizeCalculator.previousContainerWidth.value = gridContainerRef.value.getBoundingClientRect().width;
  }
};

// Add cleanup on component unmount
onMounted(() => {
  initializeLayout();
  // Initial size calculation
  getCellSize();

  // Initialize resize observer for the container
  if (gridContainerRef.value && resizeObserver.isSupported) {
    resizeObserver.observe(gridContainerRef.value);
  }

  // Also keep the window resize listener for fallback compatibility
  window.addEventListener("resize", cellSizeCalculator.clearCache);
});

onUnmounted(() => {
  // Cleanup window event listener
  window.removeEventListener("resize", cellSizeCalculator.clearCache);
});

// Export public methods
defineExpose({
  rearrangeWidgets,
  recalculateLayout,
  saveLayout,
  useBuiltInPositions,
});
</script>

<style lang="scss">
:root {
  --dashboard-background: var(--additional-50);
  --dashboard-grid-line: var(--neutrals-200);
  --dashboard-grid-line-active: var(--neutrals-300);
  --dashboard-grid-border: var(--neutrals-300);
  --dashboard-preview-bg: var(--primary-100);
  --dashboard-preview-border: var(--primary-500);
  --dashboard-valid-bg: var(--secondary-100);
  --dashboard-valid-border: var(--secondary-500);
  --dashboard-cell-height: 80px;
  --dashboard-cell-gap-vertical: 24px;
  --dashboard-cell-gap-horizontal: 18px;
  --dashboard-widget-gap: 20px;
  --dashboard-animation-duration: 200ms;
  --dashboard-animation-timing: cubic-bezier(0.4, 0, 0.2, 1);
  --dashboard-transition-duration: 0.35s;
  --dashboard-transition-timing: cubic-bezier(0.25, 0.1, 0.25, 1);
  --dashboard-drag-scale: 1.02;
  --dashboard-gap: 20px;

  --dashboard-position-preview-color: rgb(from var(--primary-500) r g b / 0.15);
  --dashboard-position-preview-border-color: rgb(from var(--primary-500) r g b / 0.5);
}

.vc-dashboard-grid {
  background-color: var(--dashboard-background);
  touch-action: none;

  &__container {
    @apply tw-w-full tw-h-full;
    padding: var(--dashboard-cell-gap-vertical) var(--dashboard-cell-gap-horizontal);
    overflow: auto;
    min-height: calc(var(--dashboard-cell-height) * 12 + var(--dashboard-cell-gap-vertical) * 2);
  }

  &__position-preview {
    position: absolute;
    background-color: var(--dashboard-position-preview-color);
    border: 2px dashed var(--dashboard-position-preview-border-color);
    border-radius: 8px;
    z-index: 100;
    pointer-events: none;
    opacity: 0.8;
    transition: transform var(--dashboard-transition-duration) var(--dashboard-transition-timing);

    &.is-animating {
      transition: transform var(--dashboard-transition-duration) var(--dashboard-transition-timing);
    }
  }
}

// Widget styles
.dashboard-widget {
  position: absolute;
  transition:
    transform var(--dashboard-transition-duration) var(--dashboard-transition-timing),
    opacity 0.2s ease;
  touch-action: none;
  will-change: transform;
  backface-visibility: hidden;

  &:hover {
    cursor: move;
  }

  &.is-dragging {
    z-index: 1000;
    opacity: 0;
    transition: none !important; /* Turn off all animations when dragging */
    pointer-events: none;
  }

  &.is-displaced {
    z-index: 10;
    transition: transform var(--dashboard-transition-duration) var(--dashboard-transition-timing);
  }

  &.is-animating {
    transition: transform var(--dashboard-transition-duration) var(--dashboard-transition-timing);
  }
}

@keyframes collision-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--danger-500), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--danger-500), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--danger-500), 0);
  }
}

@keyframes valid-pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
