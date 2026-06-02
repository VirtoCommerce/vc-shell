import { ref, watch, type Ref, onBeforeUnmount } from "vue";
import type { ColumnState, ColumnSpec } from "../types";
import { DEFAULT_MIN_COLUMN_PX, type EngineOutput } from "./useColumnWidthEngine";

export interface UseTableColumnsResizeOptions {
  columnState: Ref<ColumnState>;
  engineOutput: Ref<EngineOutput>;
  /** Re-runs the width engine with current weights and measured availableWidth. */
  recompute: () => void;
  /** Returns net available width for data columns (measured from DOM wrapper). */
  getAvailableWidth: () => number;
  /** Floor for both user-drag clamp and iterative right-neighbor distribution. */
  minColumnWidth?: number;
  /** Returns ids of currently-visible regular (non-special) columns in display order. */
  getVisibleRegularColumnIds?: () => string[];
  onResizeEnd?: () => void;
  containerEl?: Ref<HTMLElement | null>;
}

/**
 * Column resizing via weight manipulation.
 *
 * On drag start, snapshots current weights.
 * During drag, converts pixel delta to weight delta and redistributes
 * among right neighbors. On end, commits to columnState.
 * Container resize calls recompute() immediately on the first tick, then rAF-throttled.
 */
export function useTableColumnsResize(options: UseTableColumnsResizeOptions) {
  const {
    columnState,
    engineOutput,
    recompute,
    getAvailableWidth,
    minColumnWidth = DEFAULT_MIN_COLUMN_PX,
    getVisibleRegularColumnIds,
    onResizeEnd,
    containerEl,
  } = options;

  const isResizing = ref(false);

  let startX = 0;
  let rafId = 0;
  let initialSpecs: Record<string, ColumnSpec> = {};
  let draggedId = "";
  let rightNeighborIds: string[] = [];

  const cloneSpecs = (specs: Record<string, ColumnSpec>): Record<string, ColumnSpec> => {
    const cloned: Record<string, ColumnSpec> = {};
    for (const [id, spec] of Object.entries(specs)) {
      cloned[id] = { ...spec };
    }
    return cloned;
  };

  const getActiveOrder = (): string[] => {
    const visibleRegular = getVisibleRegularColumnIds?.() ?? [];
    if (visibleRegular.length > 0) {
      return visibleRegular.filter((id) => !!columnState.value.specs[id]);
    }

    const renderedIds = new Set(Object.keys(engineOutput.value.widths));
    if (renderedIds.size === 0) {
      return columnState.value.order.filter((id) => !!columnState.value.specs[id]);
    }
    return columnState.value.order.filter((id) => renderedIds.has(id) && !!columnState.value.specs[id]);
  };

  const handleResizeStart = (columnId: string, event: MouseEvent) => {
    const activeOrder = getActiveOrder();
    const idx = activeOrder.indexOf(columnId);
    if (idx < 0) return;

    draggedId = columnId;
    startX = event.pageX;
    initialSpecs = cloneSpecs(columnState.value.specs);

    // Find right neighbors in order
    rightNeighborIds = activeOrder.slice(idx + 1).filter((id) => !!initialSpecs[id]);

    isResizing.value = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const applyResize = (rawDelta: number) => {
    const available = getAvailableWidth();
    if (available <= 0) return;

    const activeOrder = getActiveOrder();
    if (activeOrder.length === 0 || !activeOrder.includes(draggedId)) return;

    // --- Work in pixels, same as the old system ---
    // Compute initial pixel widths from weights
    const initialPx: Record<string, number> = {};
    for (const id of activeOrder) {
      if (initialSpecs[id]) {
        initialPx[id] = initialSpecs[id].weight * available;
      }
    }

    // Max growth = right neighbors' shrink capacity + filler space (gap mode)
    let maxGrowthPx = 0;
    for (const id of rightNeighborIds) {
      const min = initialSpecs[id]?.minPx ?? minColumnWidth;
      maxGrowthPx += Math.max(0, initialPx[id] - min);
    }
    // In gap mode, filler space can also be consumed by growing columns
    const totalInitialPx = activeOrder.reduce((s, id) => s + (initialPx[id] ?? 0), 0);
    const fillerPx = Math.max(0, available - totalInitialPx);
    maxGrowthPx += fillerPx;

    // Max shrink = dragged column down to its minPx
    const draggedMin = initialSpecs[draggedId]?.minPx ?? minColumnWidth;
    const maxShrinkPx = Math.max(0, initialPx[draggedId] - draggedMin);

    // Clamp: can't grow more than right neighbors can give, can't shrink below min
    const clampedDelta = Math.max(-maxShrinkPx, Math.min(rawDelta, maxGrowthPx));
    if (Math.abs(clampedDelta) < 0.5) return;

    // Build new pixel widths starting from initial values
    const newPx: Record<string, number> = { ...initialPx };

    // Apply clamped delta to dragged column
    newPx[draggedId] = initialPx[draggedId] + clampedDelta;

    // Distribute inverse delta across right neighbors (iterative, same as old system)
    if (rightNeighborIds.length > 0) {
      for (const id of rightNeighborIds) {
        newPx[id] = initialPx[id];
      }
      let remaining = clampedDelta;
      const active = [...rightNeighborIds];

      while (Math.abs(remaining) > 0.5 && active.length > 0) {
        const share = remaining / active.length;
        const next: string[] = [];
        let applied = 0;

        for (const id of active) {
          const min = initialSpecs[id]?.minPx ?? minColumnWidth;
          const current = newPx[id];
          const target = current - share;
          const clamped = Math.max(min, target);
          const actualChange = current - clamped;
          applied += actualChange;
          newPx[id] = clamped;

          if (clamped > min || share < 0) {
            next.push(id);
          }
        }

        remaining -= applied;
        if (Math.abs(applied) < 0.5) break;
        active.length = 0;
        active.push(...next);
      }
    }

    // Convert px back to weights using available as denominator.
    // This preserves filler: if user shrinks a column, sum(weights) < 1.0
    // and the filler absorbs the freed space. User can then grow back into it.
    const newSpecs = cloneSpecs(initialSpecs);
    const visibleIds = activeOrder.filter((id) => !!newSpecs[id]);
    for (const id of visibleIds) {
      if (newSpecs[id] && newPx[id] !== undefined) {
        newSpecs[id].weight = newPx[id] / available;
      }
    }

    // Commit specs; recompute() re-runs the engine (in useTableColumns).
    columnState.value = { ...columnState.value, specs: newSpecs };
    recompute();
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
  //
  // Flow:
  //   1. First tick (mount / blade-open): compute immediately so exact px widths
  //      land on the first frame. The proportional CSS fallback in
  //      getEffectiveColumnWidth makes the initial paint correct; this just locks
  //      in exact px values without any artificial delay.
  //   2. Subsequent ticks → rAF-throttled to at most one recompute per frame.
  //      Prevents layout thrash during continuous animations (blade open/close
  //      takes ~300ms, ~18 ticks).
  //
  // `recompute()` queries DOM (getBoundingClientRect) and runs the engine;
  // calling it on every tick after the first would cause visible jank.

  let resizeObserver: ResizeObserver | null = null;
  let settled = false;
  let rafRecomputeId = 0;

  const scheduleRecompute = () => {
    if (rafRecomputeId) return;
    rafRecomputeId = requestAnimationFrame(() => {
      rafRecomputeId = 0;
      if (!isResizing.value) recompute();
    });
  };

  const setupResizeObserver = () => {
    if (!containerEl?.value || typeof ResizeObserver === "undefined") return;

    settled = false;

    resizeObserver = new ResizeObserver(() => {
      if (isResizing.value) return;
      if (!settled) {
        // First observed tick: compute immediately so exact px widths land on the
        // first frame. The proportional CSS fallback in getEffectiveColumnWidth
        // already makes the initial paint correct; computing now just locks exact
        // px without the previous 100ms delay. Weights are proportional, so even a
        // mid-animation width scales correctly and refines on subsequent ticks.
        settled = true;
        recompute();
        return;
      }
      // Post-settle: rAF-throttle to avoid layout thrash during animations.
      // Weights stay as-is — engine scales everything proportionally.
      scheduleRecompute();
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
    if (rafRecomputeId) cancelAnimationFrame(rafRecomputeId);
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
