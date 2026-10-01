import type { InjectionKey, Ref, ComputedRef } from "vue";
import type { ColumnCollector } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import type { ColumnInstance } from "@ui/components/organisms/vc-data-table/types";

// TableContext moved here from useTableContext.ts to break circular dependency
export interface TableContext<_T = any> {
  selectedRowIndex: ComputedRef<number | undefined>;
  setSelectedRowIndex: (index: number | undefined) => void;
  variant: ComputedRef<string | undefined>;
}

export const TableContextKey: InjectionKey<TableContext> = Symbol("TableContext");
export const ColumnCollectorKey: InjectionKey<ColumnCollector> = Symbol("ColumnCollector");
export const FillerWidthKey: InjectionKey<ComputedRef<number>> = Symbol("FillerWidth");
export const IsColumnReorderingKey: InjectionKey<Ref<boolean>> = Symbol("IsColumnReordering");

/** Cell editing for mobile cards: lets a card field open the same editor a table cell does. */
export interface MobileCellEdit<T = any> {
  enabled: () => boolean;
  isCellEditing: (rowIndex: number, field: string) => boolean;
  getEditingRowData: (item: T, rowIndex: number) => T;
  start: (item: T, field: string, rowIndex: number, column: ColumnInstance) => void;
  complete: (item: T, field: string, rowIndex: number, value: unknown) => void;
  cancel: (item: T, field: string, rowIndex: number) => void;
}
export const MobileCellEditKey: InjectionKey<MobileCellEdit> = Symbol("MobileCellEdit");
