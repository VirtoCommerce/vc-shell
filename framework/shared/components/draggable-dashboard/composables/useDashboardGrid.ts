import { computed } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import { useDashboard } from "../../../../core/composables/useDashboard";
import { useLayoutPersistence } from "./useLayoutPersistence";
import { useGridSystem } from "./useGridSystem";
import { useWidgetLayout } from "./useWidgetLayout";

// LocalStorage key for dashboard layout
const DASHBOARD_LAYOUT_KEY = "vc-dashboard-layout";

/**
 * Main composable for managing the dashboard
 *
 * Combines functionality for working with the grid, widget placement, and layout persistence
 *
 * @returns An object with functions for working with the dashboard
 */
export function useDashboardGrid() {
  // Dashboard service
  const dashboard = useDashboard();

  // Reactive properties of widgets and layout
  const widgets = computed(() => dashboard.getWidgets());
  const layout = computed(() => dashboard.getLayout());

  // Initialize subsystems
  const grid = useGridSystem();

  const widgetLayout = useWidgetLayout(dashboard.updateWidgetPosition);

  // Hook for working with localStorage
  const persistence = useLayoutPersistence(DASHBOARD_LAYOUT_KEY, dashboard.updateWidgetPosition);

  /**
   * Gets the current number of rows in the grid
   */
  const getGridRows = (): number => {
    return grid.updateGridRows(widgets.value, layout.value);
  };

  /**
   * Saves the current layout to localStorage
   */
  const saveLayoutToLocalStorage = (): void => {
    persistence.saveLayout(layout.value);
  };

  /**
   * Loads the layout from localStorage
   *
   * @returns true if the layout was successfully loaded
   */
  const loadLayoutFromLocalStorage = (): boolean => {
    return persistence.loadLayout(widgets.value);
  };

  /**
   * Arranges widgets in rows
   *
   * @param widgetsToArrange An array of widgets to arrange
   */
  const arrangeWidgetsInRows = (widgetsToArrange: IDashboardWidget[]): void => {
    widgetLayout.arrangeWidgetsInRows(widgetsToArrange, widgets.value, layout.value);
  };

  /**
   * Initializes widgets with their built-in positions
   *
   * @returns true if at least one widget had a built-in position
   */
  const initializeWithBuiltInPositions = (): boolean => {
    return widgetLayout.initializeWithBuiltInPositions(widgets.value, layout.value);
  };

  /**
   * Initializes the initial positions of widgets
   */
  const initializeLayout = (): void => {
    // Priority 1: Loading from localStorage
    const layoutLoadedFromStorage = loadLayoutFromLocalStorage();

    // Priority 2: Using built-in widget positions
    if (!layoutLoadedFromStorage) {
      const usedBuiltInPositions = initializeWithBuiltInPositions();

      // Priority 3: Standard initialization
      if (!usedBuiltInPositions) {
        arrangeWidgetsInRows(widgets.value);
      }
    }
  };

  return {
    widgets,
    layout,
    GRID_COLUMNS: grid.GRID_COLUMNS,
    getGridRows,
    saveLayoutToLocalStorage,
    loadLayoutFromLocalStorage,
    arrangeWidgetsInRows,
    initializeWithBuiltInPositions,
    initializeLayout,
  };
}
