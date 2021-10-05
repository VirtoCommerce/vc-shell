<template>
  <div class="vc-table-wrapper vc-flex vc-flex-column vc-flex-grow_1">
    <slot
      name="header"
      v-if="(items && items.length) || searchValue || searchValue === ''"
    >
      <div
        class="
          vc-table__header
          vc-flex-shrink_0
          vc-flex
          vc-flex-align_center
          vc-flex-justify_space-between
          vc-padding_l
        "
      >
        <div class="vc-margin-right_m">
          <vc-table-filter
            :items="filterItems"
            @apply="$emit('filter:apply', $event)"
            @reset="$emit('filter:reset')"
          />
        </div>
        <vc-input
          class="vc-flex-grow_1"
          :placeholder="searchPlaceholder"
          :clearable="true"
          :modelValue="searchValue"
          @update:modelValue="$emit('searchValueChanged', $event)"
        ></vc-input>
      </div>
    </slot>

    <div class="vc-table-wrapper__inner">
      <vc-loading :active="loading"></vc-loading>
      <vc-container
        v-if="items && items.length"
        ref="scrollContainer"
        :noPadding="true"
        class="vc-flex-grow_1"
      >
        <template v-if="$isPhone.value && $slots['mobile-item']">
          <div class="vc-table-mobile">
            <div
              v-for="item in items"
              :key="item.id"
              class="vc-table-mobile__item"
              :class="{
                'vc-table-mobile__item_active':
                  mobileItems[item.id] && mobileItems[item.id].isActive,
              }"
              :style="`transform: translateX(${
                (mobileItems[item.id] && mobileItems[item.id].offset) || 0
              }px)`"
              @click="$emit('itemClick', item)"
              @touchstart="itemTouchStart($event, item.id)"
              @touchmove="itemTouchMove($event, item.id)"
              @touchend="itemTouchEnd($event, item.id)"
              @touchcancel="itemTouchCancel($event, item.id)"
            >
              <div class="vc-table-mobile__item-content">
                <slot name="mobile-item" :item="item"></slot>
              </div>
              <div class="vc-table-mobile__item-actions">
                <div
                  class="
                    vc-table-mobile__item-action
                    vc-table-mobile__item-action_success
                  "
                >
                  <vc-icon icon="fas fa-check" />
                  <div class="vc-table-mobile__item-action-text">Publish</div>
                </div>
                <div class="vc-table-mobile__item-action">
                  <vc-icon icon="fas fa-ellipsis-h" />
                  <div class="vc-table-mobile__item-action-text">More</div>
                </div>
              </div>
            </div>
          </div>
        </template>
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
            </tr>
          </thead>

          <tbody v-if="items" class="vc-table__body">
            <tr
              v-for="(item, i) in items"
              :key="item.id"
              class="vc-table__body-row"
              :class="{
                'vc-table__body-row_even': i % 2 === 1,
              }"
              @click="$emit('itemClick', item)"
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
                <slot :name="`item_${cell.id}`" :item="item">{{
                  (cell.field || cell.id)
                    .split(".")
                    .reduce((p, c) => (p && p[c]) || null, item)
                }}</slot>
              </td>
            </tr>
          </tbody>
        </table>
      </vc-container>
      <template v-else>
        <slot v-if="searchValue || searchValue === ''" name="notfound">
          <div
            v-if="notfound"
            class="
              vc-fill_all
              vc-flex vc-flex-column
              vc-flex-align_center
              vc-flex-justify_center
            "
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
            class="
              vc-fill_all
              vc-flex vc-flex-column
              vc-flex-align_center
              vc-flex-justify_center
            "
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

    <slot name="footer" v-if="items && items.length">
      <div
        class="
          vc-table__footer
          vc-flex-shrink_0
          vc-flex
          vc-flex-align_center
          vc-flex-justify_space-between
          vc-padding_l
        "
      >
        <vc-pagination
          :expanded="expanded"
          :pages="pages"
          :currentPage="currentPage"
          @itemClick="$emit('paginationClick', $event)"
        ></vc-pagination>
        <vc-table-counter
          :label="totalLabel"
          :value="totalCount"
        ></vc-table-counter>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcCheckbox from "../../atoms/vc-checkbox/vc-checkbox.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import VcInput from "../../molecules/vc-input/vc-input.vue";
import VcPagination from "../../molecules/vc-pagination/vc-pagination.vue";
import VcLoading from "../../atoms/vc-loading/vc-loading.vue";
import VcTableCounter from "./_internal/vc-table-counter/vc-table-counter.vue";
import VcTableFilter from "./_internal/vc-table-filter/vc-table-filter.vue";

interface IMobileItem {
  isActive: boolean;
  offset: number;
  start: number;
}

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
  },

  data() {
    const checkboxes: Record<string, boolean> = {};
    const mobileItems: Record<string, IMobileItem> = {};

    return {
      checkboxes,
      mobileItems,
    };
  },

  props: {
    columns: {
      type: Array,
      default: () => [],
    },

    items: {
      type: Array,
      default: () => [],
    },

    filterItems: {
      type: Array,
      default: () => [],
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
  },

  emits: [
    "paginationClick",
    "selectionChanged",
    "searchValueChanged",
    "itemClick",
  ],

  watch: {
    items(value: { id: string }[]) {
      this.checkboxes = {};
      value.forEach((item) => (this.checkboxes[item.id] = false));
      const scrollContainer = this.$refs.scrollContainer as typeof VcContainer;
      scrollContainer?.scrollTop();
    },
  },

  computed: {
    sortDirection() {
      return this.sort?.slice(0, 1) === "-" ? "DESC" : "ASC";
    },

    sortField() {
      return this.sort?.slice(0, 1) === "-" ? this.sort?.slice(1) : this.sort;
    },

    headerCheckbox() {
      return Object.values(this.checkboxes).every((value) => value);
    },
  },

  methods: {
    processHeaderCheckbox() {
      const currentState = Object.values(this.checkboxes).every(
        (value) => value
      );
      Object.keys(this.checkboxes).forEach(
        (key) => (this.checkboxes[key] = !currentState)
      );
      this.$emit("selectionChanged", this.checkboxes);
    },

    processCheckbox(id: string, state: boolean) {
      this.checkboxes[id] = state;
      this.$emit("selectionChanged", this.checkboxes);
    },

    itemTouchStart(e: TouchEvent, id: string): void {
      this.mobileItems[id] = {
        ...(this.mobileItems[id] || {}),
        start: e.touches[0].clientX,
      };
    },

    itemTouchMove(e: TouchEvent, id: string): void {
      const offset = e.touches[0].clientX - this.mobileItems[id].start;
      if (Math.abs(offset) > 10 && Math.abs(offset) <= 80) {
        this.mobileItems[id] = {
          ...(this.mobileItems[id] || {}),
          offset,
        };
      }
    },

    itemTouchEnd(e: TouchEvent, id: string): void {
      this.mobileItems[id] = {
        ...(this.mobileItems[id] || {}),
        offset: this.mobileItems[id].offset < -50 ? -80 : 0,
      };
    },
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

      &_sortable {
        cursor: pointer;
      }
    }
  }

  &__body {
    &-row {
      height: 60px;
      cursor: pointer;
      background-color: #ffffff;

      &_even {
        background-color: #f8f8f8;
      }

      &:hover {
        background-color: #eff7fc;
      }
    }

    &-row:hover &-cell_bordered {
      border-right: 1px solid #bdd1df;
    }

    &-cell {
      box-sizing: border-box;

      &_bordered {
        border-right: 1px solid #eaedf3;
      }
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

  &-mobile {
    &__item {
      position: relative;
      display: flex;
      flex-wrap: nowrap;
      align-items: stretch;

      &-content {
        flex-shrink: 0;
        width: 100%;
      }

      &-actions {
        flex-shrink: 0;
        width: 80px;
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        background-color: #a9bfd2;
      }

      &-action {
        display: flex;
        flex-grow: 1;
        flex-basis: 1;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;

        &-text {
          margin-top: 4px;
          font-size: 14px;
        }

        &_success {
          background-color: #87b563;
        }
      }
    }
  }
}
</style>
