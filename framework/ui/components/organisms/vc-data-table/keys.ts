import type { InjectionKey, Ref, ComputedRef } from "vue";
import type { ColumnCollector } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";

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
