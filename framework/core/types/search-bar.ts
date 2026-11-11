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
export type NumberFilterConfig = { number: true; min?: number; max?: number };
export type CustomFilterConfig = {
  component: Component;
  label: (v: unknown) => string;
  toPhrase?: (v: unknown) => string;
};

export type EnumOperator = "any" | "not";

export interface SearchBarField extends Omit<GlobalFilterConfig, "filter"> {
  filter: ColumnFilterConfig | ToggleFilterConfig | NumberFilterConfig | CustomFilterConfig;
  /** Phrase name, defaults to id */
  key?: string;
  /** Default true */
  pinned?: boolean;
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
  query?: string;
}

export interface SearchBarChange {
  search: string;
  filters: Record<string, unknown>;
  phrase: string;
  state: SearchBarState;
}

/** A named set of filter values; the search text is not part of it */
export interface SearchBarView {
  id: string;
  name: string;
  values: Record<string, SearchBarValue>;
  /** The view the bar opens on when the URL names none (first one wins) */
  default?: boolean;
}

export interface SearchBarPreset {
  id: string;
  name: string;
  values: Record<string, SearchBarValue>;
  search?: string;
  pinned?: boolean;
  version?: number;
}
