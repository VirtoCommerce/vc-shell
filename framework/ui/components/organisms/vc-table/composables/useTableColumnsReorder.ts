import { ref, Ref, onBeforeUnmount } from "vue";

export interface ReorderableColumn {
  id: string;
  [key: string]: any;
}

export interface UseTableColumnsReorderOptions<T extends ReorderableColumn> {
  columns: Ref<T[]>;
  onReorderEnd?: (columns: T[]) => void;
}

/**
 * Composable for table column reordering with drag & drop
 * Features:
 * - Live reordering (columns swap during drag)
 * - 50% threshold (swap only when crossing middle of target column)
 * - Smooth transitions
 * - Throttling for performance
 */
export function useTableColumnsReorder<T extends ReorderableColumn>(
  options: UseTableColumnsReorderOptions<T>
) {
  const { columns, onReorderEnd } = options;

  const isDragging = ref(false);
  let draggedColumnId: string | null = null;
  let dragThrottleTimer: number | null = null;

  const handleDragStart = (columnId: string, event: DragEvent) => {
    if (!event.dataTransfer) return;

    draggedColumnId = columnId;
    isDragging.value = true;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", columnId);

    // Disable default ghost image - use transparent 1x1 pixel
    const transparentPixel = document.createElement("img");
    transparentPixel.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    transparentPixel.style.position = "absolute";
    transparentPixel.style.top = "-9999px";
    document.body.appendChild(transparentPixel);
    event.dataTransfer.setDragImage(transparentPixel, 0, 0);

    // Clean up the temporary image after drag starts
    setTimeout(() => transparentPixel.remove(), 0);

    // Add dragging class to header being dragged
    const dragElement = (event.target as HTMLElement).closest(".vc-table-composition__head") as HTMLElement;
    if (dragElement) {
      dragElement.classList.add("vc-table-composition__head--dragging");
      // dragend fires on the source element when drag ends for ANY reason
      // (successful drop, cancel, or drop outside valid targets).
      // This is the safety net — without it, dropping outside a column header
      // leaves the --dragging class stuck because `drop` never fires.
      dragElement.addEventListener("dragend", cleanupDrag, { once: true });
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    if (!draggedColumnId) return;

    // Throttle the reorder to avoid too frequent updates (50ms)
    if (dragThrottleTimer) return;

    dragThrottleTimer = window.setTimeout(() => {
      dragThrottleTimer = null;
    }, 50);

    // Get the column being hovered
    const target = event.target as HTMLElement;
    const header = target.closest(".vc-table-composition__head") as HTMLElement;
    if (!header) return;

    // Get column ID from data attribute (more reliable than DOM index)
    const hoveredColumnId = header.getAttribute("data-column-id");
    if (!hoveredColumnId || hoveredColumnId === draggedColumnId) return;

    // Check if cursor crossed the middle of the hovered column (50% threshold)
    const rect = (header as HTMLElement).getBoundingClientRect();
    const middleX = rect.left + rect.width / 2;
    const mouseX = event.clientX;

    const dragIndex = columns.value.findIndex((col) => col.id === draggedColumnId);
    const dropIndex = columns.value.findIndex((col) => col.id === hoveredColumnId);

    // Only swap if:
    // 1. Moving left and cursor is past the left half of target
    // 2. Moving right and cursor is past the right half of target
    const movingLeft = dragIndex > dropIndex;
    const movingRight = dragIndex < dropIndex;

    const shouldSwap = (movingLeft && mouseX < middleX) || (movingRight && mouseX > middleX);

    if (shouldSwap && dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
      const [movedColumn] = columns.value.splice(dragIndex, 1);
      columns.value.splice(dropIndex, 0, movedColumn);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    cleanupDrag();
  };

  const cleanupDrag = () => {
    // Guard: both `drop` and `dragend` call this — only run once
    if (!isDragging.value) return;

    // Remove dragging class from all headers
    document.querySelectorAll(".vc-table-composition__head--dragging").forEach((el) => {
      el.classList.remove("vc-table-composition__head--dragging");
    });

    isDragging.value = false;
    draggedColumnId = null;
    if (dragThrottleTimer) {
      clearTimeout(dragThrottleTimer);
      dragThrottleTimer = null;
    }

    // Callback
    if (onReorderEnd) {
      onReorderEnd(columns.value);
    }
  };

  // Cleanup on dragend event
  const handleDragEnd = () => {
    cleanupDrag();
  };

  /**
   * Returns props to spread onto a `<TableHead>` for drag-and-drop reordering.
   *
   * Usage: `<TableHead v-bind="reorder.getReorderHeadProps(col.id)" />`
   */
  const getReorderHeadProps = (columnId: string) => ({
    reorderable: true,
    columnId,
    onReorderDragStart: (id: string | undefined, e: DragEvent) => handleDragStart(id!, e),
    onReorderDragOver: (e: DragEvent) => handleDragOver(e),
    onReorderDrop: (id: string | undefined, e: DragEvent) => {
      handleDrop(e);
    },
    onReorderDragEnd: () => handleDragEnd(),
  });

  // Cleanup: if component unmounts mid-drag, clear timer and state
  onBeforeUnmount(() => {
    if (dragThrottleTimer) {
      clearTimeout(dragThrottleTimer);
      dragThrottleTimer = null;
    }
    isDragging.value = false;
    draggedColumnId = null;
  });

  return {
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    getReorderHeadProps,
  };
}
