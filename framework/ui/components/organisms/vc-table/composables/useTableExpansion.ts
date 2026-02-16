/**
 * useTableExpansion - Composable for expandable rows functionality
 *
 * Handles row expansion/collapse with efficient key-based lookup.
 * Extracted from VcDataTable.vue for better modularity.
 *
 * Inspired by PrimeVue DataTable expandableRows patterns.
 */
import { ref, computed, watch, type Ref, type ComputedRef } from "vue";

export interface UseTableExpansionOptions<T> {
  /** External expanded rows (v-model:expandedRows) */
  expandedRows?: Ref<T[] | undefined>;
  /** Function to get unique key for an item */
  getItemKey: (item: T, index: number) => string;
}

export interface RowExpandEvent<T> {
  data: T;
  originalEvent: Event;
}

export interface UseTableExpansionReturn<T> {
  /** Internal array of expanded rows */
  internalExpandedRows: Ref<T[]>;
  /** Set of expanded row keys for O(1) lookup */
  expandedRowKeys: ComputedRef<Set<string>>;
  /** Check if a specific row is expanded */
  isRowExpanded: (item: T, index: number) => boolean;
  /** Toggle row expansion state */
  toggleRowExpansion: (item: T, index: number, event: Event) => RowExpandEvent<T>;
  /** Expand a row */
  expandRow: (item: T, index: number, event?: Event) => RowExpandEvent<T>;
  /** Collapse a row */
  collapseRow: (item: T, index: number, event?: Event) => RowExpandEvent<T>;
  /** Expand all rows */
  expandAll: (items: T[]) => void;
  /** Collapse all rows */
  collapseAll: () => void;
}

export function useTableExpansion<T extends Record<string, unknown>>(
  options: UseTableExpansionOptions<T>
): UseTableExpansionReturn<T> {
  const { expandedRows, getItemKey } = options;

  // ============================================================================
  // State
  // ============================================================================

  /** Internal array of expanded rows */
  const internalExpandedRows = ref<T[]>([]) as Ref<T[]>;

  // Sync expandedRows with external prop
  watch(
    () => expandedRows?.value,
    (newVal) => {
      if (newVal !== undefined) {
        internalExpandedRows.value = [...newVal];
      }
    },
    { immediate: true }
  );

  /**
   * Set of expanded row keys for O(1) lookup
   * Uses getItemKey with index=0 - the key should be based on dataKey field, not array index
   */
  const expandedRowKeys = computed<Set<string>>(() => {
    return new Set(
      internalExpandedRows.value.map((item) => getItemKey(item, 0))
    );
  });

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Check if a specific row is expanded
   * Note: Uses index=0 for key generation to match expandedRowKeys computation
   * The key should be based on dataKey field, not array index
   */
  const isRowExpanded = (item: T, index: number): boolean => {
    // Use 0 as index because expandedRowKeys also uses 0
    // This ensures keys match when dataKey field doesn't exist (fallback to row-0)
    const key = getItemKey(item, 0);
    const result = expandedRowKeys.value.has(key);
    return result;
  };

  /**
   * Expand a row
   */
  const expandRow = (item: T, index: number, event?: Event): RowExpandEvent<T> => {
    if (!isRowExpanded(item, index)) {
      internalExpandedRows.value = [...internalExpandedRows.value, item];
    }
    return {
      data: item,
      originalEvent: event || new Event("expand"),
    };
  };

  /**
   * Collapse a row
   */
  const collapseRow = (item: T, index: number, event?: Event): RowExpandEvent<T> => {
    // Use getItemKey with 0 as index to match expandedRowKeys computation
    const key = getItemKey(item, 0);
    internalExpandedRows.value = internalExpandedRows.value.filter(
      (r) => getItemKey(r, 0) !== key
    );
    return {
      data: item,
      originalEvent: event || new Event("collapse"),
    };
  };

  /**
   * Toggle row expansion state
   */
  const toggleRowExpansion = (item: T, index: number, event: Event): RowExpandEvent<T> => {
    event.stopPropagation();

    if (isRowExpanded(item, index)) {
      return collapseRow(item, index, event);
    } else {
      return expandRow(item, index, event);
    }
  };

  /**
   * Expand all rows
   */
  const expandAll = (items: T[]): void => {
    internalExpandedRows.value = [...items];
  };

  /**
   * Collapse all rows
   */
  const collapseAll = (): void => {
    internalExpandedRows.value = [];
  };

  return {
    internalExpandedRows,
    expandedRowKeys,
    isRowExpanded,
    toggleRowExpansion,
    expandRow,
    collapseRow,
    expandAll,
    collapseAll,
  };
}

export default useTableExpansion;
