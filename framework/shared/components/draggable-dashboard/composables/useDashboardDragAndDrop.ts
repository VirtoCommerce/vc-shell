import { ref, computed, onUnmounted, type Ref } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import { GRID_COLUMNS } from "./useGridSystem";
import { useDashboard } from "../../../../core/composables/useDashboard";
import { useDragClone } from "./useDragClone";
import { useEventCoordinates } from "./useEventCoordinates";
import { useCollisionDetection } from "./useCollisionDetection";
import { useGridPosition, type CellSize } from "./useGridPosition";

// Cell height constant, corresponds to --dashboard-cell-height CSS variable
// Value of 80px is defined in DraggableDashboard.vue
const CELL_HEIGHT = 80;

/**
 * Return type for the useDashboardDragAndDrop composable.
 */
export interface UseDashboardDragAndDropReturn {
  draggedWidget: Ref<IDashboardWidget | null>;
  previewPosition: Ref<{ x: number; y: number } | null>;
  displacedWidgets: Ref<Map<string, DashboardWidgetPosition>>;
  isDragging: Ref<boolean>;
  handleMouseDown: (event: MouseEvent | TouchEvent, widget: IDashboardWidget, element: HTMLElement) => void;
  setGridContainer: (container: HTMLElement | null) => void;
  isWidgetDisplaced: (widgetId: string) => boolean;
  getDisplacedPosition: (widgetId: string) => DashboardWidgetPosition | undefined;
}

/**
 * Composables for managing the dragging of widgets on the dashboard
 *
 * Provides functions for handling drag events, updating widget positions, and handling collisions
 *
 * @param updateWidgetPosition Function to update the position of a widget in the store
 * @param getGridRows Function to get the number of rows in the grid
 * @returns An object with functions and state for managing the dragging
 */
export function useDashboardDragAndDrop(
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void,
  getGridRows?: () => number,
): UseDashboardDragAndDropReturn {
  const dashboard = useDashboard();
  const widgets = computed(() => dashboard.getWidgets());
  const gridContainer = ref<HTMLElement | null>(null);

  // Dragging state
  const draggedWidget = ref<IDashboardWidget | null>(null);
  const isDragging = ref(false);

  // Initialize helper composables
  const { dragClone, createDragClone, updateDragClonePosition, removeDragClone } = useDragClone();
  const { initialPosition, isTouchDevice, getEventCoordinates, saveInitialPosition, hasMovedBeyondThreshold } =
    useEventCoordinates();
  const { displacedWidgets, updateDisplacedWidgets, isWidgetDisplaced, getDisplacedPosition } = useCollisionDetection();
  const {
    previewPosition,
    dragOffset,
    calculateDragOffset,
    mouseToGridCoordinates,
    constrainToGrid,
    updatePreviewPosition,
    resetPosition,
  } = useGridPosition(GRID_COLUMNS, getGridRows);

  // Getting the size of the cell
  const calculateCellSize = (): CellSize => {
    if (!gridContainer.value) return { cellWidth: 0, cellHeight: CELL_HEIGHT };
    const rect = gridContainer.value.getBoundingClientRect();
    return {
      cellWidth: rect.width / GRID_COLUMNS,
      cellHeight: CELL_HEIGHT,
    };
  };

  // Common logic for updating the position during dragging
  const updateDragPosition = (event: MouseEvent | TouchEvent) => {
    if (!gridContainer.value || !draggedWidget.value || !dragClone.value) return;

    // Save event data, as it may be unavailable in requestAnimationFrame
    const coords = getEventCoordinates(event);

    // Use requestAnimationFrame for UI optimization
    requestAnimationFrame(() => {
      if (!gridContainer.value || !draggedWidget.value || !dragClone.value) return;

      const rect = gridContainer.value.getBoundingClientRect();
      const cellSize = calculateCellSize();

      // Update the position of the clone relative to the initial mouse position
      const { deltaX, deltaY } = {
        deltaX: coords.clientX - initialPosition.value.clientX,
        deltaY: coords.clientY - initialPosition.value.clientY,
      };

      updateDragClonePosition(deltaX, deltaY);

      // Calculate the scroll offset of the container
      const scrollOffset = {
        left: gridContainer.value.scrollLeft,
        top: gridContainer.value.scrollTop,
      };

      // Convert mouse coordinates to grid coordinates
      const { gridX, gridY } = mouseToGridCoordinates(coords, rect, cellSize, scrollOffset);

      // Constrain the position to the grid boundaries
      const constrainedPosition = constrainToGrid(
        gridX,
        gridY,
        draggedWidget.value.size.width,
        draggedWidget.value.size.height,
      );

      // Update the preview position only if it has changed
      if (
        !previewPosition.value ||
        previewPosition.value.x !== constrainedPosition.gridX ||
        previewPosition.value.y !== constrainedPosition.gridY
      ) {
        const newPosition = {
          x: constrainedPosition.gridX,
          y: constrainedPosition.gridY,
        };

        updatePreviewPosition(newPosition);

        // Recalculate displaced widgets when the position changes
        updateDisplacedWidgets(draggedWidget.value, newPosition, widgets.value, new Map(dashboard.getLayout()));
      }
    });
  };

  // Mouse move event handler
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !draggedWidget.value || !gridContainer.value || !dragClone.value) return;
    updateDragPosition(event);
  };

  // Touch move event handler
  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging.value || !draggedWidget.value || !gridContainer.value || !dragClone.value) return;

    // Prevent page scrolling during dragging
    event.preventDefault();

    updateDragPosition(event);
  };

  // Mouse up event handler
  const handleMouseUp = () => {
    finishDrag();
  };

  const handleTouchEnd = () => {
    finishDrag();
  };

  // Common function for finishing the dragging
  const finishDrag = () => {
    if (!isDragging.value || !draggedWidget.value || !previewPosition.value) return;

    // Get the necessary data
    const draggedWidgetId = draggedWidget.value.id;
    const finalPosition = previewPosition.value;

    // When there is a clone, finish the dragging smoothly
    if (dragClone.value) {
      // Get the DOM element of the original widget
      const originalWidget = document.querySelector(`.dashboard-widget[data-id="${draggedWidgetId}"]`) as HTMLElement;

      if (originalWidget) {
        const cellSize = calculateCellSize();
        const widgetGap = 20; // Widget gap in pixels

        // Get the current position of the clone (where the user released the mouse)
        const cloneRect = dragClone.value.getBoundingClientRect();

        // Get the page scroll
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Get the position of the grid container with the scroll
        const gridRect = gridContainer.value!.getBoundingClientRect();
        const gridScrollLeft = gridContainer.value!.scrollLeft;
        const gridScrollTop = gridContainer.value!.scrollTop;

        // Calculate the relative position of the clone inside the container with all scrolls
        const relX = cloneRect.left + scrollX - (gridRect.left + scrollX) + gridScrollLeft;
        const relY = cloneRect.top + scrollY - (gridRect.top + scrollY) + gridScrollTop;

        // Calculate the final coordinates, where the widget should be moved
        const finalX = finalPosition.x * cellSize.cellWidth + widgetGap / 2;
        const finalY = finalPosition.y * cellSize.cellHeight + widgetGap / 2;

        // First, move the original widget exactly to the clone position
        originalWidget.style.transition = "none";
        originalWidget.style.transform = `translate(${relX}px, ${relY}px)`;
        originalWidget.style.opacity = "1";
        originalWidget.style.zIndex = "1000";

        // Remove the clone immediately, as the original is in its place
        removeDragClone();

        // Force reflow for applying styles
        originalWidget.offsetHeight; // eslint-disable-line

        // Update the position in the data store
        updateWidgetPosition(draggedWidgetId, finalPosition);

        // Update the positions of all displaced widgets
        for (const [widgetId, position] of displacedWidgets.value.entries()) {
          updateWidgetPosition(widgetId, position);
        }

        // Now smoothly animate the widget to its final position
        setTimeout(() => {
          originalWidget.style.transition = `transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)`;
          originalWidget.style.transform = `translate(${finalX}px, ${finalY}px)`;
        }, 20); // Small delay for correct style application
      } else {
        // If the original is not found, simply remove the clone and update the data
        removeDragClone();

        // Update the position in the data store
        updateWidgetPosition(draggedWidgetId, finalPosition);

        // Update the positions of all displaced widgets
        for (const [widgetId, position] of displacedWidgets.value.entries()) {
          updateWidgetPosition(widgetId, position);
        }
      }
    } else {
      // If there is no clone, simply update the data
      updateWidgetPosition(draggedWidgetId, finalPosition);

      // Update the positions of all displaced widgets
      for (const [widgetId, position] of displacedWidgets.value.entries()) {
        updateWidgetPosition(widgetId, position);
      }
    }

    // Remove event handlers
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("touchmove", handleTouchMove, { passive: false } as EventListenerOptions);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);

    // Reset the state with a delay, so the animation has time to finish
    setTimeout(() => {
      isDragging.value = false;
      draggedWidget.value = null;
      resetPosition();
    }, 50);
  };

  // Mouse/touch event handler with passive listeners
  const handleMouseDown = (event: MouseEvent | TouchEvent, widget: IDashboardWidget, element: HTMLElement) => {
    if (!gridContainer.value) return;

    // Check the event type
    if ("touches" in event) {
      isTouchDevice.value = true;
    }

    // Use preventDefault only for mouse events, for touch events use passive: false
    if (!isTouchDevice.value) {
      event.preventDefault();
    }
    event.stopPropagation();

    // Save the initial position for determining the dragging
    saveInitialPosition(event);
    let hasDragStarted = false;

    // Find the parent widget element
    const widgetElement = element.closest(".dashboard-widget") as HTMLElement;
    if (!widgetElement) return;

    const cellSize = calculateCellSize();

    // Temporary handler for movement to determine the start of dragging
    const tempMoveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      if (hasDragStarted) return;

      const currentCoords = getEventCoordinates(moveEvent);

      // Start dragging only if the mouse has moved more than 3 pixels
      if (hasMovedBeyondThreshold(currentCoords, 3)) {
        hasDragStarted = true;
        isDragging.value = true;
        draggedWidget.value = widget;

        // Calculate the drag offset
        calculateDragOffset(event, widgetElement, cellSize);

        // Create a clone for dragging
        createDragClone(element);

        // Remove temporary handlers
        document.removeEventListener("mousemove", tempMoveHandler);
        document.removeEventListener("touchmove", tempMoveHandler);
        document.removeEventListener("mouseup", tempUpHandler);
        document.removeEventListener("touchend", tempUpHandler);

        // Add the dragging handlers
        if (isTouchDevice.value) {
          document.addEventListener("touchmove", handleTouchMove, { passive: false } as EventListenerOptions);
          document.addEventListener("touchend", handleTouchEnd);
          document.addEventListener("touchcancel", handleTouchEnd);
        } else {
          document.addEventListener("mousemove", handleMouseMove, { passive: true });
          document.addEventListener("mouseup", handleMouseUp);
        }
      }
    };

    // Temporary handler for releasing to cancel the determination of dragging
    const tempUpHandler = () => {
      if (!hasDragStarted) {
        document.removeEventListener("mousemove", tempMoveHandler);
        document.removeEventListener("touchmove", tempMoveHandler);
        document.removeEventListener("mouseup", tempUpHandler);
        document.removeEventListener("touchend", tempUpHandler);
      }
    };

    // Add temporary handlers for determining the start of dragging
    if (isTouchDevice.value) {
      document.addEventListener("touchmove", tempMoveHandler, { passive: true });
      document.addEventListener("touchend", tempUpHandler);
    } else {
      document.addEventListener("mousemove", tempMoveHandler, { passive: true });
      document.addEventListener("mouseup", tempUpHandler);
    }
  };

  const setGridContainer = (container: HTMLElement | null) => {
    gridContainer.value = container;
  };

  // Clear event handlers when the component is unmounted
  onUnmounted(() => {
    finishDrag();
  });

  return {
    draggedWidget,
    previewPosition,
    displacedWidgets,
    isDragging,
    handleMouseDown, // Now handles both mouse and touch events
    setGridContainer,
    isWidgetDisplaced,
    getDisplacedPosition,
  };
}
