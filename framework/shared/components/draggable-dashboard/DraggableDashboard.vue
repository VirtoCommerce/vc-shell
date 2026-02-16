<template>
  <GridstackDashboard
    ref="dashboardRef"
    :show-drag-handles="showDragHandles"
    :resizable="resizable"
    :aria-label="ariaLabel"
  />
</template>

<script setup lang="ts">
/**
 * DraggableDashboard Component
 *
 * A flexible dashboard powered by Gridstack.js that allows widgets to be
 * dragged and arranged in a grid layout.
 *
 * Features:
 * - Drag and drop interface for arranging widgets
 * - Automatic layout persistence in localStorage
 * - Support for built-in widget positions
 * - Accessibility support (a11y)
 * - Optional widget resizing
 */
import { ref } from "vue";
import GridstackDashboard from "./GridstackDashboard.vue";

// Props
interface Props {
  /** Show drag handle icons on widgets */
  showDragHandles?: boolean;
  /** Enable widget resizing */
  resizable?: boolean;
  /** Aria label for the dashboard container */
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  showDragHandles: false,
  resizable: false,
  ariaLabel: "Dashboard widgets. Drag widgets to rearrange.",
});

// State
const dashboardRef = ref<InstanceType<typeof GridstackDashboard> | null>(null);

// Public methods (delegated to GridstackDashboard)
const rearrangeWidgets = (): void => {
  dashboardRef.value?.rearrangeWidgets?.();
};

const recalculateLayout = (): void => {
  dashboardRef.value?.recalculateLayout?.();
};

const saveLayout = (): void => {
  dashboardRef.value?.saveLayout?.();
};

const useBuiltInPositions = (): boolean => {
  return dashboardRef.value?.useBuiltInPositions?.() ?? false;
};

// Expose public methods
defineExpose({
  rearrangeWidgets,
  recalculateLayout,
  saveLayout,
  useBuiltInPositions,
});
</script>
