import { ref, computed, watch, inject, type Ref, type ComputedRef } from "vue";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";

export type DataTableSortDirection = "ASC" | "DESC";
export type DataTableSortOrder = 0 | 1 | -1;

export interface UseDataTableSortOptions {
  /** Column field to sort by initially */
  initialField?: string;
  /** Initial sort direction. Default: 'ASC' */
  initialDirection?: DataTableSortDirection;
  /** When set, syncs sort to the blade URL query under this key. */
  stateKey?: string;
}

export interface UseDataTableSortReturn {
  /** Ref for v-model:sort-field on VcDataTable */
  sortField: Ref<string | undefined>;
  /**
   * Numeric ref for v-model:sort-order on VcDataTable.
   * 1 = ASC, -1 = DESC, 0 = none.
   */
  sortOrder: Ref<DataTableSortOrder>;
  /** String expression for API calls: "field:ASC" | "field:DESC" | undefined */
  sortExpression: ComputedRef<string | undefined>;
  /** Reset to initial values */
  resetSort: () => void;
}

function directionToOrder(dir?: DataTableSortDirection): DataTableSortOrder {
  if (dir === "ASC") return 1;
  if (dir === "DESC") return -1;
  return 0;
}

function orderToDirection(order: DataTableSortOrder): DataTableSortDirection | undefined {
  if (order === 1) return "ASC";
  if (order === -1) return "DESC";
  return undefined;
}

export function useDataTableSort(options?: UseDataTableSortOptions): UseDataTableSortReturn {
  const initialField = options?.initialField;
  const initialOrder = directionToOrder(options?.initialDirection);

  const sortField = ref<string | undefined>(initialField);
  const sortOrder = ref<DataTableSortOrder>(initialOrder);

  const sortExpression = computed<string | undefined>(() => {
    const dir = orderToDirection(sortOrder.value);
    if (!sortField.value || !dir) return undefined;
    return `${sortField.value}:${dir}`;
  });

  if (options?.stateKey) {
    const service = inject(TableQueryStateKey, undefined);
    if (service) {
      const restored = service.read(options.stateKey);
      if (restored.sort) {
        const [field, dir] = restored.sort.split(":");
        if (field) {
          sortField.value = field;
          sortOrder.value = dir === "DESC" ? -1 : 1;
        }
      }
      // Registered after seeding, so the restored value is the baseline (no bounce-back write).
      watch(sortExpression, (value) => service.write(options.stateKey!, { sort: value }));
    }
  }

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
