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
 * Dashboard powered by Gridstack.js: widgets are dragged into a grid, the layout persists
 * to localStorage, built-in widget positions are honoured, and resizing is optional.
 */
import { ref } from "vue";
import GridstackDashboard from "@shell/dashboard/draggable-dashboard/GridstackDashboard.vue";

// Props
interface Props {
  /** Show drag handle icons on widgets */
  showDragHandles?: boolean;
  /** Enable widget resizing */
  resizable?: boolean;
  /**
   * Aria label for the dashboard container. Left without a default here on
   * purpose: this is a pass-through, and GridstackDashboard owns the wording.
   * A copy in both places is how they came to disagree (VCST-5805).
   */
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  showDragHandles: false,
  resizable: false,
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
