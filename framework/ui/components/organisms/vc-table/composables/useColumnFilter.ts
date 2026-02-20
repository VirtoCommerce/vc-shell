/**
 * useColumnFilter - Composable for working with declarative column filter configuration
 *
 * Provides utilities to:
 * - Determine filter type from config
 * - Extract backend field names
 * - Get select options
 */

import type {
  ColumnFilterConfig,
  FilterType,
  FilterOption,
  SelectFilterConfig,
  SelectFilterWithFieldConfig,
  DateRangeFilterConfig,
} from "@ui/components/organisms/vc-table/types";

/**
 * Type guard: check if config is a select filter with options
 */
function isSelectFilter(config: ColumnFilterConfig): config is SelectFilterConfig | SelectFilterWithFieldConfig {
  return typeof config === "object" && "options" in config;
}

/**
 * Type guard: check if config is a select filter with custom field
 */
function isSelectFilterWithField(config: ColumnFilterConfig): config is SelectFilterWithFieldConfig {
  return typeof config === "object" && "options" in config && "field" in config;
}

/**
 * Type guard: check if config is a date range filter
 */
function isDateRangeFilter(config: ColumnFilterConfig): config is DateRangeFilterConfig {
  return typeof config === "object" && "range" in config;
}

/**
 * Composable for working with column filter configuration
 */
export function useColumnFilter() {
  /**
   * Determine filter type from configuration
   *
   * @example
   * getFilterType(true)                        // "text"
   * getFilterType("keyword")                   // "text"
   * getFilterType({ options: [...] })          // "select"
   * getFilterType({ range: ["a", "b"] })       // "dateRange"
   * getFilterType(undefined)                   // "none"
   */
  const getFilterType = (filter?: ColumnFilterConfig): FilterType => {
    if (!filter) return "none";
    if (filter === true || typeof filter === "string") return "text";
    if (isDateRangeFilter(filter)) return "dateRange";
    if (isSelectFilter(filter)) return "select";
    return "none";
  };

  /**
   * Get backend field name for text/select filters
   *
   * @param columnId - The column's id (used as default)
   * @param filter - Filter configuration
   * @returns Field name to send to backend
   *
   * @example
   * getFilterField("status", true)                           // "status"
   * getFilterField("search", "keyword")                      // "keyword"
   * getFilterField("status", { options: [...] })             // "status"
   * getFilterField("type", { field: "orderType", options })  // "orderType"
   */
  const getFilterField = (columnId: string, filter?: ColumnFilterConfig): string => {
    if (!filter) return columnId;
    if (filter === true) return columnId;
    if (typeof filter === "string") return filter;
    if (isSelectFilterWithField(filter)) return filter.field;
    if (isSelectFilter(filter)) return columnId;
    // For dateRange, field is not applicable (use getRangeFields instead)
    return columnId;
  };

  /**
   * Get range field names for dateRange filters
   *
   * @param filter - Filter configuration
   * @returns Tuple of [startField, endField] or undefined if not a range filter
   *
   * @example
   * getRangeFields({ range: ["startDate", "endDate"] })  // ["startDate", "endDate"]
   * getRangeFields(true)                                  // undefined
   */
  const getRangeFields = (filter?: ColumnFilterConfig): [string, string] | undefined => {
    if (filter && isDateRangeFilter(filter)) {
      return filter.range;
    }
    return undefined;
  };

  /**
   * Get select options from filter configuration
   *
   * @param filter - Filter configuration
   * @returns Array of FilterOption or undefined if not a select filter
   *
   * @example
   * getFilterOptions({ options: [{ value: "a", label: "A" }] })  // [{ value: "a", label: "A" }]
   * getFilterOptions(true)                                       // undefined
   */
  const getFilterOptions = (filter?: ColumnFilterConfig): FilterOption[] | undefined => {
    if (filter && isSelectFilter(filter)) {
      return filter.options;
    }
    return undefined;
  };

  /**
   * Check if select filter allows multiple selection
   *
   * @param filter - Filter configuration
   * @returns true if multiple selection is enabled
   *
   * @example
   * isMultipleSelect({ options: [...], multiple: true })  // true
   * isMultipleSelect({ options: [...] })                  // false
   * isMultipleSelect(true)                                // false
   */
  const isMultipleSelect = (filter?: ColumnFilterConfig): boolean => {
    if (filter && isSelectFilter(filter)) {
      return filter.multiple === true;
    }
    return false;
  };

  /**
   * Check if column has filter configured
   */
  const hasFilter = (filter?: ColumnFilterConfig): boolean => {
    return filter !== undefined && filter !== null;
  };

  return {
    getFilterType,
    getFilterField,
    getRangeFields,
    getFilterOptions,
    isMultipleSelect,
    hasFilter,
    // Export type guards for external use
    isSelectFilter,
    isSelectFilterWithField,
    isDateRangeFilter,
  };
}

export type UseColumnFilterReturn = ReturnType<typeof useColumnFilter>;
