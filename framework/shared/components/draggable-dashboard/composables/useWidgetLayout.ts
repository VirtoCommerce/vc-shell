import { ref } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import { useGridSystem } from "./useGridSystem";

// Constants for finding the optimal position
const SEARCH_DIRECTIONS = [
  { dx: 0, dy: 0 }, // Current position
  { dx: 0, dy: 1 }, // Down
  { dx: 1, dy: 0 }, // Right
  { dx: 0, dy: -1 }, // Up
  { dx: -1, dy: 0 }, // Left
  { dx: 1, dy: 1 }, // Right-down
  { dx: -1, dy: 1 }, // Left-down
  { dx: 1, dy: -1 }, // Right-up
  { dx: -1, dy: -1 }, // Left-up
];

/**
 * Hook for managing the placement of widgets on the dashboard
 *
 * @param updatePositionCallback The function for updating the position of the widget
 * @returns An object with functions for working with the placement of widgets
 */
export function useWidgetLayout(updatePositionCallback: (widgetId: string, position: DashboardWidgetPosition) => void) {
  const grid = useGridSystem();

  /**
   * Finds a free position for the widget
   *
   * @param widget The widget to place
   * @param widgets The array of all widgets
   * @param layout The map of widget positions
   * @returns The free position for the widget
   */
  const findFreePosition = (
    widget: IDashboardWidget,
    widgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
  ): DashboardWidgetPosition => {
    const currentPos = layout.get(widget.id);

    // If the current position is free, use it
    if (currentPos && !grid.hasCollision(widget, currentPos, widgets, layout, widget.id)) {
      return currentPos;
    }

    // Start searching from the top left corner or the current position
    const startX = currentPos?.x || 0;
    const startY = currentPos?.y || 0;

    // Spiral search for a free position
    let layer = 0;
    const maxLayers = Math.max(grid.GRID_COLUMNS, grid.dynamicRows.value);

    while (layer < maxLayers) {
      // Check all directions in the current layer
      for (const { dx, dy } of SEARCH_DIRECTIONS) {
        const x = startX + dx * layer;
        const y = startY + dy * layer;

        const position = { x, y };

        // Check the position
        if (!grid.hasCollision(widget, position, widgets, layout, widget.id)) {
          return position;
        }
      }

      layer++;
    }

    // If we didn't find a position, add to the end
    return {
      x: 0,
      y: grid.dynamicRows.value,
    };
  };

  /**
   * Finds the optimal position for the widget considering the occupied cells
   *
   * @param widget The widget to place
   * @param occupiedCells The set of occupied cells
   * @param maxRows The maximum number of rows
   * @returns The optimal position for the widget
   */
  const findOptimalPosition = (
    widget: IDashboardWidget,
    occupiedCells: Set<string>,
    maxRows: number,
  ): DashboardWidgetPosition => {
    // Search for a position with the minimum Y, then with the minimum X
    let bestPos: DashboardWidgetPosition = { x: 0, y: 0 };
    let minY = Number.MAX_SAFE_INTEGER;

    // Sliding window over the entire grid to find free space
    for (let y = 0; y < maxRows; y++) {
      for (let x = 0; x <= grid.GRID_COLUMNS - widget.size.width; x++) {
        if (grid.isAreaFree(x, y, widget.size.width, widget.size.height, occupiedCells)) {
          // Found free space
          if (y < minY) {
            minY = y;
            bestPos = { x, y };
          } else if (y === minY && x < bestPos.x) {
            // If on the same row, choose the left one
            bestPos = { x, y };
          }

          // If we found a place in the first row, return it immediately
          if (y === 0) {
            return bestPos;
          }
        }
      }

      // If we found something, and moved to the next row, stop searching
      if (minY !== Number.MAX_SAFE_INTEGER && y > minY) {
        break;
      }
    }

    // If we didn't find a place, return the extreme position
    if (minY === Number.MAX_SAFE_INTEGER) {
      return { x: 0, y: maxRows };
    }

    return bestPos;
  };

  /**
   * Places widgets in rows, minimizing empty spaces
   *
   * @param widgetsToArrange The array of widgets to place
   * @param allWidgets The array of all widgets
   * @param layout The map of widget positions
   */
  const arrangeWidgetsInRows = (
    widgetsToArrange: IDashboardWidget[],
    allWidgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
  ): void => {
    if (widgetsToArrange.length === 0) return;

    const sortedWidgets = [...widgetsToArrange].sort((a, b) => {
      // Sort by size (bigger first)
      const aSize = a.size.width * a.size.height;
      const bSize = b.size.width * b.size.height;
      return bSize - aSize;
    });

    // Current position for placement
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;

    sortedWidgets.forEach((widget) => {
      // Проверяем, помещается ли виджет в текущую строку
      if (currentX + widget.size.width > grid.GRID_COLUMNS) {
        // If it doesn't fit, move to the next row
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }

      // Place the widget on the current position
      const position = { x: currentX, y: currentY };
      updatePositionCallback(widget.id, position);

      // Update the current position
      currentX += widget.size.width;

      // Update the maximum height for the current row
      rowHeight = Math.max(rowHeight, widget.size.height);
    });
  };

  /**
   * Initializes widgets with their built-in positions
   *
   * @param widgets The array of widgets
   * @param layout The map of widget positions
   * @returns true if at least one widget had a built-in position
   */
  const initializeWithBuiltInPositions = (
    widgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
  ): boolean => {
    if (widgets.length === 0) return false;

    // Separate widgets into those that have built-in positions and those that don't
    const widgetsWithPositions = widgets.filter((widget) => widget.position);
    const widgetsWithoutPositions = widgets.filter((widget) => !widget.position);

    // If there are no widgets with built-in positions, exit
    if (widgetsWithPositions.length === 0) return false;

    // Sort by rows and columns for more predictable placement
    const sortedWidgets = [...widgetsWithPositions].sort((a, b) => {
      if (!a.position || !b.position) return 0;
      // First sort by y (rows)
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      // Then by x (columns)
      return a.position.x - b.position.x;
    });

    // Clear the current layout
    layout.clear();

    // Place widgets with given positions
    sortedWidgets.forEach((widget) => {
      if (widget.position) {
        updatePositionCallback(widget.id, widget.position);
      }
    });

    // Check and fix collisions for widgets with given positions
    let hasCollisions;
    do {
      hasCollisions = false;
      for (const widget of sortedWidgets) {
        if (!widget.position) continue;

        const position = layout.get(widget.id);
        if (position && grid.hasCollision(widget, position, widgets, layout, widget.id)) {
          hasCollisions = true;
          const freePosition = findFreePosition(widget, widgets, layout);
          updatePositionCallback(widget.id, freePosition);
        }
      }
    } while (hasCollisions);

    // Create a map of occupied cells for optimal placement of the remaining widgets
    const occupiedCells = grid.createOccupiedCellsMap(widgets, layout);

    // Sort the remaining widgets by size (bigger first)
    const sortedRemaining = [...widgetsWithoutPositions].sort((a, b) => {
      const aSize = a.size.width * a.size.height;
      const bSize = b.size.width * b.size.height;
      return bSize - aSize; // Bigger first
    });

    // Place the remaining widgets using the optimal algorithm
    for (const widget of sortedRemaining) {
      const position = findOptimalPosition(widget, occupiedCells, grid.dynamicRows.value + grid.ROWS_BUFFER);
      updatePositionCallback(widget.id, position);

      // Update the map of occupied cells
      for (let x = position.x; x < position.x + widget.size.width; x++) {
        for (let y = position.y; y < position.y + widget.size.height; y++) {
          occupiedCells.add(`${x},${y}`);
        }
      }
    }

    return true;
  };

  return {
    findFreePosition,
    findOptimalPosition,
    arrangeWidgetsInRows,
    initializeWithBuiltInPositions,
  };
}
