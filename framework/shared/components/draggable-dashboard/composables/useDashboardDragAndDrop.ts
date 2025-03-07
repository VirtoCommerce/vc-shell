import { ref, computed, onUnmounted } from "vue";
import type { IDashboardWidget, DashboardWidgetPosition } from "../types";
import { GRID_COLUMNS } from "./useDashboardGrid";
import { useDashboard } from "../../../../core/composables/useDashboard";

// Cell height constant, corresponds to --dashboard-cell-height CSS variable
// Value of 80px is defined in DraggableDashboard.vue
const CELL_HEIGHT = 80;

export function useDashboardDragAndDrop(
  updateWidgetPosition: (widgetId: string, position: DashboardWidgetPosition) => void,
  getGridRows?: () => number,
) {
  const dashboard = useDashboard();
  const widgets = computed(() => dashboard.getWidgets());
  const gridContainer = ref<HTMLElement | null>(null);

  // Drag state
  const draggedWidget = ref<IDashboardWidget | null>(null);
  const previewPosition = ref<DashboardWidgetPosition | null>(null);
  const isDragging = ref(false);
  const dragOffset = ref({ x: 0, y: 0 });
  const displacedWidgets = ref<Map<string, DashboardWidgetPosition>>(new Map());

  // Drag clone
  const dragClone = ref<HTMLElement | null>(null);
  const initialMousePosition = ref({ x: 0, y: 0 });
  const isTouchDevice = ref(false);

  // Get cell size
  const calculateCellSize = () => {
    if (!gridContainer.value) return { cellWidth: 0, cellHeight: CELL_HEIGHT };
    const rect = gridContainer.value.getBoundingClientRect();
    return {
      cellWidth: rect.width / GRID_COLUMNS,
      cellHeight: CELL_HEIGHT,
    };
  };

  // Create widget clone for dragging
  const createDragClone = (element: HTMLElement) => {
    // Find parent widget element
    const widgetElement = element.closest(".dashboard-widget") as HTMLElement;
    if (!widgetElement) return null;

    const clone = widgetElement.cloneNode(true) as HTMLElement;
    const rect = widgetElement.getBoundingClientRect();

    // Учитываем прокрутку страницы
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Копируем все вычисленные стили с оригинала
    const computedStyle = window.getComputedStyle(widgetElement);

    clone.style.position = "fixed";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.left = `${rect.left + scrollX}px`;
    clone.style.top = `${rect.top + scrollY}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "0.95";
    clone.style.transform = "scale(1.02)";
    clone.style.transition = "transform 0.1s ease, opacity 0.2s ease";
    clone.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    clone.style.willChange = "transform";

    // Копируем важные стили с оригинала
    clone.style.backgroundColor = computedStyle.backgroundColor;
    clone.style.borderRadius = computedStyle.borderRadius;

    // Добавляем класс для стилизации клона
    clone.classList.add("dashboard-widget-clone");

    // Анимация появления
    requestAnimationFrame(() => {
      clone.style.transform = "scale(1.02)";
      clone.style.opacity = "0.92";
    });

    document.body.appendChild(clone);
    return clone;
  };

  // Optimized intersection check function
  const intersect = (
    widgetA: IDashboardWidget,
    posA: DashboardWidgetPosition,
    widgetB: IDashboardWidget,
    posB: DashboardWidgetPosition,
  ) => {
    // Early Y-axis check (if difference is greater than sum of heights, no intersection)
    const verticalDistance = Math.abs(posA.y - posB.y);
    if (verticalDistance > widgetA.size.height + widgetB.size.height) {
      return false;
    }

    // Early X-axis check (if difference is greater than sum of widths, no intersection)
    const horizontalDistance = Math.abs(posA.x - posB.x);
    if (horizontalDistance > widgetA.size.width + widgetB.size.width) {
      return false;
    }

    // Standard rectangle intersection check
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

  // Optimized function for updating displaced widgets
  const updateDisplacedWidgets = () => {
    if (!draggedWidget.value || !previewPosition.value || !isDragging.value) {
      displacedWidgets.value.clear();
      return;
    }

    const layout = new Map(dashboard.getLayout());
    const newDisplacements = new Map<string, DashboardWidgetPosition>();
    const processedWidgets = new Set<string>();

    // Cache for initial collision checks
    const directCollisionWidgets = new Set<string>();

    // Check collisions with other widgets
    for (const widget of widgets.value) {
      if (widget.id === draggedWidget.value.id) continue;

      const pos = layout.get(widget.id);
      if (!pos) continue;

      if (intersect(draggedWidget.value, previewPosition.value, widget, pos)) {
        directCollisionWidgets.add(widget.id);
      }
    }

    // If no direct collisions, skip additional displacement calculations
    if (directCollisionWidgets.size === 0) {
      displacedWidgets.value = newDisplacements;
      return;
    }

    // Sort widgets top to bottom for more natural rearrangement
    const sortedWidgets = [...widgets.value]
      .filter((w) => w.id !== draggedWidget.value?.id)
      .sort((a, b) => {
        const posA = layout.get(a.id);
        const posB = layout.get(b.id);
        if (!posA || !posB) return 0;
        // Sort by Y first, then by X for more stable results
        return posA.y === posB.y ? posA.x - posB.x : posA.y - posB.y;
      });

    // Function for checking collisions with caching
    const collisionCache = new Map<string, boolean>();

    const checkCollision = (widget: IDashboardWidget, position: DashboardWidgetPosition) => {
      const cacheKey = `${widget.id}_${position.x}_${position.y}`;

      if (collisionCache.has(cacheKey)) {
        return collisionCache.get(cacheKey);
      }

      // Check intersection with dragged widget
      let hasCollision = intersect(draggedWidget.value!, previewPosition.value!, widget, position);

      // Check intersections with already displaced widgets if no collision with dragged widget
      if (!hasCollision) {
        for (const [id, pos] of newDisplacements) {
          const w = widgets.value.find((w) => w.id === id);
          if (w && intersect(widget, position, w, pos)) {
            hasCollision = true;
            break;
          }
        }
      }

      collisionCache.set(cacheKey, hasCollision);
      return hasCollision;
    };

    // Process widgets with direct collisions first
    for (const widget of sortedWidgets) {
      if (processedWidgets.has(widget.id)) continue;

      const currentPos = layout.get(widget.id);
      if (!currentPos) continue;

      // Focus on widgets with direct collisions first
      if (!directCollisionWidgets.has(widget.id) && newDisplacements.size === 0) continue;

      // Check collisions at current position
      const hasCollision = checkCollision(widget, currentPos);

      if (hasCollision) {
        // Find new position below dragged widget
        const newY = Math.max(previewPosition.value.y + draggedWidget.value.size.height, currentPos.y + 1);
        let finalY = newY;

        // Find nearest position without collisions, optimized
        const maxIterations = 50; // Protection against infinite loop
        let iterations = 0;

        while (checkCollision(widget, { x: currentPos.x, y: finalY }) && iterations < maxIterations) {
          finalY++;
          iterations++;
        }

        newDisplacements.set(widget.id, { x: currentPos.x, y: finalY });
        processedWidgets.add(widget.id);

        // If we displaced a widget with direct collision, check if we created new collisions
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

  // Get event coordinates for either mouse or touch events
  const getEventCoordinates = (event: MouseEvent | TouchEvent) => {
    if ("touches" in event) {
      // Touch event
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
      };
    }
    // Mouse event
    return {
      clientX: (event as MouseEvent).clientX,
      clientY: (event as MouseEvent).clientY,
    };
  };

  // Common logic for mouse and touch move events
  const updateDragPosition = (event: MouseEvent | TouchEvent) => {
    if (!gridContainer.value || !draggedWidget.value || !dragClone.value) return;

    // Save event data as it might be unavailable in requestAnimationFrame
    const coords = getEventCoordinates(event);

    // Use requestAnimationFrame for UI update optimization
    requestAnimationFrame(() => {
      if (!gridContainer.value || !draggedWidget.value || !dragClone.value) return;

      const rect = gridContainer.value.getBoundingClientRect();
      const { cellWidth, cellHeight } = calculateCellSize();

      // Update clone position relative to initial mouse position
      const deltaX = coords.clientX - initialMousePosition.value.x;
      const deltaY = coords.clientY - initialMousePosition.value.y;

      dragClone.value.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      // Calculate container scroll
      const gridScrollLeft = gridContainer.value.scrollLeft;
      const gridScrollTop = gridContainer.value.scrollTop;

      // Calculate container offset in window
      const gridRectLeft = rect.left;
      const gridRectTop = rect.top;

      // Calculate mouse position relative to grid with scroll
      const mouseX = coords.clientX - gridRectLeft + gridScrollLeft;
      const mouseY = coords.clientY - gridRectTop + gridScrollTop;

      // Convert mouse coordinates to grid coordinates with drag offset
      let gridX = Math.round(mouseX / cellWidth - dragOffset.value.x);
      let gridY = Math.round(mouseY / cellHeight - dragOffset.value.y);

      // Limit boundaries (minimum 0)
      gridX = Math.max(0, gridX);
      gridY = Math.max(0, gridY);

      // Right and bottom boundaries depend on widget size and grid dimensions
      const gridWidth = GRID_COLUMNS;
      const gridHeight = getGridRows?.() || 100; // Use large value if getGridRows is not defined

      // Limit position to keep widget within grid boundaries
      gridX = Math.min(gridX, gridWidth - draggedWidget.value.size.width);
      gridY = Math.min(gridY, gridHeight - draggedWidget.value.size.height);

      // Update preview position only if it changed
      if (!previewPosition.value || previewPosition.value.x !== gridX || previewPosition.value.y !== gridY) {
        previewPosition.value = { x: gridX, y: gridY };

        // Recalculate displaced widgets on position change
        updateDisplacedWidgets();
      }
    });
  };

  // Enhanced mouse event handler
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !draggedWidget.value || !gridContainer.value || !dragClone.value) return;
    updateDragPosition(event);
  };

  // Enhanced touch event handler
  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging.value || !draggedWidget.value || !gridContainer.value || !dragClone.value) return;

    // Prevent page scrolling during drag
    event.preventDefault();

    updateDragPosition(event);
  };

  // Enhanced drag end handlers
  const handleMouseUp = () => {
    finishDrag();
  };

  const handleTouchEnd = () => {
    finishDrag();
  };

  // Common drag finish function
  const finishDrag = () => {
    if (!isDragging.value || !draggedWidget.value || !previewPosition.value) return;

    // Get necessary data
    const draggedWidgetId = draggedWidget.value.id;
    const finalPosition = previewPosition.value;

    // When there's a clone, finish dragging smoothly
    if (dragClone.value) {
      // Get DOM element of original widget
      const originalWidget = document.querySelector(`.dashboard-widget[data-id="${draggedWidgetId}"]`) as HTMLElement;

      if (originalWidget) {
        const { cellWidth, cellHeight } = calculateCellSize();
        const widgetGap = 20; // Widget gap in pixels

        // Get current clone position (where user released mouse)
        const cloneRect = dragClone.value.getBoundingClientRect();

        // Get page scroll
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Get grid container position with scroll
        const gridRect = gridContainer.value!.getBoundingClientRect();
        const gridScrollLeft = gridContainer.value!.scrollLeft;
        const gridScrollTop = gridContainer.value!.scrollTop;

        // Calculate relative clone position inside container with all scrolls
        const relX = cloneRect.left + scrollX - (gridRect.left + scrollX) + gridScrollLeft;
        const relY = cloneRect.top + scrollY - (gridRect.top + scrollY) + gridScrollTop;

        // Calculate final coordinates where widget should move
        const finalX = finalPosition.x * cellWidth + widgetGap / 2;
        const finalY = finalPosition.y * cellHeight + widgetGap / 2;

        // First place original widget exactly at clone's position
        originalWidget.style.transition = "none";
        originalWidget.style.transform = `translate(${relX}px, ${relY}px)`;
        originalWidget.style.opacity = "1";
        originalWidget.style.zIndex = "1000";

        // Remove clone immediately since original is in its place
        if (dragClone.value.parentNode) {
          document.body.removeChild(dragClone.value);
        }
        dragClone.value = null;

        // Force reflow to apply styles
        originalWidget.offsetHeight; // eslint-disable-line

        // Update position in data store
        updateWidgetPosition(draggedWidgetId, finalPosition);

        // Update positions of all displaced widgets
        for (const [widgetId, position] of displacedWidgets.value.entries()) {
          updateWidgetPosition(widgetId, position);
        }

        // Now smoothly animate widget to its final position
        setTimeout(() => {
          originalWidget.style.transition = `transform var(--dashboard-transition-duration) var(--dashboard-transition-timing)`;
          originalWidget.style.transform = `translate(${finalX}px, ${finalY}px)`;
        }, 20); // Small delay to ensure style changes apply correctly
      } else {
        // If original not found, just remove clone and update data
        if (dragClone.value.parentNode) {
          document.body.removeChild(dragClone.value);
        }
        dragClone.value = null;

        // Update position in store
        updateWidgetPosition(draggedWidgetId, finalPosition);

        // Update positions of all displaced widgets
        for (const [widgetId, position] of displacedWidgets.value.entries()) {
          updateWidgetPosition(widgetId, position);
        }
      }
    } else {
      // If no clone, just update data
      updateWidgetPosition(draggedWidgetId, finalPosition);

      // Update positions of all displaced widgets
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

    // Reset state with delay to allow animation to complete
    setTimeout(() => {
      isDragging.value = false;
      draggedWidget.value = null;
      previewPosition.value = null;
      displacedWidgets.value.clear();
      dragOffset.value = { x: 0, y: 0 };
    }, 50);
  };

  // Enhanced mousedown handler with passive listeners
  const handleMouseDown = (event: MouseEvent | TouchEvent, widget: IDashboardWidget, element: HTMLElement) => {
    if (!gridContainer.value) return;

    // Check event type
    isTouchDevice.value = "touches" in event;

    // Use preventDefault only for mouse events, use passive: false for touch
    if (!isTouchDevice.value) {
      event.preventDefault();
    }
    event.stopPropagation();

    // Store initial position for drag detection
    const initialEvent = getEventCoordinates(event);
    let hasDragStarted = false;

    // Find parent widget element
    const widgetElement = element.closest(".dashboard-widget") as HTMLElement;
    if (!widgetElement) return;

    const rect = widgetElement.getBoundingClientRect();
    const { cellWidth, cellHeight } = calculateCellSize();

    // Temporary move handler to detect actual drag start
    const tempMoveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      if (hasDragStarted) return;

      const currentCoords = getEventCoordinates(moveEvent);
      const deltaX = Math.abs(currentCoords.clientX - initialEvent.clientX);
      const deltaY = Math.abs(currentCoords.clientY - initialEvent.clientY);

      // Start drag only if mouse moved more than 3 pixels
      if (deltaX > 3 || deltaY > 3) {
        hasDragStarted = true;
        isDragging.value = true;
        draggedWidget.value = widget;

        // Save exact coordinate offset without rounding
        dragOffset.value = {
          x: (initialEvent.clientX - rect.left) / cellWidth,
          y: (initialEvent.clientY - rect.top) / cellHeight,
        };

        initialMousePosition.value = {
          x: initialEvent.clientX,
          y: initialEvent.clientY,
        };

        dragClone.value = createDragClone(element);

        // Remove temporary handlers
        document.removeEventListener("mousemove", tempMoveHandler);
        document.removeEventListener("touchmove", tempMoveHandler);
        document.removeEventListener("mouseup", tempUpHandler);
        document.removeEventListener("touchend", tempUpHandler);

        // Add actual drag handlers
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

    // Temporary up handler to cancel drag detection
    const tempUpHandler = () => {
      if (!hasDragStarted) {
        document.removeEventListener("mousemove", tempMoveHandler);
        document.removeEventListener("touchmove", tempMoveHandler);
        document.removeEventListener("mouseup", tempUpHandler);
        document.removeEventListener("touchend", tempUpHandler);
      }
    };

    // Add temporary handlers to detect drag start
    if (isTouchDevice.value) {
      document.addEventListener("touchmove", tempMoveHandler, { passive: true });
      document.addEventListener("touchend", tempUpHandler);
    } else {
      document.addEventListener("mousemove", tempMoveHandler, { passive: true });
      document.addEventListener("mouseup", tempUpHandler);
    }
  };

  const setGridContainer = (container: HTMLElement) => {
    gridContainer.value = container;
  };

  // Clean up event handlers when the component is unmounted
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
  };
}
