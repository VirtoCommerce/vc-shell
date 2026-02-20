import type { InjectionKey, Ref } from "vue";
import type { TableContext } from "@ui/components/organisms/vc-table/composables/useTableContext";
import type { ColumnCollector } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

export const TableContextKey: InjectionKey<TableContext> = Symbol("TableContext");
export const ColumnCollectorKey: InjectionKey<ColumnCollector> = Symbol("ColumnCollector");
export const HasFlexColumnsKey: InjectionKey<Ref<boolean>> = Symbol("HasFlexColumns");
