import { ref, computed, type Ref, type ComputedRef } from "vue";

export type DataTableSortDirection = "ASC" | "DESC";

export interface UseDataTableSortOptions {
  /** Column field to sort by initially */
  initialField?: string;
  /** Initial sort direction. Default: 'ASC' */
  initialDirection?: DataTableSortDirection;
}

export interface UseDataTableSortReturn {
  /** Ref for v-model:sort-field on VcDataTable */
  sortField: Ref<string | undefined>;
  /**
   * Numeric ref for v-model:sort-order on VcDataTable.
   * Runtime values: 1 = ASC, -1 = DESC, 0 = none.
   * Typed as `number` to match VcDataTable's `update:sortOrder` emit signature.
   */
  sortOrder: Ref<number>;
  /** String expression for API calls: "field:ASC" | "field:DESC" | undefined */
  sortExpression: ComputedRef<string | undefined>;
  /** Reset to initial values */
  resetSort: () => void;
}

function directionToOrder(dir?: DataTableSortDirection): number {
  if (dir === "ASC") return 1;
  if (dir === "DESC") return -1;
  return 0;
}

function orderToDirection(order: number): DataTableSortDirection | undefined {
  if (order === 1) return "ASC";
  if (order === -1) return "DESC";
  return undefined;
}

export function useDataTableSort(options?: UseDataTableSortOptions): UseDataTableSortReturn {
  const initialField = options?.initialField;
  const initialOrder = directionToOrder(options?.initialDirection);

  const sortField = ref<string | undefined>(initialField);
  const sortOrder = ref<number>(initialOrder);

  const sortExpression = computed<string | undefined>(() => {
    const dir = orderToDirection(sortOrder.value);
    if (!sortField.value || !dir) return undefined;
    return `${sortField.value}:${dir}`;
  });

  const resetSort = () => {
    sortField.value = initialField;
    sortOrder.value = initialOrder;
  };

  return {
    sortField,
    sortOrder,
    sortExpression,
    resetSort,
  };
}
