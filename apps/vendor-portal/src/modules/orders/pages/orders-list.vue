<template>
  <vc-blade
    :title="$t('ORDERS.PAGES.LIST.TITLE')"
    :expanded="expanded"
    :closable="closable"
    width="30%"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <!-- Blade contents -->
    <vc-table
      class="vc-flex-grow_1"
      :expanded="expanded"
      :empty="empty"
      :loading="loading"
      :multiselect="true"
      :columns="columns"
      :items="orders"
      :itemActionBuilder="actionBuilder"
      :totalCount="totalCount"
      :pages="pages"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      :currentPage="currentPage"
      @search:change="onSearchList"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value">{{ $t("ORDERS.PAGES.FILTERS.TITLE") }}</h2>
        <vc-container no-padding>
          <vc-row>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("ORDERS.PAGES.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Unpaid'"
                  @update:modelValue="
                    filter.status = $event ? 'Unpaid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.FILTERS.UNPAID") }}</vc-checkbox
                >
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Paid'"
                  @update:modelValue="
                    filter.status = $event ? 'Paid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.FILTERS.PAID") }}</vc-checkbox
                >
              </div>
            </vc-col>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("ORDERS.PAGES.FILTERS.ORDER_DATE") }}
              </div>
              <div>
                <vc-input
                  :label="$t('ORDERS.PAGES.FILTERS.START_DATE')"
                  type="date"
                  class="vc-margin-bottom_m"
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                ></vc-input>
                <vc-input
                  :label="$t('ORDERS.PAGES.FILTERS.END_DATE')"
                  type="date"
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="setFilterDate('endDate', $event)"
                ></vc-input>
              </div>
            </vc-col>
          </vc-row>
          <vc-row>
            <vc-col class="vc-padding_s">
              <div class="vc-flex vc-flex-justify_end">
                <vc-button
                  outline
                  class="vc-margin-right_l"
                  @click="resetFilters"
                  >{{ $t("ORDERS.PAGES.FILTERS.RESET_FILTERS") }}</vc-button
                >
                <vc-button @click="applyFilters">{{
                  $t("ORDERS.PAGES.FILTERS.APPLY")
                }}</vc-button>
              </div>
            </vc-col>
          </vc-row>
        </vc-container>
      </template>

      <!-- Not found template -->
      <template v-slot:notfound>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("ORDERS.PAGES.NOT_FOUND.NO_ORDERS") }}
          </div>
          <vc-button @click="resetSearch">{{
            $t("ORDERS.PAGES.NOT_FOUND.RESET")
          }}</vc-button>
        </div>
      </template>

      <!-- Empty template -->
      <template v-slot:empty>
        <div
          class="
            vc-fill_all
            vc-flex vc-flex-column
            vc-flex-align_center
            vc-flex-justify_center
          "
        >
          <img src="/assets/empty-product.png" />
          <div class="vc-margin_l vc-font-size_xl vc-font-weight_medium">
            {{ $t("ORDERS.PAGES.EMPTY") }}
          </div>
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <vc-status v-bind="statusStyle(itemData.item.status)">
          {{ itemData.item.status }}
        </vc-status>
      </template>

      <template v-slot:mobile-item="itemData">
        <div class="orders-list__mobile-item vc-padding_m">
          <div class="vc-fill_width vc-flex vc-flex-justify_evenly">
            <div class="vc-flex-grow_1">
              <div class="vc-font-weight_bold vc-font-size_l">
                {{ itemData.item.number }}
              </div>
              <vc-hint class="vc-margin-top_xs">{{
                itemData.item.customerName
              }}</vc-hint>
            </div>
            <div>
              <vc-status v-bind="statusStyle(itemData.item.status)">
                {{ itemData.item.status }}
              </vc-status>
            </div>
          </div>
          <div>
            <div
              class="
                vc-margin-top_m
                vc-fill_width
                vc-flex
                vc-flex-justify_space-between
              "
            >
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{ $t("ORDERS.PAGES.STATUS.TOTAL") }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.total }} {{ itemData.item.currency }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>{{ $t("ORDERS.PAGES.STATUS.CREATED") }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{
                    itemData.item.createdDate &&
                    moment(itemData.item.createdDate).fromNow()
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { useOrders } from "../composables";
import { useFunctions, useI18n } from "@virtoshell/core";
import moment from "moment";
import OrdersDetails from "./orders-edit.vue";
import { ICustomerOrder } from "@virtoshell/api-client";
import {
  IActionBuilderResult,
  ITableColumns,
  IBladeToolbar,
} from "../../../types";

export default defineComponent({
  url: "orders",

  props: {
    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },

    param: {
      type: String,
      default: undefined,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { orders, loadOrders, loading, pages, currentPage, totalCount } =
      useOrders();
    const { debounce } = useFunctions();
    const { t } = useI18n();
    const filter = reactive({});
    const appliedFilter = ref({});
    const searchValue = ref();
    const selectedItemId = ref();

    onMounted(async () => {
      selectedItemId.value = props.param;
      await loadOrders();
    });

    const bladeToolbar = ref<IBladeToolbar[]>([
      {
        title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH")),
        icon: "fas fa-sync-alt",
        async clickHandler() {
          await reload();
        },
      },
      {
        title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CONFIRM")),
        icon: "fas fa-check",
        disabled: true,
      },
      {
        title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL")),
        icon: "fas fa-times-circle",
        disabled: true,
      },
    ]);

    const columns = ref<ITableColumns[]>([
      {
        id: "number",
        title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER")),
        width: 160,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "customerName",
        title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER")),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "total",
        title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL")),
        width: 120,
        alwaysVisible: true,
        sortable: true,
        type: "money",
      },
      {
        id: "status",
        title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS")),
        width: 120,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "createdDate",
        title: computed(() => t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED")),
        sortable: true,
        width: 180,
        type: "date-ago",
      },
    ]);

    const empty = reactive({
      image: "/assets/empty-product.png",
      text: computed(() => t("ORDERS.PAGES.EMPTY")),
    });

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: OrdersDetails,
        param: item.id,
        onOpen() {
          selectedItemId.value = item.id;
        },
        onClose() {
          selectedItemId.value = undefined;
        },
      });
    };

    const statusStyle = (status: string) => {
      const result = {
        outline: true,
        variant: "info",
      };

      switch (status) {
        case "Published":
          result.outline = false;
          result.variant = "success";
          break;
        case "New":
          result.outline = true;
          result.variant = "success";
          break;
      }
      return result;
    };

    const onPaginationClick = async (page: number) => {
      await loadOrders({
        skip: (page - 1) * 20,
      });
    };

    const actionBuilder = (item: ICustomerOrder): IActionBuilderResult[] => {
      let result = [];

      result.push({
        icon: "fas fa-check",
        title: computed(() => t("ORDERS.PAGES.TABLE.ACTIONS.CONFIRM")),
        variant: "success",
        clickHandler() {
          alert("Confirm");
        },
      });
      result.push({
        icon: "fas fa-times",
        title: computed(() => t("ORDERS.PAGES.TABLE.ACTIONS.DECLINE")),
        variant: "danger",
        clickHandler() {
          alert("Decline");
        },
      });

      return result;
    };

    const onSearchList = debounce(async (keyword: string) => {
      searchValue.value = keyword;
      await loadOrders({
        ...filter,
        keyword,
      });
    }, 200);

    const reload = async () => {
      await loadOrders({
        ...filter,
        keyword: searchValue.value,
      });
    };

    return {
      reload,
      bladeToolbar,
      columns: computed(() => {
        if (props.expanded) {
          return columns.value;
        } else {
          return columns.value.filter((item) => item.alwaysVisible === true);
        }
      }),
      orders,
      totalCount,
      actionBuilder,
      loading,
      onItemClick,
      moment,
      empty,
      pages,
      currentPage,
      statusStyle,
      onPaginationClick,
      title: computed(() => t("ORDERS.PAGES.LIST.TITLE")),
      searchValue,
      onSearchList,
      selectedItemId,
      setFilterDate(key: string, value: string) {
        filter[key] = new Date(value);
      },
      getFilterDate(key: string) {
        const date = filter[key] as Date;
        if (filter[key]) {
          const year = date.getUTCFullYear();
          const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
          const day = `${date.getUTCDate()}`.padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
        return undefined;
      },
      async resetSearch() {
        searchValue.value = "";
        Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
        await loadOrders({
          ...filter,
          keyword: "",
        });
        appliedFilter.value = {};
      },
      filter,
      activeFilterCount: computed(
        () => Object.values(appliedFilter.value).filter((item) => !!item).length
      ),
      async applyFilters() {
        await loadOrders({
          ...filter,
        });
        appliedFilter.value = {
          ...filter,
        };
      },
      async resetFilters() {
        Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
        await loadOrders({
          ...filter,
        });
        appliedFilter.value = {};
      },
    };
  },
});
</script>
