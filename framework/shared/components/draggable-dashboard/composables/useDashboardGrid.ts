import { computed, ref, watch } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition, DashboardGridConfig } from "../types";
import { useDashboard } from "../../../../core/composables/useDashboard";

// Constants for grid
export const GRID_COLUMNS = 12;
// Initial rows, but now it's the minimum value
export const MIN_GRID_ROWS = 12;
// Increase height buffer for "infinite" scroll
const ROWS_BUFFER = 10;
// Dynamically calculated number of rows
const dynamicRows = ref(MIN_GRID_ROWS);

// Constants for position search optimization
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

export function useDashboardGrid() {
  const dashboard = useDashboard();
  const widgets = computed(() => dashboard.getWidgets());
  const layout = computed(() => dashboard.getLayout());

  // Calculate current maximum number of rows based on existing widgets
  const currentRows = computed(() => {
    if (widgets.value.length === 0) return MIN_GRID_ROWS;

    const maxY = Math.max(
      ...Array.from(layout.value.values()).map((pos: DashboardWidgetPosition, index) => {
        const widget = widgets.value.find((w) => w.id === Array.from(layout.value.keys())[index]);
        return widget ? pos.y + widget.size.height : pos.y + 1;
      }),
      0,
    );

    // Update dynamic number of rows with large buffer
    dynamicRows.value = Math.max(maxY + ROWS_BUFFER, MIN_GRID_ROWS);
    return dynamicRows.value;
  });

  // Get current number of rows
  const getGridRows = () => currentRows.value;

  // Improved collision detection function
  const hasCollision = (
    widget: IDashboardWidget,
    position: DashboardWidgetPosition,
    excludeWidgetId?: string,
  ): boolean => {
    // Check only bottom grid boundary
    if (position.x < 0 || position.x + widget.size.width > GRID_COLUMNS || position.y < 0) {
      return true;
    }

    // Create occupied cells map for optimization
    const occupiedCells = new Set<string>();

    // Fill occupied cells map
    widgets.value.forEach((other) => {
      if (other.id === widget.id || (excludeWidgetId && other.id === excludeWidgetId)) {
        return;
      }

      const otherPos = layout.value.get(other.id);
      if (!otherPos) return;

      for (let x = otherPos.x; x < otherPos.x + other.size.width; x++) {
        for (let y = otherPos.y; y < otherPos.y + other.size.height; y++) {
          occupiedCells.add(`${x},${y}`);
        }
      }
    });

    // Check collisions for each widget cell
    for (let x = position.x; x < position.x + widget.size.width; x++) {
      for (let y = position.y; y < position.y + widget.size.height; y++) {
        if (occupiedCells.has(`${x},${y}`)) {
          return true;
        }
      }
    }

    return false;
  };

  // Improved free position search function
  const findFreePosition = (widget: IDashboardWidget): DashboardWidgetPosition => {
    const currentPos = layout.value.get(widget.id);

    // If current position is free, use it
    if (currentPos && !hasCollision(widget, currentPos, widget.id)) {
      return currentPos;
    }

    // Start search from top-left corner or current position
    const startX = currentPos?.x || 0;
    const startY = currentPos?.y || 0;

    // Spiral search for free position
    let layer = 0;
    const maxLayers = Math.max(GRID_COLUMNS, currentRows.value);

    while (layer < maxLayers) {
      // Check all directions in current layer
      for (const { dx, dy } of SEARCH_DIRECTIONS) {
        const x = startX + dx * layer;
        const y = startY + dy * layer;

        const position = { x, y };

        // Check position
        if (!hasCollision(widget, position, widget.id)) {
          return position;
        }
      }

      layer++;
    }

    // If no position found, add to the end
    return {
      x: 0,
      y: currentRows.value,
    };
  };

  // Arrange widgets in rows, minimizing empty spaces
  const arrangeWidgetsInRows = (widgetsToArrange: IDashboardWidget[]): void => {
    if (widgetsToArrange.length === 0) return;

    const sortedWidgets = [...widgetsToArrange].sort((a, b) => {
      // Sort by size (largest first)
      const aSize = a.size.width * a.size.height;
      const bSize = b.size.width * b.size.height;
      return bSize - aSize;
    });

    // Current position for placement
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;

    sortedWidgets.forEach((widget) => {
      // Check if widget fits in current row
      if (currentX + widget.size.width > GRID_COLUMNS) {
        // If it doesn't fit, move to the next row
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }

      // Place widget on current position
      const position = { x: currentX, y: currentY };
      dashboard.updateWidgetPosition(widget.id, position);

      // Update current position
      currentX += widget.size.width;

      // Update maximum height for current row
      rowHeight = Math.max(rowHeight, widget.size.height);
    });
  };

  // Initialize initial widget positions
  const initializeLayout = () => {
    // Check if layout rebuild is needed

    // Check if not all widgets have positioned yet
    if (widgets.value.length !== layout.value.size) {
      arrangeWidgetsInRows(widgets.value);
      return;
    }

    // Check if all widgets have a position
    const hasUnpositionedWidgets = widgets.value.some((widget: IDashboardWidget) => !layout.value.has(widget.id));

    // If there are widgets without a position, then rearrange
    if (hasUnpositionedWidgets) {
      arrangeWidgetsInRows(widgets.value);
      return;
    }

    // Check for collisions
    const hasCollisions = widgets.value.some((widget: IDashboardWidget) => {
      const pos = layout.value.get(widget.id);
      return pos && hasCollision(widget, pos, widget.id);
    });

    // If there are collisions, then rearrange
    if (hasCollisions) {
      arrangeWidgetsInRows(widgets.value);
      return;
    }

    // Check if widgets are compact
    const maxY = Math.max(...Array.from(layout.value.values()).map((pos: DashboardWidgetPosition) => pos.y + 1), 0);

    // If widgets occupy many rows but are not fully occupied, then consider this placement suboptimal
    const totalCells = GRID_COLUMNS * maxY;
    const occupiedCells = widgets.value.reduce((sum: number, widget: IDashboardWidget) => {
      return sum + widget.size.width * widget.size.height;
    }, 0);

    // If less than 70% of the grid is occupied and widgets occupy many rows, then rearrange
    const fillRatio = occupiedCells / totalCells;
    if (maxY > 1 && fillRatio < 0.7) {
      arrangeWidgetsInRows(widgets.value);
      return;
    }

    // For widgets with positions, check and eliminate only collisions
    const sortedWidgets = [...widgets.value].sort((a, b) => {
      const posA = layout.value.get(a.id);
      const posB = layout.value.get(b.id);
      if (!posA && !posB) return 0;
      if (!posA) return 1;
      if (!posB) return -1;
      return posA.y - posB.y || posA.x - posB.x;
    });

    // Rearrange widgets, avoiding collisions
    sortedWidgets.forEach((widget) => {
      const currentPos = layout.value.get(widget.id);
      if (!currentPos) {
        const freePosition = findFreePosition(widget);
        dashboard.updateWidgetPosition(widget.id, freePosition);
      } else if (hasCollision(widget, currentPos, widget.id)) {
        const freePosition = findFreePosition(widget);
        dashboard.updateWidgetPosition(widget.id, freePosition);
      }
    });
  };

  return {
    widgets,
    layout,
    arrangeWidgetsInRows,
    initializeLayout,
    GRID_COLUMNS,
    getGridRows,
  };
}
