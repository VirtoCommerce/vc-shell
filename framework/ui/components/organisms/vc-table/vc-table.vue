<template>
  <div class="tw-relative tw-overflow-hidden tw-flex tw-flex-col tw-grow tw-basis-0">
    <!-- Header slot with filter and searchbar -->
    <slot
      name="header"
      v-if="
        ($slots['header'] || header) &&
        ((items && items.length) ||
          searchValue ||
          searchValue === '' ||
          activeFilterCount)
      "
    >
      <div class="tw-shrink-0 tw-flex tw-items-center tw-justify-between tw-p-4">
        <!-- Table filter mobile button -->
        <div v-if="$isMobile.value && $slots['filters']" class="tw-mr-3">
          <VcTableFilter :counter="activeFilterCount">
            <template v-slot:default="{ closePanel }">
              <slot name="filters" :closePanel="closePanel"></slot>
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
        <div v-if="$isDesktop.value && $slots['filters']" class="tw-ml-3">
          <VcTableFilter
            :title="$t('Filters')"
            :counter="activeFilterCount"
            :parentExpanded="expanded"
          >
            <template v-slot:default="{ closePanel }">
              <slot name="filters" :closePanel="closePanel"></slot>
            </template>
          </VcTableFilter>
        </div>
      </div>
    </slot>

    <div class= "tw-flex tw-relative tw-overflow-hidden tw-grow">
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
              v-for="item in items"
              :key="item.id"
              :item="item"
              :actionBuilder="itemActionBuilder"
              @click="$emit('itemClick', item)"
              @swipeStart="handleSwipe"
              :swipingItem="mobileSwipeItem"
            >
              <slot name="mobile-item" :item="item"></slot>
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
          <thead v-if="columns" class="vc-table__header">
            <tr class="vc-table__header-row">
              <th
                v-if="multiselect"
                class="tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
                width="50"
              >
                <div class= "tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    :modelValue="headerCheckbox"
                    @update:modelValue="processHeaderCheckbox"
                    @click.stop
                  ></VcCheckbox>
                </div>
              </th>
              <th
                v-for="item in columns"
                :key="item.id"
                class="tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1] tw-px-3"
                :class="{
                  'tw-cursor-pointer tw-group': item.sortable,
                }"
                :width="item.width"
                @click="handleHeaderClick(item)"
              >
                <div
                  class= "tw-flex tw-items-center tw-flex-nowrap"
                  :class="tableAlignment[item.align]"
                >
                  <div>
                    <slot :name="`header_${item.id}`">{{ item.title }}</slot>
                  </div>
                  <div v-if="sortField === item.id" class="tw-ml-1">
                    <VcIcon
                      size="xs"
                      :icon="`fas fa-caret-${
                        sortDirection === 'DESC' ? 'down' : 'up'
                      }`"
                    ></VcIcon>
                  </div>
                  <div
                    class= "tw-flex tw-flex-col tw-ml-1 tw-invisible group-hover:tw-visible"
                    v-else
                  >
                    <VcIcon size="xs" icon="fas fa-caret-up"></VcIcon>
                    <VcIcon size="xs" icon="fas fa-caret-down"></VcIcon>
                  </div>
                </div>
              </th>
              <th
                class="tw-h-[42px] tw-bg-[#f9f9f9] !tw-border-0 tw-shadow-[inset_0px_1px_0px_#eaedf3,_inset_0px_-1px_0px_#eaedf3] tw-box-border sticky tw-top-0 tw-select-none tw-overflow-hidden tw-z-[1]"
                width="44"
                v-if="itemActionBuilder"
              ></th>
            </tr>
          </thead>

          <tbody v-if="items" class="vc-table__body">
            <tr
              v-for="(item, i) in items"
              :key="item.id"
              class="vc-table__body-row tw-h-[60px] tw-bg-white hover:tw-bg-[#dfeef9]"
              :class="{
                'tw-cursor-pointer hover:tw-bg-[#dfeef9]': onItemClick,
                'tw-bg-[#f8f8f8]': i % 2 === 1,
                '!tw-bg-[#dfeef9] hover:tw-bg-[#dfeef9]':
                  item && item.id ? selectedItemId === item.id : false,
              }"
              @click="$emit('itemClick', item)"
              @mouseover="calculateActions(item)"
              @mouseleave="closeActions"
            >
              <td v-if="multiselect" width="50">
                <div class= "tw-flex tw-justify-center tw-items-center">
                  <VcCheckbox
                    :modelValue="checkboxes[item.id]"
                    @update:modelValue="processCheckbox(item.id, $event)"
                    @click.stop
                  ></VcCheckbox>
                </div>
              </td>
              <td
                v-for="cell in columns"
                :key="`${item.id}_${cell.id}`"
                class="tw-box-border tw-overflow-hidden tw-px-3"
                :class="cell.class"
                :width="cell.width"
              >
                <slot :name="`item_${cell.id}`" :item="item" :cell="cell">
                  <VcTableCell :cell="cell" :item="item"></VcTableCell>
                </slot>
              </td>
              <td
                class="tw-box-border tw-overflow-visible tw-px-3"
                width="44"
                v-if="itemActionBuilder"
              >
                <div
                  class="vc-table__body-actions-container tw-relative !tw-hidden tw-justify-center tw-items-center"
                >
                  <button
                    class="tw-text-[#319ed4] tw-cursor-pointer tw-border-none tw-bg-transparent disabled:tw-text-[gray]"
                    @click.stop="showActions(item, item.id)"
                    :ref="(el) => setActionToggleRefs(el, item.id)"
                    aria-describedby="tooltip"
                    :disabled="!(itemActions && itemActions.length)"
                  >
                    <VcIcon icon="fas fa-cog" size="m" />
                  </button>
                  <div
                    class="vc-table__body-tooltip tw-bg-white tw-rounded-l-[4px] tw-p-[15px] tw-z-0 tw-absolute tw-right-0 tw-drop-shadow-[1px_3px_14px_rgba(111,122,131,0.25)]"
                    v-show="selectedRow === item.id"
                    @mouseleave="closeActions"
                    :ref="(el) => setTooltipRefs(el, item.id)"
                    role="tooltip"
                  >
                    <div
                      class= "tw-flex tw-items-center tw-flex-row tw-text-[#3f3f3f] tw-font-normal not-italic tw-text-base tw-leading-[20px] tw-gap-[25px]"
                    >
                      <div
                        v-for="(itemAction, i) in itemActions"
                        :key="i"
                        :class="[
                          'tw-flex tw-flex-row tw-items-center tw-text-[#319ed4] tw-cursor-pointer',
                          `vc-table__body-actions-item_${itemAction.variant}`,
                        ]"
                        @click.stop="itemAction.clickHandler(item)"
                      >
                        <VcIcon :icon="itemAction.icon" size="m" />
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
            <img v-if="notfound.image" :src="notfound.image" />
            <div class="tw-m-4 vc-table__empty-text">
              {{ notfound.text }}
            </div>
            <VcButton v-if="notfound.action" @click="notfound.clickHandler">
              {{ notfound.action }}
            </VcButton>
          </div>
        </slot>
        <slot v-else name="empty">
          <div
            v-if="empty"
            class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
          >
            <img v-if="empty.image" :src="empty.image" />
            <div class="tw-m-4 tw-text-xl tw-font-medium">{{ empty.text }}</div>
            <VcButton v-if="empty.action" @click="empty.clickHandler">
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
import { computed, nextTick, PropType, ref, watch, onBeforeUpdate } from "vue";
import {
  VcIcon,
  VcLoading,
  VcCheckbox,
  VcContainer,
  VcInput,
  VcPagination,
} from "@/ui/components";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import { createPopper, Instance } from "@popperjs/core";
import { IActionBuilderResult } from "@/core/types";

interface ITableItemRef {
  element: HTMLDivElement;
  id: string;
}

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },

  items: {
    type: Array as PropType<{ id: string }[]>,
    default: () => [],
  },

  filterItems: {
    type: Array,
    default: () => [],
  },

  itemActionBuilder: {
    type: Function,
    default: undefined,
  },

  sort: {
    type: String,
    default: undefined,
  },

  multiselect: {
    type: Boolean,
    default: false,
  },

  expanded: {
    type: Boolean,
    default: false,
  },

  totalLabel: {
    type: String,
    default: "Totals:",
  },

  totalCount: {
    type: Number,
    default: 0,
  },

  pages: {
    type: Number,
    default: 0,
  },

  currentPage: {
    type: Number,
    default: 0,
  },

  searchPlaceholder: {
    type: String,
    default: "Search...",
  },

  searchValue: {
    type: String,
    default: undefined,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  empty: {
    type: Object,
    default: () => ({
      text: "List is empty.",
    }),
  },

  notfound: {
    type: Object,
    default: () => ({
      text: "Nothing found.",
    }),
  },

  header: {
    type: Boolean,
    default: true,
  },

  footer: {
    type: Boolean,
    default: true,
  },

  activeFilterCount: {
    type: Number,
    default: 0,
  },

  selectedItemId: {
    type: String,
    default: undefined,
  },

  scrolling: {
    type: Boolean,
    default: false,
  },

  onItemClick: {
    type: Function,
    default: undefined,
  },
});

const emit = defineEmits([
  "paginationClick",
  "selectionChanged",
  "search:change",
  "filter:apply",
  "filter:reset",
  "headerClick",
]);

const checkboxes = ref<Record<string, boolean>>({});
const selectedRow = ref<string>();
const tooltip = ref<Instance>();
const scrollContainer = ref<typeof VcContainer>();
const actionToggleRefs = ref<ITableItemRef[]>([]);
const tooltipRefs = ref<ITableItemRef[]>([]);
const itemActions = ref<IActionBuilderResult[]>([]);
const mobileSwipeItem = ref<string>();

onBeforeUpdate(() => {
  actionToggleRefs.value = [];
  tooltipRefs.value = [];
});

const sortDirection = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[1];
});

const sortField = computed(() => {
  const entry = props.sort?.split(":");
  return entry && entry.length === 2 && entry[0];
});

const tableAlignment = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const headerCheckbox = computed(() =>
  Object.values(checkboxes.value).every((value) => value)
);

watch(
  () => props.items,
  (value: { id: string }[]) => {
    checkboxes.value = {};
    value?.forEach((item) => (checkboxes.value[item.id] = false));
    scrollContainer.value?.scrollTop();
  }
);

function setTooltipRefs(el: HTMLDivElement, id: string) {
  if (el) {
    const isExists = tooltipRefs.value.some((item) => item.id === id);
    if (!isExists) {
      tooltipRefs.value.push({ element: el, id });
    }
  }
}

function setActionToggleRefs(el: HTMLDivElement, id: string) {
  if (el) {
    const isExists = actionToggleRefs.value.some((item) => item.id === id);
    if (!isExists) {
      actionToggleRefs.value.push({ element: el, id });
    }
  }
}

function processHeaderCheckbox() {
  const currentState = Object.values(checkboxes.value).every((value) => value);
  Object.keys(checkboxes.value).forEach(
    (key) => (checkboxes.value[key] = !currentState)
  );
  emit("selectionChanged", checkboxes.value);
}

function processCheckbox(id: string, state: boolean) {
  checkboxes.value[id] = state;
  emit("selectionChanged", checkboxes.value);
}

function showActions(item: { id: string }, index: string) {
  selectedRow.value = item.id;

  const toggleRef = actionToggleRefs.value.find((item) => item.id === index);
  const tooltipRef = tooltipRefs.value.find((item) => item.id === index);

  if (toggleRef && tooltipRef) {
    nextTick(() => {
      tooltip.value = createPopper(toggleRef.element, tooltipRef.element, {
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

async function calculateActions(item: { id: string }) {
  if (typeof props.itemActionBuilder === "function") {
    itemActions.value = await props.itemActionBuilder(item);
  }
}

function closeActions() {
  selectedRow.value = undefined;
  tooltip.value?.destroy();
}

function handleSwipe(id: string) {
  mobileSwipeItem.value = id;
}

function handleHeaderClick(item: Record<string, unknown>) {
  emit("headerClick", item);
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

    &-row:hover .vc-table__body-actions-container {
      @apply tw-flex #{!important};
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