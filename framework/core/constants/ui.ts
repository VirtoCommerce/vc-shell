/**
 * UI Constants for VC-Shell Framework
 * Centralized storage for magic numbers and UI-related constants
 */

export const UI_CONSTANTS = {
  // Grid system
  GRID_COLUMNS: 12,
  CELL_HEIGHT: 80,
  WIDGET_GAP: 20,

  // Timing (milliseconds)
  DEBOUNCE_DEFAULT_MS: 500,
  HOVER_DELAY_MS: 200,
  TOOLTIP_DELAY_MS: 300,
  RESIZE_DEBOUNCE_MS: 100,
  ANIMATION_DURATION_MS: 200,
  TRANSITION_DURATION_MS: 150,

  // Thresholds
  DRAG_THRESHOLD_PX: 3,
  MAX_COLLISION_ITERATIONS: 50,
  MIN_COLUMN_WIDTH_PX: 15,
  OVERFLOW_THRESHOLD: 100,

  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 100,
    TOOLTIP: 9999,
    POPUP: 10000,
    MODAL: 10001,
    DRAG: 1000,
    SIDEBAR: 50,
    HEADER: 40,
  },

  // Pagination
  PAGINATION_VISIBLE_PAGES: 5,
  PAGINATION_EDGE_PAGES: 3,

  // Table
  TABLE_ROW_HEIGHT: 48,
  TABLE_HEADER_HEIGHT: 56,

  // Input
  DEFAULT_MAXLENGTH: 1024,
  DEFAULT_TEXTAREA_ROWS: 3,

  // Menu
  MENU_COLLAPSED_WIDTH: 76,
  MENU_EXPANDED_WIDTH: 246,
  MENU_ITEM_HEIGHT: 38,

  // Breakpoints (pixels)
  BREAKPOINTS: {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400,
  },
} as const;

/**
 * Type for accessing UI constants values
 */
export type UIConstants = typeof UI_CONSTANTS;
