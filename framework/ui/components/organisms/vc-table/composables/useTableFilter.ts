import { ref, computed } from "vue";
import type { FilterValue } from "../types";

export interface UseFilterStateOptions {
  /** Called whenever a filter is applied/cleared with a flat payload for the backend */
  onFilterChange?: (payload: Record<string, unknown>) => void;
}

/**
 * Simple filter state composable for backend-driven filtering.
 *
 * Collects filter values and emits flat payloads for the backend to handle.
 */
export function useFilterState(options: UseFilterStateOptions = {}) {
  const filterValues = ref<Record<string, FilterValue>>({});

  const isValueEmpty = (val: unknown): boolean => {
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  };

  const updateFilter = (field: string, value: FilterValue) => {
    filterValues.value = {
      ...filterValues.value,
      [field]: value,
    };
  };

  const updateRangeFilter = (rangeFields: [string, string], value: { start?: string; end?: string }) => {
    // Store as composite key for internal tracking
    const key = `__range__${rangeFields[0]}__${rangeFields[1]}`;
    filterValues.value = {
      ...filterValues.value,
      [key]: value as FilterValue,
    };
  };

  const clearFilter = (field: string) => {
    const newValues = { ...filterValues.value };
    delete newValues[field];
    // Also check for range keys containing this field
    for (const key of Object.keys(newValues)) {
      if (key.startsWith("__range__") && key.includes(field)) {
        delete newValues[key];
      }
    }
    filterValues.value = newValues;
  };

  const clearAllFilters = () => {
    filterValues.value = {};
  };

  /**
   * Build flat payload for backend.
   * Expands dateRange composite keys to separate fields.
   */
  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filterValues.value)) {
      if (key.startsWith("__range__")) {
        // Expand range to separate fields
        const rangeVal = value as { start?: string; end?: string } | null;
        if (rangeVal) {
          const parts = key.replace("__range__", "").split("__");
          if (parts[0] && rangeVal.start) {
            payload[parts[0]] = rangeVal.start;
          }
          if (parts[1] && rangeVal.end) {
            payload[parts[1]] = rangeVal.end;
          }
        }
      } else if (!isValueEmpty(value)) {
        payload[key] = value;
      }
    }

    return payload;
  };

  const isObjectWithValues = (val: unknown): boolean => {
    if (typeof val !== "object" || val === null || Array.isArray(val)) return false;
    return Object.values(val).some((v) => v !== null && v !== undefined && v !== "");
  };

  const hasActiveFilters = computed(() => {
    return Object.values(filterValues.value).some((val) => {
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return isObjectWithValues(val);
      }
      return !isValueEmpty(val);
    });
  });

  const activeFilterCount = computed(() => {
    let count = 0;
    for (const val of Object.values(filterValues.value)) {
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        if (isObjectWithValues(val)) count++;
      } else if (!isValueEmpty(val)) {
        count++;
      }
    }
    return count;
  });

  return {
    filterValues,
    updateFilter,
    updateRangeFilter,
    clearFilter,
    clearAllFilters,
    buildPayload,
    hasActiveFilters,
    activeFilterCount,
  };
}

export type UseFilterStateReturn = ReturnType<typeof useFilterState>;
