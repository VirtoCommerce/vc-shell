import type { InjectionKey, Ref, ComputedRef } from "vue";
import type { TableContext } from "@ui/components/organisms/vc-table/composables/useTableContext";
import type { ColumnCollector } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import type { FilterValue } from "@ui/components/organisms/vc-table/types";

export const TableContextKey: InjectionKey<TableContext> = Symbol("TableContext");
export const ColumnCollectorKey: InjectionKey<ColumnCollector> = Symbol("ColumnCollector");
export const HasFlexColumnsKey: InjectionKey<Ref<boolean>> = Symbol("HasFlexColumns");
export const IsColumnReorderingKey: InjectionKey<Ref<boolean>> = Symbol("IsColumnReordering");

export interface FilterContext {
  filterValues: Ref<Record<string, FilterValue>>;
  updateFilter: (field: string, value: FilterValue) => void;
  clearFilter: (field: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: ComputedRef<boolean>;
  activeFilterCount: ComputedRef<number>;
}

export const FilterContextKey: InjectionKey<FilterContext> = Symbol("FilterContext");
