<template>
  <div
    ref="tableRootRef"
    v-loading:49="loading"
    class="vc-data-table"
    :aria-busy="loading || undefined"
  >
    <!-- Header slot -->
    <div
      v-if="$slots.header"
      class="vc-data-table__header"
    >
      <slot name="header" />
    </div>

    <!-- Search bar + Global Filters + Column Switcher (combined toolbar) -->
    <TableSearchHeader
      v-if="searchable || globalFilters?.length || $slots['search-header-actions']"
      :searchable="searchable"
      :model-value="internalSearchValue"
      :placeholder="searchPlaceholder"
      @update:model-value="handleSearchInput"
    >
      <template #actions>
        <GlobalFiltersButton
          v-if="globalFilters?.length"
          ref="globalFiltersButtonRef"
          :active-count="globalActiveFilterCount"
          @click="showGlobalFiltersPanel = !showGlobalFiltersPanel"
        />
        <!-- Custom actions from parent (e.g. adapter's filter button) -->
        <slot name="search-header-actions" />
      </template>
    </TableSearchHeader>

    <!-- Global Filters Panel (separate, teleported to body) -->
    <GlobalFiltersPanel
      v-if="globalFilters?.length"
      :filters="globalFilters"
      :model-value="globalFilterValues"
      :show="showGlobalFiltersPanel"
      :anchor-ref="globalFiltersButtonEl"
      @update:model-value="globalFilterValues = $event"
      @update:show="showGlobalFiltersPanel = $event"
      @apply="handleGlobalFilterApply"
      @clear="handleGlobalFilterClear"
    />

    <!-- Column Switcher Panel (separate, teleported to body) -->
    <TableColumnSwitcher
      v-if="columnSwitcher"
      :columns="switcherColumns"
      :visible-columns="switcherVisibleColumnIds"
      :show="showColumnSwitcherPanel"
      :anchor-ref="columnSwitcherButtonEl"
      @update:visible-columns="handleColumnVisibilityChange"
      @update:show="showColumnSwitcherPanel = $event"
    />

    <!-- Add Row Button (header position) -->
    <TableAddRowButton
      v-if="showAddRowButton && addRowPosition === 'header'"
      :label="addRowLabel"
      :icon="addRowIcon"
      @add="handleAddRow()"
    />

    <!-- Selection Banner -->
    <slot
      name="selection-banner"
      :count="selection.internalSelection.value.length"
      :total-count="props.totalCount"
      :is-select-all="selection.isSelectAllActive.value"
      :select-all="selection.selectAll"
      :clear-selection="selection.clearSelection"
    >
      <TableSelectAllBar
        v-if="effectiveSelectionMode === 'multiple'"
        :selection-count="selection.internalSelection.value.length"
        :total-count="props.totalCount ?? 0"
        :all-selected="selection.isSelectAllActive.value"
        :show-select-all-prompt="selection.showSelectAllChoice.value"
        @select-all="selection.selectAll"
        @cancel="selection.clearSelection"
      />
    </slot>

    <!-- Desktop: Main table content -->
    <div
      v-if="!isMobileView"
      ref="tableContainerRef"
      class="vc-data-table__content"
      :style="scrollHeight ? { height: scrollHeight } : undefined"
    >
      <Table :variant="computedVariant">
        <DataTableHeader
          ref="dataTableHeaderRef"
          :columns="safeColumns"
          :show-drag-handle="showRowDragHandle"
          :show-selection-cell="hasSelectionColumn && !isSelectionViaColumn"
          :selection-mode="effectiveSelectionMode"
          :all-selected="selection.allSelected.value"
          :some-selected="selection.someSelected.value"
          :get-sort-direction="sort.getSortDirection"
          :get-sort-index="sort.getSortIndex"
          :get-column-width="cols.getEffectiveColumnWidth"
          :get-header-align="cols.getHeaderAlign"
          :get-header-style="cols.getHeaderStyle"
          :is-column-resizable="cols.isColumnResizable"
          :is-column-reorderable="cols.isColumnReorderable"
          :is-last-resizable="cols.isLastResizableColumn"
          :get-sort-field="cols.getSortField"
          :set-header-ref="cols.setHeaderRef"
          :show-filter="showColumnFilter"
          :get-filter-type="getColumnFilterType"
          :get-filter-options="getColumnFilterOptions"
          :is-filter-multiple="isColumnFilterMultiple"
          :get-range-fields="getColumnRangeFields"
          :get-filter-value="getColumnFilterValue"
          :show-column-switcher="!!columnSwitcher"
          :column-switcher-active="showColumnSwitcherPanel"
          @select-all="handleSelectAllChange"
          @sort="handleSort"
          @resize-start="handleResizeStart"
          @reorder-start="handleColumnDragStart"
          @reorder-over="handleColumnDragOver"
          @reorder-drop="(_, event) => handleColumnDrop(event)"
          @filter-apply="handleColumnFilterApply"
          @filter-clear="handleColumnFilterClear"
          @column-switcher-click="showColumnSwitcherPanel = !showColumnSwitcherPanel"
        />

        <!-- Body -->
        <DataTableBody
          :items="displayItems"
          :loading="loading"
          :empty-title="emptyTitle"
          :empty-description="emptyDescription"
          :loading-text="loadingText"
          :grouping-enabled="rowGrouping.isGroupingEnabled.value"
          :grouped-data="rowGrouping.groupedData.value"
          :expandable-row-groups="expandableRowGroups"
          :is-group-expanded="rowGrouping.isGroupExpanded"
          :get-item-group-key="rowGrouping.getItemGroupKey"
          :get-global-index="getGlobalIndex"
          :get-item-key="getItemKey"
          :get-row-props="(getRowProps as any)"
          @scroll="handleContentScroll"
          @group-toggle="(key, e) => rowGrouping.toggleGroupExpansion(key, e!)"
          @row-click="handleRowClick"
          @row-mouseenter="handleRowMouseEnter"
          @row-mouseleave="handleRowMouseLeave"
          @selection-change="handleRowSelectionChange"
          @expand-toggle="(item, index, e) => handleExpandToggle(item, index, e!)"
          @row-edit="handleStartRowEdit"
          @row-save="handleSaveRowEdit"
          @row-cancel="handleCancelRowEdit"
          @edit-complete="handleCellEditComplete"
          @edit-cancel="handleCellEditCancel"
          @cell-value-change="handleCellValueChange"
          @cell-click="handleCellClick"
          @row-mousedown="
            (e) => {
              if (isRowReorderEnabled) onRowMouseDown(e);
            }
          "
          @row-dragstart="
            (e, item) => {
              if (isRowReorderEnabled) onRowDragStart(e, item);
            }
          "
          @row-dragover="
            (e, item) => {
              if (isRowReorderEnabled) onRowDragOver(e, item);
            }
          "
          @row-dragleave="
            (e) => {
              if (isRowReorderEnabled) onRowDragLeave(e);
            }
          "
          @row-dragend="
            (e) => {
              if (isRowReorderEnabled) onRowDragEnd(e);
            }
          "
          @row-drop="
            (e) => {
              if (isRowReorderEnabled) onRowDrop(e);
            }
          "
        >
          <template #row-actions="{ item, index }">
            <TableRowActions
              v-if="rowActions"
              :actions="rowActions(item)"
              :row-index="index"
              :mode="rowActionsMode"
              :max-quick-actions="maxQuickActions"
              @action="(action) => handleRowAction(action, item, index)"
            />
          </template>
          <template #expansion="{ data, index }">
            <slot
              name="expansion"
              :data="data"
              :index="index"
            />
          </template>
          <template
            v-if="$slots.empty"
            #empty
          >
            <slot name="empty" />
          </template>
          <template
            v-if="$slots.loading"
            #loading
          >
            <slot name="loading" />
          </template>
          <template
            v-if="$slots.groupheader"
            #groupheader="{ data, index }"
          >
            <slot
              name="groupheader"
              :data="data"
              :index="index"
            />
          </template>
          <template
            v-if="$slots.groupfooter"
            #groupfooter="{ data, index }"
          >
            <slot
              name="groupfooter"
              :data="data"
              :index="index"
            />
          </template>
        </DataTableBody>

        <!-- Footer -->
        <TableFooter v-if="$slots.footer && items && items.length">
          <slot name="footer" />
        </TableFooter>

        <!-- Add Row Button (footer position) -->
        <TableAddRowButton
          v-if="showAddRowButton && addRowPosition === 'footer'"
          :label="addRowLabel"
          :icon="addRowIcon"
          @add="handleAddRow()"
        />
      </Table>
    </div>

    <!-- Mobile: Card view with swipe actions (wrapped for scroll + pagination pinning) -->
    <div
      v-else
      class="vc-data-table__content"
    >
      <DataTableMobileView
        :items="displayItems"
        :columns="visibleColumns"
        :selection="selection.internalSelection.value"
        :selection-mode="effectiveSelectionMode"
        :is-row-selectable="props.isRowSelectable"
        :row-actions="rowActions"
        :loading="loading"
        :data-key="dataKey"
        :pull-to-refresh="pullToRefresh"
        :pull-to-refresh-text="pullToRefreshText"
        @click="handleMobileRowClick"
        @select="handleMobileRowSelect"
        @action="handleMobileRowAction"
        @refresh="emit('pull-refresh')"
      >
        <template #empty>
          <slot name="empty">
            <TableEmpty
              :title="emptyTitle"
              :description="emptyDescription"
            />
          </slot>
        </template>
      </DataTableMobileView>
    </div>

    <!-- Pagination / Total counter (outside scroll area, works for both desktop and mobile) -->
    <div
      v-if="props.pagination"
      ref="paginationRef"
      class="vc-data-table__pagination"
    >
      <span class="vc-data-table__page-info">{{ paginationRangeText }}</span>
      <!-- Pagination controls -->
      <slot
        name="pagination"
        :pages="props.pagination.pages"
        :current-page="props.pagination.currentPage"
        :on-page-click="handlePaginationClick"
      >
        <VcPagination
          :pages="props.pagination.pages"
          :current-page="props.pagination.currentPage"
          :variant="props.pagination.variant"
          :max-pages="paginationMaxPages"
          :show-first-last="paginationShowFirstLast"
          @item-click="handlePaginationClick"
        />
      </slot>
    </div>

    <!-- VcColumn renderless components (they register themselves via inject) -->
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * VcDataTable - Declarative DataTable component with VcColumn support
 *
 * Refactored to use composables for better code organization.
 * Inspired by PrimeVue DataTable architecture.
 */
import { ref, computed, provide, watch, onBeforeUnmount, toRef, useSlots, inject, type Ref, type VNode } from "vue";
import { useElementSize } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import {
  Table,
  TableFooter,
  TableEmpty,
  TableRowActions,
  DataTableHeader,
  DataTableBody,
  GlobalFiltersButton,
  GlobalFiltersPanel,
  TableColumnSwitcher,
  DataTableMobileView,
  TableAddRowButton,
  TableSearchHeader,
  TableSelectAllBar,
} from "@ui/components/organisms/vc-table/components";
import { VcPagination } from "@ui/components/molecules";
import {
  useTableRowReorder,
  useTableColumnsResize,
  useTableColumnsReorder,
  useFilterState,
  useColumnFilter,
  useTableSort,
  useTableEditing,
  useTableExpansion,
  useTableSelectionV2,
  useTableColumns,
  useTableRowGrouping,
  useTableInlineEdit,
  useDataTableState,
} from "@ui/components/organisms/vc-table/composables";
import { ColumnCollector, type ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";
import { ColumnCollectorKey, FilterContextKey, HasFlexColumnsKey, IsColumnReorderingKey } from "@ui/components/organisms/vc-table/keys";
import { IsMobileKey } from "@framework/injection-keys";
import type { VcColumnProps, VcDataTableExtendedProps, FilterValue, EditChange, TableAction, SortMeta } from "@ui/components/organisms/vc-table/types";
import type { DataTablePersistedState } from "@ui/components/organisms/vc-table/composables";

const props = withDefaults(defineProps<VcDataTableExtendedProps<T>>(), {
  items: () => [],
  dataKey: "id",
  selectionMode: undefined,
  isRowSelectable: undefined,
  selectAll: false,
  editMode: undefined,
  sortField: undefined,
  sortOrder: 0,
  sortMode: "single",
  multiSortMeta: () => [],
  removableSort: false,
  striped: false,
  bordered: false,
  showGridlines: false,
  rowHover: true,
  size: "normal",
  variant: "default",
  resizableColumns: true,
  reorderableColumns: false,
  reorderableRows: false,
  showAllColumns: true,
  scrollable: false,
  scrollHeight: undefined,
  loading: false,
  expandedRows: () => [],
  expandedRowIcon: "fas fa-chevron-down",
  collapsedRowIcon: "fas fa-chevron-right",
  groupRowsBy: undefined,
  rowGroupMode: "subheader",
  expandableRowGroups: false,
  expandedRowGroups: undefined,
  rowActionsMode: "inline",
  maxQuickActions: 4,
  pullToRefresh: false,
  pullToRefreshText: undefined,
  totalCount: undefined,
  totalLabel: undefined,
  selectAllActive: false,
  addRow: undefined,
  validationRules: undefined,
  pagination: undefined,
  infiniteScroll: false,
  infiniteScrollDistance: 100,
  globalFilters: undefined,
  columnSwitcher: false,
  stateStorage: "local",
  searchable: false,
  searchValue: undefined,
  searchPlaceholder: "Search...",
  searchDebounce: 300,
});

// Emits
const emit = defineEmits<{
  // === Selection ===
  /** v-model update for selected item(s) */
  "update:selection": [value: T | T[]];
  /** v-model update for the "select all" checkbox state */
  "update:selectAll": [value: boolean];
  /** Emitted when a row is selected (click or checkbox) */
  "row-select": [event: { data: T; originalEvent: Event }];
  /** Emitted when a row is deselected */
  "row-unselect": [event: { data: T; originalEvent: Event }];
  /** Emitted when "select all" selects all visible rows */
  "row-select-all": [event: { data: T[]; originalEvent: Event }];
  /** Emitted when "select all" deselects all visible rows */
  "row-unselect-all": [event: { data: T[]; originalEvent: Event }];
  /** Emitted when the "select all" banner mode changes */
  "select-all": [event: { selected: boolean }];
  /** v-model update for "select all" active state (includes non-visible items) */
  "update:selectAllActive": [value: boolean];

  // === Editing ===
  /** v-model update for currently editing rows */
  "update:editingRows": [value: T[]];
  /** Emitted when a cell enters edit mode */
  "cell-edit-init": [event: { data: T; field: string; index: number }];
  /** Emitted when a cell edit is completed (value committed) */
  "cell-edit-complete": [event: { data: T; field: string; newValue: unknown; index: number }];
  /** Emitted when a cell edit is cancelled */
  "cell-edit-cancel": [event: { data: T; field: string; index: number }];
  /** Emitted when row edit mode is initiated */
  "row-edit-init": [event: { data: T; index: number }];
  /** Emitted when row edits are saved */
  "row-edit-save": [event: { data: T; newData: T; index: number }];
  /** Emitted when row edits are cancelled */
  "row-edit-cancel": [event: { data: T; index: number }];

  // === Inline Edit (bulk editing mode) ===
  /** Emitted when inline edit changes are saved */
  "edit-save": [event: { changes: EditChange<T>[] }];
  /** Emitted when inline editing is cancelled */
  "edit-cancel": [];
  /** Emitted when a new row is being added via inline edit */
  "row-add": [event: { defaults: Record<string, unknown>; cancel: () => void }];
  /** Emitted when a row is being removed via inline edit */
  "row-remove": [event: { data: T; index: number; cancel: () => void }];

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
  /** Emitted when a row action button/menu item is activated */
  "row-action": [event: { action: TableAction; item: T; index: number }];

  // === Reorder ===
  /** Emitted when rows are reordered via drag-and-drop */
  "row-reorder": [event: { dragIndex: number; dropIndex: number; value: T[] }];
  /** Emitted when a column resize operation ends */
  "column-resize-end": [event: { columns: { id: string; width: number }[] }];
  /** Emitted when columns are reordered via drag-and-drop */
  "column-reorder": [event: { columns: { id: string; [key: string]: unknown }[] }];

  // === State ===
  /** Emitted when table state is saved to storage */
  "state-save": [state: DataTablePersistedState];
  /** Emitted when table state is restored from storage */
  "state-restore": [state: DataTablePersistedState];

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

  // === Pull-to-Refresh ===
  /** Emitted when user triggers pull-to-refresh on mobile */
  "pull-refresh": [];

  // === Infinite Scroll ===
  /** Emitted when user scrolls near the bottom of the table */
  "load-more": [];

  // === Pagination ===
  /** Emitted when a page button is clicked in the built-in pagination */
  "pagination-click": [page: number];

  // === Search ===
  /** v-model update for search input value */
  "update:searchValue": [value: string];
  /** Emitted (debounced) when search value changes — use for backend filtering */
  search: [value: string];
}>();

defineOptions({ inheritAttrs: false });

defineSlots<{
  /** Default slot for VcColumn declarations */
  default?: () => VNode[];
  /** Custom header content above the table */
  header?: () => VNode[];
  /** Extra action buttons in the search header toolbar */
  "search-header-actions"?: () => VNode[];
  /** Custom selection banner replacing the default TableSelectAllBar */
  "selection-banner"?: (props: {
    count: number;
    totalCount: number | undefined;
    isSelectAll: boolean;
    selectAll: () => void;
    clearSelection: () => void;
  }) => VNode[];
  /** Custom content for expanded rows */
  expansion?: (props: { data: T; index: number }) => VNode[];
  /** Custom empty state content */
  empty?: () => VNode[];
  /** Custom loading state content */
  loading?: () => VNode[];
  /** Custom row group header */
  groupheader?: (props: { data: T; index: number }) => VNode[];
  /** Custom row group footer */
  groupfooter?: (props: { data: T; index: number }) => VNode[];
  /** Custom footer content below the table body */
  footer?: () => VNode[];
  /** Custom pagination replacing the default VcPagination */
  pagination?: (props: { pages: number; currentPage: number; onPageClick: (page: number) => void }) => VNode[];
}>();

// ============================================================================
// Internationalization
// ============================================================================

const { t } = useI18n({ useScope: "global" });

const emptyTitle = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY_TITLE"));
const emptyDescription = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY_DESCRIPTION"));
const loadingText = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.LOADING"));

const paginationRangeText = computed(() => {
  const p = props.pagination;
  if (!p) return "";
  const total = props.totalCount;
  if (total != null && p.pages > 0) {
    const pageSize = Math.ceil(total / p.pages);
    const start = (p.currentPage - 1) * pageSize + 1;
    const end = Math.min(start + props.items.length - 1, total);
    return `${start}\u2013${end} ${t("COMPONENTS.ORGANISMS.VC_TABLE.OF", {}, "of")} ${total}`;
  }
  return `${t("COMPONENTS.ORGANISMS.VC_TABLE.PAGE", {}, "Page")} ${p.currentPage} ${t("COMPONENTS.ORGANISMS.VC_TABLE.OF", {}, "of")} ${p.pages}`;
});

// ============================================================================
// Mobile Responsive Detection
// ============================================================================

const isMobile = inject(IsMobileKey, ref(false));
const isMobileView = computed(() => isMobile.value);

// ============================================================================
// Column Collection (Hybrid approach: slots + inject/provide)
// ============================================================================

const slots = useSlots();

// Extract columns from slot VNodes (PrimeVue-like approach)
// Convert kebab-case to camelCase for props normalization
const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Boolean props that should be converted from "" to true
const BOOLEAN_PROPS = new Set([
  "sortable",
  "editable",
  "visible",
  "alwaysVisible",
  "filter",
  "selectionMode",
  "rowEditor",
  "rowReorder",
  "expander",
  "mobileVisible",
]);

// Normalize VNode props from kebab-case to camelCase
// Also handles boolean attributes (e.g., `editable` becomes `editable: ""` in Vue, should be `true`)
const normalizeProps = (props: Record<string, unknown>): VcColumnProps => {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    const camelKey = kebabToCamel(key);
    let value = props[key];

    // Handle boolean attributes: empty string "" means true in Vue templates
    if (BOOLEAN_PROPS.has(camelKey) && value === "") {
      value = true;
    }

    normalized[camelKey] = value;
  }
  return normalized as unknown as VcColumnProps;
};

const extractColumnsFromSlots = (): ColumnInstance[] => {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];

  const columns: ColumnInstance[] = [];

  const processVNode = (vnode: VNode) => {
    // Check if this is a VcColumn component
    const type = vnode.type as any;
    if (type && (type.name === "VcColumn" || type.__name === "VcColumn")) {
      // Normalize props from kebab-case to camelCase
      const rawProps = (vnode.props || {}) as Record<string, unknown>;
      const props = normalizeProps(rawProps);
      // Ensure id exists
      if (props.id) {
        columns.push({
          instance: null as any, // Not needed for slot-based approach
          props: props,
          slots: (vnode.children || {}) as any,
        });
      }
    }
    // Check Fragment or array children
    if (Array.isArray(vnode.children)) {
      (vnode.children as VNode[]).forEach(processVNode);
    }
  };

  defaultSlot.forEach(processVNode);
  return columns;
};

// Also keep inject/provide for backward compatibility
const columnCollector = new ColumnCollector();
provide(ColumnCollectorKey, columnCollector);

const columnsVersion = ref(0);
columnCollector.onUpdate(() => {
  columnsVersion.value++;
});

// All declared columns (before visibility filtering) — from slots or collector
const declaredColumns = computed<ColumnInstance[]>(() => {
  columnsVersion.value;
  const slotCols = extractColumnsFromSlots();
  if (slotCols.length > 0) return slotCols;
  return columnCollector.getColumns();
});

// Column IDs hidden by user via TableColumnSwitcher (runtime toggle)
const hiddenColumnIds = ref<Set<string>>(new Set());
// Data-discovered columns explicitly shown by user.
// Needed to persist "Show all" for auto columns across reloads.
const shownDataDiscoveredColumnIds = ref<Set<string>>(new Set());

// Auto-discovered columns from items keys (for columnSwitcher 'auto' mode)
// These are keys in items[0] that don't have a matching declared VcColumn.
// They start hidden and can be toggled on via the switcher.
const dataDiscoveredColumns = computed<ColumnInstance[]>(() => {
  const mode = props.columnSwitcher;
  if (!mode || mode === "defined") return [];

  const items = props.items;
  if (!items || items.length === 0) return [];

  const declaredIds = new Set(declaredColumns.value.map((col) => col.props.id));
  const firstItem = items[0] as Record<string, unknown>;
  const itemKeys = Object.keys(firstItem);

  return itemKeys
    .filter((key) => !declaredIds.has(key))
    .map((key) => ({
      instance: null as any,
      props: {
        id: key,
        field: key,
        title: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      } as VcColumnProps,
      slots: {} as any,
    }));
});

// Use slot-based extraction as primary, fallback to inject
// Reuse declaredColumns instead of re-extracting from slots to avoid creating duplicate objects
const visibleColumns = computed<ColumnInstance[]>(() => {
  const baseCols = declaredColumns.value;

  const declared = baseCols.filter((col) => {
    if (col.props.visible === false) return false;
    if (hiddenColumnIds.value.size > 0 && hiddenColumnIds.value.has(col.props.id)) return false;
    // When showAllColumns=false, only show alwaysVisible columns (e.g. second blade opened)
    if (!props.showAllColumns) return !!col.props.alwaysVisible;
    return true;
  });

  // Data-discovered columns — only those explicitly enabled by user (not in hiddenColumnIds)
  const discovered = dataDiscoveredColumns.value.filter((col) => !hiddenColumnIds.value.has(col.props.id));

  return [...declared, ...discovered];
});

// ============================================================================
// Helper: Get Item Key
// ============================================================================

const getItemKey = (item: T, index: number): string => {
  const key = (item as Record<string, unknown>)[props.dataKey];
  return key?.toString() || `row-${index}`;
};

// ============================================================================
// Selection Composable
// ============================================================================

const selection = useTableSelectionV2({
  items: toRef(props, "items"),
  selection: toRef(props, "selection"),
  selectionMode: computed(() => effectiveSelectionMode.value),
  isRowSelectable: (item: T) => (props.isRowSelectable ? props.isRowSelectable(item) : true),
  dataKey: props.dataKey,
  getItemKey,
  totalCount: toRef(props, "totalCount") as Ref<number | undefined>,
  selectAllActive: toRef(props, "selectAllActive") as Ref<boolean | undefined>,
  onSelectAllChange: (active: boolean) => {
    emit("update:selectAllActive", active);
    emit("select-all", { selected: active });
  },
});

// Watch for selection changes and emit
watch(
  () => selection.internalSelection.value,
  (newSelection) => {
    emit("update:selection", effectiveSelectionMode.value === "single" ? newSelection[0] : newSelection);
  },
  { deep: true },
);

// ============================================================================
// Sort Composable
// ============================================================================

const sort = useTableSort({
  sortField: toRef(props, "sortField"),
  sortOrder: toRef(props, "sortOrder") as any,
  sortMode: toRef(props, "sortMode") as any,
  multiSortMeta: toRef(props, "multiSortMeta") as any,
  removableSort: toRef(props, "removableSort"),
  onSort: (event) => {
    if (event.sortField !== undefined) emit("update:sortField", event.sortField);
    if (event.sortOrder !== undefined) emit("update:sortOrder", event.sortOrder);
    if (event.multiSortMeta !== undefined) emit("update:multiSortMeta", event.multiSortMeta);
    emit("sort", event);
  },
});

// ============================================================================
// Editing Composable
// ============================================================================

const editing = useTableEditing({
  editMode: toRef(props, "editMode") as any,
  editingRows: toRef(props, "editingRows") as any,
  dataKey: props.dataKey,
  getItemKey,
});

// ============================================================================
// Expansion Composable
// ============================================================================

const expansion = useTableExpansion({
  expandedRows: toRef(props, "expandedRows") as any,
  getItemKey,
});

// Use a regular ref with array of keys for proper reactivity
const expandedKeysArray = ref<string[]>([]);

// Watch for expansion changes, update local ref and emit
watch(
  () => expansion.internalExpandedRows.value,
  (newExpanded) => {
    // Update array of expanded keys
    const newKeys = newExpanded.map((item) => getItemKey(item, 0));

    // Only update if keys actually changed (prevent infinite loop)
    const currentKeys = expandedKeysArray.value.join(",");
    const newKeysStr = newKeys.join(",");
    if (currentKeys !== newKeysStr) {
      expandedKeysArray.value = newKeys;
      emit("update:expandedRows", newExpanded);
    }
  },
  { deep: true, immediate: true },
);

// Helper to check if row is expanded
const isRowExpanded = (item: T): boolean => {
  const key = getItemKey(item, 0);
  return expandedKeysArray.value.includes(key);
};

// ============================================================================
// Row Grouping Composable
// ============================================================================

const rowGrouping = useTableRowGrouping({
  items: toRef(props, "items") as any,
  groupRowsBy: toRef(props, "groupRowsBy") as any,
  rowGroupMode: toRef(props, "rowGroupMode") as any,
  expandableRowGroups: toRef(props, "expandableRowGroups") as any,
  expandedRowGroups: toRef(props, "expandedRowGroups") as any,
  onExpandedRowGroupsChange: (groups) => emit("update:expandedRowGroups", groups),
  onRowGroupExpand: (event) => emit("rowgroup-expand", event),
  onRowGroupCollapse: (event) => emit("rowgroup-collapse", event),
});

// ============================================================================
// Inline Edit Composable (Row CRUD)
// ============================================================================

const inlineEdit = useTableInlineEdit({
  items: toRef(props, "items") as Ref<T[]>,
  rules: props.validationRules as Record<string, (value: unknown, row: T) => string | true> | undefined,
  onSave: (changes) => {
    emit("edit-save", { changes: changes as EditChange<T>[] });
  },
  onCancel: () => {
    emit("edit-cancel");
  },
});

// Computed for inline editing state (for use in template)
// editMode="inline" makes all editable cells always active (legacy compatibility)
const isInlineEditing = computed(() => inlineEdit.isEditing.value || props.editMode === "inline");

// Row CRUD handlers
const handleAddRow = (defaults?: Partial<T>) => {
  let cancelled = false;
  const event = {
    defaults: defaults ?? {},
    cancel: () => {
      cancelled = true;
    },
  };
  emit("row-add", event);
  if (!cancelled) {
    inlineEdit.addRow(event.defaults as Partial<T>);
  }
};

const handleRemoveRow = (rowIndex: number) => {
  if (rowIndex < 0 || rowIndex >= props.items.length) return;
  let cancelled = false;
  const event = {
    data: props.items[rowIndex],
    index: rowIndex,
    cancel: () => {
      cancelled = true;
    },
  };
  emit("row-remove", event);
  if (!cancelled) {
    inlineEdit.removeRow(rowIndex);
  }
};

// Pagination handler
const handlePaginationClick = (page: number) => {
  emit("pagination-click", page);
};

// ============================================================================
// Search
// ============================================================================

const internalSearchValue = ref(props.searchValue ?? "");
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const handleSearchInput = (value: string) => {
  internalSearchValue.value = value;
  emit("update:searchValue", value);

  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    emit("search", value);
  }, props.searchDebounce ?? 300);
};

// Watch for external changes (controlled mode)
watch(
  () => props.searchValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== internalSearchValue.value) {
      internalSearchValue.value = newVal;
    }
  },
);

// Infinite scroll handler
const handleContentScroll = (e: Event) => {
  if (!props.infiniteScroll || props.loading) return;
  const el = e.target as HTMLElement;
  const threshold = props.infiniteScrollDistance ?? 100;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
    emit("load-more");
  }
};

// Dev warning: totalCount > items.length without pagination
if (import.meta.env.DEV) {
  watch(
    () => [props.totalCount, props.items.length, props.pagination] as const,
    ([total, length, pagination]) => {
      if (!pagination && total && total > length) {
        console.warn(
          '[VcDataTable] totalCount > items.length but no "pagination" prop provided. ' +
            'Add :pagination="{ currentPage, pages }" to enable pagination.',
        );
      }
    },
    { immediate: true },
  );
}

// Add row config
const showAddRowButton = computed(() => props.addRow?.enabled === true);
const addRowPosition = computed(() => props.addRow?.position ?? "footer");
const addRowLabel = computed(() => props.addRow?.label ?? "Add row");
const addRowIcon = computed(() => props.addRow?.icon ?? "fas fa-plus");

// ============================================================================
// Row Hover for Actions
// ============================================================================
// Note: Row hover state for action visibility is managed by Table.vue's own
// tableContext provide (selectedRowIndex + setSelectedRowIndex). TableRow.vue
// calls setSelectedRowIndex on mouseenter/mouseleave, and TableRowActions.vue
// injects from the same context. No duplicate provide needed here.

// Handlers kept as no-ops to satisfy template bindings from DataTableBody.
// The actual hover state flows through Table.vue → TableRow → TableRowActions.
const handleRowMouseEnter = (_index: number) => {};
const handleRowMouseLeave = () => {};

// ============================================================================
// Selection Column Detection
// ============================================================================

const selectionColumn = computed<ColumnInstance | null>(() => {
  // Use visibleColumns which works with slot-based extraction
  return visibleColumns.value.find((col) => col.props.selectionMode !== undefined) || null;
});

const hasSelectionColumn = computed(() => props.selectionMode !== undefined || selectionColumn.value !== null);
const effectiveSelectionMode = computed<"single" | "multiple" | undefined>(() => {
  if (props.selectionMode) return props.selectionMode;
  return selectionColumn.value?.props.selectionMode;
});
const isSelectionViaColumn = computed(() => selectionColumn.value !== null);
const computedVariant = computed(() => {
  if (props.striped) return "striped";
  if (props.bordered) return "bordered";
  return props.variant;
});

// ============================================================================
// Row Reorder
// ============================================================================

const rowReorderColumn = computed<ColumnInstance | null>(() => {
  // Use visibleColumns which works with slot-based extraction
  return visibleColumns.value.find((col) => col.props.rowReorder === true) || null;
});

const isRowReorderEnabled = computed(() => props.reorderableRows || rowReorderColumn.value !== null);
const showRowDragHandle = computed(() => rowReorderColumn.value !== null);

const itemsRef = toRef(props, "items");
const {
  draggedRow,
  pendingReorder,
  reorderedItems,
  onRowMouseDown,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDragEnd,
  onRowDrop,
} = useTableRowReorder(itemsRef, (event) => emit("row-reorder", event));

// ============================================================================
// Expander Column Detection
// ============================================================================

const expanderColumn = computed<ColumnInstance | null>(() => {
  // Use visibleColumns which works with slot-based extraction
  return visibleColumns.value.find((col) => col.props.expander === true) || null;
});

const hasExpanderColumn = computed(() => expanderColumn.value !== null);

// ============================================================================
// Filtering
// ============================================================================

// Column filter helpers (declarative `filter` prop API)
const colFilter = useColumnFilter();

const {
  filterValues,
  updateFilter,
  updateRangeFilter,
  clearFilter,
  clearAllFilters,
  buildPayload,
  hasActiveFilters,
  activeFilterCount,
} = useFilterState({
  onFilterChange: (payload) => {
    emit("filter", { filters: payload, filteredValue: props.items });
  },
});

provide(FilterContextKey, {
  filterValues,
  updateFilter,
  clearFilter,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
});

// Template helpers that bridge VcColumn instances → ColumnFilter props
const showColumnFilter = (col: ColumnInstance): boolean => {
  return colFilter.hasFilter(col.props.filter);
};

const getColumnFilterField = (col: ColumnInstance): string => {
  return col.props.filterField || colFilter.getFilterField(col.props.id, col.props.filter);
};

const getColumnFilterType = (col: ColumnInstance) => {
  return colFilter.getFilterType(col.props.filter);
};

const getColumnFilterOptions = (col: ColumnInstance) => {
  return colFilter.getFilterOptions(col.props.filter);
};

const isColumnFilterMultiple = (col: ColumnInstance): boolean => {
  return colFilter.isMultipleSelect(col.props.filter);
};

const getColumnRangeFields = (col: ColumnInstance) => {
  return colFilter.getRangeFields(col.props.filter);
};

const getColumnFilterValue = (col: ColumnInstance): FilterValue => {
  const field = getColumnFilterField(col);
  // For dateRange, reconstruct { start, end } from range key
  if (getColumnFilterType(col) === "dateRange") {
    const rangeFields = getColumnRangeFields(col);
    if (rangeFields) {
      const key = `__range__${rangeFields[0]}__${rangeFields[1]}`;
      return filterValues.value[key] ?? null;
    }
  }
  return filterValues.value[field] ?? null;
};

const handleColumnFilterApply = (col: ColumnInstance, payload: Record<string, unknown>) => {
  const filterType = getColumnFilterType(col);
  const field = getColumnFilterField(col);

  if (filterType === "dateRange") {
    const rangeFields = getColumnRangeFields(col);
    if (rangeFields) {
      const start = payload[rangeFields[0]] as string | undefined;
      const end = payload[rangeFields[1]] as string | undefined;
      updateRangeFilter(rangeFields, { start, end });
    }
  } else {
    const value = payload[field];
    updateFilter(field, value as FilterValue);
  }

  // Emit combined payload
  emitFilterPayload();
};

const handleColumnFilterClear = (col: ColumnInstance) => {
  const field = getColumnFilterField(col);
  const filterType = getColumnFilterType(col);

  if (filterType === "dateRange") {
    const rangeFields = getColumnRangeFields(col);
    if (rangeFields) {
      const key = `__range__${rangeFields[0]}__${rangeFields[1]}`;
      clearFilter(key);
    }
  } else {
    clearFilter(field);
  }

  // Emit combined payload
  emitFilterPayload();
};

/** Emit the combined column + global filter payload */
const emitFilterPayload = () => {
  const payload = buildPayload();
  // Merge global filter payload (if any)
  if (globalFilterPayload.value) {
    Object.assign(payload, globalFilterPayload.value);
  }
  emit("filter", { filters: payload, filteredValue: props.items });
};

// Global filter state
const globalFilterPayload = ref<Record<string, unknown> | null>(null);
const showGlobalFiltersPanel = ref(false);
const globalFilterValues = ref<Record<string, unknown>>({});
const globalFiltersButtonRef = ref<InstanceType<typeof GlobalFiltersButton> | null>(null);

// Computed: get the raw element from the component ref for anchor positioning
const globalFiltersButtonEl = computed<HTMLElement | null>(() => {
  return (globalFiltersButtonRef.value as unknown as { $el?: HTMLElement })?.$el ?? null;
});

// Column switcher state
const showColumnSwitcherPanel = ref(false);
const dataTableHeaderRef = ref<InstanceType<typeof DataTableHeader> | null>(null);

const columnSwitcherButtonEl = computed<HTMLElement | null>(() => {
  return dataTableHeaderRef.value?.columnSwitcherEl ?? null;
});

// Computed: count of active global filters
const globalActiveFilterCount = computed(() => {
  let count = 0;
  for (const val of Object.values(globalFilterValues.value)) {
    if (val === null || val === undefined || val === "") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (typeof val === "object" && !Array.isArray(val)) {
      const range = val as { start?: string; end?: string };
      if (range.start || range.end) count++;
      continue;
    }
    count++;
  }
  return count;
});

const handleGlobalFilterApply = (payload: Record<string, unknown>) => {
  globalFilterPayload.value = payload;
  emitFilterPayload();
};

const handleGlobalFilterClear = () => {
  globalFilterPayload.value = null;
  globalFilterValues.value = {};
  emitFilterPayload();
};

// ============================================================================
// Display Items
// ============================================================================

// Display items: items come pre-filtered from the backend
// Only row-reorder dragging changes display order locally
const displayItems = computed<T[]>(() => {
  // During drag or waiting for parent to update items after drop
  if ((draggedRow.value !== undefined || pendingReorder.value) && isRowReorderEnabled.value) {
    return [...(reorderedItems.value as T[])];
  }

  return props.items ?? [];
});

// Helper to get global index of an item (for grouped mode)
const getGlobalIndex = (item: T): number => {
  return displayItems.value.indexOf(item);
};

// ============================================================================
// Column Helpers (via composable)
// ============================================================================

const cols = useTableColumns({
  visibleColumns,
  resizableColumns: props.resizableColumns,
  reorderableColumns: props.reorderableColumns,
  hasSelectionColumn,
  isSelectionViaColumn,
});

// Provide hasFlexColumns for TableRow filler control
provide(HasFlexColumnsKey, cols.hasFlexColumns);

// ============================================================================
// Column Switcher
// ============================================================================

// Stable set of data-discovered column IDs.
// Uses a string key watcher so the Set is only re-created when actual IDs change
// (avoids false triggers from new array references in the computed source).
const dataDiscoveredIds = ref<Set<string>>(new Set());
watch(
  () => dataDiscoveredColumns.value.map((c) => c.props.id).join(","),
  () => {
    dataDiscoveredIds.value = new Set(dataDiscoveredColumns.value.map((c) => c.props.id));
  },
  { immediate: true },
);

const switcherColumns = computed(() => {
  // Declared columns (excluding statically hidden and special columns)
  const declared = declaredColumns.value
    .filter((col) => col.props.visible !== false)
    .filter((col) => !cols.isSpecialColumn(col.props))
    .map((col) => ({
      id: col.props.id,
      label: col.props.title || col.props.field || col.props.id,
      visible: !hiddenColumnIds.value.has(col.props.id),
      defaultVisible: true,
    }));

  // Data-discovered columns (from items keys, default hidden)
  const discovered = dataDiscoveredColumns.value.map((col) => ({
    id: col.props.id,
    label: col.props.title || col.props.id,
    visible: !hiddenColumnIds.value.has(col.props.id),
    defaultVisible: false,
  }));

  return [...declared, ...discovered];
});

const switcherVisibleColumnIds = computed(() => {
  return switcherColumns.value.filter((c) => c.visible).map((c) => c.id);
});

// ============================================================================
// State Persistence
// ============================================================================

const statePersistence = useDataTableState({
  stateKey: toRef(props, "stateKey"),
  stateStorage: computed(() => props.stateStorage ?? "local"),
  columnWidths: cols.columnWidths,
  hiddenColumnIds,
  shownColumnIds: shownDataDiscoveredColumnIds,
  onStateSave: (state) => emit("state-save", state),
  onStateRestore: (state) => emit("state-restore", state),
});

// Initialize hiddenColumnIds with data-discovered columns (they start hidden).
// Keep hidden IDs for columns that temporarily disappear between different
// datasets/views (e.g. products vs catalog). This preserves per-view visibility.
watch(
  dataDiscoveredIds,
  (newIds, oldIds) => {
    const updatedHidden = new Set(hiddenColumnIds.value);
    const updatedShown = new Set(shownDataDiscoveredColumnIds.value);
    let hiddenChanged = false;
    let shownChanged = false;

    // Newly discovered auto columns are hidden by default, unless user
    // explicitly enabled them earlier (persisted in shownDataDiscoveredColumnIds).
    for (const id of newIds) {
      if ((!oldIds || !oldIds.has(id)) && !updatedHidden.has(id) && !updatedShown.has(id)) {
        updatedHidden.add(id);
        hiddenChanged = true;
      }
    }

    // If a key becomes a declared column (no longer auto-discovered), drop it
    // from auto-column state sets. Do not remove IDs that simply disappeared
    // due to switching datasets/views.
    if (oldIds) {
      const declaredIds = new Set(declaredColumns.value.map((col) => col.props.id));
      for (const id of oldIds) {
        if (!newIds.has(id) && declaredIds.has(id)) {
          if (updatedHidden.delete(id)) {
            hiddenChanged = true;
          }
          if (updatedShown.delete(id)) {
            shownChanged = true;
          }
        }
      }
    }

    if (hiddenChanged) {
      hiddenColumnIds.value = updatedHidden;
    }
    if (shownChanged) {
      shownDataDiscoveredColumnIds.value = updatedShown;
    }
  },
  { immediate: true },
);

const handleColumnVisibilityChange = (visibleIds: string[]) => {
  const visibleSet = new Set(visibleIds);
  const allToggleableIds = switcherColumns.value.map((c) => c.id);
  const discoveredToggleableIds = switcherColumns.value.filter((c) => c.defaultVisible === false).map((c) => c.id);

  // Preserve hidden IDs that are not part of the current switcher view.
  // This prevents losing hidden preferences when switching datasets/views.
  const toggleableSet = new Set(allToggleableIds);
  const discoveredSet = new Set(discoveredToggleableIds);
  const newHidden = new Set<string>([...hiddenColumnIds.value].filter((id) => !toggleableSet.has(id)));
  const newShown = new Set<string>([...shownDataDiscoveredColumnIds.value].filter((id) => !discoveredSet.has(id)));

  for (const id of allToggleableIds) {
    if (!visibleSet.has(id)) {
      newHidden.add(id);
    }
  }

  for (const id of discoveredToggleableIds) {
    if (visibleSet.has(id)) {
      newShown.add(id);
    }
  }

  hiddenColumnIds.value = newHidden;
  shownDataDiscoveredColumnIds.value = newShown;
};

// Safe columns getter with null-check protection for template iteration
const safeColumns = computed(() => {
  return cols.orderedVisibleColumns.value.filter(
    (col): col is ColumnInstance => col != null && col.props != null && col.props.id != null,
  );
});

// ============================================================================
// Row Props Builder (for DataTableRow component)
// ============================================================================

/**
 * Builds the props object for DataTableRow component.
 * This centralizes all row-related prop computation in one place.
 */
const getRowProps = (item: T, index: number) => ({
  item,
  index,
  columns: safeColumns.value,

  // Selection
  isSelected: selection.isSelected(item),
  isSelectable: selection.canSelect(item),
  selectionMode: effectiveSelectionMode.value,
  showSelectionCell: hasSelectionColumn.value && !isSelectionViaColumn.value,

  // Reorder
  reorderable: isRowReorderEnabled.value,
  showDragHandle: showRowDragHandle.value,
  isDragging: draggedRow.value === index,

  // Expansion
  expandable: hasExpanderColumn.value,
  isExpanded: isRowExpanded(item),
  expandedIcon: props.expandedRowIcon,
  collapsedIcon: props.collapsedRowIcon,

  // Editing
  editingRowData: editing.getEditingRowData(item, index),
  isRowEditing: editing.isRowEditing(item),
  isInlineEditing: isInlineEditing.value,
  isCellEditing: editing.isCellEditing,

  // Actions
  hasActions: !!props.rowActions,

  // Column helpers
  getColumnWidth: cols.getEffectiveColumnWidth,
  getCellAlign: cols.getCellAlign,
  getCellStyle: cols.getCellStyle,

  // Custom class
  rowClass: [{ "vc-data-table__row--dragging": draggedRow.value === index }, props.rowClass?.(item)],
});

const { handleResizeStart } = useTableColumnsResize({
  columns: cols.columnWidths,
  minColumnWidth: 60,
  getColumnElement: (id) => cols.headerRefs.get(id) ?? null,
  getAllColumnElements: (id) => {
    if (!tableContainerRef.value) return null;
    return tableContainerRef.value.querySelectorAll(`[data-column-id="${id}"]`);
  },
  onResizeEnd: (colsData) => emit("column-resize-end", { columns: colsData }),
});

const {
  isDragging: isColumnReordering,
  handleDragStart: handleColumnDragStart,
  handleDragOver: handleColumnDragOver,
  handleDrop: handleColumnDrop,
} = useTableColumnsReorder({
  columns: cols.columnWidths,
  onReorderEnd: (colsData) => emit("column-reorder", { columns: colsData }),
});

// Provide column reordering state so TableRow enables FLIP animation only during drag
provide(IsColumnReorderingKey, isColumnReordering);

// ============================================================================
// Event Handlers
// ============================================================================

const handleSort = (col: VcColumnProps, event?: MouseEvent) => {
  sort.handleSort(cols.getSortField(col), event);
};

const handleSelectAllChange = (value: boolean) => {
  const result = selection.handleSelectAllChange(value);
  if (value) emit("row-select-all", result);
  else emit("row-unselect-all", result);
  emit("update:selectAll", value);
};

const handleRowSelectionChange = (item: T, eventOrValue?: Event | boolean) => {
  const wasSelected = selection.isSelected(item);
  const result = selection.handleRowSelectionChange(item, eventOrValue);
  if (result) {
    if (wasSelected) emit("row-unselect", result);
    else emit("row-select", result);
  }
};

const handleRowClick = (item: T, index: number, event: Event) => {
  emit("row-click", { data: item, index, originalEvent: event });
  const target = event.target as HTMLElement;
  const isCheckboxClick = target.tagName === "INPUT" && target.getAttribute("type") === "checkbox";
  if (effectiveSelectionMode.value === "single" && !isCheckboxClick) {
    handleRowSelectionChange(item, event);
  }
};

const handleCellClick = (item: T, field: string, rowIndex: number, col: ColumnInstance) => {
  if (
    props.editMode === "cell" &&
    (col.slots.editor || col.props.editable) &&
    !editing.isCellEditing(rowIndex, field)
  ) {
    const event = editing.startCellEdit(item, field, rowIndex);
    emit("cell-edit-init", event);
  }
};

const handleCellEditComplete = (item: T, field: string, rowIndex: number, newValue: unknown) => {
  // Close the editor and emit the event
  // This is called from focusout on the editor wrapper or Enter key
  const event = editing.completeCellEdit(item, field, rowIndex, newValue);
  emit("cell-edit-complete", { data: item, field, newValue: event.newValue, index: rowIndex });

  // If inline editing is active, also update the inlineEdit composable
  if (inlineEdit.isEditing.value) {
    inlineEdit.updateCell(rowIndex, field, newValue);
  }
};

const handleCellEditCancel = (item: T, field: string, rowIndex: number) => {
  // Cancel editing - discard changes
  editing.cancelCellEdit(item, field, rowIndex);
  emit("cell-edit-cancel", { data: item, field, index: rowIndex });
};

/**
 * Handle cell value change during editing (for inline edit dirty tracking).
 * Called on every keystroke/input change, not just on blur.
 */
const handleCellValueChange = (field: string, rowIndex: number, newValue: unknown) => {
  // If inline editing is active, update the inlineEdit composable immediately
  if (inlineEdit.isEditing.value) {
    inlineEdit.updateCell(rowIndex, field, newValue);
  }
};

const handleExpandToggle = (item: T, index: number, event: Event) => {
  const wasExpanded = expansion.isRowExpanded(item, index);
  const result = expansion.toggleRowExpansion(item, index, event);
  if (wasExpanded) emit("row-collapse", result);
  else emit("row-expand", result);
};

const handleStartRowEdit = (item: T, index: number) => {
  const event = editing.startRowEdit(item, index);
  emit("update:editingRows", editing.internalEditingRows.value);
  emit("row-edit-init", event);
};

const handleSaveRowEdit = (item: T, index: number) => {
  const event = editing.saveRowEdit(item, index);
  emit("update:editingRows", editing.internalEditingRows.value);
  emit("row-edit-save", event);
};

const handleCancelRowEdit = (item: T, index: number) => {
  const event = editing.cancelRowEdit(item, index);
  emit("update:editingRows", editing.internalEditingRows.value);
  emit("row-edit-cancel", event);
};

const handleRowAction = (action: TableAction, item: T, index: number) => {
  // Call the action's click handler with item and index (matching legacy vc-table behavior)
  action.clickHandler?.(item, index);
  emit("row-action", { action, item, index });
};

// ============================================================================
// Mobile View Event Handlers
// ============================================================================

const handleMobileRowClick = (item: T, index: number) => {
  emit("row-click", { data: item, index, originalEvent: new Event("click") });
};

const handleMobileRowSelect = (item: T, index: number) => {
  handleRowSelectionChange(item);
};

const handleMobileRowAction = (
  action: { id: string; clickHandler?: (item: T, index: number) => void },
  item: T,
  index: number,
) => {
  // Execute the action's click handler if provided
  if (action.clickHandler) {
    action.clickHandler(item, index);
  }
  // Also emit the row-action event for parent components
  emit("row-action", { action, item, index });
};

// ============================================================================
// Refs & Lifecycle
// ============================================================================

const tableRootRef = ref<HTMLElement | null>(null);
const tableContainerRef = ref<HTMLElement | null>(null);
const paginationRef = ref<HTMLElement | null>(null);

// ============================================================================
// Adaptive Pagination
// ============================================================================

const { width: paginationWidth } = useElementSize(paginationRef);

/** Pagination item width (29px) + gap (8px) = 37px per button */
const PAGINATION_ITEM_SLOT = 37;
/** Approximate width of the page-info text + padding */
const PAGINATION_BASE_WIDTH = 140;

const paginationMaxPages = computed(() => {
  if (!props.pagination || paginationWidth.value === 0) return 5;
  const available = paginationWidth.value - PAGINATION_BASE_WIDTH;
  // prev + next buttons always shown = 2 slots
  const slotsForPages = Math.floor((available - 2 * PAGINATION_ITEM_SLOT) / PAGINATION_ITEM_SLOT);
  if (slotsForPages >= 7) return 5; // enough room for 5 pages + first/last
  if (slotsForPages >= 3) return slotsForPages;
  return 0;
});

const paginationShowFirstLast = computed(() => {
  if (!props.pagination || paginationWidth.value === 0) return true;
  const available = paginationWidth.value - PAGINATION_BASE_WIDTH;
  // Need room for: first + prev + at least 1 page + next + last = 5 slots minimum
  return available >= 5 * PAGINATION_ITEM_SLOT;
});

// Note: Click-outside handling is done via focusout on the editor wrapper in DataTableCellRenderer.
// No need for a separate mousedown listener - focusout covers all cases.

// ============================================================================
// Expose API
// ============================================================================

defineExpose({
  // Selection API
  selectAll: selection.selectAll,
  clearSelection: selection.clearSelection,
  getSelectionState: selection.getSelectionState,
  isSelectAllActive: selection.isSelectAllActive,
  showSelectAllChoice: selection.showSelectAllChoice,
  selectionInfo: selection.selectionInfo,

  // Row CRUD API
  addRow: handleAddRow,
  removeRow: handleRemoveRow,

  // Inline editing API
  startEditing: inlineEdit.startEditing,
  cancelEditing: inlineEdit.cancelEditing,
  saveChanges: inlineEdit.saveChanges,
  isEditing: inlineEdit.isEditing,
  isValid: inlineEdit.isValid,
  isDirty: inlineEdit.isDirty,
  getCellError: inlineEdit.getCellError,
  pendingChanges: inlineEdit.pendingChanges,

  // State persistence API
  clearState: statePersistence.clearState,
  saveState: statePersistence.saveState,
});

onBeforeUnmount(() => {
  columnCollector.clear();
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style lang="scss">
// Table CSS variables are defined in Table.vue on .vc-table-composition.
// No :root fallback needed — all sub-components render inside <Table>.
.vc-data-table {
  // Note: overflow-visible allows absolutely positioned elements like row actions
  // to escape the container bounds. The inner __content element handles scrolling.
  @apply tw-relative tw-flex tw-flex-col tw-grow tw-basis-0 tw-flex-auto tw-h-full tw-overflow-visible;

  &__header {
    @apply tw-flex-shrink-0 tw-px-4 tw-py-2;
  }

  &__content {
    // flex-basis: 0 (tw-basis-0) is critical: with `auto` basis the element sizes to content
    // first, so overflow-y never activates on mobile touch devices.
    // basis-0 forces height from flex allocation → content overflows → scroll works.
    @apply tw-relative tw-box-border tw-w-full tw-flex tw-flex-col tw-grow tw-shrink tw-min-h-0;
    // Vertical scroll only — horizontal overflow is hidden to prevent scrollbar flash
    // during animated container resize (blade expand/collapse).
    // Columns use flex-shrink to fit within available width.
    overflow-x: hidden;
    overflow-y: auto;
    // Enable momentum scrolling on iOS
    -webkit-overflow-scrolling: touch;
  }

  &__loading {
    @apply tw-flex tw-items-center tw-justify-center tw-p-8 tw-text-neutrals-500;
  }

  &__row--dragging {
    @apply tw-opacity-50;
  }

  &__expansion-row {
    @apply tw-bg-neutrals-50 tw-w-full tw-border-b tw-border-[color:var(--table-border-color)];
  }

  &__expansion-content {
    @apply tw-p-4;
  }

  &__global-filters {
    @apply tw-flex tw-items-center tw-px-3 tw-py-2;
    border-bottom: 1px solid var(--table-border-color, #e5e7eb);
  }

  &__header-content {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-2 tw-w-full;
  }

  &__header-title {
    @apply tw-flex-1 tw-truncate;
  }

  &__group-label {
    @apply tw-font-semibold tw-text-sm;
    color: var(--neutrals-900);
  }

  &__group-count {
    @apply tw-text-sm tw-ml-2;
    color: var(--neutrals-500);
  }

  &__group-footer {
    @apply tw-bg-neutrals-50 tw-px-4 tw-py-2 tw-border-b;
    border-color: var(--table-border-color);
    font-size: 0.875rem;
    color: var(--neutrals-600);
  }

  &__rows-container {
    @apply tw-flex tw-flex-col;
  }

  &__selection-cell {
    text-align: center;
    justify-content: center;
    min-width: 40px;
    max-width: 40px;
    width: 40px;
  }

  &__pagination {
    @apply tw-flex-shrink-0 tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-[11px] tw-border-t;
    border-color: var(--table-border-color, var(--neutrals-200));
  }

  &__page-info {
    @apply tw-text-sm;
    color: var(--neutrals-600);
  }
}

/* FLIP move animation for row reorder */
.vc-table-row-swap-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

/* Disable transitions on enter/leave so only moves animate */
.vc-table-row-swap-enter-active,
.vc-table-row-swap-leave-active {
  transition: none !important;
}
</style>
