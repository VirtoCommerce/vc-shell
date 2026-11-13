import type { Component } from "vue";

// Shared by the search bar and the external filter registry (core must not import from ui)

/** Supported filter UI types for column and global filters */
export type FilterType = "text" | "select" | "dateRange" | "none";

/** Option item for select-type filters */
export interface FilterOption {
  /** Value sent to the backend API */
  value: string | number;
  /** Human-readable label shown in the dropdown */
  label: string;
  /** Shown next to the option when the backend returns facets */
  count?: number;
}

/** Configuration for a dropdown select filter */
export interface SelectFilterConfig {
  /** Available options in the dropdown */
  options: FilterOption[];
  /** Allow selecting multiple values (default: false) */
  multiple?: boolean;
}

/** Select filter with explicit backend field override */
export interface SelectFilterWithFieldConfig extends SelectFilterConfig {
  /** Backend field name to use instead of column id */
  field: string;
}

/** Configuration for a date range filter */
export interface DateRangeFilterConfig {
  /** Tuple of [startFieldName, endFieldName] for the date range */
  range: [string, string];
}

/**
 * Declarative filter configuration for VcColumn's `filter` prop.
 * - `true` — text filter keyed by column id
 * - `"fieldName"` — text filter on that field
 * - `SelectFilterConfig` — dropdown filter
 * - `DateRangeFilterConfig` — date range picker
 */
export type ColumnFilterConfig =
  | boolean
  | string
  | SelectFilterConfig
  | SelectFilterWithFieldConfig
  | DateRangeFilterConfig;

/** Runtime filter value — varies by filter type */
export type FilterValue = string | string[] | number | { start?: string; end?: string } | null | undefined;

/** Configuration for a global filter shown in the filter panel (not tied to a column) */
export interface GlobalFilterConfig {
  /** Unique filter identifier (used as backend field name) */
  id: string;
  /** Human-readable label shown above the filter control */
  label: string;
  /** Filter type configuration (same as VcColumn `filter` prop) */
  filter: ColumnFilterConfig;
  /** Placeholder text for the filter input */
  placeholder?: string;
}

export type ToggleFilterConfig = { toggle: true };
/** A one-click range in the number editor */
export interface NumberPreset {
  label: string;
  value: NumberValue;
}
export type NumberFilterConfig = { number: true; min?: number; max?: number; presets?: NumberPreset[] };
export type CustomFilterConfig = {
  component: Component;
  label: (v: unknown) => string;
  /**
   * Checks a value read back from the URL or a saved view (already JSON-parsed): return the value
   * to apply, or undefined to drop it. Without it only primitives, arrays of primitives and plain
   * objects of those are accepted.
   */
  parse?: (raw: unknown) => SearchBarValue | undefined;
};

export type EnumOperator = "any" | "not";

export interface SearchBarField extends Omit<GlobalFilterConfig, "filter"> {
  filter: ColumnFilterConfig | ToggleFilterConfig | NumberFilterConfig | CustomFilterConfig;
  /** Name typed in the search as `key:value`, defaults to id */
  key?: string;
  /** Select only, default ["any"] */
  operators?: EnumOperator[];
}

export type NumberValue = { op: "gte" | "lte" | "eq" | "between"; min?: number; max?: number };
export type NotValue = { not: string[] };
export type RelativeDate = { relative: "today" | "7d" | "30d" };

export type SearchBarValue = FilterValue | boolean | NumberValue | NotValue | RelativeDate | unknown;

export interface SearchBarState {
  search: string;
  values: Record<string, SearchBarValue>;
}

export interface SearchBarChange {
  search: string;
  filters: Record<string, unknown>;
  state: SearchBarState;
}

/** A search bar's width mode (wide ≥720px, medium ≥480px, else narrow), or "phone" on a phone */
export type SearchBarMode = "wide" | "medium" | "narrow" | "phone";

/** A named set of filter values; the search text is not part of it */
export interface SearchBarView {
  id: string;
  name: string;
  values: Record<string, SearchBarValue>;
  /** The view the bar opens on when the URL names none (first one wins) */
  default?: boolean;
}
