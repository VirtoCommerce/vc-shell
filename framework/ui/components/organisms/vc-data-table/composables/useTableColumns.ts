/**
 * useTableColumns - Composable for column-related logic
 *
 * Uses the weight-based column width engine for deterministic
 * width computation: sum(widths) + filler === availableWidth.
 *
 * Available width is measured directly from the DOM transition-wrapper
 * element — no hardcoded constants for row padding, drag handles, etc.
 */
import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import type { ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import { isSpecialColumn, SPECIAL_COLUMN_WIDTHS } from "@ui/components/organisms/vc-data-table/utils/columnHelpers";
import type {
  VcColumnProps,
  ColumnState,
  ColumnSpec,
  TableFitMode,
} from "@ui/components/organisms/vc-data-table/types";
import {
  computeColumnWidths,
  parseColumnWidth,
  buildInitialWeights,
  normalizeWeights,
  DEFAULT_MIN_COLUMN_PX,
  type EngineOutput,
} from "./useColumnWidthEngine";

export interface UseTableColumnsOptions {
  visibleColumns: Ref<ColumnInstance[]> | ComputedRef<ColumnInstance[]>;
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
  fitMode?: TableFitMode;
  /**
   * Measures the pixel width available for data columns directly from DOM.
   * Should return the transition-wrapper width (already excludes row padding,
   * drag handles, selection cells, etc.) or 0 if not yet rendered.
   */
  getAvailableWidth: () => number;
}

export interface UseTableColumnsReturn {
  // State
  columnState: Ref<ColumnState>;
  engineOutput: Ref<EngineOutput>;
  headerRefs: Map<string, HTMLElement>;

  // Methods
  setHeaderRef: (id: string, el: unknown) => void;
  recompute: () => void;
  resetFromProps: () => void;
  /**
   * Cancels a pending deferred re-init from declared props.
   * Called by the orchestrator after persistence restores ColumnState — the
   * restored weights take precedence over declared VcColumn widths.
   */
  /**
   * Freezes weights as user data (mouse resize, or restored user-sized state):
   * declarative re-derivation from VcColumn props stops until resetFromProps().
   */
  markSizingCustomized: () => void;
  /** Whether weights currently represent a user customization (see above). */
  isSizingCustomized: () => boolean;

  // Computed
  orderedVisibleColumns: ComputedRef<ColumnInstance[]>;
  totalColumns: ComputedRef<number>;

  // Helpers
  isSpecialColumn: (col: VcColumnProps) => boolean;
  isColumnResizable: (col: VcColumnProps) => boolean;
  isColumnReorderable: (col: VcColumnProps) => boolean;
  isLastResizableColumn: (col: VcColumnProps) => boolean;
  getEffectiveColumnWidth: (col: VcColumnProps) => string | undefined;
  getHeaderAlign: (col: VcColumnProps) => "left" | "center" | "right" | undefined;
  getCellAlign: (col: VcColumnProps) => "left" | "center" | "right" | undefined;
  getHeaderStyle: (col: VcColumnProps) => object | undefined;
  getCellStyle: (col: VcColumnProps) => object | undefined;
  getSortField: (col: VcColumnProps) => string;
}

export function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
  const { visibleColumns, resizableColumns = true, reorderableColumns = false, fitMode = "gap" } = options;

  // ============================================================================
  // State
  // ============================================================================

  const columnState = ref<ColumnState>({ order: [], specs: {} });
  const engineOutput = ref<EngineOutput>({ widths: {}, fillerWidth: 0 });
  const headerRefs = new Map<string, HTMLElement>();

  // ============================================================================
  // Helpers
  // ============================================================================

  const isColumnResizable = (col: VcColumnProps): boolean => {
    if (isSpecialColumn(col)) return false;
    return resizableColumns;
  };

  const isColumnReorderable = (col: VcColumnProps): boolean => {
    if (isSpecialColumn(col)) return false;
    return reorderableColumns;
  };

  const getEffectiveColumnWidth = (col: VcColumnProps): string | undefined => {
    if (col.selectionMode) return `${SPECIAL_COLUMN_WIDTHS.selection}px`;
    if (col.rowReorder) return `${SPECIAL_COLUMN_WIDTHS.rowReorder}px`;
    if (col.expander) return `${SPECIAL_COLUMN_WIDTHS.expander}px`;
    if (col.rowEditor) return `${SPECIAL_COLUMN_WIDTHS.rowEditor}px`;
    const w = engineOutput.value.widths[col.id];
    if (w !== undefined && w > 0) return `${w}px`;
    // Engine hasn't computed yet (first paint — availableWidth not measurable).
    // Fall back to the column's DECLARED width so the first frame already matches
    // the engine's fixed/auto layout: TableHead renders `flex: 0 0 <declared>` for
    // fixed/percent columns and `flex: 1 1 0` for auto columns. For px/auto this is
    // identical to the engine's result; for percent columns it can differ by a few
    // px on the first frame (CSS resolves % against the wrapper width, which still
    // includes special cells, vs the engine's special-cell-excluded availableWidth),
    // corrected on the first recompute. This eliminates the equal-distribution flash.
    const declared = parseColumnWidth(col.width, 0);
    if (declared.type === "px") return `${declared.desiredPx}px`;
    if (declared.type === "percent" && typeof col.width === "string") return col.width.trim();
    return undefined;
  };

  const getHeaderAlign = (col: VcColumnProps): "left" | "center" | "right" | undefined => {
    if (isSpecialColumn(col)) return "center";
    const align = col.headerAlign || col.align;
    if (!align) return undefined;
    if (align === "start") return "left";
    if (align === "end") return "right";
    return align;
  };

  const getCellAlign = (col: VcColumnProps): "left" | "center" | "right" | undefined => {
    if (isSpecialColumn(col)) return "center";
    if (!col.align) return undefined;
    if (col.align === "start") return "left";
    if (col.align === "end") return "right";
    return col.align;
  };

  const getHeaderStyle = (col: VcColumnProps): object | undefined => {
    if (col.selectionMode) {
      return {
        textAlign: "center",
        justifyContent: "center",
        minWidth: `${SPECIAL_COLUMN_WIDTHS.selection}px`,
        maxWidth: `${SPECIAL_COLUMN_WIDTHS.selection}px`,
      };
    }
    if (col.rowReorder || col.expander) {
      const px = col.rowReorder ? SPECIAL_COLUMN_WIDTHS.rowReorder : SPECIAL_COLUMN_WIDTHS.expander;
      return { textAlign: "center", justifyContent: "center", minWidth: `${px}px`, maxWidth: `${px}px` };
    }
    return undefined;
  };

  const getCellStyle = (col: VcColumnProps): object | undefined => getHeaderStyle(col);

  const getSortField = (col: VcColumnProps): string => col.sortField || col.field || col.id;

  // ============================================================================
  // Refs
  // ============================================================================

  const setHeaderRef = (id: string, el: unknown) => {
    const domEl =
      el && typeof el === "object" && "$el" in el ? (el as { $el: HTMLElement }).$el : (el as HTMLElement | null);
    if (domEl) headerRefs.set(id, domEl);
    else headerRefs.delete(id);
  };

  // ============================================================================
  // Column Ordering
  // ============================================================================

  const orderedVisibleColumns = computed<ColumnInstance[]>(() => {
    const validColumns = visibleColumns.value.filter(
      (col): col is ColumnInstance => col != null && col.props != null && col.props.id != null,
    );

    if (!reorderableColumns || columnState.value.order.length === 0) {
      return validColumns;
    }

    const orderMap = new Map(columnState.value.order.map((id, i) => [id, i]));
    const specialCols = validColumns.filter((col) => isSpecialColumn(col.props));
    const dataCols = validColumns
      .filter((col) => !isSpecialColumn(col.props))
      .sort((a, b) => (orderMap.get(a.props.id) ?? 0) - (orderMap.get(b.props.id) ?? 0));

    const selectionCol = specialCols.filter((c) => c.props.selectionMode);
    const expanderCol = specialCols.filter((c) => c.props.expander);
    const reorderCol = specialCols.filter((c) => c.props.rowReorder);
    const editorCol = specialCols.filter((c) => c.props.rowEditor);

    return [...selectionCol, ...expanderCol, ...reorderCol, ...dataCols, ...editorCol];
  });

  const isLastResizableColumn = (col: VcColumnProps): boolean => {
    if (!isColumnResizable(col)) return false;
    const resizableCols = orderedVisibleColumns.value.filter((c) => isColumnResizable(c.props));
    return resizableCols.length > 0 && resizableCols[resizableCols.length - 1].props.id === col.id;
  };

  const totalColumns = computed(() => visibleColumns.value.length);

  // ============================================================================
  // Initialization from VcColumn props
  // ============================================================================

  /**
   * Build a ColumnSpec for one column from its declared props.
   * Uses `availableWidth` to resolve percentage values.
   */
  function buildSpec(col: VcColumnProps, availableWidth: number, fallbackWeight: number): ColumnSpec {
    const minParsed = parseColumnWidth(col.minWidth, availableWidth);
    const maxParsed = parseColumnWidth(col.maxWidth, availableWidth);
    return {
      weight: fallbackWeight,
      minPx: minParsed.desiredPx ?? DEFAULT_MIN_COLUMN_PX,
      maxPx: maxParsed.desiredPx ?? Infinity,
    };
  }

  /**
   * Initialize weights and specs for all currently-visible regular columns
   * from their declared props (`width`, `minWidth`, `maxWidth`).
   * Skips the columnState write when nothing actually changed, so pristine
   * re-derivation on every ResizeObserver tick doesn't churn watchers.
   */
  function applyInitFromProps(availableWidth: number): void {
    const regularCols = visibleColumns.value.filter((c) => !isSpecialColumn(c.props));
    if (regularCols.length === 0) return;

    const parsed = regularCols.map((col) => ({
      id: col.props.id,
      parsed: parseColumnWidth(col.props.width, availableWidth),
    }));
    const weights = buildInitialWeights(parsed, availableWidth);

    const order = [...columnState.value.order];
    // Ensure all regular columns are in order
    const orderSet = new Set(order);
    for (const col of regularCols) {
      if (!orderSet.has(col.props.id)) order.push(col.props.id);
    }

    const specs: Record<string, ColumnSpec> = { ...columnState.value.specs };
    let changed = order.length !== columnState.value.order.length;
    for (const col of regularCols) {
      const fallbackWeight = weights[col.props.id] ?? 1 / regularCols.length;
      const next = buildSpec(col.props, availableWidth, fallbackWeight);
      const prev = specs[col.props.id];
      if (
        !prev ||
        Math.abs(prev.weight - next.weight) > 1e-9 ||
        prev.minPx !== next.minPx ||
        prev.maxPx !== next.maxPx
      ) {
        specs[col.props.id] = next;
        changed = true;
      }
    }

    if (changed) columnState.value = { order, specs };
  }

  // While false, column sizing is purely declarative: weights are a cache of
  // "declared props × current width" and are re-derived on every recompute. This
  // is what heals the transient first measurement — blades animate `width` for
  // ~300ms, so weights built mid-animation would otherwise freeze a declared
  // 60px column at weight 60/transientWidth and blow it up at the final width.
  // Once true, weights ARE the user's data (resize / restored user sizing):
  // frozen and scaled proportionally with the container.
  let sizingCustomized = false;

  /**
   * Freeze weights: the current weights now represent a user customization
   * (mouse resize, or persisted state saved after one) and must no longer be
   * overwritten from declared VcColumn props.
   */
  const markSizingCustomized = (): void => {
    sizingCustomized = true;
  };

  /**
   * Reset: rebuild ColumnState from declared props, discarding persisted state.
   * Called by handleTableReset in the orchestrator. Also clears engineOutput
   * so callers don't see stale widths between reset and the next recompute.
   */
  const resetFromProps = (): void => {
    columnState.value = { order: [], specs: {} };
    engineOutput.value = { widths: {}, fillerWidth: 0 };
    sizingCustomized = false;
    recompute();
  };

  // ============================================================================
  // Engine recomputation
  // ============================================================================

  const recompute = () => {
    const availableWidth = options.getAvailableWidth();
    if (availableWidth <= 0) return;

    // Declarative mode: re-derive weights from VcColumn props at the CURRENT
    // width, so <VcColumn :width="200"> is honored no matter when the first
    // measurement happened. No-ops when the derived specs are unchanged.
    if (!sizingCustomized) {
      applyInitFromProps(availableWidth);
    }

    const visibleRegular = orderedVisibleColumns.value.filter((c) => !isSpecialColumn(c.props)).map((c) => c.props.id);

    const cols = visibleRegular
      .filter((id) => columnState.value.specs[id])
      .map((id) => ({ id, spec: columnState.value.specs[id] }));

    if (cols.length === 0) return;
    engineOutput.value = computeColumnWidths({ availableWidth, columns: cols, mode: fitMode });
  };

  // ============================================================================
  // Watch for column changes
  // ============================================================================

  let prevVisibleIdSet = new Set<string>();
  let isFirstRun = true;

  watch(
    visibleColumns,
    () => {
      const regularCols = visibleColumns.value.filter((c) => !isSpecialColumn(c.props));
      const newIds = regularCols.map((c) => c.props.id);
      const newIdSet = new Set(newIds);
      const trackedIds = new Set(columnState.value.order);

      const brandNewIds = newIds.filter((id) => !trackedIds.has(id));
      // On first run (immediate), skip show/hide detection — all columns appear
      // "just shown" but their weights may have been restored from persistence.
      const justShownIds = isFirstRun ? [] : newIds.filter((id) => trackedIds.has(id) && !prevVisibleIdSet.has(id));
      const justHiddenIds = isFirstRun ? [] : [...prevVisibleIdSet].filter((id) => !newIdSet.has(id));
      const visibleSetChanged = brandNewIds.length > 0 || justShownIds.length > 0 || justHiddenIds.length > 0;

      const isInitialEmpty = columnState.value.order.length === 0;
      const available = options.getAvailableWidth();

      if (isInitialEmpty || brandNewIds.length > 0) {
        // Brand-new or initial columns need specs.
        if (isInitialEmpty && available > 0) {
          // Best case: DOM is ready and we can parse declared props immediately.
          // (While sizing is declarative, recompute() re-derives at the settled
          // width anyway — this just seeds specs for the first paint.)
          applyInitFromProps(available);
        } else {
          // Fallback: DOM not ready OR we're adding columns to an existing set.
          // Give new columns a reasonable default weight; the declarative-mode
          // recompute() re-derives from props once a real width is available.
          const state = { ...columnState.value };
          state.order = [...state.order];
          state.specs = { ...state.specs };

          const existingVisible = newIds.filter((id) => state.specs[id] && !brandNewIds.includes(id));
          const avgWeight =
            existingVisible.length > 0
              ? existingVisible.reduce((s, id) => s + state.specs[id].weight, 0) / existingVisible.length
              : 1 / newIds.length;

          for (const col of regularCols) {
            if (!trackedIds.has(col.props.id)) {
              state.order.push(col.props.id);
              state.specs[col.props.id] = buildSpec(col.props, available, avgWeight);
            }
          }

          const visibleRegular = newIds.filter((id) => state.specs[id]);
          normalizeWeights(state.specs, visibleRegular);
          columnState.value = state;
        }
      } else if (justShownIds.length > 0) {
        // Previously hidden columns became visible. Give them average weight of
        // currently visible columns, then renormalize. Preserves proportions.
        const state = { ...columnState.value };
        state.specs = { ...state.specs };

        const existingVisible = newIds.filter((id) => state.specs[id] && !justShownIds.includes(id));
        const avgWeight =
          existingVisible.length > 0
            ? existingVisible.reduce((s, id) => s + state.specs[id].weight, 0) / existingVisible.length
            : 1 / newIds.length;

        for (const id of justShownIds) {
          if (state.specs[id]) state.specs[id] = { ...state.specs[id], weight: avgWeight };
        }

        normalizeWeights(
          state.specs,
          newIds.filter((id) => state.specs[id]),
        );
        columnState.value = state;
      } else if (justHiddenIds.length > 0) {
        // Columns were hidden. Renormalize remaining visible so they fill space.
        const state = { ...columnState.value };
        state.specs = { ...state.specs };
        normalizeWeights(
          state.specs,
          newIds.filter((id) => state.specs[id]),
        );
        columnState.value = state;
      }

      prevVisibleIdSet = newIdSet;
      isFirstRun = false;

      if (visibleSetChanged) recompute();
    },
    { immediate: true },
  );

  return {
    columnState,
    engineOutput,
    headerRefs,
    setHeaderRef,
    recompute,
    resetFromProps,
    markSizingCustomized,
    isSizingCustomized: () => sizingCustomized,
    orderedVisibleColumns,
    totalColumns,
    isSpecialColumn,
    isColumnResizable,
    isColumnReorderable,
    isLastResizableColumn,
    getEffectiveColumnWidth,
    getHeaderAlign,
    getCellAlign,
    getHeaderStyle,
    getCellStyle,
    getSortField,
  };
}
