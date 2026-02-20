import { ref, Ref, watch, onBeforeUnmount } from "vue";
import { TableItem } from "@ui/components/organisms/vc-table/types";
import { createLogger } from "@core/utilities";

const logger = createLogger("vc-table-row-reorder");

const ROW_SELECTOR = ".vc-table-row, .vc-table-composition__row";

/**
 * Resolve the row HTMLElement from a drag/mouse event.
 * Works both when the event is a native DOM event (currentTarget is the row)
 * and when it is re-emitted through Vue's emit system (currentTarget is null,
 * so we fall back to event.target.closest()).
 */
function resolveRowElement(event: Event): HTMLElement | null {
  if (event.currentTarget instanceof HTMLElement) {
    return event.currentTarget;
  }
  if (event.target instanceof HTMLElement) {
    return event.target.closest<HTMLElement>(ROW_SELECTOR);
  }
  return null;
}

/**
 * Composable for table row reordering with drag & drop.
 *
 * Uses live-swap approach: rows visually swap positions during drag
 * when the cursor crosses the 50% vertical threshold of a target row.
 *
 * The composable maintains an internal writable copy of items
 * so it works both with writable refs and readonly prop refs.
 * During drag, `reorderedItems` reflects the current visual order.
 *
 * Reorder is committed via `dragend` (which always fires) with `drop`
 * as a preferred path when available. This avoids relying on `drop`
 * which may not fire if the cursor is not over a row element at release.
 */
export function useTableRowReorder<T extends TableItem | string>(
  items: Ref<T[]>,
  onReorder: (args: { dragIndex: number; dropIndex: number; value: T[] }) => void,
) {
  // Internal writable copy — keeps in sync with source when not dragging
  const reorderedItems = ref<T[]>([...items.value]) as Ref<T[]>;
  let syncing = false;

  watch(
    items,
    (newVal) => {
      if (!syncing && !isDragging.value) {
        reorderedItems.value = [...newVal];
        // Parent updated items after reorder — stop showing stale reorderedItems
        pendingReorder.value = false;
      }
    },
    { deep: true },
  );

  const draggedRow = ref<number>();
  const isDragging = ref(false);
  // Keeps reorderedItems visible after drop until parent updates items
  const pendingReorder = ref(false);
  let originalIndex: number | null = null;
  let dragThrottleTimer: number | null = null;
  // Prevents double-commit when both drop and dragend fire
  let dropFired = false;

  function onRowMouseDown(event: MouseEvent) {

    const row = resolveRowElement(event);
    if (!row) return;
    row.draggable = true;
  }

  function onRowDragStart(event: DragEvent, item: T) {
    isDragging.value = true;
    dropFired = false;
    // Snapshot current items into internal copy
    reorderedItems.value = [...items.value];
    const index = reorderedItems.value.indexOf(item);

    draggedRow.value = index;
    originalIndex = index;

    if (event.dataTransfer) {
      event.dataTransfer.setData("text", "row-reorder");
      event.dataTransfer.effectAllowed = "move";

      // Hide default browser ghost — live-swap provides visual feedback
      const transparentPixel = document.createElement("img");
      transparentPixel.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      transparentPixel.style.position = "absolute";
      transparentPixel.style.top = "-9999px";
      document.body.appendChild(transparentPixel);
      event.dataTransfer.setDragImage(transparentPixel, 0, 0);
      setTimeout(() => transparentPixel.remove(), 0);
    }
  }

  function onRowDragOver(event: DragEvent, item: T) {
    if (!isDragging.value || draggedRow.value === undefined) return;

    // CRITICAL: Must always preventDefault in dragover for `drop` to fire.
    // Without this, the browser considers the element an invalid drop target.
    event.preventDefault();

    const currentIndex = reorderedItems.value.indexOf(item);
    if (currentIndex === draggedRow.value) return;

    // Throttle swaps (50ms) to avoid too frequent updates
    if (dragThrottleTimer) return;
    dragThrottleTimer = window.setTimeout(() => {
      dragThrottleTimer = null;
    }, 50);

    const rowElement = resolveRowElement(event);
    if (!rowElement) return;

    // 50% vertical threshold — same logic as column reorder uses horizontally
    const rect = rowElement.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const mouseY = event.clientY;

    const dragIndex = draggedRow.value;
    const movingUp = dragIndex > currentIndex;
    const movingDown = dragIndex < currentIndex;

    const shouldSwap = (movingUp && mouseY < middleY) || (movingDown && mouseY > middleY);

    if (shouldSwap && dragIndex !== currentIndex) {
      // Live swap in the internal copy
      const [movedItem] = reorderedItems.value.splice(dragIndex, 1);
      reorderedItems.value.splice(currentIndex, 0, movedItem);
      // Track new position of dragged item
      draggedRow.value = currentIndex;
    }
  }

  function onRowDragLeave(_event: DragEvent) {
    // No border indicators to clean up — live-swap handles visuals
  }

  /**
   * Commit the reorder if positions changed.
   * Called from both onRowDrop and onRowDragEnd (whichever fires first).
   */
  function commitReorder() {
    const didReorder =
      draggedRow.value !== undefined && originalIndex !== null && draggedRow.value !== originalIndex;

    if (didReorder) {
      syncing = true;
      onReorder({
        dragIndex: originalIndex!,
        dropIndex: draggedRow.value!,
        value: [...reorderedItems.value],
      });
      syncing = false;
      pendingReorder.value = true;
    }
  }

  /**
   * dragend always fires on the source element — use as the reliable commit point.
   * If drop already fired and committed, this is a no-op.
   */
  function onRowDragEnd(event: DragEvent) {
    const rowElement = resolveRowElement(event);
    if (rowElement) {
      rowElement.draggable = false;
    }

    // Fallback commit: drop may not fire if cursor is not over a row at release
    if (!dropFired) {
      commitReorder();
    }

    dropFired = false;
    cleanup();
  }

  /**
   * drop fires on the target row (if cursor is over a valid drop target).
   * Preferred commit path — marks dropFired so dragend skips the commit.
   */
  function onRowDrop(event: DragEvent) {
    event.preventDefault();
    dropFired = true;

    commitReorder();

    const rowElement = resolveRowElement(event);
    if (rowElement) {
      rowElement.draggable = false;
    }

    cleanup();
  }

  function cleanup() {
    isDragging.value = false;
    draggedRow.value = undefined;
    originalIndex = null;
    if (dragThrottleTimer) {
      clearTimeout(dragThrottleTimer);
      dragThrottleTimer = null;
    }
  }

  // Cleanup: if component unmounts mid-drag, clear timer and reset state
  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    draggedRow,
    pendingReorder,
    reorderedItems,
    onRowMouseDown,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDragEnd,
    onRowDrop,
  };
}
