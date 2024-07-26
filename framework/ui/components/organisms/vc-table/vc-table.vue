<template>
  <div
    v-loading:1000="unref(loading) || columnsInit"
    class="tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0 tw-border-[color:#eef0f2] tw-border-solid tw-border-t-0"
  >
    <div
      v-if="multiselect && $isMobile.value && (selection.length > 0 || allSelected)"
      class="tw-flex tw-flex-col"
    >
      <div
        class="tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-min-h-[56px] tw-font-bold tw-text-lg tw-border-[color:#eef0f2] tw-border-b tw-border-solid tw-box-border"
      >
        <div class="tw-flex tw-flex-row tw-w-full tw-justify-between">
          <div class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-3">
            <VcCheckbox
              v-model="headerCheckbox"
              class="tw-font-normal tw-self-center tw-flex"
              size="m"
              @click.stop
              >{{ $t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL_TRUNCATED") }}</VcCheckbox
            >
            {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.SELECTED") }}: {{ allSelected ? totalCount : selection.length }}
          </div>

          <VcButton
            text
            @click="
              () => {
                selection = [];
                allSelected = false;
              }
            "
            >{{ $t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") }}</VcButton
          >
        </div>
      </div>
      <div
        v-if="selectAll && showSelectionChoice"
        class="tw-w-full tw-flex tw-py-2"
      >
        <div class="tw-w-full tw-flex tw-items-center tw-justify-center">
          <div>
            {{
              allSelected
                ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
                : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
            }}
            <VcButton
              text
              class="tw-text-[13px]"
              @click="handleSelectAll"
              >{{
                allSelected ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL")
              }}</VcButton
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Header slot with filter and searchbar -->
    <slot
      v-else-if="
        ($slots['header'] || header) && (!columnsInit || searchValue || searchValue === '' || activeFilterCount)
      "
      name="header"
    >
      <div
        class="tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-box-border"
        :class="{
          'tw-px-4 tw-py-2 tw-border-[color:#eef0f2] tw-border-solid tw-border-b ': $isMobile.value,
          'tw-p-4': $isDesktop.value,
        }"
      >
        <!-- Table filter mobile button -->
        <div
          v-if="$isMobile.value && $slots['filters']"
          class="tw-mr-3"
        >
          <VcTableFilter :counter="activeFilterCount">
            <template #default="{ closePanel }">
              <slot
                name="filters"
                :close-panel="closePanel"
              ></slot>
            </template>
          </VcTableFilter>
        </div>

        <!-- Table search input -->
        <VcInput
          ref="searchInput"
          class="tw-grow tw-basis-0"
          :placeholder="searchPlaceholder || $t('COMPONENTS.ORGANISMS.VC_TABLE.SEARCH')"
          clearable
          name="table_search"
          :model-value="searchValue"
          @update:model-value="$emit('search:change', $event)"
        >
          <template #prepend-inner="{ focus }">
            <VcIcon
              icon="fas fa-search"
              class="tw-text-[color:#d2d4d7]"
              @click="focus?.()"
            ></VcIcon>
          </template>
        </VcInput>

        <!-- Table filter desktop button -->
        <div
          v-if="$isDesktop.value && $slots['filters']"
          class="tw-ml-3"
        >
          <VcTableFilter
            :title="t('COMPONENTS.ORGANISMS.VC_TABLE.ALL_FILTERS')"
            :counter="activeFilterCount"
            :parent-expanded="expanded"
          >
            <template #default="{ closePanel }">
              <slot
                name="filters"
                :close-panel="closePanel"
              ></slot>
            </template>
          </VcTableFilter>
        </div>
      </div>
    </slot>

    <div class="tw-flex tw-relative tw-overflow-hidden tw-grow">
      <!-- Table scroll container -->
      <VcContainer
        ref="scrollContainer"
        :no-padding="true"
        class="tw-grow tw-basis-0 tw-relative"
        :use-ptr="selection.length === 0 ? pullToReload : undefined"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <template v-if="$isMobile.value">
          <div v-if="items && items.length && !columnsInit">
            <VcTableMobileItem
              v-for="(item, i) in items"
              :key="i"
              :index="i"
              :items="items"
              :action-builder="itemActionBuilder"
              :swiping-item="mobileSwipeItem"
              :selection="selection"
              :is-selected="isSelected(item)"
              @click="$emit('itemClick', item)"
              @swipe-start="handleSwipe"
              @select="multiselect ? rowCheckbox(item) : undefined"
            >
              <slot
                name="mobile-item"
                :item="item"
              >
                <mobileTemplateRenderer
                  :item="item"
                  :index="i"
                />
              </slot>
            </VcTableMobileItem>
          </div>
          <div
            v-else
            class="tw-overflow-auto tw-flex tw-flex-col tw-h-full"
          >
            <!-- Empty table view -->
            <VcTableEmpty
              :items="items"
              :columns-init="columnsInit"
              :search-value="searchValue"
              :active-filter-count="activeFilterCount"
              :notfound="notfound"
              :empty="empty"
            >
              <template #notfound>
                <slot name="notfound"></slot>
              </template>
              <template #empty>
                <slot name="empty"></slot>
              </template>
            </VcTableEmpty>
          </div>
        </template>

        <!-- Desktop table view -->
        <div
          v-else
          ref="tableRef"
          class="tw-relative tw-box-border tw-w-full tw-h-full tw-flex tw-flex-col"
          :class="{
            'vc-table_empty': !items || !items.length,
            'vc-table_multiselect': multiselect,
          }"
        >
          <div
            v-if="filteredCols.length"
            class="vc-table__header tw-flex tw-flex-col tw-sticky tw-top-0 tw-bg-[#f9f9f9] tw-z-[1] tw-box-border"
            @mouseenter="handleHeaderMouseOver(true)"
            @mouseleave="handleHeaderMouseOver(false)"
          >
            <div class="vc-table__header-row tw-flex tw-flex-row">
              <div
                v-if="editing && multiselect && items && items.length"
                class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-w-[28px] tw-max-w-[28px] tw-min-w-[28px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
              >
                <div class="tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    v-model="headerCheckbox"
                    @click.stop
                  ></VcCheckbox>
                </div>
                <div class="tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-flex tw-justify-end">
                  <div class="tw-w-px tw-bg-[#e5e7eb] tw-h-full"></div>
                </div>
              </div>
              <div
                v-for="(item, index) in filteredCols"
                :id="item.id"
                :key="item.id"
                class="vc-table__header tw-flex-1 tw-flex tw-items-center tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
                :class="[
                  {
                    'tw-cursor-pointer tw-group': item.sortable,
                    'tw-p-r-[35px]': index === filteredCols.length - 1,
                  },
                  item.align ? tableAlignment[item.align as keyof typeof tableAlignment] : '',
                ]"
                :style="{ maxWidth: item.width, width: item.width }"
                @mousedown="onColumnHeaderMouseDown"
                @dragstart="onColumnHeaderDragStart($event, item)"
                @dragover="onColumnHeaderDragOver"
                @dragleave="onColumnHeaderDragLeave"
                @drop="onColumnHeaderDrop($event, item)"
                @click="handleHeaderClick(item)"
              >
                <div
                  v-if="!editing && multiselect && index === 0 && items && items.length"
                  class="tw-flex tw-pl-5 tw-items-center tw-justify-center tw-w-auto tw-bg-[#f9f9f9] tw-box-border tw-select-none tw-overflow-hidden tw-z-[1] tw-shrink-0"
                >
                  <div class="tw-flex tw-justify-center tw-items-center">
                    <VcCheckbox
                      v-model="headerCheckbox"
                      size="m"
                      @click.stop
                    ></VcCheckbox>
                  </div>
                </div>
                <div class="tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3 tw-font-bold">
                  <div class="tw-truncate">
                    <span
                      v-if="editing && item.rules?.required"
                      class="tw-text-[color:var(--label-required-color)] tw-mr-1"
                      >*</span
                    >
                    <slot :name="`header_${item.id}`">{{ item.title }}</slot>
                  </div>
                  <div
                    v-if="sortField === item.id"
                    class="tw-ml-1"
                  >
                    <VcIcon
                      size="xs"
                      :icon="`fas fa-caret-${sortDirection === 'DESC' ? 'down' : 'up'}`"
                    ></VcIcon>
                  </div>
                  <div
                    v-else
                    class="tw-flex tw-flex-col tw-ml-1 tw-invisible group-hover:tw-visible"
                  >
                    <VcIcon
                      size="xs"
                      icon="fas fa-caret-up"
                    ></VcIcon>
                    <VcIcon
                      size="xs"
                      icon="fas fa-caret-down"
                    ></VcIcon>
                  </div>
                </div>
                <div
                  class="tw-w-[5px] tw-mr-[3px] tw-border-r tw-border-r-[#e5e7eb] tw-border-solid tw-h-full tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-flex tw-justify-end"
                  :class="{
                    'tw-cursor-col-resize': props.resizableColumns,
                  }"
                  @mousedown="handleMouseDown($event, item)"
                ></div>
              </div>

              <div
                v-if="isHeaderHover && props.expanded"
                class="tw-absolute tw-h-[42px] tw-z-[1] tw-right-0 tw-flex tw-items-center"
              >
                <VcTableColumnSwitcher
                  :items="internalColumnsSorted"
                  :state-key="stateKey"
                  @change="toggleColumn"
                  @on-active="handleColumnSwitcher"
                ></VcTableColumnSwitcher>
              </div>
            </div>

            <div
              ref="resizer"
              class="tw-w-px tw-absolute tw-z-10 tw-hidden tw-h-full tw-bg-[#e5e7eb] tw-cursor-col-resize"
            ></div>
            <div
              ref="reorderRef"
              class="tw-w-0.5 tw-bg-[#41afe6] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-[2] tw-hidden"
            ></div>
          </div>
          <div
            v-if="selectAll && showSelectionChoice"
            class="tw-h-[60px] tw-min-h-[60px] tw-bg-[#dfeef9] tw-w-full tw-flex"
          >
            <div class="tw-w-full tw-flex tw-items-center tw-justify-center">
              <div>
                {{
                  allSelected
                    ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
                    : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
                }}
                <VcButton
                  text
                  class="tw-text-[13px]"
                  @click="handleSelectAll"
                  >{{
                    allSelected
                      ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL")
                      : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL")
                  }}</VcButton
                >
              </div>
            </div>
          </div>
          <div
            v-if="items && items.length && !columnsInit"
            class="tw-flex tw-flex-col tw-overflow-auto"
          >
            <div
              v-for="(item, itemIndex) in items"
              :key="(typeof item === 'object' && 'id' in item && item.id) || itemIndex"
              class="vc-table__body-row tw-flex tw-w-full tw-h-[60px] tw-min-h-[60px] tw-bg-white tw-relative tw-group"
              :class="{
                'hover:!tw-bg-[#dfeef9] tw-cursor-pointer': hasClickListener,
                '!tw-bg-[#F9F9F9]': itemIndex % 2 === 1,
                '!tw-bg-[#dfeef9] hover:!tw-bg-[#dfeef9]':
                  typeof item === 'object' && 'id' in item && item.id ? selectedItemId === item.id : false,
              }"
              @click="$emit('itemClick', item)"
              @mouseleave="closeActions"
              @mousedown="onRowMouseDown"
              @dragstart="onRowDragStart($event, item)"
              @dragover="onRowDragOver($event, item)"
              @dragleave="onRowDragLeave"
              @dragend="onRowDragEnd"
              @drop="onRowDrop"
              @mouseover="showActions(itemIndex)"
            >
              <div
                v-if="editing && multiselect && typeof item === 'object'"
                class="tw-w-[28px] tw-max-w-[28px] tw-min-w-[28px] tw-relative tw-flex-1 tw-flex tw-items-center tw-justify-center"
                @click.stop
              >
                <div class="tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    :model-value="isSelected(item)"
                    @update:model-value="rowCheckbox(item)"
                  ></VcCheckbox>
                </div>
                <div class="tw-w-px tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-bg-[#e5e7eb]"></div>
              </div>
              <div
                v-for="cell in filteredCols"
                :id="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                :key="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                class="tw-box-border tw-overflow-hidden tw-px-3 tw-flex-1 tw-flex tw-items-center tw-relative"
                :class="[cell.class]"
                :style="{ maxWidth: cell.width, width: cell.width }"
              >
                <div class="tw-truncate tw-w-full">
                  <renderCellSlot
                    :item="item"
                    :cell="cell"
                    :index="itemIndex"
                  />
                </div>
              </div>
              <div
                v-if="
                  enableItemActions && itemActionBuilder && typeof item === 'object' && selectedRowIndex === itemIndex
                "
                class="tw-absolute tw-flex tw-right-0 tw-px-[10px] actions tw-h-full tw-bg-[#f4f8fb]"
                :class="{
                  'group-hover:!tw-bg-[#dfeef9]': hasClickListener,
                }"
                @click.stop
              >
                <div
                  class="tw-flex tw-flex-row tw-items-center tw-text-[#3f3f3f] tw-font-normal not-italic tw-text-base tw-leading-[20px] tw-gap-[10px]"
                >
                  <div
                    v-for="(itemAction, i) in itemActions[itemIndex]"
                    :key="i"
                    :class="[
                      'tw-text-[#319ed4] tw-cursor-pointer tw-w-[22px] tw-h-[22px] tw-flex tw-items-center tw-justify-center hover:tw-text-[#257fad]',
                    ]"
                    @click.stop="itemAction.clickHandler(item, itemIndex)"
                  >
                    <VcTooltip
                      placement="bottom"
                      :offset="{
                        mainAxis: 5,
                      }"
                    >
                      <VcIcon
                        :icon="itemAction.icon"
                        size="m"
                      />
                      <template #tooltip>
                        <div class="tw-not-italic tw-font-normal tw-text-base tw-leading-[20px] tw-text-[#3f3f3f]">
                          {{ itemAction.title }}
                        </div>
                      </template>
                    </VcTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="tw-overflow-auto tw-flex tw-flex-col tw-flex-auto"
          >
            <!-- Empty table view -->
            <VcTableEmpty
              :items="items"
              :columns-init="columnsInit"
              :search-value="searchValue"
              :active-filter-count="activeFilterCount"
              :notfound="notfound"
              :empty="empty"
            >
              <template #notfound>
                <slot name="notfound"></slot>
              </template>
              <template #empty>
                <slot name="empty"></slot>
              </template>
            </VcTableEmpty>
          </div>
        </div>
        <VcTableAddNew
          :editing="editing"
          :add-new-row-button="addNewRowButton"
          @on-add-new-row="$emit('onAddNewRow')"
        />
      </VcContainer>
    </div>

    <!-- Table footer -->
    <slot
      v-if="($slots['footer'] || footer) && items && items.length && !columnsInit"
      name="footer"
    >
      <div
        class="tw-bg-[#fbfdfe] tw-border-t tw-border-solid tw-border-[#eaedf3] tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between"
        :class="{
          'tw-py-2 tw-px-4': $isMobile.value,
          'tw-p-4': $isDesktop.value,
        }"
      >
        <!-- Table pagination -->
        <VcPagination
          :expanded="expanded"
          :pages="pages"
          :current-page="currentPage"
          @item-click="$emit('paginationClick', $event)"
        ></VcPagination>

        <!-- Table counter -->
        <VcTableCounter
          :label="totalLabel || $t('COMPONENTS.ORGANISMS.VC_TABLE.TOTALS')"
          :value="totalCount"
        ></VcTableCounter>
      </div>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends TableItem | string">
import { useCurrentElement, useLocalStorage } from "@vueuse/core";
import {
  MaybeRef,
  Ref,
  computed,
  h,
  onBeforeUnmount,
  ref,
  toValue,
  unref,
  watch,
  getCurrentInstance,
  shallowRef,
  useSlots,
} from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcCheckbox, VcContainer, VcIcon, VcInput, VcPagination, VcLabel } from "./../../";
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import VcTableColumnSwitcher from "./_internal/vc-table-column-switcher/vc-table-column-switcher.vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import * as _ from "lodash-es";
import "core-js/actual/array/to-spliced";
import "core-js/actual/array/to-sorted";
import VcTableAddNew from "./_internal/vc-table-add-new/vc-table-add-new.vue";
import VcTableEmpty from "./_internal/vc-table-empty/vc-table-empty.vue";

export interface StatusImage {
  image?: string;
  text: string | Ref<string>;
  action?: string;
  clickHandler?: () => void;
}

export interface TableItem {
  [x: string]: any;
  actions?: IActionBuilderResult[];
}

defineSlots<{
  header: (props: any) => any;
  filters: (args: { closePanel: () => void }) => any;
  "mobile-item": (args: { item: T }) => any;
  [key: `header_${string}`]: (props: any) => any;
  [key: `item_${string}`]: (args: { item: T; cell: ITableColumns; index: number }) => any;
  notfound: (props: any) => any;
  empty: (props: any) => any;
  footer: (props: any) => any;
}>();

const props = withDefaults(
  defineProps<{
    columns: ITableColumns[];
    items: T[];
    itemActionBuilder?: (item: T) => IActionBuilderResult[] | undefined;
    sort?: string;
    multiselect?: boolean;
    expanded?: boolean;
    totalLabel?: string;
    totalCount?: number;
    pages?: number;
    currentPage?: number;
    searchPlaceholder?: string;
    searchValue?: string;
    loading?: MaybeRef<boolean>;
    empty?: StatusImage;
    notfound?: StatusImage;
    header?: boolean;
    footer?: boolean;
    activeFilterCount?: number;
    selectedItemId?: string;
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
  },
);

const emit = defineEmits<{
  paginationClick: [page: number];
  selectionChanged: [values: T[]];
  "search:change": [value: string | number | Date | null | undefined];
  headerClick: [item: ITableColumns];
  itemClick: [item: T];
  "scroll:ptr": [];
  "row:reorder": [args: { dragIndex: number; dropIndex: number; value: T[] }];
  "select:all": [values: boolean];
  onEditComplete: [args: { event: { field: string; value: string | number }; index: number }];
  onAddNewRow: [];
  onCellBlur: [args: { row: number | undefined; field: string }];
}>();

const { t } = useI18n({ useScope: "global" });
const instance = getCurrentInstance();
const slots = useSlots();

// template refs
const reorderRef = ref<HTMLElement | null>();
const tableRef = ref<HTMLElement | null>();
const searchInput = ref<HTMLElement | null>();

// event listeners
let columnResizeListener: ((...args: any[]) => any) | null = null;
let columnResizeEndListener: ((...args: any[]) => any) | null = null;

const selection = ref<T[]>([]) as Ref<T[]>;
const allSelected = ref(false);

const selectedRowIndex = shallowRef();

const scrollContainer = ref<typeof VcContainer>();

const itemActions: Ref<IActionBuilderResult[][]> = ref([]);
const mobileSwipeItem = ref<string>();
const columnResizing = ref(false);
const resizeColumnElement = ref<ITableColumns>();
const nextColumn = ref<ITableColumns>();
const lastResize = ref<number>();
const table = useCurrentElement();
const resizer = ref();
const isHeaderHover = ref(false);
const columnSwitcherActive = ref(false);
const state = useLocalStorage<Partial<ITableColumns & { predefined: boolean }>[]>(
  "VC_TABLE_STATE_" + props.stateKey.toUpperCase(),
  [],
);
const internalColumns: Ref<ITableColumns[]> = ref([]);
const draggedColumn = ref();
const draggedElement = ref<HTMLElement>();
const dropPosition = ref();
const columnsInit = ref(true);
const isHovered = ref(undefined) as Ref<{ item: T; state: boolean } | undefined>;

// row reordering variables
const draggedRow = ref<T>();
const rowDragged = ref(false);
const droppedRowIndex = ref<number>();
const draggedRowIndex = ref<number>();

onBeforeUnmount(() => {
  unbindColumnResizeEvents();
});

const sortDirection = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[1];
});

const sortField = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[0];
});

const hasClickListener = typeof instance?.vnode.props?.["onItemClick"] === "function";

const renderCellSlot = ({ item, cell, index }: { item: T; cell: ITableColumns; index: number }) => {
  const isSlotExist = slots[`item_${cell.id}`];

  const isFirstCell = filteredCols.value.indexOf(cell) === 0;

  const isRowSelected = selection.value.includes(item);

  const checkboxComponent = h(
    "div",
    {
      class: "tw-absolute tw-z-10 tw-top-0 tw-bottom-0 tw-left-[20px] tw-right-0 tw-flex tw-items-center",
    },
    h(VcCheckbox, {
      class: "",
      size: "m",
      modelValue: selection.value.includes(item),
      onClick: (e: Event) => e.stopPropagation(),
      onMouseover: () => (isHovered.value = { state: true, item: item }),
      onMouseout: () => (isHovered.value = { state: false, item: item }),
      "onUpdate:modelValue": () => {
        rowCheckbox(item);
      },
    }),
  );

  const checkboxVisibilityHandler =
    !props.editing &&
    props.multiselect &&
    props.items &&
    props.items.length &&
    ((isFirstCell && selectedRowIndex.value === index) || (isRowSelected && isFirstCell));

  return h("div", { class: "" }, [
    checkboxVisibilityHandler ? checkboxComponent : undefined,
    h(
      "div",
      {
        class: checkboxVisibilityHandler
          ? isHovered.value?.item === item && isHovered.value.state
            ? "tw-opacity-5"
            : "tw-opacity-15"
          : "",
      },
      !isSlotExist
        ? h(VcTableCell, {
            cell,

            item: item as TableItem,
            index,
            editing: props.editing,
            onUpdate: (event) => {
              emit("onEditComplete", { event, index });
            },
            onBlur: (event) => emit("onCellBlur", event),
          })
        : slots[`item_${cell.id}`]?.({ item, cell, index }),
    ),
  ]);
};

const calculateElWidth = (id: string) => {
  const el = document.getElementById(id);
  return el ? el.offsetWidth : 0;
};

const allColumns = ref([]) as Ref<ITableColumns[]>;

const mobileTemplateRenderer = ({ item, index }: { item: TableItem | string; index: number }) => {
  return h(
    "div",
    { class: "tw-border-b tw-border-solid tw-border-b-[#e3e7ec] tw-p-3 tw-gap-2 tw-flex tw-flex-wrap" },
    props.columns.map((x) => {
      return h("div", { class: "tw-grow tw-w-[33%] tw-ml-3  tw-truncate", key: `mobile-view-item-${index}` }, [
        h(VcLabel, { class: "tw-mb-1 tw-truncate", required: x?.rules?.required }, () => toValue(x.title)),
        slots[`item_${x.id}`]
          ? slots[`item_${x.id}`]?.({ item, cell: x, index })
          : [
              typeof item === "object"
                ? h(VcTableCell, {
                    cell: { ...x, class: "!tw-justify-start" },
                    item,
                    key: `mobile-view-cell-${index}`,
                    class: "tw-mb-4",
                    editing: props.editing,
                    index,
                    onUpdate: (event) => {
                      emit("onEditComplete", { event: event, index });
                    },
                    onBlur: (event) => emit("onCellBlur", event),
                  })
                : undefined,
            ],
      ]);
    }),
  );
};

watch(
  () => props.items,
  (newVal) => {
    let cols: ITableColumns[] = [];
    if (newVal && newVal.length) {
      cols = Object.keys(newVal[0]).map((key) => {
        return {
          id: key,
          // From camelCase to human readable with first letter capitalized
          title: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          visible: false,
          predefined: false,
        };
      });
    }

    const predefined = props.columns.map((item) => ({
      ...item,
      predefined: true,
      visible: typeof item.visible !== "undefined" ? item.visible : true,
    }));
    allColumns.value = _.unionBy(predefined, cols, "id");

    restoreState();
    columnsInit.value = false;
  },
  { deep: true, immediate: true },
);

const internalColumnsSorted = computed(() => {
  // alphabetical order
  return internalColumns.value /* @ts-expect-error  - toSorted is not parsed correctly by ts */
    .toSorted((a, b) => {
      if (a && b && a.title && b.title) {
        return toValue(a.title).localeCompare(toValue(b.title));
      }
      return 0;
    });
});

const tableAlignment = {
  start: "tw-justify-start",
  end: "tw-justify-end",
  center: "tw-justify-center",
  between: "tw-justify-between",
  around: "tw-justify-around",
  evenly: "tw-justify-evenly",
};

const headerCheckbox = computed({
  get() {
    return props.items && props.items.length ? selection.value.length === props.items.length : false;
  },
  set(checked: boolean) {
    let _selected: T[] = [];

    if (checked) {
      _selected = props.items;
    }

    selection.value = _selected;
    allSelected.value = false;
  },
});

const filteredCols = computed(() => {
  return internalColumns.value.filter((x) => {
    if (x.visible === false) {
      return false;
    }
    if (!props.expanded) {
      return x.alwaysVisible;
    }
    return x;
  });
});

const showSelectionChoice = computed(() => selection.value.length === props.items.length && props.pages > 1);

watch(
  () => props.items,
  (newVal) => {
    scrollContainer.value?.scrollTop();

    calculateActions(newVal);

    selection.value = selection.value.filter((selection) => newVal.includes(selection));
  },
  { deep: true, immediate: true },
);

watch(
  () => selection.value,
  (newVal) => {
    emit("selectionChanged", newVal);
  },
  { deep: true },
);

watch(
  () => allSelected.value,
  (newVal) => {
    emit("select:all", newVal);
  },
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

function handleSelectAll() {
  allSelected.value = !allSelected.value;

  if (!allSelected.value) {
    selection.value = [];
    return;
  }
}

function isSelected(item: T) {
  return selection.value.indexOf(item) > -1;
}

function rowCheckbox(item: T) {
  const clear = item;
  const index = selection.value.indexOf(clear);
  if (index > -1) {
    selection.value = selection.value.filter((x) => x !== clear);
  } else {
    selection.value.push(clear);
  }
}

function showActions(index: number) {
  if (typeof props.items[index] === "object") {
    selectedRowIndex.value = index;
  }
}

async function calculateActions(items: T[]) {
  if (props.enableItemActions && typeof props.itemActionBuilder === "function") {
    const populatedItems: IActionBuilderResult[][] = [];
    for (let index = 0; index < items.length; index++) {
      if (typeof items[index] === "object") {
        const elementWithActions = await props.itemActionBuilder(items[index]);
        if (elementWithActions) {
          populatedItems.push(elementWithActions);
        }
      }
    }
    itemActions.value = populatedItems;
  }
}

function closeActions() {
  selectedRowIndex.value = undefined;
}

function handleSwipe(id: string) {
  mobileSwipeItem.value = id;
}

function handleHeaderClick(item: ITableColumns) {
  emit("headerClick", item);
}

function handleMouseDown(e: MouseEvent, item: ITableColumns) {
  if (props.resizableColumns) {
    const containerLeft = getOffset(table.value as HTMLElement).left;
    resizeColumnElement.value = item;
    columnResizing.value = true;
    lastResize.value = e.pageX - containerLeft + (table.value as HTMLDivElement).scrollLeft;

    bindColumnResizeEvents();
  }
}

function bindColumnResizeEvents() {
  if (!columnResizeListener) {
    columnResizeListener = document.addEventListener("mousemove", (event: MouseEvent) => {
      if (columnResizing.value) {
        onColumnResize(event);
      }
    }) as unknown as typeof document.addEventListener;
  }
  if (!columnResizeEndListener) {
    columnResizeEndListener = document.addEventListener("mouseup", () => {
      if (columnResizing.value) {
        columnResizing.value = false;
        onColumnResizeEnd();
      }
    }) as unknown as typeof document.addEventListener;
  }
}

function unbindColumnResizeEvents() {
  if (columnResizeListener) {
    document.removeEventListener("document", columnResizeListener);
    columnResizeListener = null;
  }
  if (columnResizeEndListener) {
    document.removeEventListener("document", columnResizeEndListener);
    columnResizeEndListener = null;
  }
}

function onColumnResize(event: MouseEvent) {
  if (columnResizing.value) {
    const containerLeft = getOffset(table.value as HTMLElement).left;

    resizer.value.style.top = 0 + "px";
    const leftOffset = event.pageX - containerLeft + (table.value as HTMLDivElement).scrollLeft;
    resizer.value.style.left =
      Math.min(leftOffset, (table.value as HTMLDivElement).offsetWidth - resizer.value.offsetWidth - 70) + "px";
    resizer.value.style.display = "block";
  }
}

function getOffset(element: HTMLElement) {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  const rect = element.getBoundingClientRect();
  const win = element.ownerDocument.defaultView;
  return {
    top: rect.top + ((win && win.scrollY) ?? 0),
    left: rect.left + ((win && win.scrollX) ?? 0),
  };
}

function onColumnResizeEnd() {
  const delta = resizer.value.offsetLeft - (lastResize.value ?? 0);

  const columnElement: HTMLElement | null = (table.value as HTMLDivElement).querySelector(
    `#${resizeColumnElement.value?.id}`,
  );

  if (columnElement) {
    const columnWidth = columnElement.offsetWidth;
    const newColumnWidth = columnWidth + delta;

    const minWidth = 15;

    if (columnWidth + delta > parseInt(minWidth.toString(), 10) && resizeColumnElement.value) {
      nextColumn.value = filteredCols.value[filteredCols.value.indexOf(resizeColumnElement.value) + 1];

      if (nextColumn.value) {
        const nextColElement = (table.value as HTMLDivElement).querySelector(`#${nextColumn.value.id}`);

        const nextColumnWidth = (nextColElement as HTMLElement).offsetWidth - delta;

        if (newColumnWidth > 15 && nextColumnWidth > 15) {
          resizeTableCells(newColumnWidth, nextColumnWidth);
        }
      } else {
        if (newColumnWidth > 15) {
          resizeColumnElement.value.width = newColumnWidth + "px";
        }
      }
    }
    resizer.value.style.display = "none";

    unbindColumnResizeEvents();

    saveState();
  }
}

function resizeTableCells(newColumnWidth: number, nextColumnWidth: number) {
  if (resizeColumnElement.value) {
    resizeColumnElement.value.width = newColumnWidth + "px";
  }
  if (nextColumn.value) {
    nextColumn.value.width = nextColumnWidth + "px";
  }
}

function onColumnHeaderDragStart(event: DragEvent, item: ITableColumns) {
  if (columnResizing.value) {
    event.preventDefault();
    return;
  }

  draggedColumn.value = item;
  draggedElement.value = event.target as HTMLElement;
  if (event.dataTransfer) {
    event.dataTransfer.setData("text", "reorder");
  }
}

function findParentHeader(element: HTMLElement) {
  if (element.classList.contains("vc-table__header")) {
    return element;
  } else {
    let parent = element.parentElement;

    while (parent && !parent.classList.contains("vc-table__header")) {
      parent = parent.parentElement;
      if (!parent) break;
    }

    return parent;
  }
}

function onColumnHeaderDragOver(event: DragEvent) {
  const dropHeader = findParentHeader(event.target as HTMLElement);

  if (props.reorderableColumns && draggedColumn.value && dropHeader) {
    event.preventDefault();
    const containerOffset = getOffset(table.value as HTMLElement);
    const dropHeaderOffset = getOffset(dropHeader);

    if (draggedElement.value !== dropHeader && reorderRef.value && tableRef.value) {
      const targetLeft = dropHeaderOffset.left - containerOffset.left;
      const columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

      reorderRef.value.style.top = dropHeaderOffset.top - getOffset(tableRef.value).top + "px";

      if (event.pageX > columnCenter) {
        reorderRef.value.style.left = targetLeft + dropHeader.offsetWidth - 5 + "px";

        dropPosition.value = 1;
      } else {
        reorderRef.value.style.left = targetLeft - 5 + "px";
        dropPosition.value = -1;
      }

      reorderRef.value.style.display = "block";
    }
  }
}
function onColumnHeaderDragLeave(event: DragEvent) {
  if (props.reorderableColumns && draggedColumn.value) {
    event.preventDefault();

    if (reorderRef.value != undefined) {
      reorderRef.value.style.display = "none";
    }
  }
}

function onColumnHeaderDrop(event: DragEvent, item: ITableColumns) {
  event.preventDefault();

  if (draggedColumn.value) {
    const dragIndex = internalColumns.value.indexOf(draggedColumn.value);
    const dropIndex = internalColumns.value.indexOf(item);

    let allowDrop = dragIndex !== dropIndex;

    if (
      allowDrop &&
      ((dropIndex - dragIndex === 1 && dropPosition.value === -1) ||
        (dropIndex - dragIndex === -1 && dropPosition.value === 1))
    ) {
      allowDrop = false;
    }

    if (allowDrop) {
      reorderArray(internalColumns.value, dragIndex, dropIndex);

      saveState();
    }

    if (reorderRef.value) {
      reorderRef.value.style.display = "none";
    }
    if (draggedElement.value) {
      draggedElement.value.draggable = false;
    }
    draggedColumn.value = null;
    dropPosition.value = null;
  }
}

function saveState() {
  console.debug("[@vc-shell/framework#vc-table.vue] - Save state");

  const colsClone = _.cloneDeep(internalColumns.value);
  state.value = colsClone.map((col) => _.pick(col, "id", "visible", "width", "predefined"));
}

function restoreState() {
  console.debug("[@vc-shell/framework#vc-table.vue] - Restore state");

  if (state.value && state.value.length) {
    //  Iterate over the state value and update corresponding columns in allColumns
    for (const item of state.value) {
      const matchingColumn = _.cloneDeep(allColumns.value.find((col) => col.id === item.id));
      if (matchingColumn) {
        matchingColumn.width = item.width || matchingColumn.width;
        matchingColumn.visible = item.visible;
        // Remove the matched column from internalColumns
        internalColumns.value = internalColumns.value.filter((col) => col.id !== matchingColumn.id);
      }
      if (item.predefined && !props.columns.some((col) => col.id === item.id)) {
        _.remove(state.value, item);
      }
    }
    // Merge the updated columns with the remaining state columns
    internalColumns.value = state.value.map((stateItem) => {
      const id = stateItem.id;

      const propsColumn = _.find(props.columns, { id });
      const allColumn = _.find(allColumns.value, { id });

      return _.merge({}, propsColumn, allColumn, stateItem);
    });
  } else {
    internalColumns.value = allColumns.value;
  }
}

function reorderArray(value: unknown[], from: number, to: number) {
  if (value && from !== to) {
    if (to >= value.length) {
      to %= value.length;
      from %= value.length;
    }

    value.splice(to, 0, value.splice(from, 1)[0]);
  }
}

function onColumnHeaderMouseDown(event: MouseEvent) {
  if (props.reorderableColumns) {
    (event.currentTarget as HTMLElement).draggable = true;
  }
}

function toggleColumn(item: ITableColumns) {
  // if item is not in internalColumns, add it
  if (!internalColumns.value.find((x) => x.id === item.id)) {
    internalColumns.value.push(item);
  } else {
    // internalColumns.value = internalColumns.value.filter((x) => x.id !== item.id);
  }
  if (item) {
    internalColumns.value = internalColumns.value.map((x) => {
      if (x.id === item.id) {
        x = item;
      }
      return x;
    });
  }

  saveState();
}

function onRowMouseDown(event: MouseEvent) {
  if (props.reorderableRows) {
    (event.currentTarget as HTMLElement).draggable = true;
  }
}

function onRowDragStart(event: DragEvent, item: T) {
  if (!props.reorderableRows) {
    return;
  }
  rowDragged.value = true;
  draggedRow.value = item;
  draggedRowIndex.value = props.items.indexOf(item);
  if (event.dataTransfer) {
    event.dataTransfer.setData("text", "row-reorder");
  }
}

function onRowDragOver(event: DragEvent, item: T) {
  if (!props.reorderableRows) {
    return;
  }
  const index = props.items.indexOf(item);

  if (rowDragged.value && draggedRow.value !== item) {
    const rowElement = event.currentTarget as HTMLElement;
    const rowY = getOffset(rowElement).top;
    const pageY = event.pageY;
    const rowMidY = rowY + rowElement.offsetHeight / 2;
    const previousRowElement = rowElement.previousElementSibling;

    if (pageY < rowMidY) {
      rowElement.classList.remove("vc-table__drag-row-bottom");
      droppedRowIndex.value = index;

      if (previousRowElement) {
        previousRowElement.classList.add("vc-table__drag-row-bottom");
      } else {
        rowElement.classList.add("vc-table__drag-row-top");
      }
    } else {
      if (previousRowElement) {
        previousRowElement.classList.remove("vc-table__drag-row-bottom");
      } else {
        rowElement.classList.add("vc-table__drag-row-top");
      }
      droppedRowIndex.value = index + 1;
      rowElement.classList.add("vc-table__drag-row-bottom");
    }

    event.preventDefault();
  }
}

function onRowDragLeave(event: DragEvent) {
  event.preventDefault();

  const rowElement = event.currentTarget as HTMLElement;
  const previousRowElement = rowElement.previousElementSibling;

  if (previousRowElement) {
    previousRowElement.classList.remove("vc-table__drag-row-bottom");
  }

  rowElement.classList.remove("vc-table__drag-row-top");
  rowElement.classList.remove("vc-table__drag-row-bottom");
}

function onRowDragEnd(event: DragEvent) {
  rowDragged.value = false;
  draggedRowIndex.value = undefined;
  droppedRowIndex.value = undefined;
  (event.currentTarget as HTMLElement).draggable = false;
}

function onRowDrop(event: DragEvent) {
  if (droppedRowIndex.value !== undefined && draggedRowIndex.value !== undefined) {
    const dropIndex =
      draggedRowIndex.value > droppedRowIndex.value
        ? droppedRowIndex.value
        : droppedRowIndex.value === 0
          ? 0
          : droppedRowIndex.value - 1;

    const processedItems = [...props.items];

    reorderArray(processedItems, draggedRowIndex.value, dropIndex);

    emit("row:reorder", {
      dragIndex: draggedRowIndex.value,
      dropIndex: dropIndex,
      value: processedItems as T[],
    });
  }

  // cleanup
  onRowDragLeave(event);
  onRowDragEnd(event as DragEvent & { currentTarget?: { draggable: boolean } });
  event.preventDefault();
}
</script>

<style lang="scss">
:root {
  --row-drag-color: #41afe6;
}

$variants: (
  danger: #ff4a4a,
  success: #87b563,
);

.vc-table {
  &__body {
    &-row:hover .actions {
      display: flex;
    }
    &-actions-item {
      @each $name, $variant in $variants {
        &_#{$name} {
          @apply tw-text-[#{$variant}];
        }
      }
    }

    &-tooltip-arrow,
    &-tooltip-arrow:before {
      @apply tw-absolute tw-w-2 tw-h-2 tw-bg-inherit;
    }

    &-tooltip-arrow {
      @apply tw-invisible before:tw-visible before:tw-content-[""] before:tw-rotate-45;
    }

    &-tooltip[data-popper-placement^="top"] > .vc-table__body-tooltip-arrow {
      @apply tw-bottom-[-4px];
    }

    &-tooltip[data-popper-placement^="bottom"] > .vc-table__body-tooltip-arrow {
      @apply tw-top-[-4px];
    }
  }

  &__drag-row-bottom {
    @apply tw-shadow-[inset_0_-2px_0_0_var(--row-drag-color)];
  }

  &__drag-row-top {
    @apply tw-shadow-[inset_0_2px_0_0_var(--row-drag-color)];
  }
}
</style>
