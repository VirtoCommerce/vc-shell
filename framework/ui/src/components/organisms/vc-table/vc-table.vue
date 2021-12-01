<template>
  <div class="vc-table-wrapper vc-flex vc-flex-column vc-flex-grow_1">
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
      <div
        class="vc-table__header vc-flex-shrink_0 vc-flex vc-flex-align_center vc-flex-justify_space-between vc-padding_l"
      >
        <!-- Table filter mobile button -->
        <div
          v-if="$isMobile.value && $slots['filters']"
          class="vc-margin-right_m"
        >
          <vc-table-filter :counter="activeFilterCount">
            <slot name="filters"></slot>
          </vc-table-filter>
        </div>

        <!-- Table search input -->
        <vc-input
          class="vc-flex-grow_1"
          :placeholder="searchPlaceholder"
          :clearable="true"
          :modelValue="searchValue"
          @update:modelValue="$emit('search:change', $event)"
        ></vc-input>

        <!-- Table filter desktop button -->
        <div
          v-if="$isDesktop.value && $slots['filters']"
          class="vc-margin-left_m"
        >
          <vc-table-filter :title="$t('Filters')" :counter="activeFilterCount">
            <slot name="filters"></slot>
          </vc-table-filter>
        </div>
      </div>
    </slot>

    <div class="vc-table-wrapper__inner">
      <!-- Table loading overlay -->
      <vc-loading :active="loading"></vc-loading>

      <!-- Table scroll container -->
      <vc-container
        v-if="items && items.length"
        ref="scrollContainer"
        :noPadding="true"
        class="vc-flex-grow_1"
        :usePtr="!!$attrs['onScroll:ptr']"
        @scroll:ptr="$emit('scroll:ptr')"
      >
        <!-- Mobile table view -->
        <template v-if="$isMobile.value && $slots['mobile-item']">
          <div class="vc-table-mobile">
            <vc-table-mobile-item
              v-for="item in items"
              :key="item.id"
              :item="item"
              :actionBuilder="itemActionBuilder"
              @click="$emit('itemClick', item)"
            >
              <slot name="mobile-item" :item="item"></slot>
            </vc-table-mobile-item>
          </div>
        </template>

        <!-- Desktop table view -->
        <table
          v-else
          class="vc-table vc-fill_width"
          :class="{
            'vc-table_empty': !items || !items.length,
            'vc-table_multiselect': multiselect,
          }"
        >
          <thead v-if="columns" class="vc-table__header">
            <tr class="vc-table__header-row">
              <th v-if="multiselect" class="vc-table__header-cell" width="50">
                <div
                  class="vc-flex vc-flex-justify_center vc-flex-align_center"
                >
                  <vc-checkbox
                    :modelValue="headerCheckbox"
                    @update:modelValue="processHeaderCheckbox"
                    @click.stop
                  ></vc-checkbox>
                </div>
              </th>
              <th
                v-for="item in columns"
                :key="item.id"
                class="vc-table__header-cell vc-padding-horizontal_m"
                :class="{
                  'vc-table__header-cell_sortable': item.sortable,
                }"
                :width="item.width"
                @click="$emit('headerClick', item)"
              >
                <div
                  class="vc-flex vc-flex-align_center vc-flex-nowrap"
                  :class="`vc-flex-justify_${item.align || 'start'}`"
                >
                  <div>
                    <slot :name="`header_${item.id}`">{{ item.title }}</slot>
                  </div>
                  <div
                    v-if="sortField === item.id"
                    class="vc-table__header-cell_sort vc-margin-left_xs"
                  >
                    <vc-icon
                      size="xs"
                      :icon="`fas fa-caret-${
                        sortDirection === 'DESC' ? 'down' : 'up'
                      }`"
                    ></vc-icon>
                  </div>
                </div>
              </th>
              <th
                class="vc-table__header-cell"
                width="44"
                v-if="itemActionBuilder && itemActionBuilder.length"
              ></th>
            </tr>
          </thead>

          <tbody v-if="items" class="vc-table__body">
            <tr
              v-for="(item, i) in items"
              :key="item.id"
              class="vc-table__body-row"
              :class="{
                'vc-table__body-row_clickable': $attrs.onItemClick,
                'vc-table__body-row_even': i % 2 === 1,
                'vc-table__body-row_selected': selectedItemId === item.id,
              }"
              @click="$emit('itemClick', item)"
              @mouseleave="closeActions"
            >
              <td v-if="multiselect" class="vc-table__body-cell" width="50">
                <div
                  class="vc-flex vc-flex-justify_center vc-flex-align_center"
                >
                  <vc-checkbox
                    :modelValue="checkboxes[item.id]"
                    @update:modelValue="processCheckbox(item.id, $event)"
                    @click.stop
                  ></vc-checkbox>
                </div>
              </td>
              <td
                v-for="cell in columns"
                :key="`${item.id}_${cell.id}`"
                class="vc-table__body-cell vc-padding-horizontal_m"
                :class="cell.class"
                :width="cell.width"
              >
                <slot :name="`item_${cell.id}`" :item="item" :cell="cell">
                  <vc-table-cell :cell="cell" :item="item"></vc-table-cell>
                </slot>
              </td>
              <td
                class="vc-table__body-cell vc-table__body-cell_overflow"
                width="44"
                v-if="itemActionBuilder && itemActionBuilder.length"
              >
                <div
                  class="vc-table__body-actions-container vc-flex vc-flex-justify_center vc-flex-align_center"
                >
                  <div
                    class="vc-table__body-actions"
                    @click.stop="showActions(item, i)"
                    :ref="setActionToggleRefs"
                    aria-describedby="tooltip"
                  >
                    <vc-icon icon="fas fa-cog" size="m" />
                  </div>
                  <div
                    class="vc-table__body-tooltip"
                    v-show="selectedRow === item.id"
                    @mouseleave="closeActions"
                    :ref="setTooltipRefs"
                    role="tooltip"
                  >
                    <div class="vc-table__body-actions-items">
                      <div
                        v-for="(itemAction, i) in itemActions"
                        :key="i"
                        :class="[
                          'vc-table__body-actions-item',
                          `vc-table__body-actions-item_${itemAction.variant}`,
                        ]"
                        @click.stop="itemAction.clickHandler(item)"
                      >
                        <vc-icon :icon="itemAction.icon" size="m" />
                        <div class="vc-table__body-actions-item-title">
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
      </vc-container>

      <!-- Empty table view -->
      <template v-else>
        <slot
          v-if="searchValue || searchValue === '' || activeFilterCount"
          name="notfound"
        >
          <div
            v-if="notfound"
            class="vc-fill_all vc-flex vc-flex-column vc-flex-align_center vc-flex-justify_center"
          >
            <img v-if="notfound.image" :src="notfound.image" />
            <div class="vc-margin_l vc-table__empty-text">
              {{ notfound.text }}
            </div>
            <vc-button v-if="notfound.action" @click="notfound.clickHandler">
              {{ notfound.action }}
            </vc-button>
          </div>
        </slot>
        <slot v-else name="empty">
          <div
            v-if="empty"
            class="vc-fill_all vc-flex vc-flex-column vc-flex-align_center vc-flex-justify_center"
          >
            <img v-if="empty.image" :src="empty.image" />
            <div class="vc-margin_l vc-table__empty-text">{{ empty.text }}</div>
            <vc-button v-if="empty.action" @click="empty.clickHandler">
              {{ empty.action }}
            </vc-button>
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
        class="vc-table__footer vc-flex-shrink_0 vc-flex vc-flex-align_center vc-flex-justify_space-between vc-padding_l"
      >
        <!-- Table pagination -->
        <vc-pagination
          :expanded="expanded"
          :pages="pages"
          :currentPage="currentPage"
          @itemClick="$emit('paginationClick', $event)"
        ></vc-pagination>

        <!-- Table counter -->
        <vc-table-counter
          :label="totalLabel"
          :value="totalCount"
        ></vc-table-counter>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  PropType,
  ref,
  watch,
  onBeforeUpdate,
} from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcCheckbox from "../../atoms/vc-checkbox/vc-checkbox.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import VcInput from "../../molecules/vc-input/vc-input.vue";
import VcPagination from "../../molecules/vc-pagination/vc-pagination.vue";
import VcLoading from "../../atoms/vc-loading/vc-loading.vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";
import VcTableMobileItem from "./_internal/vc-table-mobile-item/vc-table-mobile-item.vue";
import VcTableCell from "./_internal/vc-table-cell/vc-table-cell.vue";
import { createPopper, Instance } from "@popperjs/core";

export default defineComponent({
  name: "VcTable",

  components: {
    VcIcon,
    VcCheckbox,
    VcContainer,
    VcInput,
    VcPagination,
    VcTableCounter,
    VcLoading,
    VcTableFilter,
    VcTableMobileItem,
    VcTableCell,
  },

  props: {
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
  },

  emits: [
    "paginationClick",
    "selectionChanged",
    "search:change",
    "filter:apply",
    "filter:reset",
  ],

  setup(props, { emit }) {
    const checkboxes = ref<Record<string, boolean>>({});
    const selectedRow = ref<string>();
    const tooltip = ref<Instance>();
    const scrollContainer = ref<typeof VcContainer>();
    const actionToggleRefs = ref<HTMLDivElement[]>([]);
    const tooltipRefs = ref<HTMLDivElement[]>([]);
    const itemActions = ref([]);

    onBeforeUpdate(() => {
      actionToggleRefs.value = [];
      tooltipRefs.value = [];
    });

    const sortDirection = computed(() =>
      props.sort?.slice(0, 1) === "-" ? "DESC" : "ASC"
    );
    const sortField = computed(() =>
      props.sort?.slice(0, 1) === "-" ? props.sort?.slice(1) : props.sort
    );
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

    function setTooltipRefs(el: HTMLDivElement) {
      if (el) {
        tooltipRefs.value.push(el);
      }
    }

    function setActionToggleRefs(el: HTMLDivElement) {
      if (el) {
        actionToggleRefs.value.push(el);
      }
    }

    function processHeaderCheckbox() {
      const currentState = Object.values(checkboxes.value).every(
        (value) => value
      );
      Object.keys(checkboxes.value).forEach(
        (key) => (checkboxes.value[key] = !currentState)
      );
      emit("selectionChanged", checkboxes.value);
    }

    function processCheckbox(id: string, state: boolean) {
      checkboxes.value[id] = state;
      emit("selectionChanged", checkboxes.value);
    }

    async function showActions(item: { id: string }, index: number) {
      selectedRow.value = item.id;

      await nextTick(() => {
        tooltip.value = createPopper(
          actionToggleRefs.value[index],
          tooltipRefs.value[index],
          {
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
          }
        );
      });

      if (typeof props.itemActionBuilder === "function") {
        itemActions.value = await props.itemActionBuilder(item);
      }
    }

    function closeActions() {
      selectedRow.value = undefined;
      tooltip.value?.destroy();
    }

    return {
      sortDirection,
      sortField,
      headerCheckbox,
      checkboxes,
      selectedRow,
      itemActions,
      tooltip,
      setTooltipRefs,
      setActionToggleRefs,
      processHeaderCheckbox,
      processCheckbox,
      showActions,
      closeActions,
    };
  },
});
</script>

<style lang="less">
.vc-table {
  border-spacing: 0;
  border-collapse: collapse;
  position: relative;
  padding-top: 43px;
  table-layout: fixed;

  &-wrapper {
    position: relative;
    overflow: hidden;

    &__inner {
      display: flex;
      position: relative;
      overflow: hidden;
      flex-grow: 1;
    }
  }

  &__header {
    &-cell {
      height: 42px;
      background-color: #f9f9f9;
      border: 0 !important;
      box-shadow: inset 0px 1px 0px #eaedf3, inset 0px -1px 0px #eaedf3;
      box-sizing: border-box;
      position: sticky;
      top: 0;
      user-select: none;
      overflow: hidden;
      z-index: 1;

      &_sortable {
        cursor: pointer;
      }
    }
  }

  &__body {
    &-row {
      height: 60px;
      background-color: #ffffff;

      &_even {
        background-color: #f8f8f8;
      }

      &_selected,
      &_selected:hover {
        background-color: #dfeef9;
      }

      &_clickable {
        cursor: pointer;

        &:hover {
          background-color: #eff7fc;
        }
      }
    }

    &-row:hover &-cell_bordered {
      border-right: 1px solid #bdd1df;
    }

    &-row:hover .vc-table__body-actions-container {
      display: flex !important;
    }

    &-cell {
      box-sizing: border-box;
      overflow: hidden;

      &_bordered {
        border-right: 1px solid #eaedf3;
      }

      &_overflow {
        overflow: visible;
      }
    }

    &-actions-container {
      position: relative;
      display: none !important;
    }

    &-actions {
      color: #319ed4;
      cursor: pointer;
    }

    &-actions-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #319ed4;

      &_danger {
        color: #ff4a4a;
      }

      &_success {
        color: #87b563;
      }
    }

    &-actions-item-title {
      font-style: normal;
      font-weight: normal;
      font-size: 13px;
      line-height: 20px;
      color: #3f3f3f;
      margin-left: 7px;
    }

    &-tooltip {
      background: #ffffff;
      color: #3f3f3f;
      border-radius: 4px 0 0 4px;
      font-style: normal;
      font-weight: normal;
      font-size: 13px;
      line-height: 20px;
      display: flex;
      align-items: center;
      flex-direction: row;
      gap: 25px;
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
  }

  &__footer {
    background-color: #fbfdfe;
    border-top: 2px solid #eaedf3;
  }

  &__empty {
    &-text {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-medium);
    }
  }
}
</style>
