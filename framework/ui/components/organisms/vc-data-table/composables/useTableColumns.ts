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
  initFromProps: (availableWidth: number) => void;

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
  getFillerWidth: () => number;
}

export function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
  const { visibleColumns, resizableColumns = true, reorderableColumns = false } = options;

  // ============================================================================
  // State
  // ============================================================================

  const columnState = ref<ColumnState>({ order: [], specs: {} });
  const engineOutput = ref<EngineOutput>({ widths: {}, fillerWidth: 0 });
  const headerRefs = new Map<string, HTMLElement>();

  // ============================================================================
  // Helpers
  // ============================================================================

  const isSpecialColumn = (col: VcColumnProps): boolean => {
    return !!(col.selectionMode || col.rowReorder || col.expander || col.rowEditor);
  };

  const isColumnResizable = (col: VcColumnProps): boolean => {
    if (isSpecialColumn(col)) return false;
    return resizableColumns ?? false;
  };

  const isColumnReorderable = (col: VcColumnProps): boolean => {
    if (isSpecialColumn(col)) return false;
    return reorderableColumns ?? false;
  };

  const getEffectiveColumnWidth = (col: VcColumnProps): string | undefined => {
    if (col.selectionMode) return "40px";
    if (col.rowReorder || col.expander) return "50px";
    if (col.rowEditor) return "100px";
    const w = engineOutput.value.widths[col.id];
    if (w !== undefined && w > 0) return `${w}px`;
    return undefined;
  };

  const getFillerWidth = (): number => engineOutput.value.fillerWidth;

  const getHeaderAlign = (col: VcColumnProps): "left" | "center" | "right" | undefined => {
    if (col.selectionMode || col.rowReorder || col.expander || col.rowEditor) return "center";
    const align = col.headerAlign || col.align;
    if (!align) return undefined;
    if (align === "start") return "left";
    if (align === "end") return "right";
    return align;
  };

  const getCellAlign = (col: VcColumnProps): "left" | "center" | "right" | undefined => {
    if (col.selectionMode || col.rowReorder || col.expander || col.rowEditor) return "center";
    if (!col.align) return undefined;
    if (col.align === "start") return "left";
    if (col.align === "end") return "right";
    return col.align;
  };

  const getHeaderStyle = (col: VcColumnProps): object | undefined => {
    if (col.selectionMode) {
      return { textAlign: "center", justifyContent: "center", minWidth: "40px", maxWidth: "40px" };
    }
    if (col.rowReorder || col.expander) {
      return { textAlign: "center", justifyContent: "center", minWidth: "50px", maxWidth: "50px" };
    }
    return undefined;
  };

  const getCellStyle = (col: VcColumnProps): object | undefined => {
    if (col.selectionMode) {
      return { textAlign: "center", justifyContent: "center", minWidth: "40px", maxWidth: "40px" };
    }
    if (col.rowReorder || col.expander) {
      return { textAlign: "center", justifyContent: "center", minWidth: "50px", maxWidth: "50px" };
    }
    return undefined;
  };

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
  // Engine recomputation
  // ============================================================================

  const recompute = () => {
    const availableWidth = options.getAvailableWidth();
    if (availableWidth <= 0) return;

    const visibleRegular = orderedVisibleColumns.value
      .filter((c) => !isSpecialColumn(c.props))
      .map((c) => c.props.id);

    const cols = visibleRegular
      .filter((id) => columnState.value.specs[id])
      .map((id) => ({ id, spec: columnState.value.specs[id] }));

    if (cols.length === 0) return;
    engineOutput.value = computeColumnWidths({
      availableWidth,
      columns: cols,
      mode: options.fitMode ?? "gap",
    });
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

  const initFromProps = (availableWidth: number) => {
    const regularCols = visibleColumns.value.filter((c) => !isSpecialColumn(c.props));
    const parsed = regularCols.map((col) => ({
      id: col.props.id,
      parsed: parseColumnWidth(col.props.width, availableWidth > 0 ? availableWidth : 0),
    }));

    const weights = buildInitialWeights(parsed, availableWidth > 0 ? availableWidth : 0);
    const order = regularCols.map((c) => c.props.id);
    const specs: Record<string, ColumnSpec> = {};

    for (const col of regularCols) {
      const minParsed = parseColumnWidth(col.props.minWidth, availableWidth > 0 ? availableWidth : 0);
      const maxParsed = parseColumnWidth(col.props.maxWidth, availableWidth > 0 ? availableWidth : 0);
      specs[col.props.id] = {
        weight: weights[col.props.id] ?? 1 / order.length,
        minPx: minParsed.desiredPx ?? 40,
        maxPx: maxParsed.desiredPx ?? Infinity,
      };
    }

    columnState.value = { order, specs };
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

      // Detect genuinely new columns (never seen before)
      const brandNewIds = newIds.filter((id) => !trackedIds.has(id));

      // Detect columns that just became visible (were tracked but hidden).
      // On first run (immediate), skip — all columns appear "just shown" but
      // their weights may have been restored from persistence. Don't overwrite.
      const justShownIds = isFirstRun ? [] : newIds.filter((id) => trackedIds.has(id) && !prevVisibleIdSet.has(id));

      // Detect columns that just became hidden
      const justHiddenIds = isFirstRun ? [] : [...prevVisibleIdSet].filter((id) => !newIdSet.has(id));

      const visibleSetChanged = brandNewIds.length > 0 || justShownIds.length > 0 || justHiddenIds.length > 0;

      if (brandNewIds.length > 0 || columnState.value.order.length === 0) {
        // Brand-new columns: add to order, give them average weight of existing visible
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
            state.specs[col.props.id] = { weight: avgWeight, minPx: 40, maxPx: Infinity };
          }
        }

        // Normalize visible columns
        const visibleRegular = newIds.filter((id) => state.specs[id]);
        normalizeWeights(state.specs, visibleRegular);
        columnState.value = state;
      } else if (justShownIds.length > 0) {
        // Previously hidden columns became visible. Give them average weight
        // of currently visible columns, then renormalize. This preserves
        // proportions among existing columns while giving new ones fair space.
        const state = { ...columnState.value };
        state.specs = { ...state.specs };

        const existingVisible = newIds.filter((id) => state.specs[id] && !justShownIds.includes(id));
        const avgWeight =
          existingVisible.length > 0
            ? existingVisible.reduce((s, id) => s + state.specs[id].weight, 0) / existingVisible.length
            : 1 / newIds.length;

        for (const id of justShownIds) {
          if (state.specs[id]) {
            state.specs[id] = { ...state.specs[id], weight: avgWeight };
          }
        }

        const visibleRegular = newIds.filter((id) => state.specs[id]);
        normalizeWeights(state.specs, visibleRegular);
        columnState.value = state;
      } else if (justHiddenIds.length > 0) {
        // Columns were hidden. Renormalize remaining visible so they fill space.
        const state = { ...columnState.value };
        state.specs = { ...state.specs };
        const visibleRegular = newIds.filter((id) => state.specs[id]);
        normalizeWeights(state.specs, visibleRegular);
        columnState.value = state;
      }

      prevVisibleIdSet = newIdSet;
      isFirstRun = false;

      // Always recompute when visible columns change
      if (visibleSetChanged) {
        recompute();
      }
    },
    { immediate: true },
  );

  return {
    columnState,
    engineOutput,
    headerRefs,
    setHeaderRef,
    recompute,
    initFromProps,
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
    getFillerWidth,
  };
}
