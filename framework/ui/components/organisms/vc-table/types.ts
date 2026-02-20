/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComputedRef, Ref, VNode } from "vue";
import { IActionBuilderResult, ITableColumns } from "@core/types";
import type { ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

// Re-export types used by compositional components
export type { IActionBuilderResult, ITableColumns };

// Re-export row grouping types from composable
export type { GroupedData, RowGroupingOptions, UseTableRowGroupingReturn } from "@ui/components/organisms/vc-table/composables/useTableRowGrouping";

// Re-export ColumnInstance for external use
export type { ColumnInstance };

/** Extended action type for table-specific functionality (row actions, context menus) */
export interface TableAction<T = {}> extends IActionBuilderResult<T> {
  /** Unique action identifier */
  id?: string;
  /** Display name shown in the action button/menu */
  name?: string;
  /** Visual variant for color styling */
  variant?: "danger" | "success" | "warning" | "info";
  /** Whether the action is disabled (grayed out but visible) */
  disabled?: boolean;
  /** Whether the action is hidden (not rendered at all) */
  hidden?: boolean;
}

/** Row action item returned by the `rowActions` prop function */
export interface DataTableRowActionItem<T = unknown> {
  /** Unique action identifier */
  id: string;
  /** Display title shown in button tooltip or dropdown menu */
  title?: string;
  /** Icon CSS class (e.g. `"fas fa-edit"`) */
  icon?: string;
  /** Visual variant for color styling */
  variant?: "danger" | "success" | "warning" | "info";
  /** Whether the action is disabled — static boolean or per-row function */
  disabled?: boolean | ((item: T) => boolean);
  /** Whether the action is hidden — static boolean or per-row function */
  hidden?: boolean | ((item: T) => boolean);
  /** Click handler called when the action is triggered */
  clickHandler?: (item: T) => void;
}

/** Base item type — allows any fields plus optional `actions` */
export interface TableItem {
  [x: string]: any;
  /** Legacy per-row actions array */
  actions?: IActionBuilderResult<any>[];
}

export type TableColPartial = Partial<
  ITableColumns & {
    predefined?: boolean;
  }
>;

/** Configuration for empty/not-found state with optional call-to-action button */
export interface TableEmptyAction {
  /** Icon CSS class displayed above the message */
  icon?: string;
  /** Main message text */
  text: string | Ref<string> | ComputedRef<string>;
  /** Action button label (if omitted, no button is shown) */
  action?: string | Ref<string> | ComputedRef<string>;
  /** Action button click handler */
  clickHandler?: () => void;
}

export type { MaybeRef } from "vue";

/** Shared props for editable cell formatters (CellDefault, CellNumber, CellMoney) */
export interface CellEditableProps {
  /** Whether the cell is in edit mode */
  editable?: boolean;
  /** Display label shown when not editing */
  label?: string;
  /** Field name used for validation and update events */
  fieldName?: string;
  /** Unique field identifier for the form */
  fieldId?: string;
  /** Validation rules map (field name → validator) */
  rules?: Record<string, unknown>;
  /** Row index in the table (for identifying the row in events) */
  rowIndex?: number;
}

/** Emits for editable cell formatters */
export interface CellEditableEmits {
  /** Emitted when cell value changes */
  update: [payload: { field: string; value: unknown }];
  /** Emitted when cell loses focus */
  blur: [payload: { row: number | undefined; field: string }];
}

// ============================================================================
// VcColumn Types (Declarative Column API)
// ============================================================================

/** Cell type options matching existing cell formatters */
export type VcColumnCellType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "date-ago"
  | "time"
  | "datetime"
  | "image"
  | "link"
  | "html"
  | "status"
  | "status-icon";

// === Declarative Filter Configuration Types ===

/** Supported filter UI types for column and global filters */
export type FilterType = "text" | "select" | "dateRange" | "none";

/** Option item for select-type filters */
export interface FilterOption {
  /** Value sent to the backend API */
  value: string | number;
  /** Human-readable label shown in the dropdown */
  label: string;
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
 * - `true` — text filter using column id as field name
 * - `"fieldName"` — text filter using the specified field name
 * - `SelectFilterConfig` — dropdown filter
 * - `DateRangeFilterConfig` — date range picker
 */
export type ColumnFilterConfig = boolean | string | SelectFilterConfig | SelectFilterWithFieldConfig | DateRangeFilterConfig;

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

/**
 * VcColumn Props Interface — declarative column definition for VcDataTable.
 *
 * @example
 * ```vue
 * <VcColumn id="name" field="name" title="Name" sortable :width="200" />
 * <VcColumn id="price" field="price" title="Price" type="money" align="end" />
 * ```
 */
export interface VcColumnProps {
  // === Identity ===
  /** Unique column identifier (must be unique within the table) */
  id: string;
  /** Data field path to read from each item (default: same as `id`) */
  field?: string;

  // === Display ===
  /** Column header title text */
  title?: string;
  /** Cell formatter type — determines how cell value is rendered */
  type?: VcColumnCellType;
  /** Field name to read currency code from (used with `type="money"`, default: `"currency"`) */
  currencyField?: string;
  /** Date/number format string (used with date/number types, e.g. `"DD.MM.YYYY"`) */
  format?: string;

  // === Sizing ===
  /** Column width in px or CSS string (e.g. `200`, `"150px"`) */
  width?: string | number;
  /** Minimum column width (default: `60px`) */
  minWidth?: string | number;
  /** Maximum column width */
  maxWidth?: string | number;

  // === Alignment ===
  /** Cell text alignment */
  align?: "start" | "center" | "end";
  /** Header text alignment (default: same as `align`) */
  headerAlign?: "start" | "center" | "end";

  // === Sorting ===
  /** Whether the column is sortable (shows sort icon on hover) */
  sortable?: boolean;
  /** Override backend field name for sorting (default: column `id`) */
  sortField?: string;

  // === Filtering ===
  /** Declarative filter configuration. Use `true` for text, `"fieldName"` for text with custom field, or object for select/dateRange */
  filter?: ColumnFilterConfig;
  /** Override backend field name for filtering (default: column `id`) */
  filterField?: string;
  /** Placeholder text for the filter input */
  filterPlaceholder?: string;

  // === Visibility ===
  /** Whether the column is visible (default: `true`). Hidden columns can be toggled via column switcher */
  visible?: boolean;
  /** If `true`, column stays visible even when `showAllColumns=false` (e.g. when blade narrows) */
  alwaysVisible?: boolean;

  // === Editing ===
  /** Whether the cell is editable (enables inline edit on click) */
  editable?: boolean;
  /** Validation rules for the editable cell (field name → validator) */
  rules?: Record<string, unknown>;

  // === Styling ===
  /** Custom CSS class applied to the entire column (header + body cells) */
  class?: string;
  /** Custom CSS class applied only to the header cell */
  headerClass?: string;
  /** Custom CSS class applied only to body cells */
  bodyClass?: string;
  /** Number of lines to clamp cell text to (`0` = no clamp, default: `2`) */
  lineClamp?: number;

  // === Special modes ===
  /** Renders a selection checkbox column (`"single"` = radio, `"multiple"` = checkbox) */
  selectionMode?: "single" | "multiple";
  /** Renders row edit save/cancel buttons in this column */
  rowEditor?: boolean;
  /** Renders a drag handle for row reordering */
  rowReorder?: boolean;
  /** Renders an expand/collapse toggle for row expansion */
  expander?: boolean;

  // === Mobile ===
  /**
   * @deprecated Use `mobileRole` instead. Kept for backward compatibility.
   * Position in mobile card layout (legacy API).
   */
  mobilePosition?: "status" | "image" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /**
   * Mobile card role — determines how column is displayed on mobile.
   * - `"title"`: Primary identifier, displayed at top (full width, bold)
   * - `"image"`: Visual element, displayed on left side
   * - `"field"`: Data with label, auto-distributed in 2x2 grid (max 4)
   * - `"status"`: Status badge, displayed at bottom (multiple allowed)
   */
  mobileRole?: MobileCardRole;
  /** Whether column is visible on mobile (default: `false` — hidden unless `mobileRole` is specified) */
  mobileVisible?: boolean;
}

/** Slot props for VcColumn's `#body` slot (custom cell rendering) */
export interface VcColumnBodySlotProps<T = any> {
  /** Row data object */
  data: T;
  /** Column field name */
  field: string;
  /** Row index in the visible items array */
  index: number;
}

/** Slot props for VcColumn's `#editor` slot (inline edit mode) */
export interface VcColumnEditorSlotProps<T = any> {
  /** Row data object (mutable — changes are tracked) */
  data: T;
  /** Column field name */
  field: string;
  /** Row index in the visible items array */
  index: number;
  /** Callback to commit the edited value */
  editorCallback: (value: unknown) => void;
}

/** Slot props for VcColumn's `#header` slot (custom header rendering) */
export interface VcColumnHeaderSlotProps {
  /** Column props for the current column */
  column: VcColumnProps;
}

/** Slot props for VcColumn's `#filter` slot (custom filter UI) */
export interface VcColumnFilterSlotProps {
  /** Column field name */
  field: string;
  /** Current filter value */
  value: FilterValue;
  /** Update the filter value */
  updateValue: (val: unknown) => void;
  /** Start date for date range filters */
  startDate: string;
  /** Update the start date */
  updateStartDate: (val: string) => void;
  /** End date for date range filters */
  endDate: string;
  /** Update the end date */
  updateEndDate: (val: string) => void;
  /** Apply the current filter value */
  applyFilter: () => void;
  /** Clear the filter (reset to default) */
  clearFilter: () => void;
}

// ============================================================================
// VcDataTable Types (Declarative Table API)
// ============================================================================

/** Sort metadata for multi-sort mode */
export interface SortMeta {
  /** Field name to sort by */
  field: string;
  /** Sort direction: `1` = ascending, `-1` = descending, `0` = unsorted */
  order: 1 | -1 | 0;
}

/**
 * VcDataTable Props Interface — core props for the compositional data table.
 *
 * @example
 * ```vue
 * <VcDataTable :items="products" data-key="id" :loading="isLoading">
 *   <VcColumn id="name" field="name" title="Name" sortable />
 *   <VcColumn id="price" field="price" title="Price" type="money" />
 * </VcDataTable>
 * ```
 */
export interface VcDataTableProps<T = any> {
  // === Data ===
  /** Array of data items to display in the table */
  items: T[];
  /** Field name used as unique row identifier (default: `"id"`) */
  dataKey?: string;

  // === Selection ===
  /** Currently selected item(s) — use with `v-model:selection` */
  selection?: T | T[];
  /** Row selection mode: `"single"` (radio) or `"multiple"` (checkbox) */
  selectionMode?: "single" | "multiple";
  /** Per-row function to disable selection (grayed-out checkbox) */
  isRowSelectable?: (data: T) => boolean;
  /** How to compare items for selection: `"equals"` (deep) or `"field"` (by `dataKey`) */
  compareSelectionBy?: "equals" | "field";
  /** Whether "select all" header checkbox is active */
  selectAll?: boolean;

  // === Editing ===
  /** Inline edit mode: `"cell"` for individual cells, `"row"` for full row editing, `"inline"` for all editable cells always active */
  editMode?: "cell" | "row" | "inline";
  /** Currently editing rows — use with `v-model:editingRows` */
  editingRows?: T[];

  // === Sorting ===
  /** Currently sorted field name — use with `v-model:sortField` */
  sortField?: string;
  /** Current sort direction: `1` = asc, `-1` = desc, `0` = unsorted */
  sortOrder?: 1 | -1 | 0;
  /** Sort mode: `"single"` (one column) or `"multiple"` (multi-column sort) */
  sortMode?: "single" | "multiple";
  /** Multi-sort metadata array — use with `v-model:multiSortMeta` */
  multiSortMeta?: SortMeta[];
  /** Allow removing sort by clicking a sorted column again (3-state: asc → desc → none) */
  removableSort?: boolean;

  // === Visual ===
  /** Alternate row background colors for readability */
  striped?: boolean;
  /** Add border around the table */
  bordered?: boolean;
  /** Show grid lines between cells */
  showGridlines?: boolean;
  /** Highlight rows on mouse hover (default: `true`) */
  rowHover?: boolean;
  /** Row density: `"small"`, `"normal"`, or `"large"` */
  size?: "small" | "normal" | "large";
  /** Per-row function returning CSS class(es) for conditional row styling */
  rowClass?: (data: T) => string | object;
  /** Per-row function returning inline styles */
  rowStyle?: (data: T) => object;
  /** Visual table variant */
  variant?: "default" | "striped" | "bordered";

  // === Features ===
  /** Allow users to resize columns by dragging column borders (default: `true`) */
  resizableColumns?: boolean;
  /** Allow users to reorder columns by drag-and-drop */
  reorderableColumns?: boolean;
  /** Allow users to reorder rows by drag-and-drop */
  reorderableRows?: boolean;
  /** Enable horizontal/vertical scrolling within the table container */
  scrollable?: boolean;
  /** Fixed height for the scroll container (e.g. `"400px"`, `"flex"`) */
  scrollHeight?: string;

  // === State ===
  /** Key for persisting table state (column widths, order, sort, filters) to storage */
  stateKey?: string;
  /** Storage type for state persistence: `"local"` (localStorage) or `"session"` (sessionStorage) */
  stateStorage?: "session" | "local";

  // === Loading ===
  /** Show loading overlay on the table */
  loading?: boolean;

  // === Row Actions ===
  /** Per-row function returning action items (buttons/menu items) for the row */
  rowActions?: (item: T) => TableAction[];
  /**
   * Display mode for row actions:
   * - `"inline"`: Quick action buttons on hover + overflow dropdown (Google Drive style)
   * - `"dropdown"`: All actions in dropdown menu triggered by three dots
   * @default "inline"
   */
  rowActionsMode?: "inline" | "dropdown";
  /**
   * Maximum number of quick action buttons to show in inline mode.
   * Actions beyond this limit go into the overflow dropdown.
   * @default 4
   */
  maxQuickActions?: number;

  // === Expandable Rows ===
  /** Currently expanded rows — use with `v-model:expandedRows` */
  expandedRows?: T[];
  /** Icon CSS class for expanded row toggle (default: `"fas fa-chevron-down"`) */
  expandedRowIcon?: string;
  /** Icon CSS class for collapsed row toggle (default: `"fas fa-chevron-right"`) */
  collapsedRowIcon?: string;

  // === Row Grouping ===
  /** Field(s) to group rows by */
  groupRowsBy?: string | string[];
  /** How groups are displayed: `"subheader"` (separate header row) or `"rowspan"` (merged cells) */
  rowGroupMode?: "subheader" | "rowspan";
  /** Allow collapsing/expanding row groups */
  expandableRowGroups?: boolean;
  /** Currently expanded group keys — use with `v-model:expandedRowGroups` */
  expandedRowGroups?: string[];
}

/**
 * Extended VcDataTable props with additional features
 * (Pull-to-refresh, Select All API, Row CRUD)
 */

/**
 * Configuration for the built-in pagination rendered below the table scroll area.
 *
 * @example
 * ```vue
 * <VcDataTable :pagination="{ currentPage: page, pages: totalPages }" @pagination-click="onPage" />
 * ```
 */
export interface DataTablePagination {
  /** Currently active page (1-based) */
  currentPage: number;
  /** Total number of pages */
  pages: number;
  /** Items per page — informational, for future "Showing 1-20 of 500" */
  pageSize?: number;
  /** Visual variant passed to VcPagination */
  variant?: "default" | "minimal";
}

export interface VcDataTableExtendedProps<T = any> extends VcDataTableProps<T> {
  /** Enable pull-to-refresh on mobile view */
  pullToRefresh?: boolean;
  /** Custom text for pull-to-refresh states */
  pullToRefreshText?: PullToRefreshTextConfig;
  /** Total count of items (for pagination - used by "select all" feature) */
  totalCount?: number;
  /** Label for the total counter (default: i18n "Totals:") */
  totalLabel?: string;
  /** v-model for "select all" state (includes non-visible items) */
  selectAllActive?: boolean;
  /** Row addition configuration */
  addRow?: AddRowConfig;
  /** Validation rules for inline editing: field → validator function returning error string or `true` */
  validationRules?: Record<string, (value: unknown, row: T) => string | true>;
  /**
   * Pagination configuration. When provided, VcPagination is rendered below the scroll area.
   * Omit to hide pagination entirely.
   */
  pagination?: DataTablePagination;
  /** Enables infinite scroll — emits `load-more` when user scrolls near the bottom */
  infiniteScroll?: boolean;
  /** Distance in px from bottom to trigger load-more (default: 100) */
  infiniteScrollDistance?: number;
  /** Global filter configurations shown in a separate panel */
  globalFilters?: GlobalFilterConfig[];
  /**
   * Show column visibility switcher in the toolbar.
   * - `true` or `'auto'` — show declared VcColumns + auto-discovered columns from `items` keys
   * - `'defined'` — only show declared VcColumns (no auto-discovery)
   * - `false` — no column switcher
   */
  columnSwitcher?: boolean | "auto" | "defined";
  /** Show search bar above the table */
  searchable?: boolean;
  /** v-model for search input value */
  searchValue?: string;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Debounce delay in ms for the search emit (default: 300) */
  searchDebounce?: number;
  /**
   * When `true` (default), all visible columns are shown.
   * When `false`, only columns with `alwaysVisible` are displayed —
   * useful when the table is narrowed (e.g. a second blade opens).
   */
  showAllColumns?: boolean;
}

/** VcDataTable Emits — all events emitted by VcDataTable */
export interface VcDataTableEmits<T = any> {
  // === Selection ===
  /** v-model update for selected item(s) */
  "update:selection": [value: T | T[]];
  /** v-model update for "select all" checkbox state */
  "update:selectAll": [value: boolean];
  /** Emitted when a row is selected (click or checkbox) */
  "row-select": [event: { data: T; originalEvent: Event }];
  /** Emitted when a row is deselected */
  "row-unselect": [event: { data: T; originalEvent: Event }];
  /** Emitted when "select all" selects all visible rows */
  "row-select-all": [event: { data: T[]; originalEvent: Event }];
  /** Emitted when "select all" deselects all visible rows */
  "row-unselect-all": [event: { data: T[]; originalEvent: Event }];

  // === Editing ===
  /** v-model update for currently editing rows */
  "update:editingRows": [value: T[]];
  /** Emitted when a cell enters edit mode (click on editable cell) */
  "cell-edit-init": [event: { data: T; field: string; index: number }];
  /** Emitted when a cell edit is completed (value committed) */
  "cell-edit-complete": [event: { data: T; field: string; newValue: unknown; index: number }];
  /** Emitted when a cell edit is cancelled (Escape or blur) */
  "cell-edit-cancel": [event: { data: T; field: string; index: number }];
  /** Emitted when row edit mode is initiated */
  "row-edit-init": [event: { data: T; index: number }];
  /** Emitted when row edits are saved */
  "row-edit-save": [event: { data: T; newData: T; index: number }];
  /** Emitted when row edits are cancelled */
  "row-edit-cancel": [event: { data: T; index: number }];

  // === Sorting ===
  /** v-model update for the sorted field name */
  "update:sortField": [value: string];
  /** v-model update for the sort direction */
  "update:sortOrder": [value: number];
  /** v-model update for multi-sort metadata */
  "update:multiSortMeta": [value: SortMeta[]];
  /** Emitted when sort changes — use for backend sorting */
  sort: [event: { sortField?: string; sortOrder?: number; multiSortMeta?: SortMeta[] }];

  // === Filtering ===
  /** Emitted when filter values change — flat payload ready for backend API */
  filter: [event: { filters: Record<string, unknown>; filteredValue: T[] }];

  // === Row Interactions ===
  /** Emitted when a row is clicked */
  "row-click": [event: { data: T; index: number; originalEvent: Event }];
  /** Emitted when a row is double-clicked */
  "row-dblclick": [event: { data: T; index: number; originalEvent: Event }];
  /** Emitted when a row is right-clicked (context menu) */
  "row-contextmenu": [event: { data: T; index: number; originalEvent: Event }];

  // === Reorder ===
  /** Emitted when rows are reordered via drag-and-drop */
  "row-reorder": [event: { dragIndex: number; dropIndex: number; value: T[] }];
  /** Emitted when columns are reordered via drag-and-drop */
  "column-reorder": [event: { dragIndex: number; dropIndex: number }];
  /** Emitted when a column resize operation ends */
  "column-resize-end": [event: { element: HTMLElement; delta: number }];

  // === State ===
  /** Emitted when table state is saved to storage */
  "state-save": [state: object];
  /** Emitted when table state is restored from storage */
  "state-restore": [state: object];

  // === Expandable Rows ===
  /** v-model update for currently expanded rows */
  "update:expandedRows": [value: T[]];
  /** Emitted when a row is expanded */
  "row-expand": [event: { data: T; originalEvent: Event }];
  /** Emitted when a row is collapsed */
  "row-collapse": [event: { data: T; originalEvent: Event }];

  // === Row Grouping ===
  /** v-model update for currently expanded row groups */
  "update:expandedRowGroups": [value: string[]];
  /** Emitted when a row group is expanded */
  "rowgroup-expand": [event: { data: string; originalEvent: Event }];
  /** Emitted when a row group is collapsed */
  "rowgroup-collapse": [event: { data: string; originalEvent: Event }];

  // === Infinite Scroll ===
  /** Emitted when user scrolls near the bottom of the table (requires `infiniteScroll` prop) */
  "load-more": [];

  // === Pagination ===
  /** Emitted when a page button is clicked in the built-in pagination */
  "pagination-click": [page: number];

  // === Search ===
  /** v-model update for search input value */
  "update:searchValue": [value: string];
  /** Emitted (debounced) when search value changes — use for backend filtering */
  search: [value: string];
}

/** VcDataTable Slots — named slots available in VcDataTable */
export interface VcDataTableSlots<T = any> {
  /** Default slot for VcColumn definitions */
  default: () => VNode[];

  /** Custom content above the table (after search bar, before column headers) */
  header: () => VNode[];
  /** Custom content below the table (after pagination) */
  footer: () => VNode[];

  /** Additional action buttons in the toolbar (next to search/filters) */
  "toolbar-actions": () => VNode[];

  /** Custom empty state when no data items exist */
  empty: () => VNode[];
  /** Custom loading overlay/skeleton */
  loading: () => VNode[];

  /** Custom content rendered when a row is expanded (requires `expander` column) */
  expansion: (props: { data: T; index: number }) => VNode[];

  /** Custom group header row (when using `groupRowsBy`) */
  groupheader: (props: { data: T; index: number }) => VNode[];
  /** Custom group footer row (when using `groupRowsBy`) */
  groupfooter: (props: { data: T; index: number }) => VNode[];

  /** Custom pagination UI — overrides built-in VcPagination when `pagination` prop is provided */
  pagination: (props: { pages: number; currentPage: number; onPageClick: (page: number) => void }) => VNode[];
}

// ============================================================================
// Mobile Card View Types
// ============================================================================

/** Mobile card position slots (for explicit placement or legacy API) */
export type MobileCardPosition = "status" | "image" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Mobile card role - semantic role for mobile card display */
export type MobileCardRole = "title" | "image" | "field" | "status";

/** Field position in 2x2 grid */
export type MobileFieldPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Mobile column configuration derived from VcColumn */
export interface MobileColumnConfig {
  /** Column ID */
  id: string;
  /** Data field name */
  field?: string;
  /** Cell type for rendering */
  type?: VcColumnCellType;
  /** Position in mobile card (for fields in grid) */
  position: MobileCardPosition;
  /** Column title for label (e.g., "Price:", "Stock:") */
  label?: string;
  /** Whether this is the title field */
  isTitle?: boolean;
  /** Original column instance for slot rendering */
  column: ColumnInstance;
}

/** Mobile card layout structure (universal layout) */
export interface MobileCardLayout {
  /** Primary title column (full width, bold) */
  title?: MobileColumnConfig;
  /** Image/avatar column (left side) */
  image?: MobileColumnConfig;
  /** Field columns with labels (displayed in 2-column grid, max 4) */
  fields: MobileColumnConfig[];
  /** Status badges (multiple allowed, displayed in row at bottom) */
  statuses: MobileColumnConfig[];
}

/** Swipe action for mobile cards */
export interface MobileSwipeAction<T = unknown> {
  /** Unique action ID */
  id: string;
  /** Display title */
  title: string;
  /** Icon class (e.g., "fas fa-edit") */
  icon: string;
  /** Action type for styling */
  type?: "danger" | "success" | "warning" | "default";
  /** Whether action is disabled */
  disabled?: boolean;
  /** Click handler */
  clickHandler: (item: T, index: number) => void;
}

/** Props for DataTableMobileView component */
export interface DataTableMobileViewProps<T = any> {
  /** Data items to display */
  items: T[];
  /** Column instances from VcColumn */
  columns: ColumnInstance[];
  /** Currently selected items */
  selection?: T[];
  /** Selection mode */
  selectionMode?: "single" | "multiple";
  /** Function to check if row is selectable */
  isRowSelectable?: (data: T) => boolean;
  /** Function to generate row actions */
  rowActions?: (item: T) => TableAction[];
  /** Loading state */
  loading?: boolean;
  /** Data key field for item identification */
  dataKey: string;
  /** Empty state configuration */
  empty?: TableEmptyAction;
}

/** Props for DataTableMobileCard component */
export interface DataTableMobileCardProps<T = any> {
  /** Data item */
  item: T;
  /** Row index */
  index: number;
  /** Card layout configuration */
  layout: MobileCardLayout;
  /** Whether row is selected */
  isSelected: boolean;
  /** Whether row is selectable */
  isSelectable: boolean;
  /** Swipe actions */
  actions?: MobileSwipeAction<T>[];
  /** Selection mode (affects checkbox display) */
  selectionMode?: "single" | "multiple";
  /** Whether any items are currently selected (shows checkboxes) */
  anySelected?: boolean;
}

/** Props for MobileActionSheet component */
export interface MobileActionSheetProps<T = any> {
  /** Whether sheet is open */
  open: boolean;
  /** Sheet title */
  title?: string;
  /** Actions to display */
  actions: MobileSwipeAction<T>[];
}

/** Emits for MobileActionSheet component */
export interface MobileActionSheetEmits<T = any> {
  /** Close the sheet */
  close: [];
  /** Action was clicked */
  action: [action: MobileSwipeAction<T>];
}

/** Pull-to-refresh custom text configuration */
export interface PullToRefreshTextConfig {
  /** Custom text for "pull" state */
  pull?: string;
  /** Custom text for "release" state */
  release?: string;
  /** Custom text for "refreshing" state */
  refreshing?: string;
}

/** Add row button configuration */
export interface AddRowConfig {
  /** Show add row button */
  enabled?: boolean;
  /** Button position: 'header', 'footer', or 'none' (via slot or external) */
  position?: "header" | "footer" | "none";
  /** Button label (default: i18n "Add row") */
  label?: string;
  /** Button icon (default: "fas fa-plus") */
  icon?: string;
}

/** Row add event payload */
export interface RowAddEvent<T = any> {
  /** Default values for the new row */
  defaults?: Partial<T>;
  /** Call to prevent adding the row */
  cancel: () => void;
}

/** Row remove event payload */
export interface RowRemoveEvent<T = any> {
  /** The row data being removed */
  data: T;
  /** Row index */
  index: number;
  /** Call to prevent removing the row */
  cancel: () => void;
}

/** Edit change from useTableInlineEdit */
export interface EditChange<T = any> {
  rowIndex: number;
  row: T;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
