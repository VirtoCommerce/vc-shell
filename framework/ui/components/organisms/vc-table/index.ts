// VcTable points to the adapter that wraps VcDataTable with the old API surface.

/**
 * @deprecated Use `VcDataTable` from `framework/ui/components` instead.
 */
export { default as VcTable } from "@ui/components/organisms/vc-table/VcTableAdapter.vue";

// Declarative API - VcDataTable with VcColumn support (PrimeVue-like)
export { default as VcDataTable } from "@ui/components/organisms/vc-table/VcDataTable.vue";

// Declarative Column Component (renderless)
export { default as VcColumn } from "@ui/components/organisms/vc-table/components/VcColumn.vue";

// Compositional API components
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableEmpty,
  TableColumnSwitcher,
  TableRowActions,
  TableCheckbox,
  TableSelectAllBar,
  TableSearchHeader,
  TableGroupRow,
} from "@ui/components/organisms/vc-table/components";

// Utilities
export { ColumnCollector } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

// Cell formatters
export {
  CellDefault,
  CellDate,
  CellDateAgo,
  CellHtml,
  CellImage,
  CellLink,
  CellMoney,
  CellNumber,
  CellStatus,
  CellStatusIcon,
  CellEditableWrapper,
} from "@ui/components/organisms/vc-table/components/cells";

// Composables (public API)
export {
  useTableContext,
  // useTableSelection — exported from shared/composables
  useTableColumnsResize,
  useTableColumnsReorder,
  useTableRowReorder,
  useTableInlineEdit,
  useTableRowGrouping,
  useVirtualScroll,
  useColumnFilter,
  useFilterState,
} from "@ui/components/organisms/vc-table/composables";

// Virtual scroll types
export type { VirtualScrollOptions, VirtualScrollItem, VirtualScrollReturn } from "@ui/components/organisms/vc-table/composables";

// Re-export types
export * from "@ui/components/organisms/vc-table/types";
