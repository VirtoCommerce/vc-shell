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
  containerEl?: Ref<HTMLElement | null>;
}

/**
 * Column resizing via Vue reactivity.
 *
 * Widths in pixels. Growing a column shrinks right neighbors equally.
 * On drag start all columns are pinned to DOM widths to prevent flex drift.
 * Container resize (blade expand/collapse) scales columns proportionally
 * after layout has settled (convergence detection, not a hardcoded timer).
 */
export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const { columns, minColumnWidth = 40, getColumnElement, onResizeEnd, containerEl } = options;

  const isResizing = ref(false);

  let resizingColumnIndex = -1;
  let startX = 0;
  let initialWidths: number[] = [];
  let rafId = 0;
  let maxGrowth = 0;
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

  // Gap between the last rendered column's right edge and the row wrapper's right edge.
  // NOTE: reads pre-pin DOM. After Vue re-renders with pinned widths, filler may differ
  // slightly when flex-grow columns existed — maxGrowth will be underestimated by that margin.
  const measureFillerSpace = (): number => {
    if (!getColumnElement) return 0;
    for (let i = columns.value.length - 1; i >= 0; i--) {
      const el = getColumnElement(columns.value[i].id);
      if (el?.parentElement) {
        const parentRight = el.parentElement.getBoundingClientRect().right;
        const colRight = el.getBoundingClientRect().right;
        return Math.max(0, Math.floor(parentRight - colRight));
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

    // Measure filler before pinning — DOM still reflects actual flex layout
    const filler = measureFillerSpace();

    // Pin all columns to DOM widths so flex doesn't redistribute during drag
    columns.value.forEach((col, i) => {
      col.width = initialWidths[i];
    });

    rightNeighborIndices = [];
    if (getColumnElement) {
      for (let i = columnIndex + 1; i < columns.value.length; i++) {
        if (getColumnElement(columns.value[i].id)) {
          rightNeighborIndices.push(i);
        }
      }
    }

    const totalGiveable = rightNeighborIndices.reduce((sum, idx) => sum + (initialWidths[idx] - minColumnWidth), 0);
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

    columns.value[resizingColumnIndex].width = Math.round(initialWidth + clampedDelta);

    // Distribute inverse delta equally across right neighbors
    if (rightNeighborIndices.length > 0) {
      let remaining = clampedDelta;
      const active = [...rightNeighborIndices];

      for (const idx of rightNeighborIndices) {
        columns.value[idx].width = initialWidths[idx];
      }

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

          if (newWidth > minColumnWidth || share < 0) {
            next.push(idx);
          }
        }

        remaining -= applied;
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
    onResizeEnd?.(columns.value);
  };

  const getResizeHeadProps = (columnId: string, index: number) => ({
    resizable: true,
    columnId,
    isLastResizable: index === columns.value.length - 1,
    onResizeStart: (id: string | undefined, e: MouseEvent) => {
      if (id) handleResizeStart(id, e);
    },
  });

  // --- Container ResizeObserver: proportional scaling on container resize ---

  let lastContainerWidth = 0;
  let resizeObserver: ResizeObserver | null = null;
  // Scaling disabled until container width stabilizes after mount/transition.
  // Uses convergence detection: 100ms with no resize events = settled.
  let settled = false;
  let settleDebounce: ReturnType<typeof setTimeout> | undefined;

  const onSettled = () => {
    settled = true;
    if (!containerEl?.value) return;
    const w = containerEl.value.clientWidth;
    // Column wider than container = corrupt (stale localStorage from a past bug)
    if (w > 0) {
      for (const col of columns.value) {
        if (col.width > w) col.width = 0;
      }
    }
    lastContainerWidth = w;
  };

  const setupResizeObserver = () => {
    if (!containerEl?.value || typeof ResizeObserver === "undefined") return;

    lastContainerWidth = 0;
    settled = false;
    if (settleDebounce !== undefined) {
      clearTimeout(settleDebounce);
      settleDebounce = undefined;
    }

    resizeObserver = new ResizeObserver((entries) => {
      if (isResizing.value) return;
      const newWidth = entries[0].contentRect.width;
      if (newWidth < 50) return; // mid-transition noise

      if (!settled) {
        lastContainerWidth = newWidth;
        // Reset debounce — width still changing (animation in progress)
        if (settleDebounce !== undefined) clearTimeout(settleDebounce);
        settleDebounce = setTimeout(() => {
          settleDebounce = undefined;
          onSettled();
        }, 100);
        return;
      }

      if (newWidth === lastContainerWidth) return;

      if (lastContainerWidth < 50) {
        lastContainerWidth = newWidth;
        return;
      }

      const hasExplicitWidths = columns.value.some((col) => col.width > 0);
      if (!hasExplicitWidths) {
        lastContainerWidth = newWidth;
        return;
      }

      const ratio = newWidth / lastContainerWidth;
      if (ratio > 3 || ratio < 1 / 3) {
        lastContainerWidth = newWidth;
        return;
      }

      columns.value.forEach((col) => {
        if (col.width > 0) {
          col.width = Math.max(minColumnWidth, Math.round(col.width * ratio));
        }
      });
      lastContainerWidth = newWidth;
    });

    resizeObserver.observe(containerEl.value);
  };

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
    if (settleDebounce !== undefined) clearTimeout(settleDebounce);
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
