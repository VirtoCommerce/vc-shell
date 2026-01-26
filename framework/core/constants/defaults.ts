/**
 * Component Default Values for VC-Shell Framework
 * Centralized storage for default prop values across components
 */

export const COMPONENT_DEFAULTS = {
  input: {
    maxlength: 1024,
    debounce: 0,
    type: "text" as const,
    autocomplete: "off" as const,
  },

  select: {
    debounce: 500,
    pageSize: 20,
    searchable: true,
    clearable: true,
  },

  table: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100] as readonly number[],
    selectable: false,
    multiselect: false,
    stickyHeader: true,
  },

  pagination: {
    pageSize: 20,
    visiblePages: 5,
  },

  textarea: {
    rows: 3,
    maxlength: 4096,
  },

  editor: {
    minHeight: 200,
    maxHeight: 500,
  },

  tooltip: {
    delay: 300,
    placement: "top" as const,
  },

  modal: {
    closeOnEscape: true,
    closeOnOverlayClick: true,
  },

  notification: {
    duration: 5000,
    position: "top-right" as const,
  },

  dashboard: {
    columns: 12,
    rowHeight: 80,
    gap: 20,
  },
} as const;

/**
 * Type for accessing component defaults
 */
export type ComponentDefaults = typeof COMPONENT_DEFAULTS;

/**
 * Helper to get defaults for a specific component
 */
export function getComponentDefaults<K extends keyof ComponentDefaults>(componentName: K): ComponentDefaults[K] {
  return COMPONENT_DEFAULTS[componentName];
}
