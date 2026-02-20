// Main component
export { default as DraggableDashboard } from "@shared/components/draggable-dashboard/DraggableDashboard.vue";

// Types
export type {
  IDashboardWidget,
  DashboardWidgetPosition,
  DashboardWidgetSize,
  DashboardDragEvent,
  DashboardGridConfig,
} from "@shared/components/draggable-dashboard/types";

// Gridstack composables (for advanced usage)
export { useGridstack } from "@shared/components/draggable-dashboard/composables/useGridstack";
export type { UseGridstackOptions, UseGridstackReturn } from "@shared/components/draggable-dashboard/composables/useGridstack";

// Import and re-export to avoid Storybook docgen issues with direct re-exports
import {
  toGridstackWidget as _toGridstackWidget,
  fromGridstackNode as _fromGridstackNode,
  loadLayoutFromStorage as _loadLayoutFromStorage,
  saveLayoutToStorage as _saveLayoutToStorage,
  mergeLayoutWithWidgets as _mergeLayoutWithWidgets,
  clearLayoutStorage as _clearLayoutStorage,
  LAYOUT_STORAGE_KEY as _LAYOUT_STORAGE_KEY,
} from "@shared/components/draggable-dashboard/composables/useGridstackAdapter";

export const toGridstackWidget = _toGridstackWidget;
export const fromGridstackNode = _fromGridstackNode;
export const loadLayoutFromStorage = _loadLayoutFromStorage;
export const saveLayoutToStorage = _saveLayoutToStorage;
export const mergeLayoutWithWidgets = _mergeLayoutWithWidgets;
export const clearLayoutStorage = _clearLayoutStorage;
export const LAYOUT_STORAGE_KEY = _LAYOUT_STORAGE_KEY;
