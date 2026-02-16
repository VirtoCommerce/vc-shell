/**
 * BaseVcDataTable - Base props and types for VcDataTable
 *
 * Inspired by PrimeVue's BaseDataTable pattern for clean separation of concerns.
 * All props are defined here for maintainability and documentation.
 */
import type { PropType, ExtractPropTypes } from "vue";
import type {
  SortMeta,
  DataTableRowActionItem,
} from "../types";

/**
 * DataTable variants for visual styling
 */
export type DataTableVariant = "default" | "striped" | "bordered" | "condensed";

/**
 * DataTable size options
 */
export type DataTableSize = "small" | "normal" | "large";

/**
 * Selection mode options
 */
export type SelectionMode = "single" | "multiple";

/**
 * Edit mode options
 */
export type EditMode = "cell" | "row";

/**
 * Sort mode options
 */
export type SortMode = "single" | "multiple";

/**
 * State storage options
 */
export type StateStorage = "local" | "session";

/**
 * Selection comparison method
 */
export type CompareSelectionBy = "equals" | "field";

/**
 * Base props definition for VcDataTable
 * Organized by category for clarity
 */
export const baseVcDataTableProps = {
  // ============================================================================
  // DATA
  // ============================================================================

  /**
   * Array of data items to display
   */
  items: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },

  /**
   * Unique key field in each data item for tracking
   * @default "id"
   */
  dataKey: {
    type: [String, Function] as PropType<string | ((item: unknown) => string)>,
    default: "id",
  },

  // ============================================================================
  // SELECTION
  // ============================================================================

  /**
   * Currently selected item(s). Use v-model:selection
   */
  selection: {
    type: [Array, Object] as PropType<unknown | unknown[]>,
    default: undefined,
  },

  /**
   * Selection mode: 'single' or 'multiple'
   */
  selectionMode: {
    type: String as PropType<SelectionMode>,
    default: undefined,
  },

  /**
   * Function to determine if a row can be selected
   */
  isRowSelectable: {
    type: Function as PropType<(item: unknown) => boolean>,
    default: undefined,
  },

  /**
   * Method to compare selection: 'equals' (deep) or 'field' (by dataKey)
   * @default "equals"
   */
  compareSelectionBy: {
    type: String as PropType<CompareSelectionBy>,
    default: "equals",
  },

  /**
   * Controlled select-all state. Use v-model:selectAll
   */
  selectAll: {
    type: Boolean,
    default: false,
  },

  // ============================================================================
  // EDITING
  // ============================================================================

  /**
   * Edit mode: 'cell' for individual cells, 'row' for entire rows
   */
  editMode: {
    type: String as PropType<EditMode>,
    default: undefined,
  },

  /**
   * Array of rows currently being edited (for row edit mode)
   * Use v-model:editingRows
   */
  editingRows: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },

  // ============================================================================
  // SORTING
  // ============================================================================

  /**
   * Current sort field. Use v-model:sortField
   */
  sortField: {
    type: String,
    default: undefined,
  },

  /**
   * Current sort order: 1 (asc), -1 (desc), 0 (none)
   * Use v-model:sortOrder
   */
  sortOrder: {
    type: Number as PropType<1 | -1 | 0>,
    default: 0,
  },

  /**
   * Sort mode: 'single' or 'multiple'
   * @default "single"
   */
  sortMode: {
    type: String as PropType<SortMode>,
    default: "single",
  },

  /**
   * Multi-column sort metadata. Use v-model:multiSortMeta
   */
  multiSortMeta: {
    type: Array as PropType<SortMeta[]>,
    default: () => [],
  },

  /**
   * Allow removing sort by clicking sorted column again
   * @default false
   */
  removableSort: {
    type: Boolean,
    default: false,
  },

  /**
   * Default sort order when clicking unsorted column
   * @default 1
   */
  defaultSortOrder: {
    type: Number as PropType<1 | -1>,
    default: 1,
  },

  // ============================================================================
  // STYLING & APPEARANCE
  // ============================================================================

  /**
   * Visual variant of the table
   * @default "default"
   */
  variant: {
    type: String as PropType<DataTableVariant>,
    default: "default",
  },

  /**
   * Whether to show striped rows (alternative to variant="striped")
   * @default false
   */
  striped: {
    type: Boolean,
    default: false,
  },

  /**
   * Whether to show bordered cells (alternative to variant="bordered")
   * @default false
   */
  bordered: {
    type: Boolean,
    default: false,
  },

  /**
   * Whether to show grid lines between cells
   * @default false
   */
  showGridlines: {
    type: Boolean,
    default: false,
  },

  /**
   * Whether to highlight rows on hover
   * @default true
   */
  rowHover: {
    type: Boolean,
    default: true,
  },

  /**
   * Table size: 'small', 'normal', 'large'
   * @default "normal"
   */
  size: {
    type: String as PropType<DataTableSize>,
    default: "normal",
  },

  /**
   * Function to compute row class
   */
  rowClass: {
    type: Function as PropType<(item: unknown) => string | object>,
    default: undefined,
  },

  /**
   * Function to compute row style
   */
  rowStyle: {
    type: Function as PropType<(item: unknown) => object>,
    default: undefined,
  },

  // ============================================================================
  // COLUMN FEATURES
  // ============================================================================

  /**
   * Allow resizing columns via drag
   * @default true
   */
  resizableColumns: {
    type: Boolean,
    default: true,
  },

  /**
   * Allow reordering columns via drag
   * @default false
   */
  reorderableColumns: {
    type: Boolean,
    default: false,
  },

  // ============================================================================
  // ROW FEATURES
  // ============================================================================

  /**
   * Allow reordering rows via drag
   * @default false
   */
  reorderableRows: {
    type: Boolean,
    default: false,
  },

  /**
   * Function to build row actions menu
   */
  rowActions: {
    type: Function as PropType<(item: unknown) => DataTableRowActionItem[]>,
    default: undefined,
  },

  // ============================================================================
  // EXPANDABLE ROWS
  // ============================================================================

  /**
   * Array of expanded row items. Use v-model:expandedRows
   */
  expandedRows: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },

  /**
   * Icon class for expanded row toggler
   * @default "fas fa-chevron-down"
   */
  expandedRowIcon: {
    type: String,
    default: "fas fa-chevron-down",
  },

  /**
   * Icon class for collapsed row toggler
   * @default "fas fa-chevron-right"
   */
  collapsedRowIcon: {
    type: String,
    default: "fas fa-chevron-right",
  },

  // ============================================================================
  // ROW GROUPING
  // ============================================================================

  /**
   * Field(s) to group rows by
   */
  groupRowsBy: {
    type: [String, Array] as PropType<string | string[]>,
    default: undefined,
  },

  /**
   * Row grouping mode: 'subheader' or 'rowspan'
   */
  rowGroupMode: {
    type: String as PropType<"subheader" | "rowspan">,
    default: undefined,
  },

  /**
   * Whether row groups can be expanded/collapsed
   * @default false
   */
  expandableRowGroups: {
    type: Boolean,
    default: false,
  },

  /**
   * Array of expanded group keys. Use v-model:expandedRowGroups
   */
  expandedRowGroups: {
    type: Array as PropType<string[]>,
    default: () => [],
  },

  // ============================================================================
  // SCROLLING & VIRTUALIZATION
  // ============================================================================

  /**
   * Whether the table is scrollable
   * @default false
   */
  scrollable: {
    type: Boolean,
    default: false,
  },

  /**
   * Height of scrollable area (e.g., '400px', 'flex')
   */
  scrollHeight: {
    type: String,
    default: undefined,
  },

  // ============================================================================
  // STATE PERSISTENCE
  // ============================================================================

  /**
   * Unique key for state persistence
   */
  stateKey: {
    type: String,
    default: undefined,
  },

  /**
   * Storage type for state persistence
   * @default "local"
   */
  stateStorage: {
    type: String as PropType<StateStorage>,
    default: "local",
  },

  // ============================================================================
  // LOADING
  // ============================================================================

  /**
   * Whether the table is in loading state
   * @default false
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * Icon class for loading indicator
   */
  loadingIcon: {
    type: String,
    default: undefined,
  },

  // ============================================================================
  // LAZY LOADING
  // ============================================================================

  /**
   * Whether to use lazy loading (server-side data)
   * @default false
   */
  lazy: {
    type: Boolean,
    default: false,
  },

  /**
   * Total records count for lazy loading
   */
  totalRecords: {
    type: Number,
    default: undefined,
  },
} as const;

/**
 * Extracted props type for TypeScript
 */
export type BaseVcDataTableProps = ExtractPropTypes<typeof baseVcDataTableProps>;

/**
 * Events emitted by VcDataTable
 */
export const vcDataTableEmits = [
  // Selection
  "update:selection",
  "update:selectAll",
  "row-select",
  "row-unselect",
  "row-select-all",
  "row-unselect-all",
  "select-all-change",

  // Editing
  "update:editingRows",
  "cell-edit-init",
  "cell-edit-complete",
  "cell-edit-cancel",
  "row-edit-init",
  "row-edit-save",
  "row-edit-cancel",

  // Sorting
  "update:sortField",
  "update:sortOrder",
  "update:multiSortMeta",
  "sort",

  // Filtering
  "filter",

  // Row interactions
  "row-click",
  "row-dblclick",
  "row-contextmenu",

  // Row reorder
  "row-reorder",

  // Expandable rows
  "update:expandedRows",
  "row-expand",
  "row-collapse",

  // Row grouping
  "update:expandedRowGroups",
  "rowgroup-expand",
  "rowgroup-collapse",

  // Column features
  "column-resize-end",
  "column-reorder",

  // State persistence
  "state-save",
  "state-restore",

  // Value change (processed data changed)
  "value-change",
] as const;

export default baseVcDataTableProps;
