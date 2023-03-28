<template>
  <div class="tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0">
    <!-- Header slot with filter and searchbar -->
    <slot
      name="header"
      v-if="
        ($slots['header'] || header) &&
        ((items && items.length) || searchValue || searchValue === '' || activeFilterCount)
      "
    >
      <div class="tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-p-4">
        <!-- Table filter mobile button -->
        <div
          v-if="$isMobile.value && $slots['filters']"
          class="tw-mr-3"
        >
          <VcTableFilter :counter="activeFilterCount">
            <template v-slot:default="{ closePanel }">
              <slot
                name="filters"
                :closePanel="closePanel"
              ></slot>
            </template>
          </VcTableFilter>
        </div>

        <!-- Table search input -->
        <VcInput
          class="tw-grow tw-basis-0"
          :placeholder="searchPlaceholder"
          clearable
          name="table_search"
          :modelValue="searchValue"
          @update:modelValue="$emit('search:change', $event)"
        ></VcInput>

        <!-- Table filter desktop button -->
        <div
          v-if="$isDesktop.value && $slots['filters']"
          class="tw-ml-3"
        >
          <VcTableFilter
            :title="$t('Filters')"
            :counter="activeFilterCount"
            :parentExpanded="expanded"
          >
            <template v-slot:default="{ closePanel }">
              <slot
                name="filters"
                :closePanel="closePanel"
              ></slot>
            </template>
          </VcTableFilter>
        </div>
      </div>
    </slot>

    <div class="tw-flex tw-relative tw-overflow-hidden tw-grow">
      <!-- Table loading overlay -->
      <VcLoading :active="loading"></VcLoading>

      <!-- Table scroll container -->
      <VcContainer
        v-if="items && items.length"
        ref="scrollContainer"
        :noPadding="true"
        class="tw-grow tw-basis-0"
        :usePtr="!!$attrs['onScroll:ptr']"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <template v-if="$isMobile.value && $slots['mobile-item']">
          <div>
            <VcTableMobileItem
              v-for="(item, i) in items"
              :key="i"
              :item="item"
              :actionBuilder="itemActionBuilder"
              @click="$emit('itemClick', item)"
              @swipeStart="handleSwipe"
              :swipingItem="mobileSwipeItem"
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
          class="[border-spacing:0] tw-border-collapse tw-relative tw-pt-[43px] tw-table-fixed tw-box-border tw-w-full"
          :class="{
            'vc-table_empty': !items || !items.length,
            'vc-table_multiselect': multiselect,
          }"
        >
          <thead
            v-if="filteredCols"
            class="vc-table__header"
          >
            <tr class="vc-table__header-row">
              <th
                v-if="multiselect"
                class="tw-h-[42px] tw-w-[50px] tw-max-w-[50px] tw-min-w-[50px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
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
                class="tw-h-[42px] tw-w-[44px] tw-max-w-[44px] tw-min-w-[44px] tw-bg-[#f9f9f9] tw-m-w-[70px] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-z-[1]"
                v-if="itemActionBuilder"
              >
                <div class="tw-w-3 tw-top-0 tw-bottom-0 tw-absolute tw-right-0 tw-flex tw-justify-end">
                  <div class="tw-w-px tw-bg-[#e5e7eb] tw-h-full"></div>
                </div>
              </th>
              <th
                v-for="item in filteredCols"
                @mousedown="onColumnHeaderMouseDown"
                @dragstart="onColumnHeaderDragStart($event, item)"
                @dragover="onColumnHeaderDragOver"
                @dragleave="onColumnHeaderDragLeave"
                @drop="onColumnHeaderDrop($event, item)"
                :key="item.id"
                class="tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
                :class="{
                  'tw-cursor-pointer tw-group': item.sortable,
                }"
                @click="handleHeaderClick(item)"
                :style="{ maxWidth: item.width, width: item.width }"
                :id="item.id"
              >
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3"
                  :class="tableAlignment[item.align as string]"
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
                    class="tw-flex tw-flex-col tw-ml-1 tw-invisible group-hover:tw-visible"
                    v-else
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
                class="tw-sticky tw-h-[42px] tw-z-[1] tw-right-0 tw-top-0 tw-table-cell tw-align-middle tw-w-0"
                v-if="props.expanded"
              >
                <VcTableColumnSwitcher
                  :items="toggleCols"
                  @change="toggleColumn"
                ></VcTableColumnSwitcher>
              </div>
            </tr>
            <div
              ref="resizer"
              class="tw-w-[1px] tw-absolute tw-z-10 tw-hidden tw-h-full tw-bg-[#e5e7eb] tw-cursor-col-resize"
            ></div>
          </thead>

          <tbody
            v-if="items"
            class="vc-table__body"
          >
            <tr
              v-for="(item, itemIndex) in items"
              :key="(typeof item === 'object' && 'id' in item && item.id) || itemIndex"
              class="vc-table__body-row tw-h-[60px] tw-bg-white hover:tw-bg-[#dfeef9] tw-cursor-pointer"
              :class="{
                'tw-bg-[#f8f8f8]': itemIndex % 2 === 1,
                '!tw-bg-[#dfeef9] hover:tw-bg-[#dfeef9]':
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
                class="tw-w-[50px] tw-max-w-[50px] tw-min-w-[50px]"
              >
                <div class="tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    @update:model-value="rowCheckbox(item)"
                    :model-value="isSelected(item)"
                    @click.stop
                  ></VcCheckbox>
                </div>
              </td>
              <td
                class="tw-box-border tw-overflow-visible tw-px-3 tw-w-[44px] tw-max-w-[44px] tw-min-w-[44px]"
                v-if="itemActionBuilder && typeof item === 'object'"
                @click.stop
              >
                <div class="vc-table__body-actions-container tw-relative tw-flex tw-justify-center tw-items-center">
                  <button
                    class="tw-text-[#41afe6] tw-cursor-pointer tw-border-none tw-bg-transparent disabled:tw-text-[gray] tw-w-5 hover:tw-text-[#319ed4]"
                    @click.stop="showActions(item, item.id)"
                    :ref="(el: Element) => setActionToggleRefs(el, item.id)"
                    aria-describedby="tooltip"
                    :disabled="!(itemActions[itemIndex] && itemActions[itemIndex].length)"
                  >
                    <VcIcon
                      icon="fas fa-ellipsis-v"
                      size="m"
                    />
                  </button>
                  <div
                    class="vc-table__body-tooltip tw-bg-white tw-rounded-[4px] tw-p-[15px] tw-z-[1] tw-absolute tw-right-0 tw-drop-shadow-[1px_3px_14px_rgba(111,122,131,0.25)]"
                    v-show="selectedRow === item.id"
                    @mouseleave="closeActions"
                    :ref="(el: Element) => setTooltipRefs(el, item.id)"
                    role="tooltip"
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
                      class="vc-table__body-tooltip-arrow"
                      data-popper-arrow
                    ></div>
                  </div>
                </div>
              </td>
              <td
                v-for="cell in filteredCols"
                :key="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                class="tw-box-border tw-overflow-hidden tw-px-3 tw-truncate"
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
              {{ notfound.text }}
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
            <div class="tw-m-4 tw-text-xl tw-font-medium">{{ empty.text }}</div>
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
      name="footer"
      v-if="($slots['footer'] || footer) && items && items.length"
    >
      <div
        class="tw-bg-[#fbfdfe] tw-border-t tw-border-solid tw-border-[#eaedf3] tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between tw-p-4"
      >
        <!-- Table pagination -->
        <VcPagination
          :expanded="expanded"
          :pages="pages"
          :currentPage="currentPage"
          @itemClick="$emit('paginationClick', $event)"
        ></VcPagination>

        <!-- Table counter -->
        <VcTableCounter
          :label="totalLabel"
          :value="totalCount"
        ></VcTableCounter>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch, onBeforeUpdate, onBeforeUnmount, Ref, onUpdated, onBeforeMount } from "vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import VcTableColumnSwitcher from "./_internal/vc-table-column-switcher/vc-table-column-switcher.vue";
import { createPopper, Instance } from "@popperjs/core";
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import { useLocalStorage, useCurrentElement } from "@vueuse/core";
import VcContainer from "./../../atoms/vc-container/vc-container.vue";

export interface StatusImage {
  image?: string;
  text: string;
  action?: string;
  clickHandler?: () => void;
}

export interface TableItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  id?: string;
  actions?: IActionBuilderResult[];
}

export type TableItemType = TableItem | string;

export interface Props {
  columns: ITableColumns[];
  items: TableItemType[];
  itemActionBuilder?: (item: TableItem) => IActionBuilderResult[];
  sort?: string;
  multiselect?: boolean;
  /**
   * Emit whole item instead of {id: boolean} while prop multiselect = true
   * @default false
   */
  multiselectEmitItem?: boolean;
  expanded?: boolean;
  totalLabel?: string;
  totalCount?: number;
  pages?: number;
  currentPage?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  loading?: boolean;
  empty?: StatusImage;
  notfound?: StatusImage;
  header?: boolean;
  footer?: boolean;
  activeFilterCount?: number;
  selectedItemId?: string;
  scrolling?: boolean;
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
  reorderableRows?: boolean;
  stateKey: string;
}

export interface Emits {
  (event: "paginationClick", page: number): void;
  (event: "selectionChanged", values: TableItemType[]): void;
  (event: "search:change", value: string): void;
  (event: "headerClick", value: Record<string, unknown>): void;
  (event: "itemClick", item: TableItemType): void;
  (event: "scroll:ptr"): void;
  (event: "row:reorder", args: { dragIndex: number; dropIndex: number; value: TableItemType[] }): void;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  totalLabel: "Totals:",
  totalCount: 0,
  pages: 0,
  expanded: true,
  currentPage: 0,
  searchPlaceholder: "Search...",
  empty: () => ({
    text: "List is empty.",
  }),
  notfound: () => ({
    text: "Nothing found.",
  }),
  header: true,
  footer: true,
  activeFilterCount: 0,
  resizableColumns: true,
  reorderableColumns: true,
});

interface ITableItemRef {
  element: Element;
  id: string;
}

const emit = defineEmits<Emits>();

const selection = ref<TableItemType[]>([]);

const selectedRow = ref<string>();
const tooltip = ref<Instance>();
const scrollContainer = ref<typeof VcContainer>();
const actionToggleRefs = ref<ITableItemRef[]>([]);
const tooltipRefs = ref<ITableItemRef[]>([]);
const itemActions = ref<IActionBuilderResult[][]>([]);
const mobileSwipeItem = ref<string>();
const columnResizing = ref(false);
const resizeColumnElement = ref<ITableColumns>();
const nextColumn = ref<ITableColumns>();
const lastResize = ref<number>();
const table = useCurrentElement();
let columnResizeListener = null;
let columnResizeEndListener = null;
const resizer = ref();
const state = useLocalStorage(props.stateKey, []);
const defaultColumns: Ref<ITableColumns[]> = ref([]);
const draggedColumn = ref();
const dropPosition = ref();

// row reordering variables
const draggedRow = ref<TableItemType>();
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
    let _selected = [];

    if (checked) {
      _selected = props.items;
    }

    selection.value = _selected;

    emit("selectionChanged", selection.value);
  },
});

const filteredCols = computed(() => {
  return defaultColumns.value.filter((x) => {
    if (("visible" in x && x.visible) || !("visible" in x)) {
      return props.expanded ? x : x.alwaysVisible;
    }
  });
});

watch(
  () => props.items,
  (newVal) => {
    scrollContainer.value?.scrollTop();

    calculateActions(newVal);
  },
  { deep: true, immediate: true }
);

watch(
  () => props.columns,
  (newVal) => {
    if (!defaultColumns.value.length) {
      defaultColumns.value = newVal;
    }
  },
  { deep: true, immediate: true }
);

function isSelected(item: TableItemType) {
  return selection.value.indexOf(item) > -1;
}

function rowCheckbox(item: TableItemType) {
  const clear = item;
  const index = selection.value.indexOf(clear);
  if (index > -1) {
    selection.value = selection.value.filter((x) => x !== clear);
  } else {
    selection.value.push(clear);
  }

  emit("selectionChanged", selection.value);
}

function setTooltipRefs(el: Element, id: string) {
  if (el) {
    const isExists = tooltipRefs.value.some((item) => item.id === id);
    if (!isExists) {
      tooltipRefs.value.push({ element: el, id });
    }
  }
}

function setActionToggleRefs(el: Element, id: string) {
  if (el) {
    const isExists = actionToggleRefs.value.some((item) => item.id === id);
    if (!isExists) {
      actionToggleRefs.value.push({ element: el, id });
    }
  }
}

function showActions(item: TableItem, index: string) {
  selectedRow.value = item.id;

  const toggleRef = actionToggleRefs.value.find((item) => item.id === index);
  const tooltipRef = tooltipRefs.value.find((item) => item.id === index);

  if (toggleRef && tooltipRef) {
    nextTick(() => {
      tooltip.value = createPopper(toggleRef.element, tooltipRef.element as HTMLElement, {
        placement: "bottom",
        onFirstUpdate: () => tooltip.value?.update(),
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [-15, 15],
            },
          },
        ],
      });
    });
  }
}

async function calculateActions(items: TableItemType[]) {
  if (typeof props.itemActionBuilder === "function") {
    let populatedItems = [];
    for (let index = 0; index < items.length; index++) {
      if (typeof items[index] === "object") {
        const elementWithActions = await props.itemActionBuilder(items[index] as TableItem);
        populatedItems.push(elementWithActions);
      }
    }
    itemActions.value = populatedItems;
  }
}

function closeActions() {
  selectedRow.value = undefined;
  tooltip.value?.destroy();
}

function handleSwipe(id: string) {
  mobileSwipeItem.value = id;
}

function handleHeaderClick(item: ITableColumns) {
  emit("headerClick", item);
}

function handleMouseDown(e: MouseEvent, item: ITableColumns) {
  let containerLeft = getOffset(table.value as HTMLElement).left;
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
    });
  }
  if (!columnResizeEndListener) {
    columnResizeEndListener = document.addEventListener("mouseup", () => {
      if (columnResizing.value) {
        columnResizing.value = false;
        onColumnResizeEnd();
      }
    });
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
  let containerLeft = getOffset(table.value as HTMLElement).left;

  resizer.value.style.top = 0 + "px";
  resizer.value.style.left = event.pageX - containerLeft + table.value.scrollLeft + "px";
  resizer.value.style.display = "block";
}

function getOffset(element: HTMLElement) {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}

function onColumnResizeEnd() {
  let delta = resizer.value.offsetLeft - lastResize.value;

  const columnElement: HTMLElement = table.value.querySelector(`#${resizeColumnElement.value.id}`);

  let columnWidth = columnElement.offsetWidth;
  let newColumnWidth = columnWidth + delta;

  let minWidth = 15;

  if (columnWidth + delta > parseInt(minWidth.toString(), 10)) {
    nextColumn.value = filteredCols.value[filteredCols.value.indexOf(resizeColumnElement.value) + 1];

    if (nextColumn.value) {
      const nextColElement: HTMLElement = table.value.querySelector(`#${nextColumn.value.id}`);

      let nextColumnWidth = nextColElement.offsetWidth - delta;
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

function resizeTableCells(newColumnWidth: number, nextColumnWidth: number) {
  resizeColumnElement.value.width = newColumnWidth + "px";
  nextColumn.value.width = nextColumnWidth + "px";
}

function onColumnHeaderDragStart(event: DragEvent, item: ITableColumns) {
  if (columnResizing.value) {
    event.preventDefault();
    return;
  }

  draggedColumn.value = item;
  event.dataTransfer.setData("text", "reorder");
}

function findParentHeader(element: HTMLElement) {
  if (element.nodeName === "TH") {
    return element;
  } else {
    let parent = element.parentElement;

    while (parent.nodeName !== "TH") {
      parent = parent.parentElement;
      if (!parent) break;
    }

    return parent;
  }
}

function onColumnHeaderDragOver(event: DragEvent) {
  let dropHeader = findParentHeader(event.target as HTMLElement);

  if (props.reorderableColumns && draggedColumn.value && dropHeader) {
    event.preventDefault();
    let dropHeaderOffset = getOffset(dropHeader);

    if (draggedColumn.value !== dropHeader) {
      let columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

      if (event.pageX > columnCenter) {
        dropPosition.value = 1;
      } else {
        dropPosition.value = -1;
      }
    }
  }
}

function onColumnHeaderDragLeave(event: DragEvent) {
  if (props.reorderableColumns && draggedColumn.value) {
    event.preventDefault();
  }
}

function onColumnHeaderDrop(event: DragEvent, item: ITableColumns) {
  event.preventDefault();

  if (draggedColumn.value) {
    let dragIndex = defaultColumns.value.indexOf(draggedColumn.value);
    let dropIndex = defaultColumns.value.indexOf(item);

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

    draggedColumn.value.draggable = false;
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
    defaultColumns.value = state.value;
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

function onColumnHeaderMouseDown(event: MouseEvent & { currentTarget?: { draggable: boolean } }) {
  if (props.reorderableColumns) {
    event.currentTarget.draggable = true;
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

function onRowMouseDown(event: MouseEvent & { currentTarget?: { draggable: boolean } }) {
  if (props.reorderableRows) {
    event.currentTarget.draggable = true;
  }
}

function onRowDragStart(event: DragEvent, item: TableItem | string) {
  if (!props.reorderableRows) {
    return;
  }
  rowDragged.value = true;
  draggedRow.value = item;
  draggedRowIndex.value = props.items.indexOf(item);
  event.dataTransfer.setData("text", "row-reorder");
}

function onRowDragOver(event: DragEvent, item: TableItem | string) {
  if (!props.reorderableRows) {
    return;
  }
  const index = props.items.indexOf(item);

  if (rowDragged.value && draggedRow.value !== item) {
    let rowElement = event.currentTarget;
    let rowY = getOffset(rowElement as HTMLElement).top;
    let pageY = event.pageY;
    let rowMidY = rowY + (rowElement as HTMLElement).offsetHeight / 2;

    if (pageY < rowMidY) {
      droppedRowIndex.value = index;
    } else {
      droppedRowIndex.value = index + 1;
    }

    event.preventDefault();
  }
}

function onRowDragLeave(event: DragEvent) {
  event.preventDefault();
}

function onRowDragEnd(event: DragEvent & { currentTarget?: { draggable: boolean } }) {
  rowDragged.value = false;
  draggedRowIndex.value = null;
  droppedRowIndex.value = null;
  event.currentTarget.draggable = false;
}

function onRowDrop(event: DragEvent) {
  if (droppedRowIndex.value != null) {
    let dropIndex =
      draggedRowIndex.value > droppedRowIndex.value
        ? droppedRowIndex.value
        : droppedRowIndex.value === 0
        ? 0
        : droppedRowIndex.value - 1;

    let processedItems = [...props.items];

    reorderArray(processedItems, draggedRowIndex.value, dropIndex);

    emit("row:reorder", {
      dragIndex: draggedRowIndex.value,
      dropIndex: dropIndex,
      value: processedItems as TableItemType[],
    });
  }

  // cleanup
  onRowDragLeave(event);
  onRowDragEnd(event as DragEvent & { currentTarget?: { draggable: boolean } });
  event.preventDefault();
}
</script>

<style lang="scss">
$variants: (
  danger: #ff4a4a,
  success: #87b563,
);

.vc-table {
  &__body {
    &-tooltip {
      background: #ffffff;
      border-radius: 4px 0 0 4px;
      padding: 15px;
      z-index: 0;
      position: absolute;
      right: 0;
      filter: drop-shadow(1px 3px 14px rgba(111, 122, 131, 0.25));
    }

    &-tooltip-arrow,
    &-tooltip-arrow:before {
      position: absolute;
      width: 8px;
      height: 8px;
      background: inherit;
    }

    &-tooltip-arrow {
      visibility: hidden;
    }

    &-tooltip-arrow:before {
      visibility: visible;
      content: "";
      transform: rotate(45deg);
    }

    &-tooltip[data-popper-placement^="top"] > .vc-table__body-tooltip-arrow {
      bottom: -5px;
    }

    &-tooltip[data-popper-placement^="bottom"] > .vc-table__body-tooltip-arrow {
      top: -5px;
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
      @apply tw-bottom-[-5px];
    }

    &-tooltip[data-popper-placement^="bottom"] > .vc-table__body-tooltip-arrow {
      @apply tw-top-[-5px];
    }
  }
}
</style>
