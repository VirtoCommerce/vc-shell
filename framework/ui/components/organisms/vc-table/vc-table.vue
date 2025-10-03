<template>
  <div
    v-loading:49="loading || columnsInit"
    class="vc-table"
  >
    <VcTableSelectAll
      :multiselect="multiselect"
      :selection="selection"
      :all-selected="allSelected"
      :total-count="totalCount"
      :header-checkbox="headerCheckbox"
      :select-all="selectAll"
      :show-selection-choice="showSelectionChoice"
      @update:selection="selection = $event"
      @update:all-selected="allSelected = $event"
      @update:header-checkbox="headerCheckbox = $event"
      @select:all="handleSelectAll"
    />
    <VcTableHeader
      :has-header-slot="!!$slots.header"
      :header="header"
      :columns-init="columnsInit"
      :search-value="searchValue"
      :active-filter-count="activeFilterCount"
      :search-placeholder="searchPlaceholder"
      :disable-filter="disableFilter"
      :expanded="expanded"
      @search:change="emit('search:change', $event)"
    >
      <template #header="slotProps">
        <slot
          name="header"
          v-bind="slotProps"
        />
      </template>
      <template
        v-if="$slots.filters"
        #filters="slotProps"
      >
        <slot
          name="filters"
          v-bind="slotProps"
        />
      </template>
    </VcTableHeader>
    <div class="vc-table__content">
      <!-- Table scroll container -->
      <VcContainer
        ref="scrollContainer"
        :no-padding="true"
        class="vc-table__scroll-container"
        :use-ptr="selection?.length === 0 ? pullToReload : undefined"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <VcTableMobileView
          v-if="$isMobile.value"
          :items="items"
          :columns="columns"
          :item-action-builder="itemActionBuilder"
          :multiselect="multiselect"
          :disabled-selection="disabledSelection"
          :selection="selection"
          :is-selected="isSelected"
          :row-checkbox="rowCheckbox"
          :editing="editing"
          :columns-init="columnsInit"
          :search-value="searchValue"
          :active-filter-count="activeFilterCount"
          :notfound="notfound"
          :empty="empty"
          @item-click="$emit('itemClick', $event)"
          @on-edit-complete="$emit('onEditComplete', $event)"
          @on-cell-blur="$emit('onCellBlur', $event)"
        >
          <template
            v-for="slot in slotNames"
            :key="slot"
            #[slot]="slotProps"
          >
            <slot
              :name="slot"
              v-bind="slotProps"
            />
          </template>
        </VcTableMobileView>

        <!-- Desktop table view -->
        <VcTableDesktopView
          v-else
          :items="items"
          :filtered-cols="filteredCols"
          :multiselect="multiselect"
          :header-checkbox="headerCheckbox"
          :is-header-hover="isHeaderHover"
          :expanded="expanded"
          :editing="editing"
          :sort-field="sortField"
          :sort-direction="sortDirection"
          :resizable-columns="resizableColumns"
          :internal-columns-sorted="internalColumnsSorted"
          :state-key="stateKey"
          :select-all="selectAll"
          :show-selection-choice="showSelectionChoice"
          :all-selected="allSelected"
          :selection="selection"
          :is-selected="isSelected"
          :disabled-selection="disabledSelection"
          :columns-init="columnsInit"
          :selected-item-id="selectedItemId"
          :reorderable-rows="reorderableRows"
          :enable-item-actions="enableItemActions"
          :item-actions="itemActions"
          :selected-row-index="selectedRowIndex"
          :has-click-listener="hasClickListener"
          :search-value="searchValue"
          :active-filter-count="activeFilterCount"
          :notfound="notfound"
          :empty="empty"
          :row-checkbox="rowCheckbox"
          :reorderable-columns="reorderableColumns"
          :internal-columns="internalColumns"
          @item-click="$emit('itemClick', $event)"
          @on-edit-complete="$emit('onEditComplete', $event)"
          @on-cell-blur="$emit('onCellBlur', $event)"
          @header-mouse-over="handleHeaderMouseOver"
          @column-switcher="handleColumnSwitcher"
          @header-click="handleHeaderClick"
          @select-all="handleSelectAll"
          @column-reorder="saveState"
          @column-resize="saveState"
          @row:reorder="$emit('row:reorder', $event)"
          @show-actions="showActions"
          @close-actions="closeActions"
          @toggle-column="toggleColumn"
          @update:header-checkbox="
            (event: boolean) => {
              headerCheckbox = event;
            }
          "
        >
          <template
            v-for="slot in slotNames"
            :key="slot"
            #[slot]="slotProps"
          >
            <slot
              :name="slot"
              v-bind="slotProps"
            />
          </template>
        </VcTableDesktopView>

        <VcTableAddNew
          :editing="editing"
          :add-new-row-button="addNewRowButton"
          @on-add-new-row="$emit('onAddNewRow')"
        />
      </VcContainer>
    </div>

    <VcTableFooter
      v-if="($slots['footer'] || footer) && items && items.length && !columnsInit"
      :total-label="totalLabel"
      :total-count="totalCount"
      :expanded="expanded"
      :pages="pages"
      :current-page="currentPage"
      :pagination-variant="paginationVariant"
      @pagination-click="
        (event: number) => {
          //scroll table to top
          tableBody?.scrollTo(0, 0);
          $emit('paginationClick', event);
        }
      "
    ></VcTableFooter>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends TableItem | string">
import { MaybeRef, Ref, computed, ref, unref, watch, getCurrentInstance, VNode, useSlots, toRefs } from "vue";
import { VcContainer, VcPagination } from "./../../";
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import * as _ from "lodash-es";
import "core-js/actual/array/to-spliced";
import "core-js/actual/array/to-sorted";
import VcTableAddNew from "./_internal/vc-table-add-new/vc-table-add-new.vue";
import type { ComponentProps } from "vue-component-type-helpers";
import { useTableSelection } from "./composables/useTableSelection";
import { useTableState } from "./composables/useTableState";
import { useTableActions } from "./composables/useTableActions";
import VcTableMobileView from "./_internal/vc-table-mobile-view/vc-table-mobile-view.vue";
import VcTableDesktopView from "./_internal/vc-table-desktop-view/vc-table-desktop-view.vue";
import VcTableHeader from "./_internal/vc-table-header/vc-table-header.vue";
import VcTableSelectAll from "./_internal/vc-table-select-all/vc-table-select-all.vue";
import VcTableFooter from "./_internal/vc-table-footer/vc-table-footer.vue";
import type { TableSlots, TableItem, TableColPartial, TableEmptyAction } from "./types";

defineSlots<TableSlots<T>>();

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
    editing?: boolean;
    addNewRowButton?: {
      show: boolean;
      title: string;
    };
    paginationVariant?: ComponentProps<typeof VcPagination>["variant"];
    selectionItems?: T[];
    disableFilter?: boolean;
    columnSelector?: "auto" | "defined" | MaybeRef<ITableColumns[]> | (() => ITableColumns[]);
    noHeaderCheckbox?: boolean;
  }>(),
  {
    items: () => [],
    totalCount: 0,
    pages: 0,
    expanded: true,
    currentPage: 0,
    header: true,
    footer: true,
    activeFilterCount: 0,
    resizableColumns: true,
    reorderableColumns: true,
    paginationVariant: "default",
    columnSelector: "auto",
    stateKey: "FALLBACK_STATE_KEY",
  },
);

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
  (e: "onCellBlur", args: { row: number | undefined; field: string }): void;
}>();

const instance = getCurrentInstance();

const { items, columns, stateKey, columnSelector, expanded, selectionItems, enableItemActions, itemActionBuilder } =
  toRefs(props);

// template refs
const tableBody = ref<HTMLElement | null>();
const scrollContainer = ref<typeof VcContainer>();

const slots = useSlots();

const slotNames = Object.keys(slots) as unknown;

const {
  selection,
  allSelected,
  disabledSelection,
  headerCheckbox,
  showSelectionChoice,
  isSelected,
  handleSelectAll,
  rowCheckbox,
} = useTableSelection<T>({
  items,
  disableItemCheckbox: props.disableItemCheckbox,
  totalCount: props.totalCount,
  onSelectionChanged: (values) => emit("selectionChanged", values),
  onSelectAll: (value) => emit("select:all", value),
});

const { itemActions, selectedRowIndex, calculateActions, showActions, closeActions } = useTableActions<T>({
  enableItemActions,
  itemActionBuilder,
});

const isHeaderHover = ref(false);
const columnSwitcherActive = ref(false);

const {
  internalColumns,
  columnsInit,
  internalColumnsSorted,
  filteredCols,
  saveState,
  toggleColumn,
  initializeColumns,
} = useTableState({
  stateKey,
  columnSelector,
  expanded,
});

const sortDirection = computed(() => {
  const entry = props.sort?.split(":");
  return (entry && entry.length === 2 && entry[1]) || "";
});

const sortField = computed(() => {
  const entry = props.sort?.split(":");
  return (entry && entry.length === 2 && entry[0]) || "";
});

const hasClickListener = typeof instance?.vnode.props?.["onItemClick"] === "function";

watch(
  () => items.value,
  (newVal) => {
    scrollContainer.value?.scrollTop();
    calculateActions(newVal);
  },
  { deep: true, immediate: true },
);

watch(
  () => selectionItems.value,
  (newVal) => {
    if (newVal) {
      if (!newVal?.length) return;
      selection.value = _.merge([], selection.value, newVal) as T[];
    }
  },
  {
    immediate: true,
  },
);

watch(
  [() => items.value, () => columns.value],
  ([newValItems, newValCols]) => {
    initializeColumns(newValCols, newValItems);
  },
  { deep: true, immediate: true },
);

function handleHeaderMouseOver(state: boolean) {
  if (columnSwitcherActive.value) {
    return;
  }
  isHeaderHover.value = state;
}

function handleColumnSwitcher(state: boolean) {
  columnSwitcherActive.value = state;

  if (!state) {
    isHeaderHover.value = false;
  }
}

function handleHeaderClick(item: TableColPartial) {
  const cleanCol = item;
  delete cleanCol.predefined;
  emit("headerClick", cleanCol as ITableColumns);
}
</script>

<style lang="scss">
:root {
  --table-border-color: var(--neutrals-200);
  --table-select-all-border-color: var(--neutrals-200);
  --table-header-bg: var(--primary-50);
  --table-header-border-color: var(--neutrals-200);
  --table-header-border:
    inset 0px 1px 0px var(--table-header-border-color), inset 0px -1px 0px var(--table-header-border-color);
  --table-header-text-color: var(--secondary-950);
  --table-resizer-color: var(--neutrals-200);
  --table-reorder-color: var(--primary-400);
  --table-select-all-bg: var(--primary-100);
  --table-row-bg-hover: var(--primary-100);
  --table-row-bg-odd: var(--additional-50);
  --table-row-bg-even: var(--neutrals-50);
  --table-row-hover: var(--primary-100);
  --table-row-bg-selected: var(--primary-100);
  --table-actions-bg: var(--primary-100);
  --table-actions-bg-hover: var(--primary-100);
  --table-actions-bg-hover-selected-item: var(--primary-100);
  --table-actions-text-color: var(--neutrals-600);
  --table-actions-tooltip-text: var(--neutrals-600);
  --table-actions-icon-color: var(--primary-500);
  --table-actions-icon-color-hover: var(--primary-600);
  --table-footer-bg: var(--neutrals-50);
  --table-footer-border-color: var(--neutrals-200);
  --table-row-drag-color: var(--primary-400);
  --table-row-drag-shadow: inset 0 -2px 0 0 var(--table-row-drag-color);
  --table-actions-color-danger: var(--danger-500);
  --table-actions-color-success: var(--success-500);
  --table-mobile-border-color: var(--secondary-200);
  --table-text-color: var(--neutrals-950);
  --table-sort-icon-color: var(--neutrals-400);
}

$variants: (
  danger: var(--table-actions-color-danger),
  success: var(--table-actions-color-success),
);

.vc-table {
  @apply tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0 tw-border-solid tw-border-t-0;
  @apply tw-flex-auto;
  border-color: var(--table-border-color);

  &__multiselect-mobile {
    @apply tw-flex tw-flex-col;
  }

  &__select-all-bar {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-min-h-14 tw-font-bold tw-text-lg tw-border-[color:var(--table-select-all-border-color)] tw-border-b tw-border-solid tw-box-border;
  }

  &__select-all-content {
    @apply tw-flex tw-flex-row tw-w-full tw-justify-between;
  }

  &__select-all-checkbox {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-3;
  }

  &__select-all-checkbox__checkbox {
    @apply tw-font-normal tw-self-center tw-flex;
  }

  &__select-all-choice {
    @apply tw-w-full tw-flex tw-py-2;
  }

  &__select-all-choice__content {
    @apply tw-w-full tw-flex tw-items-center tw-justify-center;
  }

  &__select-all-choice__button {
    @apply tw-text-sm;
  }

  &__content {
    @apply tw-flex tw-relative tw-overflow-hidden tw-grow;
  }

  &__scroll-container {
    @apply tw-grow tw-basis-0 tw-relative;
  }

  &__mobile-view {
    @apply tw-grow tw-basis-0 tw-relative;
    .vc-container__inner {
      @apply tw-flex tw-flex-grow tw-flex-col;
    }
  }

  &__mobile-items {
    @apply tw-flex-grow tw-flex tw-flex-col tw-h-max [width:-webkit-fill-available] [width:-moz-available];
  }

  &__mobile-empty {
    @apply tw-overflow-auto tw-flex tw-flex-col tw-h-full tw-flex-grow;
  }

  &__desktop-table {
    @apply tw-relative tw-box-border tw-w-full tw-h-full tw-flex tw-flex-col;
  }

  &__header {
    @apply tw-relative;
  }

  &__header-row {
    @apply tw-flex tw-flex-row [box-shadow:var(--table-header-border)] tw-bg-[--table-header-bg];
  }

  &__header-checkbox {
    @apply tw-flex-1 tw-flex tw-items-center tw-justify-center tw-w-9 tw-max-w-9 tw-min-w-9 tw-bg-[--table-header-bg] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1];
    @apply tw-border-0;
  }

  &__header-checkbox__content {
    @apply tw-flex tw-justify-center tw-items-center;
  }

  &__header-checkbox__resizer {
    @apply tw-w-px tw-bg-[--table-resizer-color] tw-h-full tw-absolute tw-right-0 tw-flex tw-justify-end;
  }

  &__header-cell {
    @apply tw-flex-1 tw-flex tw-items-center tw-h-[60px] tw-bg-[--table-header-bg] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1];
    @apply tw-border-0;
  }

  &__header-cell--sortable {
    @apply tw-cursor-pointer;

    &:hover {
      .vc-table__header-cell__sort-icons {
        @apply tw-visible;
      }
    }
  }

  &__header-cell--last {
  }

  &__header-cell__content {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3 tw-font-semibold tw-text-sm tw-text-[color:var(--table-header-text-color)] tw-leading-5;
  }

  &__header-cell__title {
    @apply tw-truncate;
  }

  &__header-cell__required {
    @apply tw-text-[color:var(--label-required-color)] tw-mr-1;
  }

  &__header-cell__sort-icon {
    @apply tw-ml-1 tw-text-[color:var(--table-sort-icon-color)];
  }

  &__header-cell__sort-icons {
    @apply tw-flex tw-flex-col tw-ml-1 tw-invisible tw-text-[color:var(--table-sort-icon-color)];
  }

  &__header-cell__resizer {
    @apply tw-w-1 tw-mr-1 tw-border-r tw-border-[--table-resizer-color] tw-border-solid tw-h-full tw-absolute tw-right-0 tw-flex tw-justify-end;
  }

  &__header-cell__resizer--cursor {
    @apply tw-cursor-col-resize;
  }

  &__column-switcher {
    @apply tw-absolute tw-h-10 tw-z-10 tw-right-0 tw-flex tw-items-center;
  }

  &__resizer {
    @apply tw-w-px tw-absolute tw-z-10 tw-hidden tw-h-full tw-bg-[--table-resizer-color] tw-cursor-col-resize;
  }

  &__reorder-ref {
    @apply tw-w-0.5 tw-bg-[--table-reorder-color] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-20 tw-hidden;
  }

  &__select-all-footer {
    @apply tw-h-16 tw-min-h-16 tw-bg-[--table-select-all-bg] tw-w-full tw-flex;
  }

  &__select-all-footer__content {
    @apply tw-w-full tw-flex tw-items-center tw-justify-center;
  }

  &__select-all-footer__button {
    @apply tw-text-sm;
  }

  &__body {
    @apply tw-flex tw-flex-col tw-overflow-auto;
  }

  &__body-row {
    @apply tw-flex tw-w-full tw-h-14 tw-min-h-14 tw-relative;
    position: relative;

    &.vc-table__drag-row-bottom {
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--table-row-drag-color);
      }
    }

    &.vc-table__drag-row-top {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--table-row-drag-color);
      }
    }
  }

  &__body-row--odd {
    @apply tw-bg-[--table-row-bg-odd];
  }

  &__body-row--even {
    @apply tw-bg-[--table-row-bg-even];
  }

  &__body-row--clickable {
    @apply hover:tw-bg-[--table-row-bg-hover] tw-cursor-pointer tw-border-solid;
  }

  &__body-row--selected {
    @apply tw-bg-[--table-row-hover] hover:tw-bg-[--table-row-hover];
  }

  &__body-row--selection {
    @apply hover:tw-bg-[--table-row-bg-selected] tw-bg-[--table-row-bg-selected];
  }

  &__body-row-checkbox {
    @apply tw-w-[36px] tw-max-w-[36px] tw-min-w-[36px] tw-relative tw-flex-1 tw-flex tw-items-center tw-justify-center;
  }

  &__body-row-checkbox-content {
    @apply tw-flex tw-justify-center tw-items-center;
  }

  &__body-row-checkbox-resizer {
    @apply tw-w-px tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-bg-[--table-resizer-color];
  }

  &__body-actions {
    @apply tw-absolute tw-flex tw-right-0 tw-px-2.5 tw-h-full tw-bg-[--table-actions-bg];
  }

  &__body-actions-content {
    @apply tw-flex tw-flex-row tw-items-center tw-text-[color:var(--table-actions-text-color)] tw-font-normal tw-text-base tw-leading-5 tw-gap-2.5;
  }

  &__body-actions-item {
    @apply tw-text-[color:var(--table-actions-icon-color)] tw-cursor-pointer tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center hover:tw-text-[color:var(--table-actions-icon-color-hover)];
  }

  &__body-actions-tooltip {
    @apply tw-not-italic tw-font-normal tw-text-base tw-leading-5 tw-text-[--table-actions-tooltip-text];
  }

  &__body-cell {
    @apply tw-box-border tw-overflow-hidden tw-px-3 tw-flex-1 tw-flex tw-items-center tw-relative;
  }

  &__body-cell__content {
    @apply tw-truncate tw-w-full tw-text-[color:var(--table-text-color)] tw-text-sm;
  }

  &__body-empty {
    @apply tw-overflow-auto tw-flex tw-flex-col tw-flex-auto;
  }

  /* Drag row styles */
  &__drag-row-bottom {
    box-shadow: inset 0 -2px 0 0 var(--table-row-drag-color);
  }

  &__drag-row-top {
    box-shadow: inset 0 2px 0 0 var(--table-row-drag-color);
  }

  /* Tooltip arrow styles */
  &__body-tooltip-arrow,
  &__body-tooltip-arrow:before {
    @apply tw-absolute tw-w-2 tw-h-2 tw-bg-inherit;
  }

  &__body-tooltip-arrow {
    @apply tw-invisible before:tw-visible before:tw-content-[""] before:tw-rotate-45;
  }

  &__body-tooltip[data-popper-placement^="top"] > .vc-table__body-tooltip-arrow {
    @apply tw-bottom-[-1px];
  }

  &__body-tooltip[data-popper-placement^="bottom"] > .vc-table__body-tooltip-arrow {
    @apply tw-top-[-1px];
  }

  /* Mobile border color */
  &__mobile-items-renderer {
    @apply tw-border-b tw-border-solid tw-border-[--table-mobile-border-color] tw-p-3 tw-gap-2 tw-flex tw-flex-wrap;
  }
}

.table-header-enter-active,
.table-header-leave-active {
  @apply tw-transition-all tw-duration-200 tw-ease-in-out;
}

.table-header-enter-from,
.table-header-leave-to {
  @apply tw-opacity-0 tw-transform tw-translate-y-[-30px];
}

.table-header-enter-to,
.table-header-leave-from {
  @apply tw-opacity-100 tw-transform tw-translate-y-0;
}
</style>
