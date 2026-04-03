import { ref, watch, Ref, onBeforeUnmount } from "vue";

export interface ResizableColumn {
  id: string;
  width: number;
}

export interface UseTableColumnsResizeOptions {
  columns: Ref<ResizableColumn[]>;
  minColumnWidth?: number;
  getColumnElement?: (id: string) => HTMLElement | null;
  onResizeEnd?: (columns: ResizableColumn[]) => void;
  /** Container element — used by ResizeObserver to scale columns when container resizes */
  containerEl?: Ref<HTMLElement | null>;
}

/**
 * Column resizing via Vue reactivity (AG Grid style).
 *
 * - All widths in pixels. No percentages.
 * - Growing a column equally shrinks ALL right neighbors to make room.
 * - Shrinking a column equally grows ALL right neighbors.
 * - Resize stops when all right neighbors hit minColumnWidth.
 * - Last column (no neighbors): grows/shrinks into filler space only.
 * - On drag start, all columns are pinned to their DOM widths to prevent flex drift.
 * - rAF-throttled for smooth 60fps updates.
 */
export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const { columns, minColumnWidth = 40, getColumnElement, onResizeEnd, containerEl } = options;

  const isResizing = ref(false);

  let resizingColumnIndex = -1;
  let startX = 0;
  let initialWidths: number[] = [];
  let rafId = 0;
  /** Max px the dragged column can grow (all right neighbors give + filler) */
  let maxGrowth = 0;
  /** Indices of all rendered right neighbors */
  let rightNeighborIndices: number[] = [];

  const measureAllColumnWidths = (): number[] => {
    return columns.value.map((col) => {
      if (getColumnElement) {
        const el = getColumnElement(col.id);
        if (el) return el.getBoundingClientRect().width;
      }
      return col.width || minColumnWidth;
    });
  };

  /**
   * Measure available filler space — the gap between the last rendered
   * column's right edge and the row wrapper's right edge.
   * This is how much ANY column can grow before the row overflows.
   */
  const measureFillerSpace = (): number => {
    if (!getColumnElement) return 0;

    // Find the last rendered column
    for (let i = columns.value.length - 1; i >= 0; i--) {
      const el = getColumnElement(columns.value[i].id);
      if (el?.parentElement) {
        const parentRight = el.parentElement.getBoundingClientRect().right;
        const colRight = el.getBoundingClientRect().right;
        return Math.max(0, parentRight - colRight - 1);
      }
    }
    return 0;
  };

  const handleResizeStart = (columnId: string, event: MouseEvent) => {
    const columnIndex = columns.value.findIndex((c) => c.id === columnId);
    if (columnIndex === -1) return;

    resizingColumnIndex = columnIndex;
    initialWidths = measureAllColumnWidths();
    startX = event.pageX;

    // Pin ALL columns to their current DOM widths.
    // Without this, stored widths may differ from DOM widths due to flex-shrink
    // (when total stored > container, flex compresses all columns).
    // Pinning ensures: stored = DOM, total ≤ container, filler appears,
    // and changing one column doesn't cause flex redistribution on others.
    columns.value.forEach((col, i) => {
      col.width = initialWidths[i];
    });

    // Find all rendered right neighbors
    rightNeighborIndices = [];
    if (getColumnElement) {
      for (let i = columnIndex + 1; i < columns.value.length; i++) {
        if (getColumnElement(columns.value[i].id)) {
          rightNeighborIndices.push(i);
        }
      }
    }

    // Max growth = total right neighbors can give + filler
    const totalGiveable = rightNeighborIndices.reduce((sum, idx) => sum + (initialWidths[idx] - minColumnWidth), 0);
    const filler = measureFillerSpace();
    maxGrowth = totalGiveable + filler;

    isResizing.value = true;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const applyResize = (rawDelta: number) => {
    const initialWidth = initialWidths[resizingColumnIndex];
    const minDelta = minColumnWidth - initialWidth;
    const clampedDelta = Math.max(minDelta, Math.min(rawDelta, maxGrowth));

    // Apply to the dragged column
    columns.value[resizingColumnIndex].width = Math.round(initialWidth + clampedDelta);

    // Distribute the inverse delta equally across ALL right neighbors.
    // Equal distribution preserves relative size differences between columns.
    // Columns that hit minColumnWidth stop shrinking; remainder redistributes to others.
    if (rightNeighborIndices.length > 0) {
      let remaining = clampedDelta;
      const active = [...rightNeighborIndices];

      // Reset all neighbors to initial widths first (needed for cumulative delta from drag start)
      for (const idx of rightNeighborIndices) {
        columns.value[idx].width = initialWidths[idx];
      }

      // Iteratively distribute: some columns may hit min and drop out
      while (Math.abs(remaining) > 0.5 && active.length > 0) {
        const share = remaining / active.length;
        const next: number[] = [];
        let applied = 0;

        for (const idx of active) {
          const current = columns.value[idx].width;
          const newWidth = Math.max(minColumnWidth, Math.round(current - share));
          const actualChange = current - newWidth;
          applied += actualChange;
          columns.value[idx].width = newWidth;

          // Column still has room to give/take — keep it active
          if (newWidth > minColumnWidth || share < 0) {
            next.push(idx);
          }
        }

        remaining -= applied;
        // If no progress was made, break to avoid infinite loop
        if (Math.abs(applied) < 0.5) break;
        active.length = 0;
        active.push(...next);
      }
    }
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

  // =========================================================================
  // Container ResizeObserver — scale column widths when container resizes
  // (e.g. blade expands/collapses). Only acts when columns have been manually
  // resized (have explicit widths). Scales proportionally so columns fill
  // the new container width without a gap.
  // =========================================================================

  let lastContainerWidth = 0;
  let resizeObserver: ResizeObserver | null = null;

  const setupResizeObserver = () => {
    if (!containerEl?.value) return;

    lastContainerWidth = containerEl.value.clientWidth;

    if (typeof ResizeObserver === "undefined") return;

    resizeObserver = new ResizeObserver((entries) => {
      // Skip during active drag
      if (isResizing.value) return;

      const newWidth = entries[0].contentRect.width;
      if (newWidth === lastContainerWidth || lastContainerWidth === 0) {
        lastContainerWidth = newWidth;
        return;
      }

      // Check if any columns have been manually resized
      const hasResizedColumns = columns.value.some((col) => col.width > 0);
      if (!hasResizedColumns) {
        lastContainerWidth = newWidth;
        return;
      }

      // Scale all resized columns proportionally
      const ratio = newWidth / lastContainerWidth;
      columns.value.forEach((col) => {
        if (col.width > 0) {
          col.width = Math.max(minColumnWidth, Math.round(col.width * ratio));
        }
      });

      lastContainerWidth = newWidth;
    });

    resizeObserver.observe(containerEl.value);
  };

  // Watch for container element becoming available
  if (containerEl) {
    watch(
      containerEl,
      (el) => {
        resizeObserver?.disconnect();
        if (el) setupResizeObserver();
      },
      { immediate: true },
    );
  }

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
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
