import { computed } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import type { CellSize } from "./useCellSizeCalculator";

/**
 * Constants for widget styles
 */
const WIDGET_GAP = 20; // The gap between widgets in pixels

/**
 * Type for returned styles
 */
export type WidgetStyle = Record<string, string>;

/**
 * Hook for managing widget styles
 *
 * Provides functions for calculating CSS styles for widgets based on their position,
 * dragging state, and other parameters
 *
 * @param getCellSize The function for getting the cell sizes
 * @returns An object with functions for working with widget styles
 */
export function useWidgetStyles(getCellSize: () => CellSize) {
  /**
   * Gets the styles for the preview position indicator
   *
   * @param widget The widget that is being dragged
   * @param position The position for preview
   * @returns An object with styles for the preview indicator
   */
  const getPreviewStyles = (widget: IDashboardWidget, position: DashboardWidgetPosition): WidgetStyle => {
    const cellSize = getCellSize();
    if (!position || !widget?.size) return {};

    const widgetWidth = widget.size.width * cellSize.width - WIDGET_GAP;
    const widgetHeight = widget.size.height * cellSize.height - WIDGET_GAP;

    const translateX = position.x * cellSize.width + WIDGET_GAP / 2;
    const translateY = position.y * cellSize.height + WIDGET_GAP / 2;

    return {
      width: `${widgetWidth}px`,
      height: `${widgetHeight}px`,
      transform: `translate(${translateX}px, ${translateY}px)`,
    };
  };

  /**
   * Gets the styles for the widget
   *
   * @param widget The widget for which to get the styles
   * @param position The position of the widget
   * @param isDragged Whether the widget is being dragged
   * @param displacedPosition The position of the displaced widget
   * @returns An object with styles for the widget
   */
  const getWidgetStyles = (
    widget: IDashboardWidget,
    position: DashboardWidgetPosition | undefined,
    isDragged: boolean = false,
    displacedPosition?: DashboardWidgetPosition,
  ): WidgetStyle => {
    if (!position) return { display: "none" };

    const cellSize = getCellSize();

    // Base sizes and positions
    const width = widget.size.width * cellSize.width - WIDGET_GAP;
    const height = widget.size.height * cellSize.height - WIDGET_GAP;

    const left = position.x * cellSize.width + WIDGET_GAP / 2;
    const top = position.y * cellSize.height + WIDGET_GAP / 2;

    // Base styles for all states
    const baseStyles: WidgetStyle = {
      position: "absolute",
      width: `${width}px`,
      height: `${height}px`,
    };

    // If the widget is displaced by another widget
    if (displacedPosition) {
      const newLeft = displacedPosition.x * cellSize.width + WIDGET_GAP / 2;
      const newTop = displacedPosition.y * cellSize.height + WIDGET_GAP / 2;

      return {
        ...baseStyles,
        transform: `translate(${newLeft}px, ${newTop}px)`,
        transition: "transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)",
        zIndex: "10",
      };
    }

    // If the widget is being dragged
    if (isDragged) {
      return {
        ...baseStyles,
        transform: `translate(${left}px, ${top}px)`,
        opacity: "0", // Hide the original, since the clone is displayed
        pointerEvents: "none",
        zIndex: "1",
        transition: "none", // Disable animations for the original widget
      };
    }

    // Normal widget
    return {
      ...baseStyles,
      transform: `translate(${left}px, ${top}px)`,
      transition: "transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)",
    };
  };

  return {
    getPreviewStyles,
    getWidgetStyles,
    WIDGET_GAP,
  };
}
