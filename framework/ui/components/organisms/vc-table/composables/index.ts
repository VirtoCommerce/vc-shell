// === PUBLIC API ===
export { useTableContext } from "@ui/components/organisms/vc-table/composables/useTableContext";
// useTableSelection — exported from shared/composables (not from this directory)
export { useTableColumnsResize } from "@ui/components/organisms/vc-table/composables/useTableColumnsResize";
export { useTableColumnsReorder } from "@ui/components/organisms/vc-table/composables/useTableColumnsReorder";
export { useTableRowReorder } from "@ui/components/organisms/vc-table/composables/useTableRowReorder";
export { useTableInlineEdit } from "@ui/components/organisms/vc-table/composables/useTableInlineEdit";
export { useVirtualScroll } from "@ui/components/organisms/vc-table/composables/useVirtualScroll";
export type { VirtualScrollOptions, VirtualScrollItem, VirtualScrollReturn } from "@ui/components/organisms/vc-table/composables/useVirtualScroll";
export { useTableRowGrouping } from "@ui/components/organisms/vc-table/composables/useTableRowGrouping";
export type { RowGroupingOptions, GroupedData, UseTableRowGroupingReturn } from "@ui/components/organisms/vc-table/composables/useTableRowGrouping";
export { useFilterState } from "@ui/components/organisms/vc-table/composables/useTableFilter";
export type { UseFilterStateOptions, UseFilterStateReturn } from "@ui/components/organisms/vc-table/composables/useTableFilter";
export { useColumnFilter } from "@ui/components/organisms/vc-table/composables/useColumnFilter";
export type { UseColumnFilterReturn } from "@ui/components/organisms/vc-table/composables/useColumnFilter";

// === NEW COMPOSABLES (PrimeVue-style) ===
export { useTableSort } from "@ui/components/organisms/vc-table/composables/useTableSort";
export type { UseTableSortOptions, UseTableSortReturn, SortEvent } from "@ui/components/organisms/vc-table/composables/useTableSort";
export { useTableEditing } from "@ui/components/organisms/vc-table/composables/useTableEditing";
export type {
  UseTableEditingOptions,
  UseTableEditingReturn,
  CellEditEvent,
  CellEditCompleteEvent,
  RowEditEvent,
  RowEditSaveEvent,
} from "@ui/components/organisms/vc-table/composables/useTableEditing";
export { useTableExpansion } from "@ui/components/organisms/vc-table/composables/useTableExpansion";
export type { UseTableExpansionOptions, UseTableExpansionReturn, RowExpandEvent } from "@ui/components/organisms/vc-table/composables/useTableExpansion";
export { useTableSelectionV2 } from "@ui/components/organisms/vc-table/composables/useTableSelectionV2";
export type {
  UseTableSelectionV2Options,
  UseTableSelectionV2Return,
  RowSelectEvent,
  RowSelectAllEvent,
} from "@ui/components/organisms/vc-table/composables/useTableSelectionV2";
export { useDataProcessing } from "@ui/components/organisms/vc-table/composables/useDataProcessing";
export type { UseDataProcessingOptions, UseDataProcessingReturn } from "@ui/components/organisms/vc-table/composables/useDataProcessing";
export { useTableColumns } from "@ui/components/organisms/vc-table/composables/useTableColumns";
export type { UseTableColumnsOptions, UseTableColumnsReturn } from "@ui/components/organisms/vc-table/composables/useTableColumns";
export { useMobileCardLayout } from "@ui/components/organisms/vc-table/composables/useMobileCardLayout";
export type { UseMobileCardLayoutOptions, UseMobileCardLayoutReturn } from "@ui/components/organisms/vc-table/composables/useMobileCardLayout";
export { useDataTableState } from "@ui/components/organisms/vc-table/composables/useDataTableState";
export type { UseDataTableStateOptions, UseDataTableStateReturn, DataTablePersistedState } from "@ui/components/organisms/vc-table/composables/useDataTableState";

// === SWIPE (used by mobile components) ===
export { useTableSwipe, provideTableSwipe } from "@ui/components/organisms/vc-table/composables/useTableSwipe";

