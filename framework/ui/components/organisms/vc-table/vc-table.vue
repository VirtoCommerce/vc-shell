<template>
  <div class="tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0">
    <!-- Header slot with filter and searchbar -->
    <slot
      v-if="
        ($slots['header'] || header) &&
        ((items && items.length) || searchValue || searchValue === '' || activeFilterCount)
      "
      name="header"
    >
      <div class="tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-p-4">
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
          class="tw-grow tw-basis-0"
          :placeholder="searchPlaceholder || $t('COMPONENTS.ORGANISMS.VC_TABLE.SEARCH')"
          clearable
          name="table_search"
          :model-value="searchValue"
          @update:model-value="$emit('search:change', $event)"
        ></VcInput>

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

    <div
      v-loading="unref(loading)"
      class="tw-flex tw-relative tw-overflow-hidden tw-grow"
    >
      <!-- Table scroll container -->
      <VcContainer
        v-if="items && items.length"
        ref="scrollContainer"
        :no-padding="true"
        class="tw-grow tw-basis-0"
        :use-ptr="pullToReload"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <template v-if="$isMobile.value && $slots['mobile-item']">
          <div>
            <VcTableMobileItem
              v-for="(item, i) in items"
              :key="i"
              :item="item"
              :action-builder="itemActionBuilder"
              :swiping-item="mobileSwipeItem"
              @click="$emit('itemClick', item)"
              @swipe-start="handleSwipe"
            >
              <slot
                name="mobile-item"
                :item="item"
              ></slot>
            </VcTableMobileItem>
          </div>
        </template>

        <!-- Desktop table view -->
        <table
          v-else
          ref="tableRef"
          class="[border-spacing:0] tw-border-collapse tw-relative tw-pt-[43px] tw-table-fixed tw-box-border tw-w-full"
          :class="{
            'vc-table_empty': !items || !items.length,
            'vc-table_multiselect': multiselect,
          }"
        >
          <thead
            v-if="filteredCols"
            class="vc-table__header tw-relative"
          >
            <tr class="vc-table__header-row">
              <th
                v-if="multiselect"
                class="tw-h-[42px] tw-w-[50px] tw-max-w-[28px] tw-min-w-[28px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
              >
                <div class="tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    v-model="headerCheckbox"
                    @click.stop
                  ></VcCheckbox>
                </div>
                <div class="tw-w-3 tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-flex tw-justify-end">
                  <div class="tw-w-px tw-bg-[#e5e7eb] tw-h-full"></div>
                </div>
              </th>
              <th
                v-if="itemActionBuilder"
                class="tw-h-[42px] tw-w-[21px] tw-max-w-[21px] tw-min-w-[21px] tw-bg-[#f9f9f9] tw-m-w-[70px] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-z-[1]"
              >
                <div class="tw-w-3 tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-flex tw-justify-end">
                  <div class="tw-w-px tw-bg-[#e5e7eb] tw-h-full"></div>
                </div>
              </th>
              <th
                v-for="item in filteredCols"
                :id="item.id"
                :key="item.id"
                class="tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
                :class="{
                  'tw-cursor-pointer tw-group': item.sortable,
                }"
                :style="{ maxWidth: item.width, width: item.width }"
                @mousedown="onColumnHeaderMouseDown"
                @dragstart="onColumnHeaderDragStart($event, item)"
                @dragover="onColumnHeaderDragOver"
                @dragleave="onColumnHeaderDragLeave"
                @drop="onColumnHeaderDrop($event, item)"
                @click="handleHeaderClick(item)"
              >
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3"
                  :class="item.align ? tableAlignment[item.align as keyof typeof tableAlignment] : ''"
                >
                  <div class="tw-truncate">
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
                  class="tw-w-3 tw-top-0 tw-bottom-0 tw-cursor-col-resize tw-absolute tw-right-0 tw-flex tw-justify-end"
                  @mousedown="handleMouseDown($event, item)"
                >
                  <div class="tw-w-px tw-bg-[#e5e7eb] tw-h-full"></div>
                </div>
              </th>

              <th
                class="tw-w-auto tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
              ></th>
              <div
                v-if="props.expanded"
                class="tw-sticky tw-h-[42px] tw-z-[1] tw-right-0 tw-top-0 tw-table-cell tw-align-middle tw-w-0"
              >
                <VcTableColumnSwitcher
                  :items="toggleCols.filter((col): col is ITableColumns => col !== undefined)"
                  @change="toggleColumn"
                ></VcTableColumnSwitcher>
              </div>
            </tr>
            <div
              ref="resizer"
              class="tw-w-px tw-absolute tw-z-10 tw-hidden tw-h-full tw-bg-[#e5e7eb] tw-cursor-col-resize"
            ></div>
            <div
              ref="reorderRef"
              class="tw-w-0.5 tw-bg-[#41afe6] tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-z-[2] tw-hidden"
            ></div>
          </thead>
          <div
            v-if="selectAll && showSelectionChoice"
            class="tw-h-[60px] tw-bg-[#dfeef9] tw-w-full tw-absolute tw-flex"
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
          <tbody
            v-if="items"
            class="vc-table__body"
            :class="{ 'tw-translate-y-[60px]': selectAll && showSelectionChoice }"
          >
            <tr
              v-for="(item, itemIndex) in items"
              :key="(typeof item === 'object' && 'id' in item && item.id) || itemIndex"
              class="vc-table__body-row tw-h-[60px] tw-bg-white hover:!tw-bg-[#dfeef9] tw-cursor-pointer"
              :class="{
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
            >
              <td
                v-if="multiselect && typeof item === 'object'"
                class="tw-w-[50px] tw-max-w-[28px] tw-min-w-[28px] tw-relative"
                @click.stop
              >
                <div class="tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    :model-value="isSelected(item)"
                    @update:model-value="rowCheckbox(item)"
                  ></VcCheckbox>
                </div>
                <div class="tw-w-px tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-bg-[#e5e7eb]"></div>
              </td>
              <td
                v-if="itemActionBuilder && typeof item === 'object'"
                class="tw-box-border tw-overflow-visible tw-w-[21px] tw-max-w-[21px] tw-min-w-[21px] tw-relative"
                @click.stop
              >
                <div
                  class="vc-table__body-actions-container tw-relative tw-flex tw-justify-center tw-items-center tw-group"
                >
                  <button
                    :ref="(el) => setActionToggleRefs(el, item.id)"
                    class="tw-text-[#41afe6] tw-cursor-pointer tw-border-none tw-bg-transparent disabled:tw-text-[gray] tw-w-full"
                    :class="{
                      'group-hover:tw-text-[#319ed4]': itemActions[itemIndex] && itemActions[itemIndex].length,
                    }"
                    :disabled="!(itemActions[itemIndex] && itemActions[itemIndex].length)"
                    @click.stop="showActions(item, item.id)"
                  >
                    <VcIcon
                      icon="fas fa-ellipsis-v"
                      size="m"
                    />
                  </button>
                  <div
                    v-show="selectedRow === item.id"
                    :ref="(el) => setTooltipRefs(el, item.id)"
                    class="vc-table__body-tooltip tw-bg-white tw-rounded-[4px] tw-p-[15px] tw-z-[1] tw-absolute tw-right-0 tw-drop-shadow-[1px_3px_14px_rgba(111,122,131,0.25)] tw-w-max"
                    :style="tooltipStyle"
                    @mouseleave="closeActions"
                  >
                    <div
                      class="tw-flex tw-items-start tw-flex-col tw-text-[#3f3f3f] tw-font-normal not-italic tw-text-base tw-leading-[20px] tw-gap-[25px]"
                    >
                      <div
                        v-for="(itemAction, i) in itemActions[itemIndex]"
                        :key="i"
                        :class="[
                          'tw-flex tw-flex-row tw-items-center tw-text-[#319ed4] tw-cursor-pointer',
                          `vc-table__body-actions-item_${itemAction.variant}`,
                        ]"
                        @click.stop="itemAction.clickHandler(item)"
                      >
                        <VcIcon
                          :icon="itemAction.icon"
                          size="m"
                        />
                        <div
                          class="tw-not-italic tw-font-normal tw-text-base tw-leading-[20px] tw-text-[#3f3f3f] tw-ml-[7px]"
                        >
                          {{ itemAction.title }}
                        </div>
                      </div>
                    </div>
                    <div
                      :ref="(el) => setTooltipArrowRefs(el, item.id)"
                      class="vc-table__body-tooltip-arrow"
                      :style="arrowStyle"
                    ></div>
                  </div>
                </div>
                <div class="tw-w-px tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-bg-[#e5e7eb]"></div>
              </td>
              <td
                v-for="cell in filteredCols"
                :key="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                class="tw-box-border tw-overflow-hidden tw-px-3 [&~:not(.vc-image)]:tw-truncate"
                :class="cell.class"
                :style="{ maxWidth: cell.width, width: cell.width }"
              >
                <slot
                  :name="`item_${cell.id}`"
                  :item="item"
                  :cell="cell"
                >
                  <VcTableCell
                    v-if="typeof item === 'object'"
                    :cell="cell"
                    :item="item"
                  ></VcTableCell>
                </slot>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </VcContainer>

      <!-- Empty table view -->
      <template v-else>
        <slot
          v-if="searchValue || searchValue === '' || activeFilterCount"
          name="notfound"
        >
          <div
            v-if="notfound"
            class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
          >
            <img
              v-if="notfound.image"
              :src="notfound.image"
            />
            <div class="tw-m-4 vc-table__empty-text">
              {{ notfound.text || t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_FOUND") }}
            </div>
            <VcButton
              v-if="notfound.action"
              @click="notfound.clickHandler"
            >
              {{ notfound.action }}
            </VcButton>
          </div>
        </slot>
        <slot
          v-else
          name="empty"
        >
          <div
            v-if="empty"
            class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
          >
            <img
              v-if="empty.image"
              :src="empty.image"
            />
            <div class="tw-m-4 tw-text-xl tw-font-medium">
              {{ empty.text || t("COMPONENTS.ORGANISMS.VC_TABLE.EMPTY") }}
            </div>
            <VcButton
              v-if="empty.action"
              @click="empty.clickHandler"
            >
              {{ empty.action }}
            </VcButton>
          </div>
        </slot>
      </template>
    </div>

    <!-- Table footer -->
    <slot
      v-if="($slots['footer'] || footer) && items && items.length"
      name="footer"
    >
      <div
        class="tw-bg-[#fbfdfe] tw-border-t tw-border-solid tw-border-[#eaedf3] tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between tw-p-4"
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
import {
  unref,
  computed,
  ref,
  watch,
  onBeforeUpdate,
  onBeforeUnmount,
  Ref,
  onUpdated,
  onBeforeMount,
  nextTick,
  MaybeRef,
  ComponentPublicInstance,
} from "vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import VcTableColumnSwitcher from "./_internal/vc-table-column-switcher/vc-table-column-switcher.vue";
import { offset, flip, arrow, computePosition, ComputePositionReturn, ReferenceElement } from "@floating-ui/vue";
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import { useLocalStorage, useCurrentElement } from "@vueuse/core";
import { VcContainer, VcInput, VcCheckbox, VcIcon, VcPagination, VcButton } from "./../../";
import { useI18n } from "vue-i18n";

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
  [key: `item_${string}`]: (args: { item: T; cell: ITableColumns }) => any;
  notfound: (props: any) => any;
  empty: (props: any) => any;
  footer: (props: any) => any;
}>();

const props = withDefaults(
  defineProps<{
    columns: ITableColumns[];
    items: T[];
    itemActionBuilder?: (item: T) => IActionBuilderResult[];
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
  }>(),
  {
    items: () => [],
    totalCount: 0,
    pages: 0,
    expanded: true,
    currentPage: 0,
    selectedItemId: undefined,
    header: true,
    footer: true,
    activeFilterCount: 0,
    resizableColumns: true,
    reorderableColumns: true,
  },
);

interface ITableItemRef {
  element: Element | ComponentPublicInstance;
  id: string;
}

const emit = defineEmits<{
  paginationClick: [page: number];
  selectionChanged: [values: T[]];
  "search:change": [value: string | number | Date | null];
  headerClick: [item: ITableColumns];
  value: [Record<string, unknown>];
  itemClick: [item: T];
  "scroll:ptr": [];
  "row:reorder": [args: { dragIndex: number; dropIndex: number; value: T[] }];
  "select:all": [values: boolean];
}>();

const { t } = useI18n({ useScope: "global" });

// template refs
const tooltipRefs = ref<ITableItemRef[]>([]);
const tooltipArrowRefs = ref<ITableItemRef[] | null>([]);
const reorderRef = ref<HTMLElement | null>();
const tableRef = ref<HTMLElement | null>();

// event listeners
let columnResizeListener: ((...args: any[]) => any) | null = null;
let columnResizeEndListener: ((...args: any[]) => any) | null = null;

const selection = ref<T[]>([]) as Ref<T[]>;
const allSelected = ref(false);

const selectedRow = ref<string>();
const tooltip = ref<ComputePositionReturn>();
const scrollContainer = ref<typeof VcContainer>();
const actionToggleRefs = ref<ITableItemRef[]>([]);

const itemActions: Ref<IActionBuilderResult[][]> = ref([]);
const mobileSwipeItem = ref<string>();
const columnResizing = ref(false);
const resizeColumnElement = ref<ITableColumns>();
const nextColumn = ref<ITableColumns>();
const lastResize = ref<number>();
const table = useCurrentElement();
const resizer = ref();
const state = useLocalStorage<ITableColumns[]>("VC_TABLE_STATE_" + props.stateKey.toUpperCase(), []);
const defaultColumns: Ref<ITableColumns[]> = ref([]);
const draggedColumn = ref();
const draggedElement = ref<HTMLElement>();
const dropPosition = ref();

// row reordering variables
const draggedRow = ref<T>();
const rowDragged = ref(false);
const droppedRowIndex = ref<number>();
const draggedRowIndex = ref<number>();

onBeforeMount(() => {
  if (isStateful()) {
    restoreState();
  }
});

onBeforeUnmount(() => {
  unbindColumnResizeEvents();
});

onBeforeUpdate(() => {
  actionToggleRefs.value = [];
  tooltipRefs.value = [];
});

onUpdated(() => {
  if (isStateful()) {
    saveState();
  }
});

const sortDirection = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[1];
});

const sortField = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[0];
});

const toggleCols = computed(() => {
  return props.columns.map((item) => {
    return defaultColumns.value.find((mutatedItem) => item.id === mutatedItem.id);
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
    return props.items ? selection.value.length === props.items.length : false;
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
  return defaultColumns.value.filter((x) => {
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
  () => props.columns,
  (newVal) => {
    defaultColumns.value = newVal;

    if (newVal.length !== state.value.length) {
      saveState();
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => allSelected.value,
  (newVal) => {
    emit("select:all", newVal);
  },
);

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

function setTooltipRefs(el: Element | ComponentPublicInstance | null, id: string) {
  if (el) {
    const isExists = tooltipRefs.value.some((item) => item.id === id);
    if (!isExists) {
      tooltipRefs.value.push({ element: el, id });
    }
  }
}

function setActionToggleRefs(el: Element | ComponentPublicInstance | null, id: string) {
  if (el) {
    const isExists = actionToggleRefs.value.some((item) => item.id === id);
    if (!isExists) {
      actionToggleRefs.value.push({ element: el, id });
    }
  }
}

function setTooltipArrowRefs(el: Element | ComponentPublicInstance | null, id: string) {
  if (el) {
    const isExists = tooltipArrowRefs.value?.some((item) => item.id === id);
    if (!isExists) {
      tooltipArrowRefs.value?.push({ element: el, id });
    }
  }
}

function showActions(item: T, index: string) {
  if (typeof item !== "string") {
    if (selectedRow.value) {
      closeActions();
      return;
    }

    selectedRow.value = item.id;

    const toggleRef = actionToggleRefs.value.find((item) => item.id === index)?.element;
    const tooltipRef = tooltipRefs.value.find((item) => item.id === index)?.element;
    const tooltipArrowRef = tooltipArrowRefs.value?.find((item) => item.id === index)?.element;

    if (toggleRef && tooltipRef && tooltipArrowRef) {
      nextTick(() => {
        computePosition(toggleRef as ReferenceElement, tooltipRef as HTMLElement, {
          placement: "bottom",
          middleware: [
            flip({ fallbackPlacements: ["top", "bottom"] }),
            offset({ crossAxis: 35, mainAxis: 15 }),
            arrow({ element: tooltipArrowRef as HTMLElement }),
          ],
        }).then((item) => (tooltip.value = item));
      });
    }
  }
}

const tooltipStyle = computed(() => {
  return {
    top: `${tooltip.value?.y ?? 0}px`,
    left: `${tooltip.value?.x ?? 0}px`,
  };
});

const arrowStyle = computed(() => {
  if (tooltip.value && tooltip.value.middlewareData.arrow) {
    const { x } = tooltip.value && tooltip.value.middlewareData.arrow;
    return {
      top: (tooltip.value.placement === "bottom" && "-4px") || undefined,
      bottom: (tooltip.value.placement === "top" && "-4px") || undefined,
      left: `${x ?? 0}px`,
    };
  }
  return {
    top: "0px",
    left: "0px",
  };
});

async function calculateActions(items: T[]) {
  if (typeof props.itemActionBuilder === "function") {
    const populatedItems = [];
    for (let index = 0; index < items.length; index++) {
      if (typeof items[index] === "object") {
        const elementWithActions = await props.itemActionBuilder(items[index]);
        populatedItems.push(elementWithActions);
      }
    }
    itemActions.value = populatedItems;
  }
}

function closeActions() {
  selectedRow.value = undefined;
}

function handleSwipe(id: string) {
  mobileSwipeItem.value = id;
}

function handleHeaderClick(item: ITableColumns) {
  emit("headerClick", item);
}

function handleMouseDown(e: MouseEvent, item: ITableColumns) {
  const containerLeft = getOffset(table.value as HTMLElement).left;
  resizeColumnElement.value = item;
  columnResizing.value = true;
  lastResize.value = e.pageX - containerLeft + table.value.scrollLeft;

  bindColumnResizeEvents();
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
  const containerLeft = getOffset(table.value as HTMLElement).left;

  resizer.value.style.top = 0 + "px";
  resizer.value.style.left = event.pageX - containerLeft + table.value.scrollLeft + "px";
  resizer.value.style.display = "block";
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

  const columnElement: HTMLElement | null = table.value.querySelector(`#${resizeColumnElement.value?.id}`);

  if (columnElement) {
    const columnWidth = columnElement.offsetWidth;
    const newColumnWidth = columnWidth + delta;

    const minWidth = 15;

    if (columnWidth + delta > parseInt(minWidth.toString(), 10) && resizeColumnElement.value) {
      nextColumn.value = filteredCols.value[filteredCols.value.indexOf(resizeColumnElement.value) + 1];

      if (nextColumn.value) {
        const nextColElement = table.value.querySelector(`#${nextColumn.value.id}`);

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
  if (element.nodeName === "TH") {
    return element;
  } else {
    let parent = element.parentElement;

    while (parent && parent.nodeName !== "TH") {
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
        reorderRef.value.style.left = targetLeft + dropHeader.offsetWidth + "px";

        dropPosition.value = 1;
      } else {
        reorderRef.value.style.left = targetLeft + "px";
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
    const dragIndex = defaultColumns.value.indexOf(draggedColumn.value);
    const dropIndex = defaultColumns.value.indexOf(item);

    let allowDrop = dragIndex !== dropIndex;

    if (
      allowDrop &&
      ((dropIndex - dragIndex === 1 && dropPosition.value === -1) ||
        (dropIndex - dragIndex === -1 && dropPosition.value === 1))
    ) {
      allowDrop = false;
    }

    if (allowDrop) {
      reorderArray(defaultColumns.value, dragIndex, dropIndex);

      if (isStateful()) {
        saveState();
      }
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

function isStateful() {
  return props.stateKey != null;
}

function saveState() {
  console.debug("[@vc-shell/framewok#vc-table.vue] - Save state");

  state.value = defaultColumns.value;
}

function restoreState() {
  console.debug("[@vc-shell/framewok#vc-table.vue] - Restore state");
  if (Object.keys(state.value).length) {
    defaultColumns.value = state.value.map((item) => {
      const column = defaultColumns.value.find((x) => x.id === item.id);
      if (column) {
        return {
          ...item,
          title: column.title,
          visible: column.visible,
          sortable: column.sortable,
          alwaysVisible: column.alwaysVisible,
          type: column.type,
        };
      }
      return item;
    });
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
  if (item) {
    defaultColumns.value = defaultColumns.value.map((x) => {
      if (x === item) {
        x = item;
      }
      return x;
    });
  }

  if (isStateful()) {
    saveState();
  }
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
