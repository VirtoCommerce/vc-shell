import { ref } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import type { EventCoordinates } from "./useEventCoordinates";

/**
 * Interface for the cell size
 */
export interface CellSize {
  cellWidth: number;
  cellHeight: number;
}

/**
 * Interface for the drag offset
 */
export interface DragOffset {
  x: number;
  y: number;
}

/**
 * Composible for calculating the position of a widget in the grid
 *
 * Provides functions for converting mouse coordinates to grid coordinates,
 * considering the cell sizes, drag offset, and grid boundaries
 *
 * @param gridColumns The number of columns in the grid
 * @param getGridRows The function for getting the number of rows in the grid
 * @returns An object with functions for working with the grid position
 */
export function useGridPosition(gridColumns: number, getGridRows?: () => number) {
  // Current preview position
  const previewPosition = ref<DashboardWidgetPosition | null>(null);

  // Drag offset (relative to the top left corner of the widget)
  const dragOffset = ref<DragOffset>({ x: 0, y: 0 });

  /**
   * Calculates the drag offset
   *
   * @param event The mouse or touch event
   * @param element The HTML element of the widget
   * @param cellSize The cell sizes
   */
  const calculateDragOffset = (event: MouseEvent | TouchEvent, element: HTMLElement, cellSize: CellSize) => {
    const rect = element.getBoundingClientRect();

    // Get the coordinates of the event
    let clientX: number, clientY: number;

    if ("touches" in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Calculate the offset relative to the cell size
    dragOffset.value = {
      x: (clientX - rect.left) / cellSize.cellWidth,
      y: (clientY - rect.top) / cellSize.cellHeight,
    };
  };

  /**
   * Converts mouse coordinates to grid coordinates
   *
   * @param coords The mouse coordinates
   * @param containerRect The sizes and position of the grid container
   * @param cellSize The cell sizes
   * @param scrollOffset The scroll offset of the container
   * @returns The coordinates in the grid
   */
  const mouseToGridCoordinates = (
    coords: EventCoordinates,
    containerRect: DOMRect,
    cellSize: CellSize,
    scrollOffset: { left: number; top: number },
  ): { gridX: number; gridY: number } => {
    // Calculate the position of the mouse relative to the container with the scroll offset
    const mouseX = coords.clientX - containerRect.left + scrollOffset.left;
    const mouseY = coords.clientY - containerRect.top + scrollOffset.top;

    // Convert the mouse coordinates to grid coordinates with the drag offset
    const gridX = Math.round(mouseX / cellSize.cellWidth - dragOffset.value.x);
    const gridY = Math.round(mouseY / cellSize.cellHeight - dragOffset.value.y);

    return { gridX, gridY };
  };

  /**
   * Constrains the position of the widget to the grid boundaries
   *
   * @param gridX The X-coordinate in the grid
   * @param gridY The Y-coordinate in the grid
   * @param widgetWidth The width of the widget in cells
   * @param widgetHeight The height of the widget in cells
   * @returns The constrained coordinates in the grid
   */
  const constrainToGrid = (
    gridX: number,
    gridY: number,
    widgetWidth: number,
    widgetHeight: number,
  ): { gridX: number; gridY: number } => {
    // Constrain the minimum values (not less than 0)
    gridX = Math.max(0, gridX);
    gridY = Math.max(0, gridY);

    // The right and bottom boundaries depend on the size of the widget and the size of the grid
    const gridWidth = gridColumns;
    const gridHeight = getGridRows?.() || 100; // Use a large value if getGridRows is not defined

    // Constrain the position so that the widget remains within the grid
    gridX = Math.min(gridX, gridWidth - widgetWidth);
    gridY = Math.min(gridY, gridHeight - widgetHeight);

    return { gridX, gridY };
  };

  /**
   * Updates the preview position
   *
   * @param position The new position
   * @returns The updated preview position
   */
  const updatePreviewPosition = (position: DashboardWidgetPosition): DashboardWidgetPosition => {
    previewPosition.value = position;
    return position;
  };

  /**
   * Resets the preview position and drag offset
   */
  const resetPosition = () => {
    previewPosition.value = null;
    dragOffset.value = { x: 0, y: 0 };
  };

  return {
    previewPosition,
    dragOffset,
    calculateDragOffset,
    mouseToGridCoordinates,
    constrainToGrid,
    updatePreviewPosition,
    resetPosition,
  };
}
