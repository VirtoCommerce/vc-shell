<template>
  <div
    ref="tableRootRef"
    v-loading:49="(loading || bladeLoading) && !showSkeleton"
    class="vc-data-table"
    :aria-busy="loading || bladeLoading || undefined"
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
      @reset="handleTableReset"
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
          :is-editing="isInlineEditing"
          :show-column-switcher="!!columnSwitcher"
          :column-switcher-active="showColumnSwitcherPanel"
          :actions-position="rowActionsPosition"
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
          :loading="loading || bladeLoading"
          :skeleton-rows="props.skeletonRows"
          :columns="safeColumns"
          :get-column-width="cols.getEffectiveColumnWidth"
          :get-cell-style="cols.getCellStyle"
          :show-selection-cell="hasSelectionColumn && !isSelectionViaColumn"
          :empty-icon="resolvedEmptyIcon"
          :empty-title="resolvedEmptyTitle"
          :empty-description="resolvedEmptyDescription"
          :empty-action-label="resolvedEmptyActionLabel"
          :empty-action-handler="resolvedEmptyActionHandler"
          :loading-text="loadingText"
          :grouping-enabled="rowGrouping.isGroupingEnabled.value"
          :grouped-data="rowGrouping.groupedData.value"
          :expandable-row-groups="expandableRowGroups"
          :is-group-expanded="rowGrouping.isGroupExpanded"
          :get-item-group-key="rowGrouping.getItemGroupKey"
          :get-global-index="getGlobalIndex"
          :get-item-key="getItemKey"
          :new-row-indices="inlineEdit.newRowIndices.value"
          :get-row-props="getRowProps as any"
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
              :position="rowActionsPosition"
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
            v-if="$slots['not-found'] || $slots.empty"
            #empty
          >
            <slot
              v-if="isNotFoundState && $slots['not-found']"
              name="not-found"
            />
            <slot
              v-else
              name="empty"
            />
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
      <!-- Mobile: Select all toolbar (appears when selection is active) -->
      <div
        v-if="effectiveSelectionMode === 'multiple' && (selection.someSelected.value || selection.allSelected.value)"
        class="vc-data-table__mobile-select-toolbar"
      >
        <TableCheckbox
          :model-value="selection.allSelected.value"
          :indeterminate="selection.someSelected.value && !selection.allSelected.value"
          @change="handleSelectAllChange"
        />
        <span class="vc-data-table__mobile-select-toolbar-text">
          {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.SELECTED", "Selected") }}: {{ selection.internalSelection.value.length }}
        </span>
      </div>

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
        :is-inline-editing="isInlineEditing"
        :new-row-indices="inlineEdit.newRowIndices.value"
        @click="handleMobileRowClick"
        @select="handleMobileRowSelect"
        @action="handleMobileRowAction"
        @refresh="emit('pull-refresh')"
        @cell-value-change="(field, index, value) => handleCellValueChange(field, index, value)"
      >
        <template #empty>
          <slot
            v-if="isNotFoundState && $slots['not-found']"
            name="not-found"
          />
          <slot
            v-else-if="$slots.empty"
            name="empty"
          />
          <TableEmpty
            v-else
            :icon="resolvedEmptyIcon"
            :title="resolvedEmptyTitle"
            :description="resolvedEmptyDescription"
            :action-label="resolvedEmptyActionLabel"
            :action-handler="resolvedEmptyActionHandler"
          />
        </template>
      </DataTableMobileView>

      <!-- Add Row Button (mobile) -->
      <TableAddRowButton
        v-if="showAddRowButton"
        :label="addRowLabel"
        :icon="addRowIcon"
        @add="handleAddRow()"
      />
    </div>

    <!-- Pagination / Total counter (outside scroll area, works for both desktop and mobile) -->
    <div
      v-if="props.pagination && props.pagination.pages > 0"
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
 *
 * Orchestration logic (sub-composable wiring, watchers, event handlers, derived
 * computeds) is extracted into useDataTableOrchestrator for independent testability.
 */
import { ref, computed, provide, watch, onBeforeUnmount, useSlots, type Ref, type VNode } from "vue";
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
  TableCheckbox,
} from "@ui/components/organisms/vc-data-table/components";
import { VcPagination } from "@ui/components/molecules";
import { useDataTableOrchestrator } from "@ui/components/organisms/vc-data-table/composables/useDataTableOrchestrator";
import { ColumnCollector, type ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import {
  ColumnCollectorKey,
  FilterContextKey,
  FillerWidthKey,
  IsColumnReorderingKey,
} from "@ui/components/organisms/vc-data-table/keys";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import type {
  VcColumnProps,
  VcDataTableExtendedProps,
  FilterValue,
  EditChange,
  TableAction,
  SortMeta,
  MobileSwipeAction,
  TableStateConfig,
  TableFitMode,
} from "@ui/components/organisms/vc-data-table/types";
import type { PersistedStateV2 } from "@ui/components/organisms/vc-data-table/types";
import { vLoading } from "@core/directives";

const props = withDefaults(defineProps<VcDataTableExtendedProps<T> & { fitMode?: TableFitMode }>(), {
  fitMode: "gap",
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
  reorderableColumns: true,
  reorderableRows: false,
  showAllColumns: true,
  scrollable: false,
  scrollHeight: undefined,
  loading: false,
  expandedRows: () => [],
  expandedRowIcon: "lucide-chevron-down",
  collapsedRowIcon: "lucide-chevron-right",
  groupRowsBy: undefined,
  rowGroupMode: "subheader",
  expandableRowGroups: false,
  expandedRowGroups: undefined,
  rowActionsMode: "inline",
  rowActionsPosition: "overlay",
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
  columnSwitcher: true,
  stateStorage: "local",
  searchable: false,
  searchValue: undefined,
  searchPlaceholder: "Search...",
  emptyState: undefined,
  notFoundState: undefined,
  searchDebounce: 300,
  activeItemId: undefined,
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
  /** v-model update for active (highlighted) row ID */
  "update:activeItemId": [value: string | undefined];
  /** Emitted when a row is clicked */
  "row-click": [event: { data: T; index: number; originalEvent: Event }];
  /** Emitted when a row action button/menu item is activated */
  "row-action": [event: { action: TableAction | MobileSwipeAction<T>; item: T; index: number }];

  // === Reorder ===
  /** Emitted when rows are reordered via drag-and-drop */
  "row-reorder": [event: { dragIndex: number; dropIndex: number; value: T[] }];
  /** Emitted when a column resize operation ends */
  "column-resize-end": [event: { columns: { id: string; width: number }[] }];
  /** Emitted when columns are reordered via drag-and-drop */
  "column-reorder": [event: { columns: { id: string; [key: string]: unknown }[] }];

  // === State ===
  /** Emitted when table state is saved to storage */
  "state-save": [state: PersistedStateV2];
  /** Emitted when table state is restored from storage */
  "state-restore": [state: PersistedStateV2];

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
  /** Custom not-found state content (shown when search yields no results) */
  "not-found"?: () => VNode[];
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
const notFoundTitle = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND_TITLE"));
const notFoundDescription = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND_DESCRIPTION"));

/** Detect not-found state: items empty + active search or filters */
const isNotFoundState = computed(
  () =>
    displayItems.value.length === 0 && !props.loading && (internalSearchValue.value !== "" || hasActiveFilters.value),
);

/** Resolved title/description/icon/action for the current empty-like state */
const resolvedEmptyIcon = computed(() => (isNotFoundState.value ? props.notFoundState?.icon : props.emptyState?.icon));
const resolvedEmptyTitle = computed(() =>
  isNotFoundState.value
    ? (props.notFoundState?.title ?? notFoundTitle.value)
    : (props.emptyState?.title ?? emptyTitle.value),
);
const resolvedEmptyDescription = computed(() =>
  isNotFoundState.value
    ? (props.notFoundState?.description ?? notFoundDescription.value)
    : (props.emptyState?.description ?? emptyDescription.value),
);
const resolvedEmptyActionLabel = computed(() =>
  isNotFoundState.value ? props.notFoundState?.actionLabel : props.emptyState?.actionLabel,
);
const resolvedEmptyActionHandler = computed(() =>
  isNotFoundState.value ? props.notFoundState?.actionHandler : props.emptyState?.actionHandler,
);
const loadingText = computed(() => t("COMPONENTS.ORGANISMS.VC_TABLE.LOADING"));

/** Track whether data has ever been loaded — distinguishes initial load from refresh */
const hasLoadedOnce = ref(false);
watch(
  () => props.items,
  (items) => {
    if (items && items.length > 0) hasLoadedOnce.value = true;
  },
  { immediate: true },
);

/** Blade-level loading state (skeleton mode from parent VcBlade) */
const bladeLoading = useBladeLoading();

/** True when skeleton should show instead of spinner overlay */
const showSkeleton = computed(() => (props.loading || bladeLoading.value) && !hasLoadedOnce.value);

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

const { isMobile } = useResponsive();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
// DOM Refs (declared early — passed to orchestrator for column resize)
// ============================================================================

const tableRootRef = ref<HTMLElement | null>(null);
const tableContainerRef = ref<HTMLElement | null>(null);
const paginationRef = ref<HTMLElement | null>(null);

// ============================================================================
// Orchestrator — wires all sub-composables, watchers, and event handlers
// ============================================================================

const {
  // Sub-composable instances
  selection,
  sort,
  editing,
  expansion,
  rowGrouping,
  inlineEdit,
  cols,
  statePersistence,

  // Column filter helpers
  filterValues,
  updateFilter,
  clearFilter,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,

  // Column filter template helpers
  showColumnFilter,
  getColumnFilterType,
  getColumnFilterOptions,
  isColumnFilterMultiple,
  getColumnRangeFields,
  getColumnFilterValue,
  handleColumnFilterApply,
  handleColumnFilterClear,
  emitFilterPayload,

  // Global filter payload (owned by component UI state; orchestrator wires it)
  globalFilterPayload,

  // Resize / reorder
  handleResizeStart,
  isColumnReordering,
  handleColumnDragStart,
  handleColumnDragOver,
  handleColumnDrop,

  // Row reorder state
  draggedRow,
  onRowMouseDown,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDragEnd,
  onRowDrop,

  // Derived computeds
  displayItems,
  getGlobalIndex,
  effectiveSelectionMode,
  hasSelectionColumn,
  isSelectionViaColumn,
  isRowReorderEnabled,
  showRowDragHandle,
  hasExpanderColumn,
  computedVariant,
  switcherColumns,
  switcherVisibleColumnIds,
  safeColumns,
  isInlineEditing,

  // Expansion helper
  isRowExpanded,
  canExpand,

  // Event handlers
  handleSort,
  handleSelectAllChange,
  handleRowSelectionChange,
  handleRowClick,
  handleAddRow,
  handleRemoveRow,
  handleColumnVisibilityChange,
  handleTableReset,
  handleCellClick,
  handleCellEditComplete,
  handleCellEditCancel,
  handleCellValueChange,
  handleExpandToggle,
  handleStartRowEdit,
  handleSaveRowEdit,
  handleCancelRowEdit,
  handleRowAction,
  handleMobileRowClick,
  handleMobileRowSelect,
  handleMobileRowAction,
} = useDataTableOrchestrator<T>({
  props,
  emit: emit as any,
  visibleColumns,
  declaredColumns,
  hiddenColumnIds,
  shownDataDiscoveredColumnIds,
  dataDiscoveredColumns,
  getItemKey,
  tableContainerRef,
});

// Provide filter context (values returned by orchestrator, provide() here per plan rules)
provide(FilterContextKey, {
  filterValues,
  updateFilter,
  clearFilter,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
});

// Provide engine-controlled filler width for TableRow
provide(FillerWidthKey, computed(() => cols.getFillerWidth()));

// Provide column reordering state so TableRow enables FLIP animation only during drag
provide(IsColumnReorderingKey, isColumnReordering);

// ============================================================================
// Pagination handler (UI-level, stays in component)
// ============================================================================

const handlePaginationClick = (page: number) => {
  emit("pagination-click", page);
};

// ============================================================================
// Search (UI state stays in component)
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
const addRowIcon = computed(() => props.addRow?.icon ?? "lucide-plus");

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
// Global Filter UI State (UI-level state, component-owned)
// ============================================================================

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
// Row Props Builder (for DataTableRow component)
// Uses orchestrator outputs + DOM refs + UI state — stays in component
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
  isActive: props.activeItemId != null && getItemKey(item, index) === String(props.activeItemId),
  isSelectable: selection.canSelect(item),
  selectionMode: effectiveSelectionMode.value,
  showSelectionCell: hasSelectionColumn.value && !isSelectionViaColumn.value,

  // Reorder
  reorderable: isRowReorderEnabled.value,
  showDragHandle: showRowDragHandle.value,
  isDragging: draggedRow.value === index,

  // Expansion
  expandable: hasExpanderColumn.value && canExpand(item),
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
  actionsPosition: props.rowActionsPosition ?? "overlay",

  // Column helpers
  getColumnWidth: cols.getEffectiveColumnWidth,
  getCellAlign: cols.getCellAlign,
  getCellStyle: cols.getCellStyle,

  // Custom class
  rowClass: [{ "vc-data-table__row--dragging": draggedRow.value === index }, props.rowClass?.(item)],
});

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

  // Hide spinner overlay when skeleton is showing (initial load)
  &--skeleton-active .vc-loading-overlay {
    display: none !important;
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

  &__mobile-select-toolbar {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2.5;
    background-color: var(--table-select-bar-bg, var(--additional-50));
    border-bottom: 1px solid var(--table-border-color, var(--neutrals-200));
  }

  &__mobile-select-toolbar-text {
    @apply tw-text-sm tw-font-medium;
    color: var(--neutrals-700);
  }

  &__selection-cell {
    text-align: center;
    justify-content: center;
    min-width: 40px;
    max-width: 40px;
    width: 40px;
    // Override overflow:hidden from TableHead/TableCell so checkbox
    // focus ring (box-shadow 3px) is fully visible within the 40px cell
    &,
    .vc-table-composition__cell-content {
      overflow: visible;
      // Don't let cell-content grow — keep it intrinsic-sized so that
      // justify-content: center on the parent actually centers the checkbox/skeleton
      flex: 0 0 auto;
    }
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
