import { ref, Ref, onBeforeUnmount } from "vue";

export interface ResizableColumn {
  id: string;
  width: number;
}

export interface UseTableColumnsResizeOptions {
  columns: Ref<ResizableColumn[]>;
  minColumnWidth?: number;
  /** Returns the header cell DOM element for a given column id (for measuring flex columns) */
  getColumnElement?: (id: string) => HTMLElement | null;
  /** Returns all cell DOM elements for a given column id (for live resize updates) */
  getAllColumnElements?: (id: string) => NodeListOf<Element> | null;
  onResizeEnd?: (columns: ResizableColumn[]) => void;
}

/**
 * Composable for table column resizing with DOM-based updates during drag.
 *
 * Implements two-column resize: dragging a column's right border grows that
 * column while shrinking its right neighbor by the same amount, keeping the
 * total table width constant and preventing columns from overflowing.
 *
 * The last column (no right neighbor) can shrink freely and can grow only
 * into the existing filler gap. When already at the container edge, dragging
 * right is a no-op. After being shrunk, it can grow back up to the edge.
 *
 * During drag: updates DOM styles directly (no reactive updates = no re-renders = smooth).
 * On mouseup: commits final widths for ALL columns to reactive state (including
 * unchanged columns whose actual rendered width is recorded). This ensures
 * hasFlexColumns becomes false and the filler gap appears after the last column.
 */
/** Minimum gap between the last column's right edge and the container's right edge */
const EDGE_MARGIN = 10;

export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const { columns, minColumnWidth = 60, getColumnElement, getAllColumnElements, onResizeEnd } = options;

  const isResizing = ref(false);

  // Mutable state (not reactive — only used during drag)
  let resizingColumnIndex = -1;
  let neighborColumnIndex = -1;
  let startX = 0;
  // All column widths measured at resize start
  let initialWidths: number[] = [];
  // Pending widths for resized column and neighbor (updated during drag)
  let pendingWidth = 0;
  let pendingNeighborWidth = 0;
  // How far the last column can grow (= gap between column right edge and container right edge)
  let maxLastColumnGrowth = 0;

  /**
   * Check whether a column is currently rendered in the DOM.
   * Columns may exist in the columns array (columnWidths) but be hidden
   * (e.g. via column switcher, showAllColumns=false, hiddenColumnIds).
   */
  const isColumnRendered = (columnId: string): boolean => {
    if (!getColumnElement) return false;
    return getColumnElement(columnId) !== null;
  };

  /**
   * Update DOM element width directly (bypasses reactivity for smooth drag)
   * Updates both header and all body cells for the column
   */
  const setElementWidth = (columnId: string, width: number) => {
    const widthPx = `${width}px`;

    // Update header element
    if (getColumnElement) {
      const el = getColumnElement(columnId);
      if (el) {
        el.style.transition = "none";
        el.style.width = widthPx;
        el.style.minWidth = widthPx;
        el.style.maxWidth = widthPx;
        el.style.flex = "0 0 auto";
      }
    }

    // Update all body cells with this column id
    if (getAllColumnElements) {
      const cells = getAllColumnElements(columnId);
      if (cells) {
        cells.forEach((cell) => {
          const htmlCell = cell as HTMLElement;
          htmlCell.style.transition = "none";
          htmlCell.style.width = widthPx;
          htmlCell.style.minWidth = widthPx;
          htmlCell.style.maxWidth = widthPx;
          htmlCell.style.flex = "0 0 auto";
        });
      }
    }
  };

  /**
   * Pin ALL column widths to their current rendered values in a single batch.
   * This prevents flex redistribution during resize.
   *
   * Key: measure ALL widths first, then apply ALL changes.
   * This avoids layout thrashing that causes visual "jumping".
   */
  const pinAllColumnWidths = (): number[] => {
    const widths: number[] = [];

    // Phase 1: Measure all widths (single layout read)
    columns.value.forEach((col) => {
      let width = 0;
      if (getColumnElement) {
        const el = getColumnElement(col.id);
        if (el) {
          width = Math.round(el.getBoundingClientRect().width);
        }
      }
      if (!width) {
        width = col.width || minColumnWidth;
      }
      widths.push(width);
    });

    // Phase 2: Apply all DOM updates (single layout write)
    widths.forEach((width, index) => {
      setElementWidth(columns.value[index].id, width);
    });

    return widths;
  };

  /**
   * Remove hardcoded DOM styles set during resize and actively restore the
   * correct flex/width values. After resize ALL columns have committed widths,
   * so this always restores flex: 0 1 auto with the committed pixel width.
   */
  const unpinAllColumnWidths = () => {
    columns.value.forEach((col) => {
      const hasWidth = col.width > 0;
      const restoreElement = (el: HTMLElement | null | undefined) => {
        if (!el) return;
        el.style.minWidth = "";
        el.style.maxWidth = "";
        el.style.transition = "";
        if (hasWidth) {
          el.style.flex = "0 1 auto";
          el.style.width = `${col.width}px`;
        } else {
          el.style.flex = "1 1 0";
          el.style.width = "";
        }
      };

      if (getColumnElement) {
        restoreElement(getColumnElement(col.id));
      }
      if (getAllColumnElements) {
        const cells = getAllColumnElements(col.id);
        if (cells) {
          cells.forEach((cell) => restoreElement(cell as HTMLElement));
        }
      }
    });
  };

  const handleResizeStart = (columnId: string, event: MouseEvent) => {
    const columnIndex = columns.value.findIndex((c) => c.id === columnId);
    if (columnIndex === -1) return;

    resizingColumnIndex = columnIndex;

    // Find the next RENDERED column to the right as the resize neighbor.
    // columns.value (columnWidths) may contain hidden column entries — these
    // have no DOM element and must be skipped. If no rendered neighbor exists,
    // this is the last visible column and uses the "last column" resize mode.
    neighborColumnIndex = -1;
    for (let i = columnIndex + 1; i < columns.value.length; i++) {
      if (isColumnRendered(columns.value[i].id)) {
        neighborColumnIndex = i;
        break;
      }
    }

    // Pin ALL columns and record their actual rendered widths
    initialWidths = pinAllColumnWidths();

    // For the last column: measure how much room there is to grow.
    // We measure from the column's parent wrapper (the TransitionGroup flex container),
    // NOT from the table container — the container includes row padding and other elements
    // that would overestimate the available space and cause overflow on mouseup.
    // wrapperRight - columnRight = exact filler width (the growable space).
    maxLastColumnGrowth = 0;
    if (neighborColumnIndex === -1 && getColumnElement) {
      const columnEl = getColumnElement(columnId);
      if (columnEl && columnEl.parentElement) {
        const wrapperRight = columnEl.parentElement.getBoundingClientRect().right;
        const columnRight = columnEl.getBoundingClientRect().right;
        maxLastColumnGrowth = Math.max(0, wrapperRight - columnRight - EDGE_MARGIN);
      }
    }

    startX = event.pageX;
    pendingWidth = initialWidths[columnIndex];
    pendingNeighborWidth = neighborColumnIndex !== -1 ? initialWidths[neighborColumnIndex] : 0;
    isResizing.value = true;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing.value || resizingColumnIndex === -1) return;

    const rawDelta = event.pageX - startX;
    const initialWidth = initialWidths[resizingColumnIndex];

    // Clamp so resized column doesn't go below minColumnWidth
    const minDelta = minColumnWidth - initialWidth;

    let clampedDelta: number;
    if (neighborColumnIndex !== -1) {
      // Two-column mode: resized column grows/shrinks, right neighbor does the inverse.
      const neighborInitial = initialWidths[neighborColumnIndex];
      const maxDelta = neighborInitial - minColumnWidth;
      clampedDelta = Math.max(minDelta, Math.min(rawDelta, maxDelta));

      pendingNeighborWidth = Math.round(neighborInitial - clampedDelta);
      setElementWidth(columns.value[neighborColumnIndex].id, pendingNeighborWidth);
    } else {
      // Last column (no neighbor): can grow only into the filler gap (the space between
      // the column's right edge and the container's right edge measured at mousedown).
      // When already at the edge, maxLastColumnGrowth ≈ 0 → can't grow → drag right is no-op.
      // Can always shrink down to minColumnWidth.
      clampedDelta = Math.max(minDelta, Math.min(rawDelta, maxLastColumnGrowth));
    }

    pendingWidth = Math.round(initialWidth + clampedDelta);
    setElementWidth(columns.value[resizingColumnIndex].id, pendingWidth);
  };

  const handleResizeEnd = () => {
    if (!isResizing.value) return;

    // Commit widths to reactive state.
    // Resized + neighbor get their new values; other RENDERED columns keep their
    // actual rendered width (measured at mousedown). Hidden columns (no DOM element)
    // keep their existing width — don't overwrite with initialWidths fallback values.
    columns.value.forEach((col, index) => {
      if (index === resizingColumnIndex) {
        col.width = pendingWidth;
      } else if (index === neighborColumnIndex) {
        col.width = pendingNeighborWidth;
      } else if (isColumnRendered(col.id)) {
        // Only commit measured width for rendered columns
        col.width = initialWidths[index];
      }
      // Hidden columns: keep their existing col.width unchanged
    });

    // Clear hardcoded DOM styles so Vue regains control
    unpinAllColumnWidths();

    isResizing.value = false;
    resizingColumnIndex = -1;
    neighborColumnIndex = -1;
    initialWidths = [];
    pendingWidth = 0;
    pendingNeighborWidth = 0;
    maxLastColumnGrowth = 0;

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);

    if (onResizeEnd) {
      onResizeEnd(columns.value);
    }
  };

  /**
   * Returns props to spread onto a `<TableHead>` for column resizing.
   */
  const getResizeHeadProps = (columnId: string, index: number) => ({
    resizable: true,
    columnId,
    isLastResizable: index === columns.value.length - 1,
    onResizeStart: (id: string | undefined, e: MouseEvent) => handleResizeStart(id!, e),
  });

  // Cleanup: if component unmounts mid-resize, remove document listeners
  onBeforeUnmount(() => {
    if (isResizing.value) {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      isResizing.value = false;
    }
  });

  return {
    isResizing,
    handleResizeStart,
    getResizeHeadProps,
  };
}
