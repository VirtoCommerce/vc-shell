import { inject } from "vue";
import { TableContextKey, type TableContext } from "@ui/components/organisms/vc-table/keys";

// Re-export for backward compatibility (TableContext now lives in keys.ts)
export type { TableContext };

/**
 * Hook to access table context from child components
 * @returns Table context or null if not inside a Table component
 */
export function useTableContext<T = any>(): TableContext<T> | null {
  return inject(TableContextKey, null) as TableContext<T> | null;
}
