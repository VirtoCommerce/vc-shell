/**
 * useTableColumns - Composable for column-related logic
 *
 * Extracts column ordering, width management, and helper functions
 * from VcDataTable.vue to reduce main component size.
 *
 * Uses the weight-based column width engine for deterministic
 * width computation: sum(widths) + filler === availableWidth.
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
  hasSelectionColumn?: ComputedRef<boolean>;
  isSelectionViaColumn?: ComputedRef<boolean>;
  fitMode?: TableFitMode;
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
  getSpecialColumnsWidth: () => number;
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

  /**
   * Total fixed-width "chrome" in each row that is NOT available for data columns.
   * Includes: row padding, special VcColumn widths, drag handle + gap.
   */
  const getSpecialColumnsWidth = (): number => {
    // Row horizontal padding: tw-px-4 = 16px × 2 = 32px (TableRow.vue)
    let total = 32;

    for (const col of visibleColumns.value) {
      if (col.props.selectionMode) total += 40;
      else if (col.props.rowReorder) {
        // rowReorder column (50px) + row gap between drag handle and transition wrapper (8px)
        total += 50 + 8;
      } else if (col.props.expander) total += 50;
      else if (col.props.rowEditor) total += 100;
    }
    return total;
  };

  const getEffectiveColumnWidth = (col: VcColumnProps): string | undefined => {
    // Special columns — always have fixed width
    if (col.selectionMode) return "40px";
    if (col.rowReorder || col.expander) return "50px";
    if (col.rowEditor) return "100px";
    // Read from engine output
    const w = engineOutput.value.widths[col.id];
    if (w !== undefined && w > 0) return `${w}px`;
    return undefined;
  };

  const getFillerWidth = (): number => {
    return engineOutput.value.fillerWidth;
  };

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
    // Handle both component instances and direct DOM elements
    const domEl =
      el && typeof el === "object" && "$el" in el ? (el as { $el: HTMLElement }).$el : (el as HTMLElement | null);
    if (domEl) headerRefs.set(id, domEl);
    else headerRefs.delete(id);
  };

  // ============================================================================
  // Engine recomputation
  // ============================================================================

  const recompute = () => {
    const availableWidth = options.getAvailableWidth() - getSpecialColumnsWidth();
    if (availableWidth <= 0) return;

    const visibleRegular = orderedVisibleColumns.value.filter((c) => !isSpecialColumn(c.props)).map((c) => c.props.id);

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
    // Filter out any undefined/null columns to prevent runtime errors
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

  const totalColumns = computed(() => {
    let count = visibleColumns.value.length;
    if (options.hasSelectionColumn?.value && !options.isSelectionViaColumn?.value) {
      count += 1;
    }
    return count;
  });

  // ============================================================================
  // Initialization from VcColumn props
  // ============================================================================

  const initFromProps = (availableWidth: number) => {
    const regularCols = visibleColumns.value.filter((c) => !isSpecialColumn(c.props));
    const specialWidth = getSpecialColumnsWidth();
    const netAvailable = availableWidth - specialWidth;

    const parsed = regularCols.map((col) => ({
      id: col.props.id,
      parsed: parseColumnWidth(col.props.width, netAvailable > 0 ? netAvailable : 0),
    }));

    const weights = buildInitialWeights(parsed, netAvailable > 0 ? netAvailable : 0);
    const order = regularCols.map((c) => c.props.id);
    const specs: Record<string, ColumnSpec> = {};

    for (const col of regularCols) {
      const minParsed = parseColumnWidth(col.props.minWidth, netAvailable > 0 ? netAvailable : 0);
      const maxParsed = parseColumnWidth(col.props.maxWidth, netAvailable > 0 ? netAvailable : 0);
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

  watch(
    visibleColumns,
    () => {
      const regularCols = visibleColumns.value.filter((c) => !isSpecialColumn(c.props));
      const currentIds = new Set(columnState.value.order);
      const newIds = regularCols.map((c) => c.props.id);

      if (newIds.every((id) => currentIds.has(id)) && columnState.value.order.length > 0) {
        return; // All visible columns already tracked
      }

      // Append new columns with lazy-init weight
      const state = { ...columnState.value };
      state.order = [...state.order];
      state.specs = { ...state.specs };

      for (const col of regularCols) {
        if (!currentIds.has(col.props.id)) {
          state.order.push(col.props.id);
          state.specs[col.props.id] = {
            weight: 0, // will be normalized
            minPx: 40,
            maxPx: Infinity,
          };
        }
      }

      // Normalize visible weights
      const visibleRegular = newIds.filter((id) => state.specs[id]);
      normalizeWeights(state.specs, visibleRegular);

      columnState.value = state;
      recompute();
    },
    { immediate: true },
  );

  return {
    // State
    columnState,
    engineOutput,
    headerRefs,

    // Methods
    setHeaderRef,
    recompute,
    initFromProps,

    // Computed
    orderedVisibleColumns,
    totalColumns,

    // Helpers
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
    getSpecialColumnsWidth,
  };
}
