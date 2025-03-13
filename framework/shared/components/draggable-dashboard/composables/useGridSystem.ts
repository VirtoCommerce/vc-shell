import { ref, computed } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";

// Константы для работы с сеткой
export const GRID_COLUMNS = 12;
export const MIN_GRID_ROWS = 12;
export const ROWS_BUFFER = 10;

/**
 * Hook for working with the dashboard grid
 *
 * Provides basic functions and constants for working with the grid
 *
 * @returns An object with functions and constants for working with the grid
 */
export function useGridSystem() {
  // Dynamic number of rows in the grid
  const dynamicRows = ref(MIN_GRID_ROWS);

  /**
   * Updates the number of rows based on the widget positions
   *
   * @param widgets The array of widgets
   * @param layout The map of widget positions
   * @returns The current number of rows
   */
  const updateGridRows = (widgets: IDashboardWidget[], layout: Map<string, DashboardWidgetPosition>): number => {
    if (widgets.length === 0) {
      dynamicRows.value = MIN_GRID_ROWS;
      return dynamicRows.value;
    }

    // Find the maximum occupied row
    const maxY = Math.max(
      ...Array.from(layout.values()).map((pos, index) => {
        const widget = widgets.find((w) => w.id === Array.from(layout.keys())[index]);
        return widget ? pos.y + widget.size.height : pos.y + 1;
      }),
      0,
    );

    // Set the number of rows with a buffer for scrolling
    dynamicRows.value = Math.max(maxY + ROWS_BUFFER, MIN_GRID_ROWS);
    return dynamicRows.value;
  };

  /**
   * Checks if there is a collision (overlap) of the widget in the specified position
   *
   * @param widget The widget to check
   * @param position The position to check
   * @param widgets The array of all widgets
   * @param layout The map of widget positions
   * @param excludeWidgetId The ID of the widget to exclude from the check (optional)
   * @returns true if there is a collision, false otherwise
   */
  const hasCollision = (
    widget: IDashboardWidget,
    position: DashboardWidgetPosition,
    widgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
    excludeWidgetId?: string,
  ): boolean => {
    // Check if the position is out of the grid
    if (position.x < 0 || position.x + widget.size.width > GRID_COLUMNS || position.y < 0) {
      return true;
    }

    // Create a map of occupied cells for optimization
    const occupiedCells = new Set<string>();

    // Fill the map with occupied cells
    widgets.forEach((other) => {
      if (other.id === widget.id || (excludeWidgetId && other.id === excludeWidgetId)) {
        return;
      }

      const otherPos = layout.get(other.id);
      if (!otherPos) return;

      for (let x = otherPos.x; x < otherPos.x + other.size.width; x++) {
        for (let y = otherPos.y; y < otherPos.y + other.size.height; y++) {
          occupiedCells.add(`${x},${y}`);
        }
      }
    });

    // Check for collisions for each cell of the widget
    for (let x = position.x; x < position.x + widget.size.width; x++) {
      for (let y = position.y; y < position.y + widget.size.height; y++) {
        if (occupiedCells.has(`${x},${y}`)) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Checks if the specified area is free for placement of the widget
   *
   * @param x The X coordinate
   * @param y The Y coordinate
   * @param width The width of the widget
   * @param height The height of the widget
   * @param occupiedCells The set of occupied cells
   * @returns true if the area is free, false otherwise
   */
  const isAreaFree = (x: number, y: number, width: number, height: number, occupiedCells: Set<string>): boolean => {
    // Check if the area is out of the grid
    if (x < 0 || x + width > GRID_COLUMNS || y < 0) {
      return false;
    }

    // Check each cell in the area
    for (let ix = x; ix < x + width; ix++) {
      for (let iy = y; iy < y + height; iy++) {
        if (occupiedCells.has(`${ix},${iy}`)) {
          return false;
        }
      }
    }
    return true;
  };

  /**
   * Creates a map of occupied cells based on the current layout
   *
   * @param widgets The array of widgets
   * @param layout The map of widget positions
   * @returns The set of occupied cells in the format "x,y"
   */
  const createOccupiedCellsMap = (
    widgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
    excludeWidgetId?: string,
  ): Set<string> => {
    const occupiedCells = new Set<string>();

    widgets.forEach((widget) => {
      if (excludeWidgetId && widget.id === excludeWidgetId) {
        return;
      }

      const pos = layout.get(widget.id);
      if (!pos) return;

      for (let x = pos.x; x < pos.x + widget.size.width; x++) {
        for (let y = pos.y; y < pos.y + widget.size.height; y++) {
          occupiedCells.add(`${x},${y}`);
        }
      }
    });

    return occupiedCells;
  };

  return {
    GRID_COLUMNS,
    MIN_GRID_ROWS,
    ROWS_BUFFER,
    dynamicRows,
    updateGridRows,
    hasCollision,
    isAreaFree,
    createOccupiedCellsMap,
  };
}
