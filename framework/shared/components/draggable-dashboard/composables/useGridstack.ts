/**
 * Gridstack Integration Composable
 *
 * Provides Vue 3 integration with Gridstack.js library.
 * Handles initialization, event binding, and cleanup.
 */

import { ref, shallowRef, onUnmounted, watch, nextTick, type Ref, type ShallowRef } from "vue";
import { GridStack, type GridStackOptions, type GridStackNode } from "gridstack";
import type { IDashboardWidget, DashboardWidgetPosition } from "@shared/components/draggable-dashboard/types";
import {
  toGridstackWidget,
  fromGridstackNode,
  loadLayoutFromStorage,
  saveLayoutToStorage,
  mergeLayoutWithWidgets,
} from "@shared/components/draggable-dashboard/composables/useGridstackAdapter";

/**
 * Default Gridstack configuration
 */
const DEFAULT_OPTIONS: GridStackOptions = {
  column: 12,
  cellHeight: 80,
  margin: "10px",
  float: false,
  animate: true,
  // Disable responsive column changes - always use 12 columns
  columnOpts: {
    breakpoints: [{ w: 0, c: 12 }], // Always 12 columns regardless of width
  },
  draggable: {
    handle: ".grid-stack-item-content",
  },
  resizable: {
    handles: "se", // Only bottom-right corner
  },
};

/**
 * Options for useGridstack composable
 */
export interface UseGridstackOptions {
  /** Gridstack configuration options */
  gridOptions?: Partial<GridStackOptions>;
  /** Enable widget resizing */
  resizable?: boolean;
  /** Auto-save layout to localStorage */
  autoSave?: boolean;
  /** Callback when layout changes */
  onLayoutChange?: (layout: Map<string, DashboardWidgetPosition>) => void;
}

/**
 * Return type for useGridstack composable
 */
export interface UseGridstackReturn {
  /** Reference to GridStack instance */
  grid: ShallowRef<GridStack | null>;
  /** Current layout map */
  layout: Ref<Map<string, DashboardWidgetPosition>>;
  /** Whether grid is initialized */
  isInitialized: Ref<boolean>;
  /** Initialize grid on element */
  initGrid: (element: HTMLElement) => void;
  /** Destroy grid instance */
  destroyGrid: () => void;
  /** Add a widget to the grid */
  addWidget: (widget: IDashboardWidget) => void;
  /** Remove a widget from the grid */
  removeWidget: (widgetId: string) => void;
  /** Update widget position */
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void;
  /** Save current layout */
  saveLayout: () => void;
  /** Load layout from storage */
  loadLayout: () => void;
  /** Reset to built-in positions */
  resetToDefaults: () => void;
  /** Batch update mode (disable animations) */
  batchUpdate: (fn: () => void) => void;
}

/**
 * Vue 3 composable for Gridstack integration
 */
export function useGridstack(
  widgets: Ref<IDashboardWidget[]>,
  options: UseGridstackOptions = {},
): UseGridstackReturn {
  const {
    gridOptions = {},
    resizable = false,
    autoSave = true,
    onLayoutChange,
  } = options;

  // State
  const grid = shallowRef<GridStack | null>(null);
  const layout = ref<Map<string, DashboardWidgetPosition>>(new Map());
  const isInitialized = ref(false);
  const isUpdating = ref(false);

  /**
   * Merge options with defaults
   */
  const mergedOptions: GridStackOptions = {
    ...DEFAULT_OPTIONS,
    ...gridOptions,
    disableResize: !resizable,
  };

  /**
   * Initialize the grid on a DOM element
   */
  const initGrid = (element: HTMLElement): void => {
    if (grid.value) {
      console.warn("[useGridstack] Grid already initialized");
      return;
    }

    // Load saved layout
    const savedLayout = loadLayoutFromStorage();
    layout.value = mergeLayoutWithWidgets(widgets.value, savedLayout);

    // Initialize Gridstack
    grid.value = GridStack.init(mergedOptions, element);

    // Bind event handlers
    grid.value.on("change", handleChange);
    grid.value.on("added", handleAdded);
    grid.value.on("removed", handleRemoved);

    // Explicitly load widgets with their positions to ensure proper layout
    // This is needed because Vue renders DOM after Gridstack.init() processes children
    const widgetData = widgets.value.map((widget) => {
      const position = layout.value.get(widget.id);
      return toGridstackWidget(widget, position);
    });

    // Use load() to apply positions - this updates existing items
    grid.value.load(widgetData);

    isInitialized.value = true;
  };

  /**
   * Handle grid change events (drag/resize)
   */
  const handleChange = (_event: Event, nodes: GridStackNode[]): void => {
    if (isUpdating.value) return;

    for (const node of nodes) {
      const { id, position } = fromGridstackNode(node);
      if (id) {
        layout.value.set(id, position);
      }
    }

    // Trigger reactivity
    layout.value = new Map(layout.value);

    // Notify callback
    onLayoutChange?.(layout.value);

    // Auto-save
    if (autoSave) {
      saveLayout();
    }
  };

  /**
   * Handle widget added event
   */
  const handleAdded = (_event: Event, nodes: GridStackNode[]): void => {
    for (const node of nodes) {
      const { id, position } = fromGridstackNode(node);
      if (id && !layout.value.has(id)) {
        layout.value.set(id, position);
      }
    }
    layout.value = new Map(layout.value);
  };

  /**
   * Handle widget removed event
   */
  const handleRemoved = (_event: Event, nodes: GridStackNode[]): void => {
    for (const node of nodes) {
      if (node.id) {
        layout.value.delete(node.id);
      }
    }
    layout.value = new Map(layout.value);
  };

  /**
   * Destroy the grid instance
   */
  const destroyGrid = (): void => {
    if (grid.value) {
      grid.value.off("change");
      grid.value.off("added");
      grid.value.off("removed");
      grid.value.destroy(false); // false = don't remove DOM elements
      grid.value = null;
      isInitialized.value = false;
    }
  };

  /**
   * Add a widget to the grid
   */
  const addWidget = (widget: IDashboardWidget): void => {
    if (!grid.value) return;

    const position = layout.value.get(widget.id) ?? widget.position;
    const gsWidget = toGridstackWidget(widget, position);

    // Find the DOM element for this widget
    const element = document.querySelector(`[gs-id="${widget.id}"]`);
    if (element) {
      grid.value.makeWidget(element as HTMLElement, gsWidget);
    }
  };

  /**
   * Remove a widget from the grid
   */
  const removeWidget = (widgetId: string): void => {
    if (!grid.value) return;

    const element = document.querySelector(`[gs-id="${widgetId}"]`);
    if (element) {
      grid.value.removeWidget(element as HTMLElement, false);
    }
    layout.value.delete(widgetId);
  };

  /**
   * Update widget position programmatically
   */
  const updateWidgetPosition = (widgetId: string, position: DashboardWidgetPosition): void => {
    if (!grid.value) return;

    const element = document.querySelector(`[gs-id="${widgetId}"]`);
    if (element) {
      isUpdating.value = true;
      grid.value.update(element as HTMLElement, { x: position.x, y: position.y });
      layout.value.set(widgetId, position);
      layout.value = new Map(layout.value);
      isUpdating.value = false;
    }
  };

  /**
   * Save current layout to localStorage
   */
  const saveLayout = (): void => {
    saveLayoutToStorage(widgets.value, layout.value);
  };

  /**
   * Load layout from localStorage
   */
  const loadLayout = (): void => {
    const savedLayout = loadLayoutFromStorage();
    if (savedLayout) {
      layout.value = mergeLayoutWithWidgets(widgets.value, savedLayout);
      applyLayoutToGrid();
    }
  };

  /**
   * Reset to built-in widget positions
   */
  const resetToDefaults = (): void => {
    layout.value = new Map();
    for (const widget of widgets.value) {
      if (widget.position) {
        layout.value.set(widget.id, { ...widget.position });
      }
    }
    applyLayoutToGrid();
    saveLayout();
  };

  /**
   * Apply current layout to grid
   */
  const applyLayoutToGrid = (): void => {
    if (!grid.value) return;

    isUpdating.value = true;
    grid.value.batchUpdate();

    for (const widget of widgets.value) {
      const position = layout.value.get(widget.id);
      if (position) {
        const element = document.querySelector(`[gs-id="${widget.id}"]`);
        if (element) {
          grid.value.update(element as HTMLElement, {
            x: position.x,
            y: position.y,
          });
        }
      }
    }

    grid.value.batchUpdate(false);
    isUpdating.value = false;
  };

  /**
   * Execute function in batch update mode
   */
  const batchUpdate = (fn: () => void): void => {
    if (!grid.value) {
      fn();
      return;
    }

    isUpdating.value = true;
    grid.value.batchUpdate();
    fn();
    grid.value.batchUpdate(false);
    isUpdating.value = false;
  };

  // Watch for widget changes
  watch(
    widgets,
    async (newWidgets, oldWidgets) => {
      if (!grid.value || !isInitialized.value) return;

      await nextTick();

      // Find added widgets
      const addedWidgets = newWidgets.filter(
        (w) => !oldWidgets?.some((ow) => ow.id === w.id),
      );

      // Find removed widgets
      const removedWidgetIds = oldWidgets
        ?.filter((w) => !newWidgets.some((nw) => nw.id === w.id))
        .map((w) => w.id) ?? [];

      // Remove old widgets
      for (const id of removedWidgetIds) {
        removeWidget(id);
      }

      // Add new widgets
      for (const widget of addedWidgets) {
        addWidget(widget);
      }
    },
    { deep: false },
  );

  // Cleanup on unmount
  onUnmounted(() => {
    destroyGrid();
  });

  return {
    grid,
    layout,
    isInitialized,
    initGrid,
    destroyGrid,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    saveLayout,
    loadLayout,
    resetToDefaults,
    batchUpdate,
  };
}
