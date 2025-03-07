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
        :style="getPreviewStyles(draggedWidget, previewPosition)"
      ></div>

      <!-- Widgets -->
      <DashboardWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        :style="getWidgetStyles(widget)"
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
import { ref, onMounted, onUnmounted, defineExpose, computed, watch, onUpdated } from "vue";
import type { Ref, Component } from "vue";
import type { IDashboardWidget } from "./types";
import { useDashboardGrid } from "./composables/useDashboardGrid";
import { useDashboardDragAndDrop } from "./composables/useDashboardDragAndDrop";
import { useDashboard } from "../../../core/composables/useDashboard";
import VcContainer from "../../../ui/components/atoms/vc-container/vc-container.vue";
import DashboardWidget from "./_internal/DashboardWidget.vue";

// Reference to the grid container for coordinate calculations
const gridContainerRef = ref<HTMLElement | null>(null);

// Initialize Grid
const dashboard = useDashboard();
const {
  widgets,
  layout,

  arrangeWidgetsInRows,
  initializeLayout,
  getGridRows,
} = useDashboardGrid();

// Initialize Drag & Drop
const { draggedWidget, previewPosition, displacedWidgets, isDragging, handleMouseDown, setGridContainer } =
  useDashboardDragAndDrop(dashboard.updateWidgetPosition, getGridRows);

// Pass grid container reference to the dragging composable
watch(gridContainerRef, (container) => {
  if (container) {
    setGridContainer(container);
  }
});

// Cached cell size
const cellSizeCache = ref<{ width: number; height: number } | null>(null);
// Previous container width
const previousContainerWidth = ref<number>(0);
// ResizeObserver instance
const resizeObserver = ref<ResizeObserver | null>(null);
// Debounce timer
const resizeDebounceTimer = ref<number | null>(null);

// Function to get cell size with caching
const getCellSize = () => {
  if (cellSizeCache.value) return cellSizeCache.value;
  if (!gridContainerRef.value) return { width: 0, height: 0 };

  const rect = gridContainerRef.value.getBoundingClientRect();
  const availableWidth = rect.width - 2 * 18; // Subtract horizontal padding (18px on each side)
  const cellWidthWithGap = availableWidth / 12; // Total width including gap

  const size = {
    width: Math.max(cellWidthWithGap, 0), // Protection from negative values
    height: 80, // Cell height remains the same
  };

  cellSizeCache.value = size;
  previousContainerWidth.value = rect.width;
  return size;
};

// Clear cache when window is resized
const clearCellSizeCache = () => {
  cellSizeCache.value = null;
};

// Recalculate widget positions based on new container size
const recalculateWidgetPositions = () => {
  // First recalculate cell size to get updated dimensions
  getCellSize();

  // Update previous width
  if (gridContainerRef.value) {
    previousContainerWidth.value = gridContainerRef.value.getBoundingClientRect().width;
  }
};

// Handle container resize with debounce
const handleContainerResize = (entries: ResizeObserverEntry[]) => {
  if (!entries.length || isDragging.value) return;

  const entry = entries[0];
  const newWidth = entry.contentRect.width;

  // Clear cache to force recalculation of sizes
  clearCellSizeCache();

  // If width changed significantly (more than 5% or 50px), reposition widgets
  const widthChange = Math.abs(newWidth - previousContainerWidth.value);
  const widthChangePercent = previousContainerWidth.value ? (widthChange / previousContainerWidth.value) * 100 : 0;

  if (widthChangePercent > 5 || widthChange > 50) {
    recalculateWidgetPositions();
  }
}; // 300ms debounce

// Get styles for preview position indicator
const getPreviewStyles = (widget: IDashboardWidget, position: { x: number; y: number }) => {
  const cellSize = getCellSize();
  if (!position || !widget?.size) return {};

  const widgetGap = 20; // Widget gap in pixels

  return {
    width: `${widget.size.width * cellSize.width - widgetGap}px`,
    height: `${widget.size.height * cellSize.height - widgetGap}px`,
    transform: `translate(${position.x * cellSize.width + widgetGap / 2}px, ${position.y * cellSize.height + widgetGap / 2}px)`,
  };
};

// Helper to check if widget is being displaced
const isWidgetDisplaced = (widgetId: string) => {
  return displacedWidgets.value.has(widgetId);
};

// Get combined widget styles for absolute positioning
const getWidgetStyles = computed(() => (widget: IDashboardWidget) => {
  const position = layout.value.get(widget.id);
  if (!position) return { display: "none" };

  const cellSize = getCellSize();
  const widgetGap = 20; // Widget gap in pixels

  // Calculate actual dimensions with gaps
  const width = widget.size.width * cellSize.width - widgetGap;
  const height = widget.size.height * cellSize.height - widgetGap;

  // Calculate position with gaps
  const left = position.x * cellSize.width + widgetGap / 2;
  const top = position.y * cellSize.height + widgetGap / 2;

  // Base styles for all widgets
  const baseStyles = {
    position: "absolute",
    width: `${width}px`,
    height: `${height}px`,
  };

  // If widget is being displaced by another widget
  if (isWidgetDisplaced(widget.id)) {
    const newPos = displacedWidgets.value.get(widget.id)!;
    return {
      ...baseStyles,
      transform: `translate(${newPos.x * cellSize.width + widgetGap / 2}px, ${newPos.y * cellSize.height + widgetGap / 2}px)`,
      transition: "transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)",
      zIndex: "10",
    } as Record<string, string>;
  }

  // If widget is currently being dragged
  if (draggedWidget.value?.id === widget.id) {
    return {
      ...baseStyles,
      transform: `translate(${left}px, ${top}px)`,
      opacity: "0", // Hide original since clone is displayed
      pointerEvents: "none",
      zIndex: "1",
      transition: "none", // Disable animations for the source widget
    } as Record<string, string>;
  }

  // Regular widget
  return {
    ...baseStyles,
    transform: `translate(${left}px, ${top}px)`,
    transition: "transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)",
  } as Record<string, string>;
});

// Public method for rearranging widgets
const rearrangeWidgets = () => {
  arrangeWidgetsInRows(widgets.value);
};

// Public method to manually trigger a layout recalculation
const recalculateLayout = () => {
  clearCellSizeCache();
  recalculateWidgetPositions();
};

// Add cleanup on component unmount
onMounted(() => {
  initializeLayout();
  // Initial size calculation
  getCellSize();

  // Initialize resize observer for the container
  if (gridContainerRef.value && window.ResizeObserver) {
    resizeObserver.value = new ResizeObserver(handleContainerResize);
    resizeObserver.value.observe(gridContainerRef.value);
  }

  // Also keep the window resize listener for fallback compatibility
  window.addEventListener("resize", clearCellSizeCache);
});

onUnmounted(() => {
  // Cleanup resize observer
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }

  // Clear debounce timer if any
  if (resizeDebounceTimer.value !== null) {
    window.clearTimeout(resizeDebounceTimer.value);
    resizeDebounceTimer.value = null;
  }

  window.removeEventListener("resize", clearCellSizeCache);
});

// Export public methods
defineExpose({
  rearrangeWidgets,
  recalculateLayout,
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
  --dashboard-widget-shadow-base: 0px 0px 6px -2px rgb(from var(--neutrals-950) r g b / 0.1);
  --dashboard-widget-shadow-elevated: 3px 9px 15px -3px rgb(from var(--neutrals-950) r g b / 0.08);
  --dashboard-position-preview-color: rgb(from var(--primary-500) r g b / 0.15);
  --dashboard-position-preview-border-color: rgb(from var(--primary-500) r g b / 0.5);
}

.vc-dashboard-grid {
  @apply tw-w-full tw-h-full;
  background-color: var(--dashboard-background);
  touch-action: none;

  &__container {
    @apply tw-w-full tw-h-full tw-relative;
    padding: var(--dashboard-cell-gap-vertical) var(--dashboard-cell-gap-horizontal);
    position: relative;
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
