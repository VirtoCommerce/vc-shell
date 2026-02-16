/**
 * useDataTableOrchestrator - Central orchestrator for VcDataTable composables
 *
 * This composable provides a unified interface for coordinating all VcDataTable
 * functionality. It wraps individual composables and provides consistent typing.
 *
 * NOTE: This is a foundation for future refactoring. Currently VcDataTable.vue
 * uses individual composables directly. This orchestrator can be gradually
 * integrated to reduce VcDataTable complexity.
 *
 * Features coordinated:
 * - Selection (single/multiple)
 * - Sorting (single/multi)
 * - Filtering (column + global)
 * - Editing (row/cell)
 * - Expansion
 * - Row grouping
 * - Inline edit mode
 * - Column management (resize, reorder, visibility)
 *
 * Benefits:
 * - Reduces VcDataTable.vue complexity
 * - Centralizes state management
 * - Provides unified event handling
 * - Makes testing easier
 */

import { computed, ref, toRef, watch, type Ref, type ComputedRef } from "vue";
import type { ColumnInstance } from "../utils/ColumnCollector";
import type { VcColumnProps, EditChange } from "../types";

import { useTableSelectionV2 } from "./useTableSelectionV2";
import { useTableSort, type SortEvent } from "./useTableSort";
import { useTableEditing } from "./useTableEditing";
import { useTableExpansion } from "./useTableExpansion";
import { useTableRowGrouping, type GroupedData } from "./useTableRowGrouping";
import { useTableInlineEdit } from "./useTableInlineEdit";
import { useTableColumns } from "./useTableColumns";
import { useTableColumnsResize } from "./useTableColumnsResize";
import { useTableColumnsReorder } from "./useTableColumnsReorder";
import { useColumnFilter } from "./useColumnFilter";

// =============================================================================
// Types
// =============================================================================

export interface DataTableOrchestratorOptions<T extends Record<string, any>> {
  // === Data ===
  items: Ref<T[]>;
  dataKey: string;
  getItemKey: (item: T, index: number) => string;

  // === Selection ===
  selection?: Ref<T | T[] | undefined>;
  selectionMode?: ComputedRef<"single" | "multiple" | undefined>;
  isRowSelectable?: (item: T) => boolean;
  totalCount?: Ref<number | undefined>;
  selectAllActive?: Ref<boolean | undefined>;

  // === Sorting ===
  sortField?: Ref<string | undefined>;
  sortOrder?: Ref<0 | 1 | -1>;
  sortMode?: Ref<"single" | "multiple">;
  multiSortMeta?: Ref<Array<{ field: string; order: 0 | 1 | -1 }>>;
  removableSort?: Ref<boolean>;

  // === Editing ===
  editMode?: Ref<"cell" | "row" | undefined>;
  editingRows?: Ref<T[]>;
  validationRules?: Record<string, (value: unknown, row: T) => string | true>;

  // === Expansion ===
  expandedRows?: Ref<T[]>;

  // === Row Grouping ===
  groupRowsBy?: Ref<string | undefined>;
  rowGroupMode?: Ref<"subheader" | "rowspan">;
  expandableRowGroups?: Ref<boolean>;
  expandedRowGroups?: Ref<string[] | undefined>;

  // === Columns ===
  visibleColumns: ComputedRef<ColumnInstance[]>;
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
  hasSelectionColumn: ComputedRef<boolean>;
  isSelectionViaColumn: ComputedRef<boolean>;
  tableContainerRef?: Ref<HTMLElement | null>;

  // === Callbacks/Emitters ===
  onSelectionChange?: (selection: T | T[]) => void;
  onSelectAllChange?: (active: boolean) => void;
  onSort?: (event: SortEvent) => void;
  onEditSave?: (changes: EditChange<T>[]) => void;
  onEditCancel?: () => void;
  onExpandedRowsChange?: (rows: T[]) => void;
  onExpandedRowGroupsChange?: (groups: string[]) => void;
  onRowGroupExpand?: (event: { data: string; originalEvent: Event }) => void;
  onRowGroupCollapse?: (event: { data: string; originalEvent: Event }) => void;
  onColumnResizeEnd?: (columns: Array<{ id: string; width: number }>) => void;
  onColumnReorder?: (columns: Array<{ id: string; width: number }>) => void;
}

export interface DataTableOrchestratorReturn<T extends Record<string, any>> {
  // === Selection ===
  selection: {
    internalSelection: Ref<T[]>;
    allSelected: ComputedRef<boolean>;
    someSelected: ComputedRef<boolean>;
    isSelected: (item: T) => boolean;
    canSelect: (item: T) => boolean;
    handleRowSelectionChange: (item: T, eventOrValue?: Event | boolean) => { data: T; index?: number } | null;
    handleSelectAllChange: (value: boolean, event?: Event) => { data: T[]; originalEvent: Event };
    clearSelection: () => void;
  };

  // === Sort ===
  sort: {
    getSortDirection: (field: string) => "asc" | "desc" | undefined;
    getSortIndex: (field: string) => number | undefined;
    handleSort: (field: string, event?: MouseEvent) => void;
  };

  // === Editing ===
  editing: {
    isRowEditing: (item: T) => boolean;
    getEditingRowData: (item: T, index: number) => T | null;
    isCellEditing: (rowIndex: number, field: string) => boolean;
    startRowEdit: (item: T, index: number) => void;
    cancelRowEdit: (item: T, index: number) => void;
    saveRowEdit: (item: T, index: number) => void;
  };

  // === Expansion ===
  expansion: {
    isRowExpanded: (item: T) => boolean;
    toggleRowExpansion: (item: T, index: number, event: Event) => void;
    expandedKeysArray: Ref<string[]>;
  };

  // === Row Grouping ===
  rowGrouping: {
    isGroupingEnabled: ComputedRef<boolean>;
    groupedData: ComputedRef<GroupedData<T>[]>;
    isGroupExpanded: (key: string) => boolean;
    toggleGroupExpansion: (key: string, event: Event) => void;
    getItemGroupKey: (item: T) => string;
  };

  // === Inline Edit ===
  inlineEdit: {
    isEditing: Ref<boolean>;
    startEditing: () => void;
    cancelEditing: () => void;
    saveChanges: () => Promise<void>;
    updateCell: (rowIndex: number, field: string, value: unknown) => void;
    addRow: (defaults?: Partial<T>) => void;
    removeRow: (index: number) => void;
  };

  // === Columns ===
  cols: {
    orderedVisibleColumns: ComputedRef<ColumnInstance[]>;
    columnWidths: Ref<Array<{ id: string; width: number }>>;
    getEffectiveColumnWidth: (colProps: VcColumnProps) => string | undefined;
    getHeaderAlign: (colProps: VcColumnProps) => "left" | "center" | "right" | undefined;
    getHeaderStyle: (colProps: VcColumnProps) => object | undefined;
    getCellAlign: (colProps: VcColumnProps) => "left" | "center" | "right" | undefined;
    getCellStyle: (colProps: VcColumnProps) => object | undefined;
    getSortField: (colProps: VcColumnProps) => string;
    isColumnResizable: (colProps: VcColumnProps) => boolean;
    isColumnReorderable: (colProps: VcColumnProps) => boolean;
    isLastResizableColumn: (colProps: VcColumnProps) => boolean;
    setHeaderRef: (id: string, el: HTMLElement | null) => void;
    headerRefs: Map<string, HTMLElement>;
    handleResizeStart: (columnId: string, event: MouseEvent) => void;
    handleColumnDragStart: (columnId: string, event: DragEvent) => void;
    handleColumnDragOver: (event: DragEvent, targetColumnId: string) => void;
    handleColumnDrop: (event: DragEvent) => void;
  };

  // === Column Filter Helpers ===
  columnFilter: {
    getFilterType: (col: ColumnInstance) => string;
    getFilterOptions: (col: ColumnInstance) => Array<{ label: string; value: unknown }> | undefined;
    getRangeFields: (col: ColumnInstance) => [string, string] | undefined;
    isMultipleSelect: (col: ColumnInstance) => boolean;
  };

  // === Helpers ===
  getGlobalIndex: (item: T) => number;
  getRowProps: (item: T, index: number) => Record<string, unknown>;
}

// =============================================================================
// Implementation
// =============================================================================

export function useDataTableOrchestrator<T extends Record<string, any>>(
  options: DataTableOrchestratorOptions<T>
): DataTableOrchestratorReturn<T> {
  const {
    items,
    dataKey,
    getItemKey,
    visibleColumns,
    hasSelectionColumn,
    isSelectionViaColumn,
    tableContainerRef,
  } = options;

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const selectionComposable = useTableSelectionV2({
    items,
    selection: options.selection,
    selectionMode: options.selectionMode ?? computed(() => undefined),
    isRowSelectable: options.isRowSelectable,
    dataKey,
    getItemKey,
    totalCount: options.totalCount,
    selectAllActive: options.selectAllActive,
    onSelectAllChange: options.onSelectAllChange,
  });

  // Watch for selection changes
  watch(
    () => selectionComposable.internalSelection.value,
    (newSelection) => {
      if (options.onSelectionChange) {
        const mode = options.selectionMode?.value;
        options.onSelectionChange(mode === "single" ? newSelection[0] : newSelection);
      }
    },
    { deep: true }
  );

  // ---------------------------------------------------------------------------
  // Sort
  // ---------------------------------------------------------------------------

  const sortComposable = useTableSort({
    sortField: options.sortField ?? ref(undefined),
    sortOrder: (options.sortOrder ?? ref(0)) as Ref<0 | 1 | -1>,
    sortMode: (options.sortMode ?? ref("single")) as Ref<"single" | "multiple">,
    multiSortMeta: (options.multiSortMeta ?? ref([])) as Ref<Array<{ field: string; order: 0 | 1 | -1 }>>,
    removableSort: options.removableSort ?? ref(false),
    onSort: options.onSort,
  });

  // ---------------------------------------------------------------------------
  // Editing
  // ---------------------------------------------------------------------------

  const editingComposable = useTableEditing({
    editMode: (options.editMode ?? ref(undefined)) as Ref<"cell" | "row" | undefined>,
    editingRows: (options.editingRows ?? ref([])) as Ref<T[]>,
    dataKey,
    getItemKey,
  });

  // ---------------------------------------------------------------------------
  // Expansion
  // ---------------------------------------------------------------------------

  const expansionComposable = useTableExpansion({
    expandedRows: (options.expandedRows ?? ref([])) as Ref<T[]>,
    getItemKey,
  });

  const expandedKeysArray = ref<string[]>([]);

  watch(
    () => expansionComposable.internalExpandedRows.value,
    (newExpanded) => {
      const newKeys = newExpanded.map((item) => getItemKey(item, 0));
      const currentKeysStr = expandedKeysArray.value.join(",");
      const newKeysStr = newKeys.join(",");
      if (currentKeysStr !== newKeysStr) {
        expandedKeysArray.value = newKeys;
        if (options.onExpandedRowsChange) {
          options.onExpandedRowsChange(newExpanded);
        }
      }
    },
    { deep: true, immediate: true }
  );

  const isRowExpanded = (item: T): boolean => {
    const key = getItemKey(item, 0);
    return expandedKeysArray.value.includes(key);
  };

  // ---------------------------------------------------------------------------
  // Row Grouping
  // ---------------------------------------------------------------------------

  const rowGroupingComposable = useTableRowGrouping({
    items: items as Ref<T[]>,
    groupRowsBy: (options.groupRowsBy ?? ref(undefined)) as Ref<string | undefined>,
    rowGroupMode: (options.rowGroupMode ?? ref("subheader")) as Ref<"subheader" | "rowspan">,
    expandableRowGroups: (options.expandableRowGroups ?? ref(false)) as Ref<boolean>,
    expandedRowGroups: (options.expandedRowGroups ?? ref(undefined)) as Ref<string[] | undefined>,
    onExpandedRowGroupsChange: options.onExpandedRowGroupsChange,
    onRowGroupExpand: options.onRowGroupExpand,
    onRowGroupCollapse: options.onRowGroupCollapse,
  });

  // ---------------------------------------------------------------------------
  // Inline Edit
  // ---------------------------------------------------------------------------

  const inlineEditComposable = useTableInlineEdit({
    items: items as Ref<T[]>,
    rules: options.validationRules,
    onSave: (changes) => {
      if (options.onEditSave) {
        options.onEditSave(changes as EditChange<T>[]);
      }
    },
    onCancel: options.onEditCancel,
  });

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const colsComposable = useTableColumns({
    visibleColumns,
    resizableColumns: options.resizableColumns ?? true,
    reorderableColumns: options.reorderableColumns ?? false,
    hasSelectionColumn,
    isSelectionViaColumn,
  });

  const { handleResizeStart } = useTableColumnsResize({
    columns: colsComposable.columnWidths,
    minColumnWidth: 60,
    getColumnElement: (id) => colsComposable.headerRefs.get(id) ?? null,
    getAllColumnElements: (id) => {
      if (!tableContainerRef?.value) return null;
      return tableContainerRef.value.querySelectorAll(`[data-column-id="${id}"]`);
    },
    getContainerElement: () => tableContainerRef?.value ?? null,
    onResizeEnd: options.onColumnResizeEnd,
  });

  const {
    handleDragStart: handleColumnDragStart,
    handleDragOver: handleColumnDragOver,
    handleDrop: handleColumnDrop,
  } = useTableColumnsReorder({
    columns: colsComposable.columnWidths,
    onReorderEnd: options.onColumnReorder,
  });

  // ---------------------------------------------------------------------------
  // Column Filter Helpers
  // ---------------------------------------------------------------------------

  const columnFilterComposable = useColumnFilter();

  const getColFilterType = (col: ColumnInstance): string => {
    if (col.props.filter) {
      return columnFilterComposable.getFilterType(col.props.filter);
    }
    return "none";
  };

  const getColFilterOptions = (col: ColumnInstance) => {
    return columnFilterComposable.getFilterOptions(col.props.filter);
  };

  const getColRangeFields = (col: ColumnInstance): [string, string] | undefined => {
    return columnFilterComposable.getRangeFields(col.props.filter);
  };

  const isColFilterMultiple = (col: ColumnInstance): boolean => {
    return columnFilterComposable.isMultipleSelect(col.props.filter);
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getGlobalIndex = (item: T): number => {
    return items.value.findIndex((i) => getItemKey(i, 0) === getItemKey(item, 0));
  };

  /**
   * Builds props for DataTableRow component.
   * Centralizes all row-related state to avoid duplication.
   */
  const getRowProps = (item: T, index: number): Record<string, unknown> => ({
    item,
    index,
    columns: colsComposable.orderedVisibleColumns.value,

    // Selection
    isSelected: selectionComposable.isSelected(item),
    isSelectable: selectionComposable.canSelect(item),
    selectionMode: options.selectionMode?.value,
    showSelectionCell: hasSelectionColumn.value && !isSelectionViaColumn.value,

    // Reorder - not included in orchestrator, handled separately
    reorderable: false,
    showDragHandle: false,
    isDragging: false,

    // Expansion
    expandable: visibleColumns.value.some((col) => col.props.expander),
    isExpanded: isRowExpanded(item),
    expandedIcon: "fas fa-chevron-down",
    collapsedIcon: "fas fa-chevron-right",

    // Editing
    editingRowData: editingComposable.getEditingRowData(item, index) ?? item,
    isRowEditing: editingComposable.isRowEditing(item),
    isInlineEditing: inlineEditComposable.isEditing.value,
    isCellEditing: editingComposable.isCellEditing,

    // Actions - determined externally
    hasActions: false,

    // Column helpers
    getColumnWidth: colsComposable.getEffectiveColumnWidth,
    getCellAlign: colsComposable.getCellAlign,
    getCellStyle: colsComposable.getCellStyle,
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    selection: {
      internalSelection: selectionComposable.internalSelection,
      allSelected: selectionComposable.allSelected,
      someSelected: selectionComposable.someSelected,
      isSelected: selectionComposable.isSelected,
      canSelect: selectionComposable.canSelect,
      handleRowSelectionChange: selectionComposable.handleRowSelectionChange,
      handleSelectAllChange: selectionComposable.handleSelectAllChange,
      clearSelection: selectionComposable.clearSelection,
    },

    sort: {
      getSortDirection: sortComposable.getSortDirection,
      getSortIndex: sortComposable.getSortIndex,
      handleSort: sortComposable.handleSort,
    },

    editing: {
      isRowEditing: editingComposable.isRowEditing,
      getEditingRowData: editingComposable.getEditingRowData,
      isCellEditing: editingComposable.isCellEditing,
      startRowEdit: editingComposable.startRowEdit,
      cancelRowEdit: editingComposable.cancelRowEdit,
      saveRowEdit: editingComposable.saveRowEdit,
    },

    expansion: {
      isRowExpanded,
      toggleRowExpansion: expansionComposable.toggleRowExpansion,
      expandedKeysArray,
    },

    rowGrouping: {
      isGroupingEnabled: rowGroupingComposable.isGroupingEnabled,
      groupedData: rowGroupingComposable.groupedData as ComputedRef<GroupedData<T>[]>,
      isGroupExpanded: rowGroupingComposable.isGroupExpanded,
      toggleGroupExpansion: rowGroupingComposable.toggleGroupExpansion,
      getItemGroupKey: rowGroupingComposable.getItemGroupKey,
    },

    inlineEdit: {
      isEditing: inlineEditComposable.isEditing,
      startEditing: inlineEditComposable.startEditing,
      cancelEditing: inlineEditComposable.cancelEditing,
      saveChanges: inlineEditComposable.saveChanges,
      updateCell: inlineEditComposable.updateCell,
      addRow: inlineEditComposable.addRow,
      removeRow: inlineEditComposable.removeRow,
    },

    cols: {
      orderedVisibleColumns: colsComposable.orderedVisibleColumns,
      columnWidths: colsComposable.columnWidths,
      getEffectiveColumnWidth: colsComposable.getEffectiveColumnWidth,
      getHeaderAlign: colsComposable.getHeaderAlign,
      getHeaderStyle: colsComposable.getHeaderStyle,
      getCellAlign: colsComposable.getCellAlign,
      getCellStyle: colsComposable.getCellStyle,
      getSortField: colsComposable.getSortField,
      isColumnResizable: colsComposable.isColumnResizable,
      isColumnReorderable: colsComposable.isColumnReorderable,
      isLastResizableColumn: colsComposable.isLastResizableColumn,
      setHeaderRef: colsComposable.setHeaderRef,
      headerRefs: colsComposable.headerRefs,
      handleResizeStart,
      handleColumnDragStart,
      handleColumnDragOver,
      handleColumnDrop,
    },

    columnFilter: {
      getFilterType: getColFilterType,
      getFilterOptions: getColFilterOptions,
      getRangeFields: getColRangeFields,
      isMultipleSelect: isColFilterMultiple,
    },

    getGlobalIndex,
    getRowProps,
  };
}
