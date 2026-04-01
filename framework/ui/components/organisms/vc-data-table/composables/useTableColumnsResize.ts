import { ref, Ref, onBeforeUnmount } from "vue";

export interface ResizableColumn {
  id: string;
  width: number;
}

export interface UseTableColumnsResizeOptions {
  columns: Ref<ResizableColumn[]>;
  minColumnWidth?: number;
  getColumnElement?: (id: string) => HTMLElement | null;
  getAllColumnElements?: (id: string) => NodeListOf<Element> | null;
  onResizeEnd?: (columns: ResizableColumn[]) => void;
}

/**
 * Column resizing via Vue reactivity (AG Grid shift-mode style).
 *
 * - All widths in pixels. No percentages.
 * - Growing a column proportionally shrinks right neighbors (total stays constant).
 * - Flex-grow columns get explicit px width on first resize (flex disabled, like AG Grid).
 * - Last column can only shrink (grow it by resizing the second-to-last).
 * - No direct DOM manipulation — Vue re-renders atomically. Zero layout shift.
 * - rAF-throttled for smooth 60fps updates.
 */
export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const { columns, minColumnWidth = 40, getColumnElement, onResizeEnd } = options;

  const isResizing = ref(false);

  let resizingColumnIndex = -1;
  let startX = 0;
  let initialWidths: number[] = [];
  let rafId = 0;
  let maxLastColumnGrowth = 0;

  const isColumnRendered = (columnId: string): boolean => {
    if (!getColumnElement) return false;
    return getColumnElement(columnId) !== null;
  };

  const measureAllColumnWidths = (): number[] => {
    return columns.value.map((col) => {
      if (getColumnElement) {
        const el = getColumnElement(col.id);
        if (el) return el.getBoundingClientRect().width;
      }
      return col.width || minColumnWidth;
    });
  };

  const getRightNeighborIndices = (fromIndex: number): number[] => {
    const indices: number[] = [];
    for (let i = fromIndex + 1; i < columns.value.length; i++) {
      if (isColumnRendered(columns.value[i].id)) {
        indices.push(i);
      }
    }
    return indices;
  };

  const handleResizeStart = (columnId: string, event: MouseEvent) => {
    const columnIndex = columns.value.findIndex((c) => c.id === columnId);
    if (columnIndex === -1) return;

    resizingColumnIndex = columnIndex;
    initialWidths = measureAllColumnWidths();
    startX = event.pageX;

    // For the last column: measure filler gap (space between column right edge
    // and container right edge). The column can grow back into this gap.
    maxLastColumnGrowth = 0;
    if (getRightNeighborIndices(columnIndex).length === 0 && getColumnElement) {
      const el = getColumnElement(columnId);
      if (el?.parentElement) {
        const parentRight = el.parentElement.getBoundingClientRect().right;
        const colRight = el.getBoundingClientRect().right;
        maxLastColumnGrowth = Math.max(0, parentRight - colRight - 2);
      }
    }

    isResizing.value = true;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const applyResize = (rawDelta: number) => {
    const initialWidth = initialWidths[resizingColumnIndex];
    const minDelta = minColumnWidth - initialWidth;
    const rightIndices = getRightNeighborIndices(resizingColumnIndex);

    let clampedDelta: number;
    if (rightIndices.length > 0) {
      const totalGiveable = rightIndices.reduce(
        (sum, idx) => sum + (initialWidths[idx] - minColumnWidth),
        0,
      );
      clampedDelta = Math.max(minDelta, Math.min(rawDelta, totalGiveable));

      // Distribute proportionally among right neighbors
      const totalRightWidth = rightIndices.reduce((sum, idx) => sum + initialWidths[idx], 0);
      let distributed = 0;

      for (let i = 0; i < rightIndices.length; i++) {
        const idx = rightIndices[i];
        const initialW = initialWidths[idx];

        if (i === rightIndices.length - 1) {
          // Last neighbor absorbs rounding remainder
          columns.value[idx].width = Math.max(minColumnWidth, Math.round(initialW - (clampedDelta - distributed)));
        } else {
          const share = totalRightWidth > 0 ? (initialW / totalRightWidth) * clampedDelta : 0;
          const newWidth = Math.max(minColumnWidth, Math.round(initialW - share));
          distributed += initialW - newWidth;
          columns.value[idx].width = newWidth;
        }
      }
    } else {
      // Last column: can shrink freely, can grow into the filler gap.
      clampedDelta = Math.max(minDelta, Math.min(rawDelta, maxLastColumnGrowth));
    }

    columns.value[resizingColumnIndex].width = Math.round(initialWidth + clampedDelta);
  };

  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing.value || resizingColumnIndex === -1) return;

    const rawDelta = event.pageX - startX;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      applyResize(rawDelta);
      rafId = 0;
    });
  };

  const handleResizeEnd = () => {
    if (!isResizing.value) return;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    isResizing.value = false;
    resizingColumnIndex = -1;
    initialWidths = [];

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);

    if (onResizeEnd) {
      onResizeEnd(columns.value);
    }
  };

  const getResizeHeadProps = (columnId: string, index: number) => ({
    resizable: true,
    columnId,
    isLastResizable: index === columns.value.length - 1,
    onResizeStart: (id: string | undefined, e: MouseEvent) => handleResizeStart(id!, e),
  });

  onBeforeUnmount(() => {
    if (isResizing.value) {
      if (rafId) cancelAnimationFrame(rafId);
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
