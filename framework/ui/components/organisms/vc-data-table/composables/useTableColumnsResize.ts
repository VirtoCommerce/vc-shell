import { ref, watch, type Ref, onBeforeUnmount } from "vue";
import type { ColumnState, ColumnSpec, TableFitMode } from "../types";
import { computeColumnWidths, normalizeWeights, type EngineOutput } from "./useColumnWidthEngine";

export interface UseTableColumnsResizeOptions {
  columnState: Ref<ColumnState>;
  engineOutput: Ref<EngineOutput>;
  recompute: () => void;
  getAvailableWidth: () => number;
  getSpecialColumnsWidth: () => number;
  minColumnWidth?: number;
  fitMode?: TableFitMode;
  getColumnElement?: (id: string) => HTMLElement | null;
  onResizeEnd?: () => void;
  containerEl?: Ref<HTMLElement | null>;
}

/**
 * Column resizing via weight manipulation.
 *
 * On drag start, snapshots current weights.
 * During drag, converts pixel delta to weight delta and redistributes
 * among right neighbors. On end, commits to columnState.
 * Container resize simply calls recompute() after debounce.
 */
export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const {
    columnState,
    engineOutput,
    recompute,
    getAvailableWidth,
    getSpecialColumnsWidth,
    minColumnWidth = 40,
    fitMode = "gap",
    onResizeEnd,
    containerEl,
  } = options;

  const isResizing = ref(false);

  let startX = 0;
  let rafId = 0;
  let initialSpecs: Record<string, ColumnSpec> = {};
  let draggedId = "";
  let rightNeighborIds: string[] = [];

  const handleResizeStart = (columnId: string, event: MouseEvent) => {
    draggedId = columnId;
    startX = event.pageX;
    initialSpecs = JSON.parse(JSON.stringify(columnState.value.specs));

    // Find right neighbors in order
    const order = columnState.value.order;
    const idx = order.indexOf(columnId);
    rightNeighborIds = idx >= 0 ? order.slice(idx + 1).filter((id) => initialSpecs[id]) : [];

    isResizing.value = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const applyResize = (rawDelta: number) => {
    const available = getAvailableWidth() - getSpecialColumnsWidth();
    if (available <= 0) return;

    const deltaWeight = rawDelta / available;
    const newSpecs = JSON.parse(JSON.stringify(initialSpecs)) as Record<string, ColumnSpec>;

    // Apply delta to dragged column
    newSpecs[draggedId].weight = Math.max(0.01, initialSpecs[draggedId].weight + deltaWeight);

    // Compensate from right neighbors proportionally
    const totalRightWeight = rightNeighborIds.reduce((s, id) => s + (initialSpecs[id]?.weight ?? 0), 0);
    if (totalRightWeight > 0) {
      for (const id of rightNeighborIds) {
        const share = initialSpecs[id].weight / totalRightWeight;
        newSpecs[id].weight = Math.max(0.01, initialSpecs[id].weight - deltaWeight * share);
      }
    }

    // Normalize visible weights
    const visibleIds = columnState.value.order.filter((id) => newSpecs[id]);
    normalizeWeights(newSpecs, visibleIds);

    // Compute and update
    const cols = visibleIds.map((id) => ({ id, spec: newSpecs[id] }));
    engineOutput.value = computeColumnWidths({ availableWidth: available, columns: cols, mode: fitMode });

    // Update specs
    columnState.value = { ...columnState.value, specs: newSpecs };
  };

  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing.value || !draggedId) return;
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
    draggedId = "";
    initialSpecs = {};
    rightNeighborIds = [];
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    onResizeEnd?.();
  };

  const getResizeHeadProps = (columnId: string, index: number) => ({
    resizable: true,
    columnId,
    isLastResizable: index === columnState.value.order.length - 1,
    onResizeStart: (id: string | undefined, e: MouseEvent) => {
      if (id) handleResizeStart(id, e);
    },
  });

  // --- Container ResizeObserver: recompute on container resize ---

  let resizeObserver: ResizeObserver | null = null;
  let settled = false;
  let settleDebounce: ReturnType<typeof setTimeout> | undefined;

  const setupResizeObserver = () => {
    if (!containerEl?.value || typeof ResizeObserver === "undefined") return;

    settled = false;
    if (settleDebounce !== undefined) {
      clearTimeout(settleDebounce);
      settleDebounce = undefined;
    }

    resizeObserver = new ResizeObserver(() => {
      if (isResizing.value) return;
      if (!settled) {
        if (settleDebounce !== undefined) clearTimeout(settleDebounce);
        settleDebounce = setTimeout(() => {
          settleDebounce = undefined;
          settled = true;
          recompute();
        }, 100);
        return;
      }
      recompute();
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
