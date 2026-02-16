/**
 * Gridstack Type Adapter
 *
 * Converts between our IDashboardWidget types and Gridstack's GridStackWidget types.
 * Handles localStorage format migration for backwards compatibility.
 */

import type { GridStackWidget, GridStackNode } from "gridstack";
import type { IDashboardWidget, DashboardWidgetPosition, DashboardWidgetSize } from "../types";

/**
 * LocalStorage key for layout persistence
 */
export const LAYOUT_STORAGE_KEY = "vc-dashboard-layout";

/**
 * Old localStorage format (Map serialized as object)
 */
interface LegacyLayoutFormat {
  [widgetId: string]: DashboardWidgetPosition;
}

/**
 * Converts our widget type to Gridstack widget format
 */
export function toGridstackWidget(
  widget: IDashboardWidget,
  position?: DashboardWidgetPosition,
): GridStackWidget {
  const pos = position ?? widget.position;
  return {
    id: widget.id,
    x: pos?.x ?? 0,
    y: pos?.y ?? 0,
    w: widget.size.width,
    h: widget.size.height,
    minW: 2,
    minH: 2,
  };
}

/**
 * Extracts position from Gridstack node
 */
export function fromGridstackNode(node: GridStackNode): {
  id: string;
  position: DashboardWidgetPosition;
  size: DashboardWidgetSize;
} {
  return {
    id: node.id ?? "",
    position: {
      x: node.x ?? 0,
      y: node.y ?? 0,
    },
    size: {
      width: node.w ?? 1,
      height: node.h ?? 1,
    },
  };
}

/**
 * Converts Gridstack nodes array to our layout Map format
 */
export function gridstackNodesToLayoutMap(
  nodes: GridStackNode[],
): Map<string, DashboardWidgetPosition> {
  const layout = new Map<string, DashboardWidgetPosition>();

  for (const node of nodes) {
    if (node.id) {
      layout.set(node.id, {
        x: node.x ?? 0,
        y: node.y ?? 0,
      });
    }
  }

  return layout;
}

/**
 * Loads layout from localStorage with legacy format support
 */
export function loadLayoutFromStorage(): Map<string, DashboardWidgetPosition> | null {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check if it's the new Gridstack array format
    if (Array.isArray(parsed)) {
      return gridstackNodesToLayoutMap(parsed as GridStackNode[]);
    }

    // Legacy format: object with widget IDs as keys
    if (typeof parsed === "object" && parsed !== null) {
      const layout = new Map<string, DashboardWidgetPosition>();
      for (const [id, pos] of Object.entries(parsed as LegacyLayoutFormat)) {
        if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
          layout.set(id, { x: pos.x, y: pos.y });
        }
      }
      return layout;
    }

    return null;
  } catch (error) {
    console.warn("[GridstackAdapter] Failed to load layout from storage:", error);
    return null;
  }
}

/**
 * Saves layout to localStorage in Gridstack format
 */
export function saveLayoutToStorage(
  widgets: IDashboardWidget[],
  layout: Map<string, DashboardWidgetPosition>,
): void {
  try {
    const gridstackFormat: GridStackWidget[] = widgets.map((widget) => {
      const pos = layout.get(widget.id);
      return {
        id: widget.id,
        x: pos?.x ?? widget.position?.x ?? 0,
        y: pos?.y ?? widget.position?.y ?? 0,
        w: widget.size.width,
        h: widget.size.height,
      };
    });

    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(gridstackFormat));
  } catch (error) {
    console.warn("[GridstackAdapter] Failed to save layout to storage:", error);
  }
}

/**
 * Clears layout from localStorage
 */
export function clearLayoutStorage(): void {
  try {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  } catch (error) {
    console.warn("[GridstackAdapter] Failed to clear layout storage:", error);
  }
}

/**
 * Auto-arrange widgets in a grid layout
 * Places widgets side by side when possible, wrapping to next row
 */
function autoArrangeWidgets(
  widgets: IDashboardWidget[],
  columns: number = 12,
): Map<string, DashboardWidgetPosition> {
  const layout = new Map<string, DashboardWidgetPosition>();

  // Track occupied cells in each row
  const rowOccupancy: Map<number, number[]> = new Map();

  const isPositionFree = (x: number, y: number, width: number, height: number): boolean => {
    for (let row = y; row < y + height; row++) {
      const occupied = rowOccupancy.get(row) || [];
      for (let col = x; col < x + width; col++) {
        if (occupied.includes(col)) return false;
      }
    }
    return true;
  };

  const occupyPosition = (x: number, y: number, width: number, height: number): void => {
    for (let row = y; row < y + height; row++) {
      const occupied = rowOccupancy.get(row) || [];
      for (let col = x; col < x + width; col++) {
        occupied.push(col);
      }
      rowOccupancy.set(row, occupied);
    }
  };

  const findFreePosition = (width: number, height: number): DashboardWidgetPosition => {
    let y = 0;
    while (true) {
      for (let x = 0; x <= columns - width; x++) {
        if (isPositionFree(x, y, width, height)) {
          return { x, y };
        }
      }
      y++;
      // Safety limit
      if (y > 100) break;
    }
    return { x: 0, y };
  };

  for (const widget of widgets) {
    const position = findFreePosition(widget.size.width, widget.size.height);
    layout.set(widget.id, position);
    occupyPosition(position.x, position.y, widget.size.width, widget.size.height);
  }

  return layout;
}

/**
 * Merges saved layout with widget defaults
 * Handles cases where widgets have been added/removed
 * Auto-arranges widgets that don't have positions
 */
export function mergeLayoutWithWidgets(
  widgets: IDashboardWidget[],
  savedLayout: Map<string, DashboardWidgetPosition> | null,
): Map<string, DashboardWidgetPosition> {
  // If we have a saved layout with positions, use it
  if (savedLayout && savedLayout.size > 0) {
    const layout = new Map<string, DashboardWidgetPosition>();

    for (const widget of widgets) {
      const savedPos = savedLayout.get(widget.id);
      const builtInPos = widget.position;
      const position = savedPos ?? builtInPos ?? { x: 0, y: 0 };
      layout.set(widget.id, position);
    }

    return layout;
  }

  // Check if all widgets have built-in positions
  const allHavePositions = widgets.every((w) => w.position !== undefined);

  if (allHavePositions) {
    const layout = new Map<string, DashboardWidgetPosition>();
    for (const widget of widgets) {
      layout.set(widget.id, widget.position!);
    }
    return layout;
  }

  // Auto-arrange widgets
  return autoArrangeWidgets(widgets);
}
