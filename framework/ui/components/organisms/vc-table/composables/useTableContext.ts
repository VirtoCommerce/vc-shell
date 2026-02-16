import { inject, type ComputedRef } from "vue";

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
  return inject<TableContext<T> | null>("tableContext", null);
}
