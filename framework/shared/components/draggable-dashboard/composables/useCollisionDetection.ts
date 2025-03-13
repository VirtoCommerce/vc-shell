import { ref } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";

/**
 * Composables for detecting and handling collisions between widgets
 *
 * Provides functions for checking widget intersections and calculating
 * new positions for displaced widgets
 *
 * @returns An object with functions for working with collisions
 */
export function useCollisionDetection() {
  // Map of displaced widgets: widget id -> new position
  const displacedWidgets = ref<Map<string, DashboardWidgetPosition>>(new Map());

  /**
   * Checks the intersection of two widgets
   *
   * @param widgetA The first widget
   * @param posA The position of the first widget
   * @param widgetB The second widget
   * @param posB The position of the second widget
   * @returns true if the widgets intersect
   */
  const intersect = (
    widgetA: IDashboardWidget,
    posA: DashboardWidgetPosition,
    widgetB: IDashboardWidget,
    posB: DashboardWidgetPosition,
  ): boolean => {
    // Early check by Y axis (if the difference is greater than the sum of heights, there is no intersection)
    const verticalDistance = Math.abs(posA.y - posB.y);
    if (verticalDistance > widgetA.size.height + widgetB.size.height) {
      return false;
    }

    // Early check by X axis (if the difference is greater than the sum of widths, there is no intersection)
    const horizontalDistance = Math.abs(posA.x - posB.x);
    if (horizontalDistance > widgetA.size.width + widgetB.size.width) {
      return false;
    }

    // Standard intersection check
    const aLeft = posA.x;
    const aRight = posA.x + widgetA.size.width;
    const aTop = posA.y;
    const aBottom = posA.y + widgetA.size.height;

    const bLeft = posB.x;
    const bRight = posB.x + widgetB.size.width;
    const bTop = posB.y;
    const bBottom = posB.y + widgetB.size.height;

    return !(aRight <= bLeft || aLeft >= bRight || aBottom <= bTop || aTop >= bBottom);
  };

  /**
   * Updates the list of displaced widgets based on the current position of the dragged widget
   *
   * @param draggedWidget The dragged widget
   * @param previewPosition The current position of the dragged widget
   * @param widgets All widgets on the dashboard
   * @param layout The current dashboard layout (widget id -> position map)
   */
  const updateDisplacedWidgets = (
    draggedWidget: IDashboardWidget | null,
    previewPosition: DashboardWidgetPosition | null,
    widgets: IDashboardWidget[],
    layout: Map<string, DashboardWidgetPosition>,
  ) => {
    if (!draggedWidget || !previewPosition) {
      displacedWidgets.value.clear();
      return;
    }

    const newDisplacements = new Map<string, DashboardWidgetPosition>();
    const processedWidgets = new Set<string>();

    // Cache for initial collision checks
    const directCollisionWidgets = new Set<string>();

    // Check collisions with other widgets
    for (const widget of widgets) {
      if (widget.id === draggedWidget.id) continue;

      const pos = layout.get(widget.id);
      if (!pos) continue;

      if (intersect(draggedWidget, previewPosition, widget, pos)) {
        directCollisionWidgets.add(widget.id);
      }
    }

    // If there are no direct collisions, skip additional calculations
    if (directCollisionWidgets.size === 0) {
      displacedWidgets.value = newDisplacements;
      return;
    }

    // Sort widgets from top to bottom for more natural rearrangement
    const sortedWidgets = [...widgets]
      .filter((w) => w.id !== draggedWidget.id)
      .sort((a, b) => {
        const posA = layout.get(a.id);
        const posB = layout.get(b.id);
        if (!posA || !posB) return 0;
        // Sort first by Y, then by X for more stable results
        return posA.y === posB.y ? posA.x - posB.x : posA.y - posB.y;
      });

    // Function for checking collisions with caching
    const collisionCache = new Map<string, boolean>();

    const checkCollision = (widget: IDashboardWidget, position: DashboardWidgetPosition) => {
      const cacheKey = `${widget.id}_${position.x}_${position.y}`;

      if (collisionCache.has(cacheKey)) {
        return collisionCache.get(cacheKey);
      }

      // Check intersection with the dragged widget
      let hasCollision = intersect(draggedWidget, previewPosition, widget, position);

      // Check intersections with already displaced widgets, if there is no collision with the dragged widget
      if (!hasCollision) {
        for (const [id, pos] of newDisplacements) {
          const w = widgets.find((w) => w.id === id);
          if (w && intersect(widget, position, w, pos)) {
            hasCollision = true;
            break;
          }
        }
      }

      collisionCache.set(cacheKey, hasCollision);
      return hasCollision;
    };

    // First process widgets with direct collisions
    for (const widget of sortedWidgets) {
      if (processedWidgets.has(widget.id)) continue;

      const currentPos = layout.get(widget.id);
      if (!currentPos) continue;

      // First focus on widgets with direct collisions
      if (!directCollisionWidgets.has(widget.id) && newDisplacements.size === 0) continue;

      // Check collisions in the current position
      const hasCollision = checkCollision(widget, currentPos);

      if (hasCollision) {
        // Find a new position below the dragged widget
        const newY = Math.max(previewPosition.y + draggedWidget.size.height, currentPos.y + 1);
        let finalY = newY;

        // Find the nearest position without collisions
        const maxIterations = 50; // Protection against infinite loop
        let iterations = 0;

        while (checkCollision(widget, { x: currentPos.x, y: finalY }) && iterations < maxIterations) {
          finalY++;
          iterations++;
        }

        newDisplacements.set(widget.id, { x: currentPos.x, y: finalY });
        processedWidgets.add(widget.id);

        // If we have displaced a widget with a direct collision, check if we have created new collisions
        for (const w of sortedWidgets) {
          if (w.id !== widget.id && !processedWidgets.has(w.id)) {
            const pos = layout.get(w.id);
            if (pos && intersect(widget, { x: currentPos.x, y: finalY }, w, pos)) {
              directCollisionWidgets.add(w.id);
            }
          }
        }
      }
    }

    displacedWidgets.value = newDisplacements;
  };

  /**
   * Clears the list of displaced widgets
   */
  const clearDisplacedWidgets = () => {
    displacedWidgets.value.clear();
  };

  /**
   * Checks if the widget is displaced
   *
   * @param widgetId The ID of the widget
   * @returns true if the widget is displaced
   */
  const isWidgetDisplaced = (widgetId: string) => {
    return displacedWidgets.value.has(widgetId);
  };

  /**
   * Gets the new position for the displaced widget
   *
   * @param widgetId The ID of the widget
   * @returns The new position or undefined if the widget is not displaced
   */
  const getDisplacedPosition = (widgetId: string) => {
    return displacedWidgets.value.get(widgetId);
  };

  return {
    displacedWidgets,
    intersect,
    updateDisplacedWidgets,
    clearDisplacedWidgets,
    isWidgetDisplaced,
    getDisplacedPosition,
  };
}
