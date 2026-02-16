// === PUBLIC API ===
export { useTableContext } from "./useTableContext";
// useTableSelection — exported from shared/composables (not from this directory)
export { useTableColumnsResize } from "./useTableColumnsResize";
export { useTableColumnsReorder } from "./useTableColumnsReorder";
export { useTableRowReorder } from "./useTableRowReorder";
export { useTableInlineEdit } from "./useTableInlineEdit";
export { useVirtualScroll } from "./useVirtualScroll";
export type { VirtualScrollOptions, VirtualScrollItem, VirtualScrollReturn } from "./useVirtualScroll";
export { useTableRowGrouping } from "./useTableRowGrouping";
export type { RowGroupingOptions, GroupedData, UseTableRowGroupingReturn } from "./useTableRowGrouping";
export { useFilterState } from "./useTableFilter";
export type { UseFilterStateOptions, UseFilterStateReturn } from "./useTableFilter";
export { useColumnFilter } from "./useColumnFilter";
export type { UseColumnFilterReturn } from "./useColumnFilter";

// === NEW COMPOSABLES (PrimeVue-style) ===
export { useTableSort } from "./useTableSort";
export type { UseTableSortOptions, UseTableSortReturn, SortEvent } from "./useTableSort";
export { useTableEditing } from "./useTableEditing";
export type {
  UseTableEditingOptions,
  UseTableEditingReturn,
  CellEditEvent,
  CellEditCompleteEvent,
  RowEditEvent,
  RowEditSaveEvent,
} from "./useTableEditing";
export { useTableExpansion } from "./useTableExpansion";
export type { UseTableExpansionOptions, UseTableExpansionReturn, RowExpandEvent } from "./useTableExpansion";
export { useTableSelectionV2 } from "./useTableSelectionV2";
export type {
  UseTableSelectionV2Options,
  UseTableSelectionV2Return,
  RowSelectEvent,
  RowSelectAllEvent,
} from "./useTableSelectionV2";
export { useDataProcessing } from "./useDataProcessing";
export type { UseDataProcessingOptions, UseDataProcessingReturn } from "./useDataProcessing";
export { useTableColumns } from "./useTableColumns";
export type { UseTableColumnsOptions, UseTableColumnsReturn } from "./useTableColumns";
export { useMobileCardLayout } from "./useMobileCardLayout";
export type { UseMobileCardLayoutOptions, UseMobileCardLayoutReturn } from "./useMobileCardLayout";
export { useDataTableState } from "./useDataTableState";
export type { UseDataTableStateOptions, UseDataTableStateReturn, DataTablePersistedState } from "./useDataTableState";

// === SWIPE (used by mobile components) ===
export { useTableSwipe, provideTableSwipe } from "./useTableSwipe";

