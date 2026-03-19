/* eslint-disable @typescript-eslint/no-explicit-any */
// framework/composables/useTableSort.ts
import { ref, computed, Ref, WritableComputedRef } from "vue";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-table-sort");

export type ITableSortDirection = "ASC" | "DESC";

export interface TableSortState {
  property: string | null;
  direction: ITableSortDirection | null;
}

export interface UseTableSortOptions {
  initialProperty?: string;
  initialDirection?: ITableSortDirection;
}

export type SortParam = string;

export interface UseTableSortReturn {
  // State exposed as writable computed or refs for direct v-model or manipulation if needed
  // Though direct manipulation is less common, usually via handleSortChange
  currentSort: WritableComputedRef<TableSortState>;
  sortExpression: Ref<string | undefined>; // e.g., "name:ASC"
  handleSortChange: (sortParam: SortParam) => void;
  resetSort: () => void;
}

export function useTableSort(options?: UseTableSortOptions): UseTableSortReturn {
  const currentSortProperty = ref<string | null>(options?.initialProperty || null);
  const currentSortDirection = ref<ITableSortDirection | null>(options?.initialDirection || null);

  const currentSort: WritableComputedRef<TableSortState> = computed({
    get: () => ({
      property: currentSortProperty.value,
      direction: currentSortDirection.value,
    }),
    set: (newState: TableSortState) => {
      currentSortProperty.value = newState.property;
      currentSortDirection.value = newState.direction;
    },
  });

  const sortExpression = computed<string | undefined>(() => {
    if (currentSortProperty.value && currentSortDirection.value) {
      return `${currentSortProperty.value}:${currentSortDirection.value}`;
    }
    return undefined;
  });

  const handleSortChange = (sortParam: SortParam) => {
    let newSortProperty: string | undefined = undefined;
    let newSortDirection: ITableSortDirection | undefined = undefined;

    const parts = sortParam.split(":");
    if (parts.length === 2) {
      newSortProperty = parts[0];
      const dir = parts[1].toUpperCase();
      if (dir === "ASC" || dir === "DESC") {
        newSortDirection = dir as ITableSortDirection;
      }
    } else {
      newSortProperty = sortParam; // Assume it's just the property name
    }

    if (newSortProperty) {
      if (currentSortProperty.value === newSortProperty) {
        // Clicked on the same column, toggle direction (3-state: ASC → DESC → none)
        if (newSortDirection) {
          // If table provided a new direction (e.g. explicit sort)
          currentSortDirection.value = newSortDirection;
        } else {
          // Toggle existing: ASC → DESC → clear
          if (currentSortDirection.value === "ASC") {
            currentSortDirection.value = "DESC";
          } else if (currentSortDirection.value === "DESC") {
            // Third click - clear sort
            currentSortProperty.value = null;
            currentSortDirection.value = null;
          } else {
            currentSortDirection.value = "ASC";
          }
        }
      } else {
        // Clicked on a new column
        currentSortProperty.value = newSortProperty;
        currentSortDirection.value = newSortDirection || "ASC"; // Default to ASC if no direction provided
      }
    } else {
      logger.warn("Could not determine valid sort property from sortParam:", sortParam);
    }
  };

  const resetSort = () => {
    currentSortProperty.value = options?.initialProperty || null;
    currentSortDirection.value = options?.initialDirection || null;
  };

  return {
    currentSort,
    sortExpression,
    handleSortChange,
    resetSort,
  };
}
