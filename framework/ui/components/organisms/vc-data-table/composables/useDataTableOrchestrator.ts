/**
 * @internal
 * Wires all VcDataTable sub-composables together.
 *
 * This composable owns:
 * - All sub-composable calls (selection, sort, editing, expansion, row grouping,
 *   inline edit, state persistence, columns, resize, reorder, row reorder, filters)
 * - Inter-composable watchers
 * - Derived computed properties (displayItems, effectiveSelectionMode, etc.)
 * - Event handlers (handleSort, handleSelectAllChange, handleRowSelectionChange,
 *   handleRowClick, handleAddRow, handleRemoveRow, handleColumnVisibilityChange)
 *
 * VcDataTable.vue retains: template, props/emits, defineSlots, slot extraction,
 * all provide() calls, DOM refs, and UI-state refs (showGlobalFiltersPanel, etc.).
 */

import { ref, computed, watch, toRef, type Ref, type ComputedRef } from "vue";
import {
  useTableRowReorder,
  useTableColumnsResize,
  useTableColumnsReorder,
  useFilterState,
  useColumnFilter,
  useTableSort,
  useTableEditing,
  useTableExpansion,
  useTableSelectionV2,
  useTableColumns,
  useTableRowGrouping,
  useTableInlineEdit,
  useDataTableState,
} from "@ui/components/organisms/vc-data-table/composables";
import type { ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import { isSpecialColumn } from "@ui/components/organisms/vc-data-table/utils/columnHelpers";
import { DEFAULT_MIN_COLUMN_PX } from "@ui/components/organisms/vc-data-table/composables/useColumnWidthEngine";
import type {
  VcColumnProps,
  FilterValue,
  EditChange,
  TableAction,
  SortMeta,
  MobileSwipeAction,
  VcDataTableExtendedProps,
  TableFitMode,
  PersistedStateV2,
} from "@ui/components/organisms/vc-data-table/types";

// ============================================================================
// Orchestrator input/output interfaces
// ============================================================================

/**
 * @internal
 * Reactive props subset passed from VcDataTable into the orchestrator.
 * All values must be reactive (Ref/ComputedRef) so the orchestrator
 * correctly tracks changes throughout the component's lifetime.
 */
export interface VcDataTableOrchestratorOptions<T extends Record<string, unknown>> {
  props: VcDataTableExtendedProps<T> & { fitMode?: TableFitMode };
  emit: VcDataTableOrchestratorEmit<T>;
  visibleColumns: ComputedRef<ColumnInstance[]>;
  declaredColumns: ComputedRef<ColumnInstance[]>;
  hiddenColumnIds: Ref<Set<string>>;
  shownDataDiscoveredColumnIds: Ref<Set<string>>;
  dataDiscoveredColumns: ComputedRef<ColumnInstance[]>;
  getItemKey: (item: T, index: number) => string;
  /**
   * Ref to the tableContainerRef DOM element.
   * Required by useTableColumnsResize to query cell elements.
   */
  tableContainerRef: Ref<HTMLElement | null>;
}

/**
 * @internal
 * Emit signature expected by the orchestrator (subset of VcDataTable emits
 * that are consumed by the extracted event handlers and watchers).
 */
export type VcDataTableOrchestratorEmit<T> = {
  (event: "update:selection", value: T | T[]): void;
  (event: "update:selectAll", value: boolean): void;
  (event: "row-select", payload: { data: T; originalEvent: Event }): void;
  (event: "row-unselect", payload: { data: T; originalEvent: Event }): void;
  (event: "row-select-all", payload: { data: T[]; originalEvent: Event }): void;
  (event: "row-unselect-all", payload: { data: T[]; originalEvent: Event }): void;
  (event: "select-all", payload: { selected: boolean }): void;
  (event: "update:selectAllActive", value: boolean): void;
  (event: "update:editingRows", value: T[]): void;
  (event: "cell-edit-init", payload: { data: T; field: string; index: number }): void;
  (event: "cell-edit-complete", payload: { data: T; field: string; newValue: unknown; index: number }): void;
  (event: "cell-edit-cancel", payload: { data: T; field: string; index: number }): void;
  (event: "row-edit-init", payload: { data: T; index: number }): void;
  (event: "row-edit-save", payload: { data: T; newData: T; index: number }): void;
  (event: "row-edit-cancel", payload: { data: T; index: number }): void;
  (event: "edit-save", payload: { changes: EditChange<T>[] }): void;
  (event: "edit-cancel"): void;
  (event: "row-add", payload: { defaults: Record<string, unknown>; cancel: () => void }): void;
  (event: "row-remove", payload: { data: T; index: number; cancel: () => void }): void;
  (event: "update:sortField", value: string): void;
  (event: "update:sortOrder", value: number): void;
  (event: "update:multiSortMeta", value: SortMeta[]): void;
  (event: "sort", payload: { sortField?: string; sortOrder?: number; multiSortMeta?: SortMeta[] }): void;
  (event: "filter", payload: { filters: Record<string, unknown>; filteredValue: T[] }): void;
  (event: "update:activeItemId", value: string | undefined): void;
  (event: "row-click", payload: { data: T; index: number; originalEvent: Event }): void;
  (event: "row-action", payload: { action: TableAction | MobileSwipeAction<T>; item: T; index: number }): void;
  (event: "row-reorder", payload: { dragIndex: number; dropIndex: number; value: T[] }): void;
  (event: "column-resize-end", payload: { columns: { id: string; width: number }[] }): void;
  (event: "column-reorder", payload: { columns: { id: string; [key: string]: unknown }[] }): void;
  (event: "state-save", state: PersistedStateV2): void;
  (event: "state-restore", state: PersistedStateV2): void;
  (event: "update:expandedRows", value: T[]): void;
  (event: "row-expand", payload: { data: T; originalEvent: Event }): void;
  (event: "row-collapse", payload: { data: T; originalEvent: Event }): void;
  (event: "update:expandedRowGroups", value: string[]): void;
  (event: "rowgroup-expand", payload: { data: string; originalEvent: Event }): void;
  (event: "rowgroup-collapse", payload: { data: string; originalEvent: Event }): void;
};

/**
 * @internal
 * All reactive state and handlers returned by the orchestrator for use in
 * VcDataTable's template and provide() calls.
 */
export interface VcDataTableOrchestratorReturn<T extends Record<string, unknown>> {
  // Sub-composable instances (needed for template bindings + expose)
  selection: ReturnType<typeof useTableSelectionV2<T>>;
  sort: ReturnType<typeof useTableSort>;
  editing: ReturnType<typeof useTableEditing<T>>;
  expansion: ReturnType<typeof useTableExpansion<T>>;
  rowGrouping: ReturnType<typeof useTableRowGrouping<T>>;
  inlineEdit: ReturnType<typeof useTableInlineEdit<T>>;
  cols: ReturnType<typeof useTableColumns>;
  statePersistence: ReturnType<typeof useDataTableState>;

  // Column filter helpers (returned from useColumnFilter / useFilterState)
  colFilter: ReturnType<typeof useColumnFilter>;
  filterValues: Ref<Record<string, FilterValue>>;
  updateFilter: (field: string, value: FilterValue) => void;
  updateRangeFilter: (fields: [string, string], value: { start?: string; end?: string }) => void;
  clearFilter: (field: string) => void;
  clearAllFilters: () => void;
  buildPayload: () => Record<string, unknown>;
  hasActiveFilters: ComputedRef<boolean>;
  activeFilterCount: ComputedRef<number>;

  // Column filter template helpers
  showColumnFilter: (col: ColumnInstance) => boolean;
  getColumnFilterType: (col: ColumnInstance) => ReturnType<ReturnType<typeof useColumnFilter>["getFilterType"]>;
  getColumnFilterOptions: (col: ColumnInstance) => ReturnType<ReturnType<typeof useColumnFilter>["getFilterOptions"]>;
  isColumnFilterMultiple: (col: ColumnInstance) => boolean;
  getColumnRangeFields: (col: ColumnInstance) => ReturnType<ReturnType<typeof useColumnFilter>["getRangeFields"]>;
  getColumnFilterValue: (col: ColumnInstance) => FilterValue;
  handleColumnFilterApply: (col: ColumnInstance, payload: Record<string, unknown>) => void;
  handleColumnFilterClear: (col: ColumnInstance) => void;
  emitFilterPayload: () => void;

  // Global filter (owned by component UI state but wired here)
  globalFilterPayload: Ref<Record<string, unknown> | null>;

  // Resize / reorder handlers (from useTableColumnsResize / useTableColumnsReorder)
  handleResizeStart: ReturnType<typeof useTableColumnsResize>["handleResizeStart"];
  isColumnReordering: Ref<boolean>;
  handleColumnDragStart: ReturnType<typeof useTableColumnsReorder>["handleDragStart"];
  handleColumnDragOver: ReturnType<typeof useTableColumnsReorder>["handleDragOver"];
  handleColumnDrop: ReturnType<typeof useTableColumnsReorder>["handleDrop"];

  // Row reorder state
  draggedRow: Ref<number | undefined>;
  pendingReorder: Ref<boolean>;
  reorderedItems: Ref<T[]>;
  onRowMouseDown: ReturnType<typeof useTableRowReorder>["onRowMouseDown"];
  onRowDragStart: (event: DragEvent, item: T) => void;
  onRowDragOver: (event: DragEvent, item: T) => void;
  onRowDragLeave: ReturnType<typeof useTableRowReorder>["onRowDragLeave"];
  onRowDragEnd: ReturnType<typeof useTableRowReorder>["onRowDragEnd"];
  onRowDrop: ReturnType<typeof useTableRowReorder>["onRowDrop"];

  // Derived computeds
  displayItems: ComputedRef<T[]>;
  getGlobalIndex: (item: T) => number;
  effectiveSelectionMode: ComputedRef<"single" | "multiple" | undefined>;
  selectionColumn: ComputedRef<ColumnInstance | null>;
  hasSelectionColumn: ComputedRef<boolean>;
  isSelectionViaColumn: ComputedRef<boolean>;
  isRowReorderEnabled: ComputedRef<boolean>;
  showRowDragHandle: ComputedRef<boolean>;
  expanderColumn: ComputedRef<ColumnInstance | null>;
  hasExpanderColumn: ComputedRef<boolean>;
  computedVariant: ComputedRef<"striped" | "bordered" | "default">;
  switcherColumns: ComputedRef<{ id: string; label: string; visible: boolean; defaultVisible: boolean }[]>;
  switcherVisibleColumnIds: ComputedRef<string[]>;
  safeColumns: ComputedRef<ColumnInstance[]>;
  isInlineEditing: ComputedRef<boolean>;

  // Expansion helper
  isRowExpanded: (item: T) => boolean;
  canExpand: (item: T) => boolean;
  expandedKeysArray: Ref<string[]>;

  // Data-discovered IDs watcher stable ref
  dataDiscoveredIds: Ref<Set<string>>;

  // Event handlers
  handleSort: (col: VcColumnProps, event?: MouseEvent) => void;
  handleSelectAllChange: (value: boolean) => void;
  handleRowSelectionChange: (item: T, eventOrValue?: Event | boolean) => void;
  handleRowClick: (item: T, index: number, event: Event) => void;
  handleAddRow: (defaults?: Partial<T>) => void;
  handleRemoveRow: (rowIndex: number) => void;
  handleColumnVisibilityChange: (visibleIds: string[]) => void;
  handleTableReset: () => void;
  handleCellClick: (item: T, field: string, rowIndex: number, col: ColumnInstance) => void;
  handleCellEditComplete: (item: T, field: string, rowIndex: number, newValue: unknown) => void;
  handleCellEditCancel: (item: T, field: string, rowIndex: number) => void;
  handleCellValueChange: (field: string, rowIndex: number, newValue: unknown) => void;
  handleExpandToggle: (item: T, index: number, event: Event) => void;
  handleStartRowEdit: (item: T, index: number) => void;
  handleSaveRowEdit: (item: T, index: number) => void;
  handleCancelRowEdit: (item: T, index: number) => void;
  handleRowAction: (action: TableAction, item: T, index: number) => void;
  handleMobileRowClick: (item: T, index: number) => void;
  handleMobileRowSelect: (item: T, index: number) => void;
  handleMobileRowAction: (action: MobileSwipeAction<T>, item: T, index: number) => void;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * @internal
 * Wires all VcDataTable sub-composables together.
 *
 * Called once in VcDataTable's `<script setup>`. Receives reactive inputs from
 * the component and returns all the reactive state and handlers the template
 * needs. The component itself retains provide() calls, DOM refs, and UI state.
 */
export function useDataTableOrchestrator<T extends Record<string, unknown>>(
  options: VcDataTableOrchestratorOptions<T>,
): VcDataTableOrchestratorReturn<T> {
  const {
    props,
    emit,
    visibleColumns,
    declaredColumns,
    hiddenColumnIds,
    shownDataDiscoveredColumnIds,
    dataDiscoveredColumns,
    getItemKey,
    tableContainerRef,
  } = options;

  // ============================================================================
  // Derived computeds (needed early — used as inputs to sub-composables below)
  // ============================================================================

  const selectionColumn = computed<ColumnInstance | null>(() => {
    return visibleColumns.value.find((col) => col.props.selectionMode !== undefined) || null;
  });

  const hasSelectionColumn = computed(() => props.selectionMode !== undefined || selectionColumn.value !== null);

  const effectiveSelectionMode = computed<"single" | "multiple" | undefined>(() => {
    if (props.selectionMode) return props.selectionMode;
    return selectionColumn.value?.props.selectionMode;
  });

  const isSelectionViaColumn = computed(() => selectionColumn.value !== null);

  const computedVariant = computed(() => {
    if (props.striped) return "striped";
    if (props.bordered) return "bordered";
    return props.variant ?? "default";
  });

  // ============================================================================
  // Selection Composable
  // ============================================================================

  const selection = useTableSelectionV2<T>({
    items: toRef(props, "items") as Ref<T[]>,
    selection: toRef(props, "selection") as Ref<T | T[] | undefined>,
    selectionMode: computed(() => effectiveSelectionMode.value),
    isRowSelectable: (item: T) => (props.isRowSelectable ? props.isRowSelectable(item) : true),
    dataKey: props.dataKey ?? "id",
    getItemKey,
    totalCount: toRef(props, "totalCount") as Ref<number | undefined>,
    selectAllActive: toRef(props, "selectAllActive") as Ref<boolean | undefined>,
    onSelectAllChange: (active: boolean) => {
      emit("update:selectAllActive", active);
      emit("select-all", { selected: active });
    },
  });

  // Watch for selection changes and emit
  watch(
    () => selection.internalSelection.value,
    (newSelection) => {
      emit("update:selection", effectiveSelectionMode.value === "single" ? newSelection[0] : newSelection);
    },
    { deep: true },
  );

  // ============================================================================
  // Sort Composable
  // ============================================================================

  const sort = useTableSort({
    sortField: toRef(props, "sortField") as Ref<string | undefined>,
    sortOrder: toRef(props, "sortOrder") as Ref<number>,
    sortMode: toRef(props, "sortMode") as Ref<"single" | "multiple">,
    multiSortMeta: toRef(props, "multiSortMeta") as Ref<SortMeta[]>,
    removableSort: toRef(props, "removableSort") as Ref<boolean>,
    onSort: (event) => {
      if (event.sortField !== undefined) emit("update:sortField", event.sortField);
      if (event.sortOrder !== undefined) emit("update:sortOrder", event.sortOrder);
      if (event.multiSortMeta !== undefined) emit("update:multiSortMeta", event.multiSortMeta);
      emit("sort", event);
    },
  });

  // ============================================================================
  // Editing Composable
  // ============================================================================

  const editing = useTableEditing<T>({
    editMode: toRef(props, "editMode") as Ref<"cell" | "row" | undefined>,
    editingRows: toRef(props, "editingRows") as Ref<T[] | undefined>,
    dataKey: props.dataKey ?? "id",
    getItemKey,
  });

  // ============================================================================
  // Expansion Composable
  // ============================================================================

  const expansion = useTableExpansion<T>({
    expandedRows: toRef(props, "expandedRows") as Ref<T[]>,
    getItemKey,
    isRowExpandable: (item: T) => (props.isRowExpandable ? props.isRowExpandable(item) : true),
  });

  // Use a regular ref with array of keys for proper reactivity
  const expandedKeysArray = ref<string[]>([]);

  // Watch for expansion changes, update local ref and emit
  watch(
    () => expansion.internalExpandedRows.value,
    (newExpanded) => {
      // Update array of expanded keys
      const newKeys = newExpanded.map((item) => getItemKey(item as T, 0));

      // Only update if keys actually changed (prevent infinite loop)
      const currentKeys = expandedKeysArray.value.join(",");
      const newKeysStr = newKeys.join(",");
      if (currentKeys !== newKeysStr) {
        expandedKeysArray.value = newKeys;
        emit("update:expandedRows", newExpanded as T[]);
      }
    },
    { deep: true, immediate: true },
  );

  // Helper to check if row is expanded
  const isRowExpanded = (item: T): boolean => {
    const key = getItemKey(item, 0);
    return expandedKeysArray.value.includes(key);
  };

  // Helper to check if row can be expanded
  const canExpand = (item: T): boolean => {
    return expansion.canExpand(item);
  };

  // ============================================================================
  // Row Grouping Composable
  // ============================================================================

  const rowGrouping = useTableRowGrouping<T>({
    items: toRef(props, "items") as Ref<T[]>,
    groupRowsBy: toRef(props, "groupRowsBy") as Ref<string | undefined>,
    rowGroupMode: toRef(props, "rowGroupMode") as Ref<"subheader" | "rowspan">,
    expandableRowGroups: toRef(props, "expandableRowGroups") as Ref<boolean>,
    expandedRowGroups: toRef(props, "expandedRowGroups") as Ref<string[] | undefined>,
    onExpandedRowGroupsChange: (groups) => emit("update:expandedRowGroups", groups),
    onRowGroupExpand: (event) => emit("rowgroup-expand", event),
    onRowGroupCollapse: (event) => emit("rowgroup-collapse", event),
  });

  // ============================================================================
  // Inline Edit Composable (Row CRUD)
  // ============================================================================

  const inlineEdit = useTableInlineEdit<T>({
    items: toRef(props, "items") as Ref<T[]>,
    rules: props.validationRules as Record<string, (value: unknown, row: T) => string | true> | undefined,
    onSave: (changes) => {
      emit("edit-save", { changes: changes as EditChange<T>[] });
    },
    onCancel: () => {
      emit("edit-cancel");
    },
  });

  // Computed for inline editing state (for use in template)
  // editMode="inline" makes all editable cells always active (legacy compatibility)
  const isInlineEditing = computed(() => inlineEdit.isEditing.value || props.editMode === "inline");

  // ============================================================================
  // Column Helpers (via composable)
  // ============================================================================

  // Cached transition-wrapper element — updated lazily on measurement.
  // Avoids a querySelector call on every ResizeObserver tick.
  let cachedWrapper: HTMLElement | null = null;

  /**
   * Measures available width for data columns directly from the DOM.
   *
   * Reads the transition-wrapper width (already excludes row padding,
   * drag handles, row-level gap) and subtracts special cells rendered
   * inside the wrapper (implicit selection checkbox, VcColumn-based
   * selection/expander/rowReorder/rowEditor). No hardcoded pixel constants.
   *
   * When wrapper is not mounted yet, returns 0 — callers treat this as
   * "defer until DOM is ready" to avoid a first-frame column jump.
   */
  const measureAvailableWidth = (): number => {
    if (!cachedWrapper || !cachedWrapper.isConnected) {
      cachedWrapper = (tableContainerRef.value?.querySelector(
        ".vc-table-composition__row-transition-wrapper",
      ) ?? null) as HTMLElement | null;
    }
    if (!cachedWrapper || cachedWrapper.clientWidth <= 0) return 0;

    // Subtract special cells inside the wrapper.
    let specialWidth = 0;
    // 1. Implicit selection cells (not a VcColumn — no data-column-id).
    const implicitCells = cachedWrapper.querySelectorAll(".vc-data-table__selection-cell");
    for (const cell of implicitCells) {
      specialWidth += (cell as HTMLElement).getBoundingClientRect().width;
    }
    // 2. Special VcColumn cells (selectionMode, expander, rowReorder, rowEditor).
    for (const col of visibleColumns.value) {
      if (isSpecialColumn(col.props)) {
        const el = cols.headerRefs.get(col.props.id);
        if (el) specialWidth += el.getBoundingClientRect().width;
      }
    }
    return Math.max(0, cachedWrapper.clientWidth - specialWidth);
  };

  const cols = useTableColumns({
    visibleColumns,
    resizableColumns: props.resizableColumns ?? true,
    reorderableColumns: props.reorderableColumns ?? true,
    fitMode: props.fitMode ?? "gap",
    getAvailableWidth: measureAvailableWidth,
  });

  // ============================================================================
  // Column Switcher
  // ============================================================================

  // Stable set of data-discovered column IDs.
  // Uses a string key watcher so the Set is only re-created when actual IDs change
  // (avoids false triggers from new array references in the computed source).
  const dataDiscoveredIds = ref<Set<string>>(new Set());
  watch(
    () => dataDiscoveredColumns.value.map((c) => c.props.id).join(","),
    () => {
      dataDiscoveredIds.value = new Set(dataDiscoveredColumns.value.map((c) => c.props.id));
    },
    { immediate: true },
  );

  const switcherColumns = computed(() => {
    // Declared columns (excluding statically hidden and special columns)
    const declared = declaredColumns.value
      .filter((col) => col.props.visible !== false)
      .filter((col) => !isSpecialColumn(col.props))
      .map((col) => ({
        id: col.props.id,
        label: col.props.title || col.props.field || col.props.id,
        visible: !hiddenColumnIds.value.has(col.props.id),
        defaultVisible: true,
      }));

    // Data-discovered columns (from items keys, default hidden)
    const discovered = dataDiscoveredColumns.value.map((col) => ({
      id: col.props.id,
      label: col.props.title || col.props.id,
      visible: !hiddenColumnIds.value.has(col.props.id),
      defaultVisible: false,
    }));

    return [...declared, ...discovered];
  });

  const switcherVisibleColumnIds = computed(() => {
    return switcherColumns.value.filter((c) => c.visible).map((c) => c.id);
  });

  // ============================================================================
  // State Persistence
  // ============================================================================

  const statePersistence = useDataTableState({
    stateKey: toRef(props, "stateKey") as Ref<string | undefined>,
    stateStorage: computed(() => props.stateStorage ?? "local"),
    columnState: cols.columnState,
    hiddenColumnIds,
    shownColumnIds: shownDataDiscoveredColumnIds,
    getAvailableWidth: measureAvailableWidth,
    onStateSave: (state) => emit("state-save", state),
    onStateRestore: (state) => {
      // Persistence has restored weights — cancel any pending deferred
      // re-init from declared VcColumn props so recompute() doesn't overwrite
      // the user's saved column widths with the declarative defaults.
      cols.markStateRestored();
      emit("state-restore", state);
    },
  });

  // Initialize hiddenColumnIds with data-discovered columns (they start hidden).
  // Keep hidden IDs for columns that temporarily disappear between different
  // datasets/views (e.g. products vs catalog). This preserves per-view visibility.
  watch(
    dataDiscoveredIds,
    (newIds, oldIds) => {
      const updatedHidden = new Set(hiddenColumnIds.value);
      const updatedShown = new Set(shownDataDiscoveredColumnIds.value);
      let hiddenChanged = false;
      let shownChanged = false;

      // Newly discovered auto columns are hidden by default, unless user
      // explicitly enabled them earlier (persisted in shownDataDiscoveredColumnIds).
      for (const id of newIds) {
        if ((!oldIds || !oldIds.has(id)) && !updatedHidden.has(id) && !updatedShown.has(id)) {
          updatedHidden.add(id);
          hiddenChanged = true;
        }
      }

      // If a key becomes a declared column (no longer auto-discovered), drop it
      // from auto-column state sets. Do not remove IDs that simply disappeared
      // due to switching datasets/views.
      if (oldIds) {
        const declaredIds = new Set(declaredColumns.value.map((col) => col.props.id));
        for (const id of oldIds) {
          if (!newIds.has(id) && declaredIds.has(id)) {
            if (updatedHidden.delete(id)) {
              hiddenChanged = true;
            }
            if (updatedShown.delete(id)) {
              shownChanged = true;
            }
          }
        }
      }

      if (hiddenChanged) {
        hiddenColumnIds.value = updatedHidden;
      }
      if (shownChanged) {
        shownDataDiscoveredColumnIds.value = updatedShown;
      }
    },
    { immediate: true },
  );

  // ============================================================================
  // Row Reorder
  // ============================================================================

  const rowReorderColumn = computed<ColumnInstance | null>(() => {
    return visibleColumns.value.find((col) => col.props.rowReorder === true) || null;
  });

  const isRowReorderEnabled = computed(() => props.reorderableRows || rowReorderColumn.value !== null);
  const showRowDragHandle = computed(() => rowReorderColumn.value !== null);

  const {
    draggedRow,
    pendingReorder,
    reorderedItems,
    onRowMouseDown,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDragEnd,
    onRowDrop,
  } = useTableRowReorder(toRef(props, "items") as Ref<T[]>, (event) => emit("row-reorder", event));

  // ============================================================================
  // Expander Column Detection
  // ============================================================================

  const expanderColumn = computed<ColumnInstance | null>(() => {
    return visibleColumns.value.find((col) => col.props.expander === true) || null;
  });

  const hasExpanderColumn = computed(() => expanderColumn.value !== null);

  // ============================================================================
  // Filtering
  // ============================================================================

  // Column filter helpers (declarative `filter` prop API)
  const colFilter = useColumnFilter();

  const {
    filterValues,
    updateFilter,
    updateRangeFilter,
    clearFilter,
    clearAllFilters,
    buildPayload,
    hasActiveFilters,
    activeFilterCount,
  } = useFilterState({
    onFilterChange: (payload) => {
      emit("filter", { filters: payload, filteredValue: props.items });
    },
  });

  // Template helpers that bridge VcColumn instances → ColumnFilter props
  const showColumnFilter = (col: ColumnInstance): boolean => {
    return colFilter.hasFilter(col.props.filter);
  };

  const getColumnFilterField = (col: ColumnInstance): string => {
    return col.props.filterField || colFilter.getFilterField(col.props.id, col.props.filter);
  };

  const getColumnFilterType = (col: ColumnInstance) => {
    return colFilter.getFilterType(col.props.filter);
  };

  const getColumnFilterOptions = (col: ColumnInstance) => {
    return colFilter.getFilterOptions(col.props.filter);
  };

  const isColumnFilterMultiple = (col: ColumnInstance): boolean => {
    return colFilter.isMultipleSelect(col.props.filter);
  };

  const getColumnRangeFields = (col: ColumnInstance) => {
    return colFilter.getRangeFields(col.props.filter);
  };

  const getColumnFilterValue = (col: ColumnInstance): FilterValue => {
    const field = getColumnFilterField(col);
    // For dateRange, reconstruct { start, end } from range key
    if (getColumnFilterType(col) === "dateRange") {
      const rangeFields = getColumnRangeFields(col);
      if (rangeFields) {
        const key = `__range__${rangeFields[0]}__${rangeFields[1]}`;
        return filterValues.value[key] ?? null;
      }
    }
    return filterValues.value[field] ?? null;
  };

  // Global filter payload (passed back so component can merge it in emitFilterPayload)
  const globalFilterPayload = ref<Record<string, unknown> | null>(null);

  /** Emit the combined column + global filter payload */
  const emitFilterPayload = () => {
    const payload = buildPayload();
    // Merge global filter payload (if any)
    if (globalFilterPayload.value) {
      Object.assign(payload, globalFilterPayload.value);
    }
    emit("filter", { filters: payload, filteredValue: props.items });
  };

  const handleColumnFilterApply = (col: ColumnInstance, payload: Record<string, unknown>) => {
    const filterType = getColumnFilterType(col);
    const field = getColumnFilterField(col);

    if (filterType === "dateRange") {
      const rangeFields = getColumnRangeFields(col);
      if (rangeFields) {
        const start = payload[rangeFields[0]] as string | undefined;
        const end = payload[rangeFields[1]] as string | undefined;
        updateRangeFilter(rangeFields, { start, end });
      }
    } else {
      const value = payload[field];
      updateFilter(field, value as FilterValue);
    }

    // Emit combined payload
    emitFilterPayload();
  };

  const handleColumnFilterClear = (col: ColumnInstance) => {
    const field = getColumnFilterField(col);
    const filterType = getColumnFilterType(col);

    if (filterType === "dateRange") {
      const rangeFields = getColumnRangeFields(col);
      if (rangeFields) {
        const key = `__range__${rangeFields[0]}__${rangeFields[1]}`;
        clearFilter(key);
      }
    } else {
      clearFilter(field);
    }

    // Emit combined payload
    emitFilterPayload();
  };

  // ============================================================================
  // Display Items
  // ============================================================================

  // Display items: items come pre-filtered from the backend
  // Only row-reorder dragging changes display order locally
  const displayItems = computed<T[]>(() => {
    // During drag or waiting for parent to update items after drop
    if ((draggedRow.value !== undefined || pendingReorder.value) && isRowReorderEnabled.value) {
      return [...(reorderedItems.value as T[])];
    }

    return props.items ?? [];
  });

  // Helper to get global index of an item (for grouped mode)
  const getGlobalIndex = (item: T): number => {
    return displayItems.value.indexOf(item);
  };

  // ============================================================================
  // Safe Columns (null-check protected)
  // ============================================================================

  const safeColumns = computed(() => {
    return cols.orderedVisibleColumns.value.filter(
      (col): col is ColumnInstance => col != null && col.props != null && col.props.id != null,
    );
  });

  // ============================================================================
  // Resize + Reorder Composables
  // ============================================================================

  const { handleResizeStart } = useTableColumnsResize({
    columnState: cols.columnState,
    engineOutput: cols.engineOutput,
    recompute: cols.recompute,
    getAvailableWidth: measureAvailableWidth,
    minColumnWidth: DEFAULT_MIN_COLUMN_PX,
    getVisibleRegularColumnIds: () =>
      cols.orderedVisibleColumns.value.filter((col) => !isSpecialColumn(col.props)).map((col) => col.props.id),
    onResizeEnd: () => emit("column-resize-end", { columns: [] }),
    containerEl: tableContainerRef,
  });

  const {
    isDragging: isColumnReordering,
    handleDragStart: handleColumnDragStart,
    handleDragOver: handleColumnDragOver,
    handleDrop: handleColumnDrop,
  } = useTableColumnsReorder({
    columnState: cols.columnState,
    onReorderEnd: () => emit("column-reorder", { columns: [] }),
  });

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSort = (col: VcColumnProps, event?: MouseEvent) => {
    sort.handleSort(cols.getSortField(col), event);
  };

  const handleSelectAllChange = (value: boolean) => {
    const result = selection.handleSelectAllChange(value);
    if (value) emit("row-select-all", result);
    else emit("row-unselect-all", result);
    emit("update:selectAll", value);
  };

  const handleRowSelectionChange = (item: T, eventOrValue?: Event | boolean) => {
    const wasSelected = selection.isSelected(item);
    const result = selection.handleRowSelectionChange(item, eventOrValue);
    if (result) {
      if (wasSelected) emit("row-unselect", result);
      else emit("row-select", result);
    }
  };

  const handleRowClick = (item: T, index: number, event: Event) => {
    const itemKey = getItemKey(item, index);
    const isSameItem = props.activeItemId != null && itemKey === String(props.activeItemId);
    emit("update:activeItemId", isSameItem ? undefined : itemKey);
    emit("row-click", { data: item, index, originalEvent: event });
    const target = event.target as HTMLElement;
    const isCheckboxClick = target.tagName === "INPUT" && target.getAttribute("type") === "checkbox";
    if (effectiveSelectionMode.value === "single" && !isCheckboxClick) {
      handleRowSelectionChange(item, event);
    }
  };

  const handleCellClick = (item: T, field: string, rowIndex: number, col: ColumnInstance) => {
    if (
      props.editMode === "cell" &&
      (col.slots.editor || col.props.editable) &&
      !editing.isCellEditing(rowIndex, field)
    ) {
      const event = editing.startCellEdit(item, field, rowIndex);
      emit("cell-edit-init", event);
    }
  };

  const handleCellEditComplete = (item: T, field: string, rowIndex: number, newValue: unknown) => {
    // Close the editor and emit the event
    // This is called from focusout on the editor wrapper or Enter key
    const event = editing.completeCellEdit(item, field, rowIndex, newValue);
    emit("cell-edit-complete", { data: item, field, newValue: event.newValue, index: rowIndex });

    // If inline editing is active, also update the inlineEdit composable
    if (inlineEdit.isEditing.value) {
      inlineEdit.updateCell(rowIndex, field, newValue);
    }
  };

  const handleCellEditCancel = (item: T, field: string, rowIndex: number) => {
    // Cancel editing - discard changes
    editing.cancelCellEdit(item, field, rowIndex);
    emit("cell-edit-cancel", { data: item, field, index: rowIndex });
  };

  /**
   * Handle cell value change during editing (for inline edit dirty tracking).
   * Called on every keystroke/input change, not just on blur.
   */
  const handleCellValueChange = (field: string, rowIndex: number, newValue: unknown) => {
    // Clear new row flag on first interaction
    inlineEdit.clearNewRowFlag(rowIndex);

    // Use isInlineEditing (not inlineEdit.isEditing) to cover editMode="inline" without startEditing()
    if (isInlineEditing.value) {
      inlineEdit.updateCell(rowIndex, field, newValue);
    }

    // In editMode="inline", also emit cell-edit-complete so parent pages
    // that listen to @cell-edit-complete get notified. Mobile view has no
    // blur/complete cycle, so this is the only way values propagate.
    if (props.editMode === "inline") {
      const item = props.items[rowIndex];
      if (item) {
        emit("cell-edit-complete", { data: item, field, newValue, index: rowIndex });
      }
    }
  };

  const handleExpandToggle = (item: T, index: number, event: Event) => {
    const wasExpanded = expansion.isRowExpanded(item, index);
    const result = expansion.toggleRowExpansion(item, index, event);
    if (!result) return;
    if (wasExpanded) emit("row-collapse", result);
    else emit("row-expand", result);
  };

  const handleStartRowEdit = (item: T, index: number) => {
    const event = editing.startRowEdit(item, index);
    emit("update:editingRows", editing.internalEditingRows.value as T[]);
    emit("row-edit-init", event);
  };

  const handleSaveRowEdit = (item: T, index: number) => {
    const event = editing.saveRowEdit(item, index);
    emit("update:editingRows", editing.internalEditingRows.value as T[]);
    emit("row-edit-save", event);
  };

  const handleCancelRowEdit = (item: T, index: number) => {
    const event = editing.cancelRowEdit(item, index);
    emit("update:editingRows", editing.internalEditingRows.value as T[]);
    emit("row-edit-cancel", event);
  };

  const handleRowAction = (action: TableAction, item: T, index: number) => {
    // Call the action's click handler with item and index (matching legacy vc-table behavior)
    action.clickHandler?.(item, index);
    emit("row-action", { action, item, index });
  };

  const handleAddRow = (defaults?: Partial<T>) => {
    let cancelled = false;
    const event = {
      defaults: (defaults ?? {}) as Record<string, unknown>,
      cancel: () => {
        cancelled = true;
      },
    };
    emit("row-add", event);
    if (!cancelled) {
      inlineEdit.addRow(event.defaults as Partial<T>);
    }
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= props.items.length) return;
    let cancelled = false;
    const event = {
      data: props.items[rowIndex],
      index: rowIndex,
      cancel: () => {
        cancelled = true;
      },
    };
    emit("row-remove", event);
    if (!cancelled) {
      inlineEdit.removeRow(rowIndex);
    }
  };

  const handleColumnVisibilityChange = (visibleIds: string[]) => {
    const visibleSet = new Set(visibleIds);
    const allToggleableIds = switcherColumns.value.map((c) => c.id);
    const discoveredToggleableIds = switcherColumns.value.filter((c) => c.defaultVisible === false).map((c) => c.id);

    // Preserve hidden IDs that are not part of the current switcher view.
    // This prevents losing hidden preferences when switching datasets/views.
    const toggleableSet = new Set(allToggleableIds);
    const discoveredSet = new Set(discoveredToggleableIds);
    const newHidden = new Set<string>([...hiddenColumnIds.value].filter((id) => !toggleableSet.has(id)));
    const newShown = new Set<string>([...shownDataDiscoveredColumnIds.value].filter((id) => !discoveredSet.has(id)));

    for (const id of allToggleableIds) {
      if (!visibleSet.has(id)) {
        newHidden.add(id);
      }
    }

    for (const id of discoveredToggleableIds) {
      if (visibleSet.has(id)) {
        newShown.add(id);
      }
    }

    hiddenColumnIds.value = newHidden;
    shownDataDiscoveredColumnIds.value = newShown;
  };

  const handleTableReset = () => {
    // 1. Reset persisted state (clears storage + runtime refs including columnState, hiddenColumnIds, etc.)
    statePersistence.resetState();

    // 2. Re-hide data-discovered columns (they default to hidden).
    // The dataDiscoveredIds watcher won't re-fire because the IDs haven't changed,
    // but resetState() cleared hiddenColumnIds — so we must re-populate manually.
    if (dataDiscoveredIds.value.size > 0) {
      hiddenColumnIds.value = new Set(dataDiscoveredIds.value);
    }

    // 3. Re-init from declared VcColumn props (discards any runtime state).
    cols.resetFromProps();
    cols.recompute();
  };

  // ============================================================================
  // Mobile View Event Handlers
  // ============================================================================

  const handleMobileRowClick = (item: T, index: number) => {
    emit("row-click", { data: item, index, originalEvent: new Event("click") });
  };

  const handleMobileRowSelect = (item: T, _index: number) => {
    handleRowSelectionChange(item);
  };

  const handleMobileRowAction = (action: MobileSwipeAction<T>, item: T, index: number) => {
    // Execute the action's click handler if provided
    if (action.clickHandler) {
      action.clickHandler(item, index);
    }
    // Also emit the row-action event for parent components
    emit("row-action", { action, item, index });
  };

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Sub-composable instances
    selection,
    sort,
    editing,
    expansion,
    rowGrouping,
    inlineEdit,
    cols,
    statePersistence,

    // Column filter helpers
    colFilter,
    filterValues,
    updateFilter,
    updateRangeFilter,
    clearFilter,
    clearAllFilters,
    buildPayload,
    hasActiveFilters,
    activeFilterCount,

    // Column filter template helpers
    showColumnFilter,
    getColumnFilterType,
    getColumnFilterOptions,
    isColumnFilterMultiple,
    getColumnRangeFields,
    getColumnFilterValue,
    handleColumnFilterApply,
    handleColumnFilterClear,
    emitFilterPayload,

    // Global filter
    globalFilterPayload,

    // Resize / reorder
    handleResizeStart,
    isColumnReordering,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDrop,

    // Row reorder state
    draggedRow,
    pendingReorder,
    reorderedItems: reorderedItems as Ref<T[]>,
    onRowMouseDown,
    onRowDragStart: onRowDragStart as (event: DragEvent, item: T) => void,
    onRowDragOver: onRowDragOver as (event: DragEvent, item: T) => void,
    onRowDragLeave,
    onRowDragEnd,
    onRowDrop,

    // Derived computeds
    displayItems,
    getGlobalIndex,
    effectiveSelectionMode,
    selectionColumn,
    hasSelectionColumn,
    isSelectionViaColumn,
    isRowReorderEnabled,
    showRowDragHandle,
    expanderColumn,
    hasExpanderColumn,
    computedVariant,
    switcherColumns,
    switcherVisibleColumnIds,
    safeColumns,
    isInlineEditing,

    // Expansion helper
    isRowExpanded,
    canExpand,
    expandedKeysArray,

    // Data-discovered IDs stable ref
    dataDiscoveredIds,

    // Event handlers
    handleSort,
    handleSelectAllChange,
    handleRowSelectionChange,
    handleRowClick,
    handleAddRow,
    handleRemoveRow,
    handleColumnVisibilityChange,
    handleTableReset,
    handleCellClick,
    handleCellEditComplete,
    handleCellEditCancel,
    handleCellValueChange,
    handleExpandToggle,
    handleStartRowEdit,
    handleSaveRowEdit,
    handleCancelRowEdit,
    handleRowAction,
    handleMobileRowClick,
    handleMobileRowSelect,
    handleMobileRowAction,
  };
}
