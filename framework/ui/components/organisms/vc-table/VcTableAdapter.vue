<template>
  <div class="vc-table-adapter">
    <VcDataTable
      :items="props.items"
      :sort-field="sortFieldValue"
      :sort-order="sortOrderValue"
      :removable-sort="true"
      :selection-mode="selectionMode"
      :selection="internalSelection"
      :is-row-selectable="rowSelectable"
      :row-actions="effectiveRowActions"
      :row-class="rowClassWithHighlight"
      :loading="loadingValue"
      :resizable-columns="props.resizableColumns"
      :reorderable-columns="props.reorderableColumns"
      :reorderable-rows="props.reorderableRows"
      :state-key="props.stateKey"
      :pull-to-refresh="props.pullToReload"
      :column-switcher="columnSwitcherValue"
      :edit-mode="editModeValue"
      :show-all-columns="expanded"
      :select-all="props.selectAll"
      :total-count="props.totalCount"
      :total-label="props.totalLabel"
      :searchable="showSearch"
      :search-value="props.searchValue"
      :search-placeholder="props.searchPlaceholder"
      :pagination="paginationConfig"
      :add-row="addRowConfig"
      :variant="props.variant"
      @sort="handleSort"
      @update:selection="handleSelectionUpdate"
      @row-click="handleRowClick"
      @row-reorder="handleRowReorder"
      @cell-edit-complete="handleCellEditComplete"
      @pull-refresh="handlePullRefresh"
      @update:select-all="handleSelectAll"
      @pagination-click="handlePaginationClick"
      @search="handleSearchChange"
      @update:search-value="handleSearchChange"
      @row-add="handleAddRow"
    >
      <!-- Dynamic VcColumn generation from columns[] prop -->
      <VcColumn
        v-for="col in effectiveColumns"
        :key="col.id"
        :id="col.id"
        :field="col.field || col.id"
        :title="toValue(col.title)"
        :width="col.width"
        :type="mapColumnType(col.type)"
        :sortable="col.sortable"
        :editable="col.editable"
        :align="mapColumnAlign(col.align)"
        :always-visible="col.alwaysVisible"
        :currency-field="col.currencyField"
        :rules="col.rules"
        :filter="col.filter"
        :mobile-role="mapMobileRole(col.mobilePosition)"
        :mobile-position="mapMobilePosition(col.mobilePosition)"
        :mobile-visible="col.mobileVisible"
      >
        <!-- Forward item_{colId} → VcColumn #body -->
        <template
          v-if="$slots[`item_${col.id}`]"
          #body="{ data, index }"
        >
          <slot
            :name="`item_${col.id}`"
            :item="data"
            :cell="col"
            :index="index"
          />
        </template>
        <!-- Forward header_{colId} → VcColumn #header -->
        <template
          v-if="$slots[`header_${col.id}`]"
          #header
        >
          <slot :name="`header_${col.id}`" />
        </template>
      </VcColumn>

      <!-- Legacy header + filters → toolbar-actions -->
      <template
        v-if="$slots.filters || $slots.header"
        #search-header-actions
      >
        <GlobalFiltersButton
          v-if="$slots.filters"
          ref="legacyFiltersButtonRef"
          :active-count="props.activeFilterCount ?? 0"
          :disabled="props.disableFilter"
          @click="showLegacyFiltersPanel = !showLegacyFiltersPanel"
        />
        <slot name="search-header-actions"></slot>
      </template>

      <!-- Header -->
      <template
        v-if="$slots.header"
        #header
      >
        <slot
          name="header"
          :header="() => null"
        />
      </template>

      <!-- Empty / NotFound -->
      <template #empty>
        <template v-if="isNotFoundState && ($slots.notfound || props.notfound)">
          <slot name="notfound">
            <div
              v-if="props.notfound"
              class="vc-table-adapter__empty-state"
            >
              <VcIcon
                v-if="props.notfound.icon"
                :icon="props.notfound.icon"
                size="xxl"
              />
              <p class="vc-table-adapter__empty-text">{{ toValue(props.notfound.text) }}</p>
              <a
                v-if="props.notfound.action"
                class="vc-table-adapter__empty-action"
                @click="props.notfound.clickHandler?.()"
              >
                {{ toValue(props.notfound.action) }}
              </a>
            </div>
          </slot>
        </template>
        <template v-else>
          <slot name="empty">
            <div
              v-if="props.empty"
              class="vc-table-adapter__empty-state"
            >
              <VcIcon
                v-if="props.empty.icon"
                :icon="props.empty.icon"
                size="xxl"
              />
              <p class="vc-table-adapter__empty-text">{{ toValue(props.empty.text) }}</p>
              <a
                v-if="props.empty.action"
                class="vc-table-adapter__empty-action"
                @click="props.empty.clickHandler?.()"
              >
                {{ toValue(props.empty.action) }}
              </a>
            </div>
          </slot>
        </template>
      </template>

      <!-- Loading -->
      <template
        v-if="$slots.loading"
        #loading
      >
        <slot name="loading" />
      </template>

      <!-- Footer -->
      <template
        v-if="$slots.footer"
        #footer
      >
        <slot name="footer" />
      </template>
    </VcDataTable>

    <!-- Legacy Filters Panel (reuses VcDropdownPanel for consistent styling) -->
    <VcDropdownPanel
      :show="showLegacyFiltersPanel && !!$slots.filters"
      :anchor-ref="legacyFiltersButtonEl"
      :title="$t('COMPONENTS.ORGANISMS.VC_TABLE.GLOBAL_FILTERS.TITLE')"
      width="280px"
      max-width="400px"
      @update:show="showLegacyFiltersPanel = $event"
    >
      <div class="vc-global-filters-panel__content">
        <slot
          name="filters"
          :close-panel="closeLegacyFiltersPanel"
        />
      </div>
    </VcDropdownPanel>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends Record<string, any>">
import { computed, ref, toValue, watch } from "vue";
import type { Ref, MaybeRef } from "vue";
import { useI18n } from "vue-i18n";
import VcDataTable from "./VcDataTable.vue";
import VcColumn from "./components/VcColumn.vue";
import { GlobalFiltersButton } from "./components";
import { VcDropdownPanel } from "../../molecules";
import { VcIcon } from "../../atoms";
import type { TableAction, TableEmptyAction, DataTablePagination, AddRowConfig } from "./types";
import type { ITableColumns, IActionBuilderResult } from "../../../../core/types";

// ============================================================================
// Props — mirrors old VcTable (TableProps) interface
// ============================================================================

const props = withDefaults(
  defineProps<{
    columns: ITableColumns[];
    items: T[];
    itemActionBuilder?: (item: T) => IActionBuilderResult<T>[] | undefined;
    sort?: string;
    multiselect?: boolean;
    disableItemCheckbox?: (item: T) => boolean;
    expanded?: boolean;
    totalLabel?: string;
    totalCount?: number;
    pages?: number;
    currentPage?: number;
    searchPlaceholder?: string;
    searchValue?: string;
    loading?: MaybeRef<boolean>;
    empty?: TableEmptyAction;
    notfound?: TableEmptyAction;
    header?: boolean;
    footer?: boolean;
    activeFilterCount?: number;
    selectedItemId?: MaybeRef<string>;
    pullToReload?: boolean;
    resizableColumns?: boolean;
    reorderableColumns?: boolean;
    reorderableRows?: boolean;
    stateKey: string;
    selectAll?: boolean;
    enableItemActions?: boolean;
    paginationVariant?: "default" | "minimal";
    selectionItems?: T[];
    disableFilter?: boolean;
    columnSelector?: "auto" | "defined" | Ref<ITableColumns[]> | ITableColumns[] | (() => ITableColumns[]);
    noHeaderCheckbox?: boolean;
    variant?: "default" | "striped" | "bordered";
    editing?: boolean;
    addNewRowButton?: { show: boolean; title: string };
  }>(),
  {
    items: () => [] as any,
    sort: undefined,
    multiselect: false,
    disableItemCheckbox: undefined,
    expanded: true,
    totalLabel: undefined,
    totalCount: undefined,
    pages: undefined,
    currentPage: 1,
    searchPlaceholder: undefined,
    searchValue: undefined,
    loading: false,
    empty: undefined,
    notfound: undefined,
    header: true,
    footer: true,
    activeFilterCount: 0,
    selectedItemId: undefined,
    pullToReload: false,
    resizableColumns: true,
    reorderableColumns: true,
    reorderableRows: false,
    selectAll: false,
    enableItemActions: true,
    paginationVariant: "default",
    selectionItems: undefined,
    disableFilter: false,
    columnSelector: "auto",
    noHeaderCheckbox: false,
    variant: "default",
    editing: false,
    addNewRowButton: undefined,
    itemActionBuilder: undefined,
  },
);

// ============================================================================
// Emits — mirrors old VcTable emit signatures
// ============================================================================

const emit = defineEmits<{
  (e: "paginationClick", page: number): void;
  (e: "selectionChanged", values: T[]): void;
  (e: "search:change", value: string | undefined): void;
  (e: "headerClick", item: ITableColumns): void;
  (e: "itemClick", item: T): void;
  (e: "scroll:ptr"): void;
  (e: "row:reorder", args: { dragIndex: number; dropIndex: number; value: T[] }): void;
  (e: "select:all", values: boolean): void;
  (e: "onEditComplete", args: { event: { field: string; value: string | number }; index: number }): void;
  (e: "onAddNewRow"): void;
  /** Emitted after cell edit completes (alongside onEditComplete), for blur-based recalculations. */
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
}>();

// Slots — includes mobile-item for backward compatibility (VcDataTable handles mobile internally)
defineSlots<{
  header?: (props: { header: () => null }) => any;
  filters?: (props: { closePanel: () => void }) => any;
  "mobile-item"?: (props: { item: T }) => any;
  [key: `header_${string}`]: (props: any) => any;
  [key: `item_${string}`]: (props: { item: T; cell: ITableColumns; index: number }) => any;
  notfound?: (props: any) => any;
  empty?: (props: any) => any;
  footer?: (props: any) => any;
  loading?: (props: any) => any;
  "search-header-actions"?: (props: any) => any;
}>();

// ============================================================================
// Internationalization
// ============================================================================

const { t: $t } = useI18n({ useScope: "global" });

// ============================================================================
// Internal state
// ============================================================================

const internalSelection = ref(props.selectionItems ?? []) as Ref<T[]>;

// ============================================================================
// Legacy Filters Panel (dropdown, teleported to body)
// ============================================================================

const showLegacyFiltersPanel = ref(false);
const legacyFiltersButtonRef = ref<InstanceType<typeof GlobalFiltersButton> | null>(null);

const legacyFiltersButtonEl = computed<HTMLElement | null>(
  () => (legacyFiltersButtonRef.value as unknown as { $el?: HTMLElement })?.$el ?? null,
);

const closeLegacyFiltersPanel = () => {
  showLegacyFiltersPanel.value = false;
};

// Sync internalSelection when parent updates selectionItems
watch(
  () => props.selectionItems,
  (newVal) => {
    if (newVal) {
      internalSelection.value = [...newVal];
    }
  },
);

// ============================================================================
// Computed: Prop mapping (old → new)
// ============================================================================

// Sort: "field:DESC" → sortField + sortOrder
const sortFieldValue = computed(() => props.sort?.split(":")[0] || undefined);
const sortOrderValue = computed<1 | -1 | 0>(() => {
  const dir = props.sort?.split(":")[1];
  if (dir === "ASC") return 1;
  if (dir === "DESC") return -1;
  return 0;
});
// Track last known sort field for fallback during sort removal (3rd click).
// Needed because props.sort may not be bound (parent uses `:sort-expression`
// which doesn't match the adapter's `sort` prop), so sortFieldValue can be
// undefined even when a column was actively sorted.
const lastSortField = ref<string>();

// Selection
const selectionMode = computed<"single" | "multiple" | undefined>(() => (props.multiselect ? "multiple" : undefined));
const rowSelectable = computed(() =>
  props.disableItemCheckbox ? (item: T) => !props.disableItemCheckbox!(item) : undefined,
);

// Row Actions: IActionBuilderResult → TableAction (TableAction extends IActionBuilderResult)
const effectiveRowActions = computed<((item: T) => TableAction<T>[]) | undefined>(() => {
  if (!props.enableItemActions || !props.itemActionBuilder) return undefined;
  return (item: T) => (props.itemActionBuilder!(item) ?? []) as TableAction<T>[];
});

// Row class: apply highlight for selectedItemId
const rowClassWithHighlight = computed(() => {
  const selectedId = toValue(props.selectedItemId);
  if (!selectedId) return undefined;
  return (data: T) => {
    const rowId = String((data as any).id ?? "");
    return rowId === selectedId ? "vc-data-table__row--highlighted" : "";
  };
});

// Pagination
const paginationConfig = computed<DataTablePagination | undefined>(() => {
  if (props.footer === false || !props.pages) return undefined;
  return {
    currentPage: props.currentPage ?? 1,
    pages: props.pages,
    variant: props.paginationVariant,
  };
});

// Columns: filter only by explicit visibility.
// The expanded/alwaysVisible filtering is handled exclusively by VcDataTable
// via the showAllColumns prop. Keeping all VcColumn elements mounted ensures
// that state persistence (column widths/order) is never lost during blade collapse.
const effectiveColumns = computed(() =>
  props.columns.filter((col) => col.visible !== false),
);

// NotFound state detection
const isNotFoundState = computed(
  () => props.items.length === 0 && (!!props.searchValue || (props.activeFilterCount ?? 0) > 0),
);

// Loading: unwrap MaybeRef
const loadingValue = computed(() => toValue(props.loading) ?? false);

// Add row
const addRowConfig = computed<AddRowConfig | undefined>(() => {
  if (!props.addNewRowButton?.show) return undefined;
  return {
    enabled: true,
    label: props.addNewRowButton.title,
    position: "footer" as const,
  };
});

// Edit mode: legacy editing=true → all editable cells are always inputs (inline mode)
const editModeValue = computed<"inline" | undefined>(() => (props.editing ? "inline" : undefined));

// Search: show search bar when header is true
const showSearch = computed(() => props.header !== false);

// Column switcher mapping
const columnSwitcherValue = computed<boolean | "auto" | "defined">(() => {
  if (props.columnSelector === "auto") return "auto";
  if (props.columnSelector === "defined") return "defined";
  // Other types (Ref<ITableColumns[]>, ITableColumns[], fn) — just enable auto mode
  if (props.columnSelector) return "auto";
  return false;
});

// ============================================================================
// Type mappers (old column types → new VcColumn types)
// ============================================================================

type VcColumnCellType =
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

function mapColumnType(type: string | undefined): VcColumnCellType | undefined {
  if (!type) return undefined;
  // Old ITableColumnsBase uses "date-time", VcColumn uses "datetime"
  if (type === "date-time") return "datetime";
  return type as VcColumnCellType;
}

function mapColumnAlign(align: string | undefined): "start" | "center" | "end" | undefined {
  if (!align) return undefined;
  // Old type has extra values like "between" | "around" | "evenly" — not supported in VcColumn
  if (align === "start" || align === "center" || align === "end") return align;
  return undefined;
}

// Legacy mobilePosition includes "image" | "status" which are now separate mobileRole values
function mapMobileRole(mobilePosition: string | undefined): "image" | "status" | "field" | "title" | undefined {
  if (mobilePosition === "image") return "image";
  if (mobilePosition === "status") return "status";
  if (mobilePosition === "top-left") return "title";
  // Grid positions ("top-left", etc.) map to "field" role
  if (mobilePosition) return "field";
  return undefined;
}

function mapMobilePosition(
  mobilePosition: string | undefined,
): "top-left" | "top-right" | "bottom-left" | "bottom-right" | undefined {
  if (
    mobilePosition === "top-left" ||
    mobilePosition === "top-right" ||
    mobilePosition === "bottom-left" ||
    mobilePosition === "bottom-right"
  ) {
    return mobilePosition;
  }
  return undefined;
}

// ============================================================================
// Event Handlers
// ============================================================================

// Sort → headerClick: find the column, emit legacy event.
// When sort is removed (3rd click), event.sortField is undefined — fall back to
// the current prop value which still holds the previously sorted column (parent
// hasn't updated yet). This lets the parent advance its own asc→desc→none cycle.
//
// IMPORTANT: We encode VcDataTable's sort direction into the column ID so the
// parent's handleSortChange receives e.g. "name:DESC" and sets the direction
// directly instead of independently cycling its own asc→desc→none state.
// Without this, both VcDataTable and the parent advance their sort cycles
// independently on each click, causing a one-step misalignment between the
// displayed sort icon and the actual data sort order.
function handleSort(event: { sortField?: string; sortOrder?: number }) {
  // Remember the last sorted field so we can identify it during sort removal
  // (when event.sortField is undefined on the 3rd click).
  if (event.sortField) {
    lastSortField.value = event.sortField;
  }

  const field = event.sortField ?? lastSortField.value ?? sortFieldValue.value;
  if (field) {
    const col = props.columns.find((c) => (c.field || c.id) === field);
    if (col) {
      // Encode direction so parent sets it directly (no independent cycling)
      let sortId = col.id;
      if (event.sortOrder === 1) sortId = `${col.id}:ASC`;
      else if (event.sortOrder === -1) sortId = `${col.id}:DESC`;
      // sortOrder=0 (removal) → bare ID → parent cycles from DESC to clear
      emit("headerClick", { ...col, id: sortId });
    }
  }

  // Clear tracked field after sort removal so it doesn't leak to future sorts
  if (event.sortOrder === 0) {
    lastSortField.value = undefined;
  }
}

// Selection → selectionChanged
function handleSelectionUpdate(items: T | T[]) {
  const arr = Array.isArray(items) ? items : [items];
  internalSelection.value = arr;
  emit("selectionChanged", arr);
}

// Row click → itemClick
function handleRowClick(event: { data: T }) {
  emit("itemClick", event.data);
}

// Pagination → paginationClick
function handlePaginationClick(page: number) {
  emit("paginationClick", page);
}

// Search → search:change (used for both @search and @update:search-value)
function handleSearchChange(value: string) {
  emit("search:change", value || undefined);
}

// Row reorder → row:reorder
function handleRowReorder(event: { dragIndex: number; dropIndex: number; value: T[] }) {
  emit("row:reorder", event);
}

// Pull refresh → scroll:ptr
function handlePullRefresh() {
  emit("scroll:ptr");
}

// Cell edit → onEditComplete + onCellBlur
function handleCellEditComplete(event: { data: T; field: string; newValue: unknown; index: number }) {
  emit("onEditComplete", {
    event: { field: event.field, value: event.newValue as string | number },
    index: event.index,
  });
  emit("onCellBlur", { row: event.index, field: event.field });
}

// Select all → select:all
function handleSelectAll(value: boolean) {
  emit("select:all", value);
}

// Add row → onAddNewRow
// Cancel VcDataTable's internal inlineEdit.addRow() because the parent manages items directly.
function handleAddRow(event: { defaults: Record<string, unknown>; cancel: () => void }) {
  event.cancel();
  emit("onAddNewRow");
}
</script>

<style lang="scss">
.vc-table-adapter {
  @apply tw-flex tw-flex-col tw-grow tw-basis-0 tw-overflow-hidden;

  &__empty-state {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 tw-gap-3;
    color: var(--neutrals-500);
  }

  &__empty-text {
    @apply tw-text-sm tw-text-center;
    color: var(--neutrals-600);
  }

  &__empty-action {
    @apply tw-text-sm tw-cursor-pointer tw-underline;
    color: var(--primary-500);

    &:hover {
      color: var(--primary-700);
    }
  }
}

/* Row highlight for selectedItemId support.
 * No !important — allows hover (higher specificity) to override naturally. */
.vc-data-table__row--highlighted {
  background-color: var(--primary-50);
}
</style>
