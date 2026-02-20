import { inject, type ComputedRef } from "vue";
import { TableContextKey } from "@ui/components/organisms/vc-table/keys";

export interface TableContext<T = any> {
  selectedRowIndex: ComputedRef<number | undefined>;
  setSelectedRowIndex: (index: number | undefined) => void;
  variant: ComputedRef<string | undefined>;
}

/**
 * Hook to access table context from child components
 * @returns Table context or null if not inside a Table component
 */
export function useTableContext<T = any>(): TableContext<T> | null {
  return inject(TableContextKey, null) as TableContext<T> | null;
}
