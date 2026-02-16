/**
 * useTableColumns - Composable for column-related logic
 *
 * Extracts column ordering, width management, and helper functions
 * from VcDataTable.vue to reduce main component size.
 */
import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import type { ColumnInstance } from "../utils/ColumnCollector";
import type { VcColumnProps } from "../types";

export interface UseTableColumnsOptions {
  visibleColumns: Ref<ColumnInstance[]> | ComputedRef<ColumnInstance[]>;
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
  hasSelectionColumn?: ComputedRef<boolean>;
  isSelectionViaColumn?: ComputedRef<boolean>;
}

export interface UseTableColumnsReturn {
  // State
  columnWidths: Ref<{ id: string; width: number }[]>;
  headerRefs: Map<string, HTMLElement>;

  // Methods
  setHeaderRef: (id: string, el: unknown) => void;

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
  /** Whether any visible column has no explicit width (i.e., uses flex-grow) */
  hasFlexColumns: ComputedRef<boolean>;
}

export function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
  const { visibleColumns, resizableColumns = true, reorderableColumns = false } = options;

  // ============================================================================
  // State
  // ============================================================================

  const columnWidths = ref<{ id: string; width: number }[]>([]);
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
    // Special columns — always have fixed width
    if (col.selectionMode) return "40px";
    if (col.rowReorder || col.expander) return "50px";
    if (col.rowEditor) return "100px";
    // User-resized width takes priority
    const resized = columnWidths.value.find((c) => c.id === col.id);
    if (resized && resized.width > 0) return `${resized.width}px`;
    // Developer-set width
    if (col.width) return typeof col.width === "number" ? `${col.width}px` : col.width;
    // No width → undefined, flex layout will make it grow to fill available space
    return undefined;
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
      el && typeof el === "object" && "$el" in el
        ? (el as { $el: HTMLElement }).$el
        : (el as HTMLElement | null);
    if (domEl) headerRefs.set(id, domEl);
    else headerRefs.delete(id);
  };

  // ============================================================================
  // Column Ordering
  // ============================================================================

  const orderedVisibleColumns = computed<ColumnInstance[]>(() => {
    // Filter out any undefined/null columns to prevent runtime errors
    const validColumns = visibleColumns.value.filter((col): col is ColumnInstance =>
      col != null && col.props != null && col.props.id != null
    );

    if (!reorderableColumns || columnWidths.value.length === 0) {
      return validColumns;
    }

    const orderMap = new Map(columnWidths.value.map((c, i) => [c.id, i]));
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
  // Watch for column changes
  // ============================================================================

  watch(
    visibleColumns,
    (cols) => {
      const newWidths = cols
        .filter((col) => !isSpecialColumn(col.props))
        .map((col) => ({
          id: col.props.id,
          // Only store absolute pixel values; percentage/other relative widths stay 0
          // so getEffectiveColumnWidth falls through to the original col.width string.
          width: col.props.width
            ? typeof col.props.width === "number"
              ? col.props.width
              : typeof col.props.width === "string" && /^\d+(\.\d+)?(px)?$/.test(col.props.width.trim())
                ? parseInt(col.props.width) || 0
                : 0
            : 0,
        }));

      // Guard: skip if all visible columns are already tracked in columnWidths.
      // Since we never remove entries (hidden columns preserve their state),
      // the only meaningful change is when a genuinely new column appears.
      const current = columnWidths.value;
      const currentIds = new Set(current.map((c) => c.id));

      if (newWidths.every((nw) => currentIds.has(nw.id))) {
        // All visible columns already tracked — nothing to do
        return;
      }

      // Structural change: columns added or removed.
      // Keep ALL existing entries — columns may be temporarily hidden
      // (showAllColumns=false during blade collapse, or hidden via hiddenColumnIds)
      // and their widths/order must be preserved for when they become visible again.
      if (current.length > 0) {
        const currentMap = new Map(current.map((c) => [c.id, c.width]));

        // Only append genuinely new columns (not already tracked)
        let changed = false;
        const merged = [...current];
        for (const nw of newWidths) {
          if (!currentMap.has(nw.id)) {
            merged.push(nw);
            changed = true;
          }
        }

        if (changed) {
          columnWidths.value = merged;
        }
      } else {
        // First initialization — no existing state
        columnWidths.value = newWidths;
      }
    },
    { immediate: true }
  );

  // Whether any visible data column has no explicit width (flex-grow columns exist)
  const hasFlexColumns = computed(() => {
    return orderedVisibleColumns.value.some(
      (col) => !isSpecialColumn(col.props) && getEffectiveColumnWidth(col.props) === undefined,
    );
  });

  return {
    // State
    columnWidths,
    headerRefs,

    // Methods
    setHeaderRef,

    // Computed
    orderedVisibleColumns,
    totalColumns,
    hasFlexColumns,

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
  };
}
