<template>
  <div
    v-loading:1000="unref(loading) || columnsInit"
    class="vc-table"
  >
    <div
      v-if="multiselect && $isMobile.value && (selection.length > 0 || allSelected)"
      class="vc-table__multiselect-mobile"
    >
      <div class="vc-table__select-all-bar">
        <div class="vc-table__select-all-content">
          <div class="vc-table__select-all-checkbox">
            <VcCheckbox
              v-model="headerCheckbox"
              class="vc-table__select-all-checkbox__checkbox"
              size="m"
              @click.stop
            >
              {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL_TRUNCATED") }}
            </VcCheckbox>
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
          >
            {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") }}
          </VcButton>
        </div>
      </div>
      <div
        v-if="selectAll && showSelectionChoice"
        class="vc-table__select-all-choice"
      >
        <div class="vc-table__select-all-choice__content">
          <div>
            {{
              allSelected
                ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
                : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
            }}
            <VcButton
              text
              class="vc-table__select-all-choice__button"
              @click="handleSelectAll"
            >
              {{
                allSelected ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL") : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL")
              }}
            </VcButton>
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
      :header="headerComponent"
    >
      <headerComponent></headerComponent>
    </slot>

    <div class="vc-table__content">
      <!-- Table scroll container -->
      <VcContainer
        ref="scrollContainer"
        :no-padding="true"
        class="vc-table__mobile-view"
        :use-ptr="selection.length === 0 ? pullToReload : undefined"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <template v-if="$isMobile.value">
          <div
            v-if="items && items.length && !columnsInit"
            class="vc-table__mobile-items"
          >
            <VcTableMobileItem
              v-for="(item, i) in items"
              :key="i"
              :index="i"
              :items="items"
              :action-builder="itemActionBuilder"
              :disabled-selection="disabledSelection"
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
            class="vc-table__mobile-empty"
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
          class="vc-table__desktop-table"
          :class="{
            'vc-table__empty': !items || !items.length,
            'vc-table__multiselect': multiselect,
          }"
        >
          <div
            v-if="filteredCols.length"
            class="vc-table__header"
            @mouseenter="handleHeaderMouseOver(true)"
            @mouseleave="handleHeaderMouseOver(false)"
          >
            <div class="vc-table__header-row">
              <div
                v-if="multiselect && items && items.length"
                class="vc-table__header-checkbox"
              >
                <div class="vc-table__header-checkbox__content">
                  <VcCheckbox
                    v-model="headerCheckbox"
                    size="m"
                    @click.stop
                  ></VcCheckbox>
                </div>
                <div class="vc-table__header-checkbox__resizer"></div>
              </div>
              <div
                v-for="(item, index) in filteredCols"
                :id="item.id"
                :key="item.id"
                class="vc-table__header-cell"
                :class="[
                  {
                    'vc-table__header-cell--sortable': item.sortable,
                    'vc-table__header-cell--last': index === filteredCols.length - 1,
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
                <div class="vc-table__header-cell__content">
                  <div class="vc-table__header-cell__title">
                    <span
                      v-if="editing && item.rules?.required"
                      class="vc-table__header-cell__required"
                      >*</span
                    >
                    <slot :name="`header_${item.id}`">{{ item.title }}</slot>
                  </div>
                  <div
                    v-if="sortField === item.id"
                    class="vc-table__header-cell__sort-icon"
                  >
                    <VcIcon
                      size="xs"
                      :icon="`fas fa-caret-${sortDirection === 'DESC' ? 'down' : 'up'}`"
                    ></VcIcon>
                  </div>
                  <div
                    v-else
                    class="vc-table__header-cell__sort-icons"
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
                  class="vc-table__header-cell__resizer"
                  :class="{
                    'vc-table__header-cell__resizer--cursor': props.resizableColumns,
                  }"
                  @mousedown="handleMouseDown($event, item)"
                ></div>
              </div>

              <div
                v-if="isHeaderHover && props.expanded"
                class="vc-table__column-switcher"
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
              class="vc-table__resizer"
            ></div>
            <div
              ref="reorderRef"
              class="vc-table__reorder-ref"
            ></div>
          </div>
          <div
            v-if="selectAll && showSelectionChoice"
            class="vc-table__select-all-footer"
          >
            <div class="vc-table__select-all-footer__content">
              <div>
                {{
                  allSelected
                    ? t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_SELECTED")
                    : t("COMPONENTS.ORGANISMS.VC_TABLE.CURRENT_PAGE_SELECTED")
                }}
                <VcButton
                  text
                  class="vc-table__select-all-footer__button"
                  @click="handleSelectAll"
                >
                  {{
                    allSelected
                      ? t("COMPONENTS.ORGANISMS.VC_TABLE.CANCEL")
                      : t("COMPONENTS.ORGANISMS.VC_TABLE.SELECT_ALL")
                  }}
                </VcButton>
              </div>
            </div>
          </div>
          <div
            v-if="items && items.length && !columnsInit"
            class="vc-table__body"
          >
            <div
              v-for="(item, itemIndex) in items"
              :key="(typeof item === 'object' && 'id' in item && item.id) || itemIndex"
              class="vc-table__body-row"
              :class="{
                'vc-table__body-row--odd': itemIndex % 2 === 0,
                'vc-table__body-row--clickable': hasClickListener,
                'vc-table__body-row--even': itemIndex % 2 === 1,
                'vc-table__body-row--selected':
                  typeof item === 'object' && 'id' in item && item.id ? selectedItemId === item.id : false,
                'vc-table__body-row--selection': selection && selection.length && selection.includes(item),
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
                v-if="multiselect && typeof item === 'object'"
                class="vc-table__body-row-checkbox"
                @click.stop
              >
                <div class="vc-table__body-row-checkbox-content">
                  <VcCheckbox
                    :model-value="isSelected(item)"
                    size="m"
                    :disabled="disabledSelection.includes(item)"
                    @update:model-value="rowCheckbox(item)"
                  ></VcCheckbox>
                </div>
                <div class="vc-table__body-row-checkbox-resizer"></div>
              </div>
              <div
                v-for="cell in filteredCols"
                :id="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                :key="`${(typeof item === 'object' && 'id' in item && item.id) || itemIndex}_${cell.id}`"
                class="vc-table__body-cell"
                :class="[cell.class]"
                :style="{ maxWidth: cell.width, width: cell.width }"
              >
                <div class="vc-table__body-cell__content">
                  <slot
                    :name="`item_${cell.id}`"
                    :item="item"
                    :cell="cell"
                    :index="itemIndex"
                  >
                    <VcTableCell
                      :item="item as TableItem"
                      :cell="cell"
                      :index="itemIndex"
                      :editing="editing"
                      @update="$emit('onEditComplete', { event: $event, index: itemIndex })"
                      @blur="$emit('onCellBlur', $event)"
                    ></VcTableCell>
                  </slot>
                </div>
              </div>
              <div
                v-if="
                  enableItemActions && itemActionBuilder && typeof item === 'object' && selectedRowIndex === itemIndex
                "
                class="vc-table__body-actions"
                :class="{
                  'vc-table__body-actions--hover': hasClickListener,
                  'vc-table__body-actions--selected':
                    hasClickListener && selection && selection.length && selection.includes(item),
                }"
                @click.stop
              >
                <div class="vc-table__body-actions-content">
                  <div
                    v-for="(itemAction, i) in itemActions[itemIndex]"
                    :key="i"
                    class="vc-table__body-actions-item"
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
                        <div class="vc-table__body-actions-tooltip">
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
            class="vc-table__body-empty"
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
        class="vc-table__footer"
        :class="{
          'vc-table__footer--mobile': $isMobile.value,
          'vc-table__footer--desktop': $isDesktop.value,
        }"
      >
        <!-- Table pagination -->
        <VcPagination
          :expanded="expanded"
          :pages="pages"
          :current-page="currentPage"
          :variant="paginationVariant"
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
  VNode,
} from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcCheckbox, VcContainer, VcIcon, VcPagination, VcLabel } from "./../../";
import { IActionBuilderResult, ITableColumns } from "./../../../../core/types";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import VcTableColumnSwitcher from "./_internal/vc-table-column-switcher/vc-table-column-switcher.vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import VcTableBaseHeader from "./_internal/vc-table-base-header/vc-table-base-header.vue";
import * as _ from "lodash-es";
import "core-js/actual/array/to-spliced";
import "core-js/actual/array/to-sorted";
import VcTableAddNew from "./_internal/vc-table-add-new/vc-table-add-new.vue";
import VcTableEmpty from "./_internal/vc-table-empty/vc-table-empty.vue";
import type { ComponentProps } from "vue-component-type-helpers";

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
  header: (props: { header: VNode }) => any;
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
    disableItemCheckbox?: (item: T) => boolean;
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
    paginationVariant?: ComponentProps<typeof VcPagination>["variant"];
    selectionItems?: T[];
    disableFilter?: boolean;
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
const disabledSelection: Ref<T[]> = ref([]);
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
// const isHovered = ref(undefined) as Ref<{ item: T; state: boolean } | undefined>;

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

// const renderCellSlot = ({ item, cell, index }: { item: T; cell: ITableColumns; index: number }) => {
//   const isSlotExist = slots[`item_${cell.id}`];

//   const isFirstCell = filteredCols.value.indexOf(cell) === 0;

//   const isRowSelected = isSelected(item);

//   const checkboxComponent = h(
//     "div",
//     {
//       class: "tw-absolute tw-z-10 tw-top-0 tw-bottom-0 tw-left-[20px] tw-right-0 tw-flex tw-items-center",
//     },
//     h(VcCheckbox, {
//       class: "",
//       size: "m",
//       modelValue: isSelected(item),
//       onClick: (e: Event) => e.stopPropagation(),
//       onMouseover: () => (isHovered.value = { state: true, item: item }),
//       onMouseout: () => (isHovered.value = { state: false, item: item }),
//       "onUpdate:modelValue": () => {
//         rowCheckbox(item);
//       },
//     }),
//   );

//   const checkboxVisibilityHandler =
//     !props.editing &&
//     props.multiselect &&
//     props.items &&
//     props.items.length &&
//     ((isFirstCell && selectedRowIndex.value === index) || (isRowSelected && isFirstCell));

//   return h("div", { class: "" }, [
//     checkboxVisibilityHandler ? checkboxComponent : undefined,
//     h(
//       "div",
//       {
//         class: checkboxVisibilityHandler
//           ? isHovered.value?.item === item && isHovered.value.state
//             ? "tw-opacity-5"
//             : "tw-opacity-15"
//           : "",
//       },
//       !isSlotExist
//         ? h(VcTableCell, {
//             cell,

//             item: item as TableItem,
//             index,
//             editing: props.editing,
//             onUpdate: (event) => {
//               emit("onEditComplete", { event, index });
//             },
//             onBlur: (event) => emit("onCellBlur", event),
//           })
//         : slots[`item_${cell.id}`]?.({ item, cell, index }),
//     ),
//   ]);
// };

// const calculateElWidth = (id: string) => {
//   const el = document.getElementById(id);
//   return el ? el.offsetWidth : 0;
// };

const headerComponent = () =>
  h(
    VcTableBaseHeader,
    {
      searchValue: props.searchValue,
      searchPlaceholder: props.searchPlaceholder,
      activeFilterCount: props.activeFilterCount,
      expanded: props.expanded,
      "onSearch:change": (value: string) => emit("search:change", value),
      disableFilter: props.disableFilter,
    },
    slots.filters
      ? {
          filters: () => {
            return slots.filters?.({ closePanel: () => {} });
          },
        }
      : undefined,
  );

const allColumns = ref([]) as Ref<ITableColumns[]>;

const mobileTemplateRenderer = ({ item, index }: { item: TableItem | string; index: number }) => {
  return h(
    "div",
    {
      class: "vc-table__mobile-items-renderer",
    },
    props.columns.map((x) => {
      return h("div", { class: "tw-grow tw-w-[33%] tw-ml-3  tw-truncate", key: `mobile-view-item-${index}` }, [
        h(VcLabel, { class: "tw-mb-1 tw-truncate", required: x?.rules?.required }, () => toValue(x.title)),
        slots[`item_${x.id}`]
          ? slots[`item_${x.id}`]?.({ item, cell: x, index })
          : [
              typeof item === "object"
                ? h(VcTableCell, {
                    cell: { ...x, class: "!tw-justify-start " },
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
  () => props.selectionItems,
  (newVal) => {
    if (newVal) {
      if (!newVal?.length) return;
      selection.value = _.merge(selection.value, newVal);
    }
  },
  {
    immediate: true,
  },
);

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
    return props.items && props.items.length
      ? selection.value.length ===
          props.items.length -
            (disabledSelection.value.length !== props.items.length ? disabledSelection.value.length : 0)
      : false;
  },
  set(checked: boolean) {
    let _selected: T[] = [];

    if (checked) {
      _selected = props.items.filter((x) => !disabledSelection.value.includes(x));
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
    handleMultiselect(newVal);

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
  return !!selection.value.find((x) => _.isEqual(x, item));
}

function rowCheckbox(item: T) {
  const clear = item;

  // const index = props.items.findIndex((x) => _.isEqual(x, clear));

  if (disabledSelection.value.includes(item)) {
    return;
  }

  const isExist = selection.value.find((x) => _.isEqual(x, clear));

  if (isExist) {
    selection.value = selection.value.filter((x) => !_.isEqual(x, clear));
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

async function handleMultiselect(items: T[]) {
  if (props.multiselect && props.disableItemCheckbox && typeof props.disableItemCheckbox === "function") {
    const disabledMultiselect = [];
    for (let index = 0; index < items.length; index++) {
      if (typeof items[index] === "object") {
        const element = await props.disableItemCheckbox(items[index]);

        if (element) {
          disabledMultiselect.push(items[index]);
        }
      }
    }
    disabledSelection.value = disabledMultiselect as T[];
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
  --table-border-color: var(--base-border-color, var(--neutrals-200));
  --table-select-all-border-color: var(--base-border-color, var(--neutrals-200));
  --table-header-bg: var(--neutrals-50);
  --table-header-border-color: var(--base-border-color, var(--neutrals-200));
  --table-header-border: inset 0px 1px 0px var(--table-header-border-color),
    inset 0px -1px 0px var(--table-header-border-color);
  --table-header-text-color: var(--secondary-700);
  --table-resizer-color: var(--base-border-color, var(--neutrals-200));
  --table-reorder-color: var(--primary-400);
  --table-select-all-bg: var(--primary-100);
  --table-row-bg-hover: var(--primary-50);
  --table-row-bg-odd: var(--additional-50);
  --table-row-bg-even: var(--neutrals-50);
  --table-row-hover: var(--primary-50);
  --table-row-bg-selected: var(--primary-100);
  --table-actions-bg: var(--neutrals-100);
  --table-actions-bg-hover: var(--primary-50);
  --table-actions-bg-hover-selected-item: var(--primary-100);
  --table-actions-text-color: var(--neutrals-600);
  --table-actions-tooltip-text: var(--neutrals-600);
  --table-actions-icon-color: var(--primary-500);
  --table-actions-icon-color-hover: var(--primary-600);
  --table-footer-bg: var(--neutrals-50);
  --table-footer-border-color: var(--base-border-color, var(--neutrals-200));
  --table-row-drag-color: var(--primary-400);
  --table-row-drag-shadow: inset 0 -2px 0 0 var(--table-row-drag-color);
  --table-actions-color-danger: var(--danger-500);
  --table-actions-color-success: var(--success-500);
  --table-mobile-border-color: var(--secondary-200);
  --table-text-color: var(--base-text-color, var(--neutrals-950));
}

$variants: (
  danger: var(--table-actions-color-danger),
  success: var(--table-actions-color-success),
);

.vc-table {
  @apply tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0 tw-border-solid tw-border-t-0;
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

  &__mobile-view {
    @apply tw-grow tw-basis-0 tw-relative;
    .vc-container__inner {
      @apply tw-flex tw-flex-grow;
    }
  }

  &__mobile-items {
    @apply tw-flex-grow tw-flex tw-flex-col tw-h-max [width:-webkit-fill-available];
  }

  &__mobile-empty {
    @apply tw-overflow-auto tw-flex tw-flex-col tw-h-full tw-flex-grow;
  }

  &__desktop-table {
    @apply tw-relative tw-box-border tw-w-full tw-h-full tw-flex tw-flex-col;
  }

  &__header {
    @apply tw-flex tw-flex-col tw-sticky tw-top-0 tw-bg-[--table-header-bg] tw-z-[1] tw-box-border;
  }

  &__header-row {
    @apply tw-flex tw-flex-row;
  }

  &__header-checkbox {
    @apply tw-flex-1 tw-flex tw-items-center tw-justify-center tw-w-9 tw-max-w-9 tw-min-w-9 tw-bg-[--table-header-bg] [box-shadow:var(--table-header-border)] tw-shadow-none tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1];
    @apply tw-border-0 #{!important};
  }

  &__header-checkbox__content {
    @apply tw-flex tw-justify-center tw-items-center;
  }

  &__header-checkbox__resizer {
    @apply tw-w-px tw-bg-[--table-resizer-color] tw-h-full tw-absolute tw-right-0 tw-flex tw-justify-end;
  }

  &__header-cell {
    @apply tw-flex-1 tw-flex tw-items-center tw-h-10 tw-bg-[--table-header-bg] [box-shadow:var(--table-header-border)] tw-box-border tw-sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1];
    @apply tw-border-0 #{!important};
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
    @apply tw-flex tw-items-center tw-flex-nowrap tw-truncate tw-px-3 tw-font-bold tw-text-sm tw-text-[color:var(--table-header-text-color)];
  }

  &__header-cell__title {
    @apply tw-truncate;
  }

  &__header-cell__required {
    @apply tw-text-[color:var(--label-required-color)] tw-mr-1;
  }

  &__header-cell__sort-icon {
    @apply tw-ml-1;
  }

  &__header-cell__sort-icons {
    @apply tw-flex tw-flex-col tw-ml-1 tw-invisible;
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

    &:hover {
      .vc-table__body-actions--hover {
        @apply tw-bg-[--table-actions-bg-hover];
      }

      .vc-table__body-actions--selected {
        @apply tw-bg-[--table-actions-bg-hover-selected-item];
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
    @apply tw-bg-[--table-row-hover] hover:tw-bg-[--table-row-hover] #{!important};
  }

  &__body-row--selection {
    @apply hover:tw-bg-[--table-row-bg-selected] tw-bg-[--table-row-bg-selected] #{!important};
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

  &__footer {
    @apply tw-bg-[--table-footer-bg] tw-border-t tw-border-solid tw-border-[--table-footer-border-color] tw-flex-shrink-0 tw-flex tw-items-center tw-justify-between;
  }

  &__footer--mobile {
    @apply tw-py-2 tw-px-4;
  }

  &__footer--desktop {
    @apply tw-p-4;
  }

  /* Drag row styles */
  &__drag-row-bottom {
    box-shadow: var(--table-row-drag-shadow);
  }

  &__drag-row-top {
    box-shadow: var(--table-row-drag-shadow);
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
</style>
