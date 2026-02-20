/**
 * useDataProcessing - Composable for data processing pipeline
 *
 * Handles the data transformation pipeline:
 * 1. Sorting
 * 2. Row Grouping
 *
 * Inspired by PrimeVue's processedData computed pattern.
 */
import { computed, type Ref, type ComputedRef } from "vue";
import type { SortMeta } from "@ui/components/organisms/vc-table/types";

export interface UseDataProcessingOptions<T> {
  /** Source data items */
  items: Ref<T[]>;

  // Sorting
  sortField?: Ref<string | undefined>;
  sortOrder?: Ref<number>;
  sortMode?: Ref<"single" | "multiple">;
  multiSortMeta?: Ref<SortMeta[]>;

  // Row grouping
  groupRowsBy?: Ref<string | string[] | undefined>;

  // Lazy loading (server-side)
  lazy?: Ref<boolean>;

  // Callbacks
  onSortChange?: (sortedValue: T[]) => void;
}

export interface UseDataProcessingReturn<T> {
  /** Fully processed data (sorted, grouped) */
  processedData: ComputedRef<T[]>;

  /** Is data empty after processing */
  isEmpty: ComputedRef<boolean>;
}

/**
 * Resolves a nested field value from an object
 * Supports dot notation: "address.city"
 */
function resolveFieldData<T>(data: T, field: string | undefined): unknown {
  if (!data || !field) return data;

  if (field.includes(".")) {
    const fields = field.split(".");
    let value: unknown = data;

    for (const f of fields) {
      if (value == null) return null;
      value = (value as Record<string, unknown>)[f];
    }

    return value;
  }

  return (data as Record<string, unknown>)[field];
}

/**
 * Compare two values for sorting
 */
function compare(
  value1: unknown,
  value2: unknown,
  order: number,
  nullSortOrder: number = 1
): number {
  const result = compareValues(value1, value2, nullSortOrder);
  return order * result;
}

function compareValues(value1: unknown, value2: unknown, nullSortOrder: number): number {
  // Handle null/undefined
  if (value1 == null && value2 == null) return 0;
  if (value1 == null) return nullSortOrder;
  if (value2 == null) return -nullSortOrder;

  // Handle different types
  if (typeof value1 === "string" && typeof value2 === "string") {
    return value1.localeCompare(value2, undefined, { numeric: true, sensitivity: "base" });
  }

  if (typeof value1 === "number" && typeof value2 === "number") {
    return value1 - value2;
  }

  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() - value2.getTime();
  }

  // Fallback to string comparison
  const str1 = String(value1);
  const str2 = String(value2);
  return str1.localeCompare(str2);
}

/**
 * Main composable for data processing
 */
export function useDataProcessing<T extends Record<string, unknown>>(
  options: UseDataProcessingOptions<T>
): UseDataProcessingReturn<T> {
  const {
    items,
    sortField,
    sortOrder,
    sortMode,
    multiSortMeta,
    groupRowsBy,
    lazy,
    onSortChange,
  } = options;

  // ============================================================================
  // SORTING
  // ============================================================================

  /**
   * Sort single field
   */
  const sortSingle = (data: T[]): T[] => {
    const field = sortField?.value;
    const order = sortOrder?.value ?? 1;

    if (!field) return data;

    const sorted = [...data];
    sorted.sort((a, b) => {
      const value1 = resolveFieldData(a, field);
      const value2 = resolveFieldData(b, field);
      return compare(value1, value2, order);
    });

    return sorted;
  };

  /**
   * Sort multiple fields
   */
  const sortMultiple = (data: T[]): T[] => {
    const meta = multiSortMeta?.value;
    if (!meta || meta.length === 0) return data;

    const sorted = [...data];
    sorted.sort((a, b) => {
      for (const sortMeta of meta) {
        const value1 = resolveFieldData(a, sortMeta.field);
        const value2 = resolveFieldData(b, sortMeta.field);
        const result = compare(value1, value2, sortMeta.order);
        if (result !== 0) return result;
      }
      return 0;
    });

    return sorted;
  };

  /**
   * Sorted data
   */
  const sortedData = computed<T[]>(() => {
    // Skip sorting for lazy mode (server handles it)
    if (lazy?.value) return items.value;

    const data = items.value;
    const mode = sortMode?.value ?? "single";

    let result: T[];

    if (mode === "multiple") {
      result = sortMultiple(data);
    } else if (sortField?.value) {
      result = sortSingle(data);
    } else {
      result = data;
    }

    // Notify callback
    if (result !== data) {
      onSortChange?.(result);
    }

    return result;
  });

  // ============================================================================
  // ROW GROUPING
  // ============================================================================

  /**
   * Group data by field(s)
   * Returns data in grouped order with group headers
   */
  const groupedData = computed<T[]>(() => {
    const groupBy = groupRowsBy?.value;
    if (!groupBy) return sortedData.value;

    const data = sortedData.value;
    const field = Array.isArray(groupBy) ? groupBy[0] : groupBy;

    // Sort by group field first if not already sorted
    const sorted = [...data].sort((a, b) => {
      const value1 = resolveFieldData(a, field);
      const value2 = resolveFieldData(b, field);
      return compare(value1, value2, 1);
    });

    return sorted;
  });

  // ============================================================================
  // FINAL OUTPUT
  // ============================================================================

  /**
   * Fully processed data
   */
  const processedData = computed<T[]>(() => {
    return groupedData.value;
  });

  /**
   * Is processed data empty
   */
  const isEmpty = computed(() => {
    return processedData.value.length === 0;
  });

  return {
    processedData,
    isEmpty,
  };
}

export default useDataProcessing;
