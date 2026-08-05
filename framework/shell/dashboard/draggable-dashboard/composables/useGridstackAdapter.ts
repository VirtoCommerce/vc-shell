/**
 * Gridstack Type Adapter
 *
 * Converts between our IDashboardWidget types and Gridstack's GridStackWidget types.
 * Handles localStorage format migration for backwards compatibility.
 */

import type { GridStackWidget, GridStackNode } from "gridstack";
import type {
  IDashboardWidget,
  DashboardWidgetPosition,
  DashboardWidgetPlacement,
  DashboardWidgetSize,
} from "@shell/dashboard/draggable-dashboard/types";

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
export function toGridstackWidget(widget: IDashboardWidget, placement?: DashboardWidgetPlacement): GridStackWidget {
  const pos = placement ?? widget.position;
  return {
    id: widget.id,
    x: pos?.x ?? 0,
    y: pos?.y ?? 0,
    // A placement size wins over the declared one, so a saved or live resize is
    // restored instead of snapping back to the widget's default.
    w: placement?.width ?? widget.size.width,
    h: placement?.height ?? widget.size.height,
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
export function gridstackNodesToLayoutMap(nodes: GridStackNode[]): Map<string, DashboardWidgetPlacement> {
  const layout = new Map<string, DashboardWidgetPlacement>();

  for (const node of nodes) {
    if (node.id) {
      layout.set(node.id, {
        x: node.x ?? 0,
        y: node.y ?? 0,
        // Size is carried through as well; dropping it here is what used to make
        // every resize — mouse or keyboard — invisible to state and to storage.
        ...(typeof node.w === "number" ? { width: node.w } : {}),
        ...(typeof node.h === "number" ? { height: node.h } : {}),
      });
    }
  }

  return layout;
}

/**
 * Loads layout from localStorage with legacy format support
 */
export function loadLayoutFromStorage(): Map<string, DashboardWidgetPlacement> | null {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check if it's the new Gridstack array format
    if (Array.isArray(parsed)) {
      return gridstackNodesToLayoutMap(parsed as GridStackNode[]);
    }

    // Legacy format: object with widget IDs as keys. It never carried a size, so
    // those entries stay size-less and fall back to the widget's declared size.
    if (typeof parsed === "object" && parsed !== null) {
      const layout = new Map<string, DashboardWidgetPlacement>();
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
export function saveLayoutToStorage(widgets: IDashboardWidget[], layout: Map<string, DashboardWidgetPlacement>): void {
  try {
    const gridstackFormat: GridStackWidget[] = widgets.map((widget) => {
      const placement = layout.get(widget.id);
      return {
        id: widget.id,
        x: placement?.x ?? widget.position?.x ?? 0,
        y: placement?.y ?? widget.position?.y ?? 0,
        // Prefer the live size. Reading `widget.size` unconditionally is what used
        // to discard every resize on reload, since that prop is never written back.
        w: placement?.width ?? widget.size.width,
        h: placement?.height ?? widget.size.height,
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
function autoArrangeWidgets(widgets: IDashboardWidget[], columns: number = 12): Map<string, DashboardWidgetPlacement> {
  const layout = new Map<string, DashboardWidgetPlacement>();

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
  savedLayout: Map<string, DashboardWidgetPlacement> | null,
): Map<string, DashboardWidgetPlacement> {
  // If we have a saved layout with positions, use it
  if (savedLayout && savedLayout.size > 0) {
    const layout = new Map<string, DashboardWidgetPlacement>();

    for (const widget of widgets) {
      // Carries the saved size through as well — dropping it here would restore
      // the position but snap the widget back to its declared size.
      const savedPlacement = savedLayout.get(widget.id);
      const builtInPos = widget.position;
      const placement = savedPlacement ?? builtInPos ?? { x: 0, y: 0 };
      layout.set(widget.id, placement);
    }

    return layout;
  }

  // Check if all widgets have built-in positions
  const allHavePositions = widgets.every((w) => w.position !== undefined);

  if (allHavePositions) {
    const layout = new Map<string, DashboardWidgetPlacement>();
    for (const widget of widgets) {
      layout.set(widget.id, widget.position!);
    }
    return layout;
  }

  // Auto-arrange widgets
  return autoArrangeWidgets(widgets);
}
