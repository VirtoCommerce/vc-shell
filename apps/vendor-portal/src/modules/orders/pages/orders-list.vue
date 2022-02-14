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
      :columns="columns"
      :items="orders"
      :itemActionBuilder="actionBuilder"
      :totalCount="totalCount"
      :pages="pages"
      :sort="sort"
      :searchValue="searchValue"
      :activeFilterCount="activeFilterCount"
      :selectedItemId="selectedItemId"
      :currentPage="currentPage"
      @search:change="onSearchList"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
      @scroll:ptr="reload"
      @headerClick="onHeaderClick"
      @selectionChanged="onSelectionChanged"
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value">
          {{ $t("ORDERS.PAGES.LIST.FILTERS.TITLE") }}
        </h2>
        <vc-container no-padding>
          <vc-row>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("ORDERS.PAGES.LIST.FILTERS.STATUS_FILTER") }}
              </div>
              <div>
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Unpaid'"
                  @update:modelValue="
                    filter.status = $event ? 'Unpaid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.UNPAID") }}</vc-checkbox
                >
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Paid'"
                  @update:modelValue="
                    filter.status = $event ? 'Paid' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.PAID") }}</vc-checkbox
                >

                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Accepted'"
                  @update:modelValue="
                    filter.status = $event ? 'Accepted' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.ACCEPTED") }}</vc-checkbox
                >
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Shipped'"
                  @update:modelValue="
                    filter.status = $event ? 'Shipped' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.SHIPPED") }}</vc-checkbox
                >
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Cancelled'"
                  @update:modelValue="
                    filter.status = $event ? 'Cancelled' : undefined
                  "
                  >{{ $t("ORDERS.PAGES.LIST.FILTERS.CANCELLED") }}</vc-checkbox
                >
              </div>
            </vc-col>
            <vc-col class="filter-col vc-padding_s">
              <div class="group-title">
                {{ $t("ORDERS.PAGES.LIST.FILTERS.ORDER_DATE") }}
              </div>
              <div>
                <vc-input
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.START_DATE')"
                  type="date"
                  class="vc-margin-bottom_m"
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                ></vc-input>
                <vc-input
                  :label="$t('ORDERS.PAGES.LIST.FILTERS.END_DATE')"
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
                  >{{
                    $t("ORDERS.PAGES.LIST.FILTERS.RESET_FILTERS")
                  }}</vc-button
                >
                <vc-button @click="applyFilters">{{
                  $t("ORDERS.PAGES.LIST.FILTERS.APPLY")
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
            {{ $t("ORDERS.PAGES.LIST.NOT_FOUND.NO_ORDERS") }}
          </div>
          <vc-button @click="resetSearch">{{
            $t("ORDERS.PAGES.LIST.NOT_FOUND.RESET")
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
            {{ $t("ORDERS.PAGES.LIST.EMPTY") }}
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
              <div class="vc-ellipsis vc-flex-grow_1 vc-margin-right_s">
                <vc-hint>{{ $t("ORDERS.PAGES.LIST.STATUS.TOTAL") }}</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.total }} {{ itemData.item.currency }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1 vc-margin-right_s">
                <vc-hint>{{ $t("ORDERS.PAGES.LIST.STATUS.CREATED") }}</vc-hint>
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
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useOrders } from "../composables";
import { useFunctions, useI18n } from "@virtoshell/core";
import moment from "moment";
import OrdersDetails from "./orders-edit.vue";
import { CustomerOrder } from "@virtoshell/api-client";
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
    const {
      orders,
      loadOrders,
      loading,
      pages,
      currentPage,
      totalCount,
      changeOrderStatus,
    } = useOrders();
    const { debounce } = useFunctions();
    const { t } = useI18n();
    const filter = reactive({});
    const appliedFilter = ref({});
    const searchValue = ref();
    const selectedItemId = ref();
    const selectedOrdersIds = ref([]);
    const sort = ref("createdDate:DESC");

    onMounted(async () => {
      selectedItemId.value = props.param;
      await loadOrders();
    });

    watch(sort, async (value) => {
      await loadOrders({ ...filter, keyword: searchValue.value, sort: value });
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
        disabled: computed(() => !selectedOrdersIds.value?.length),
        isVisible: false,
      },
      {
        title: computed(() => t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL")),
        icon: "fas fa-times-circle",
        disabled: computed(() => !selectedOrdersIds.value?.length),
        isVisible: false,
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
          result.outline = false;
          result.variant = "success";
          break;
        case "Cancelled":
          result.outline = true;
          result.variant = "danger";
          break;
        case "Shipped":
          result.outline = true;
          result.variant = "success";
      }
      return result;
    };

    const onPaginationClick = async (page: number) => {
      await loadOrders({
        skip: (page - 1) * 20,
      });
    };

    const actionBuilder = (item: CustomerOrder): IActionBuilderResult[] => {
      let result = [];

      if (item.status === "Paid" || item.status === "Unpaid") {
        result.push({
          icon: "fas fa-check",
          title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.ACCEPT")),
          variant: "success",
          async clickHandler() {
            item.status = "Accepted";
            await changeOrderStatus(item);
            await reload();
          },
        });
      }

      if (item.status !== "Cancelled") {
        result.push({
          icon: "fas fa-times",
          title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.CANCEL")),
          variant: "danger",
          async clickHandler() {
            item.status = "Cancelled";
            await changeOrderStatus(item);
            await reload();
          },
        });
      }

      if (item.status === "Accepted") {
        result.push({
          icon: "fas fa-shipping-fast",
          title: computed(() => t("ORDERS.PAGES.LIST.TABLE.ACTIONS.SHIP")),
          variant: "danger",
          async clickHandler() {
            item.status = "Shipped";
            await changeOrderStatus(item);
            await reload();
          },
        });
      }

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

    const onHeaderClick = (item: ITableColumns) => {
      const sortBy = [":DESC", ":ASC", ""];
      if (item.sortable) {
        item.sortDirection = (item.sortDirection ?? 0) + 1;
        sort.value = `${item.id}${sortBy[item.sortDirection % 3]}`;
      }
    };

    const onSelectionChanged = (checkboxes: { [key: string]: boolean }) => {
      selectedOrdersIds.value = Object.entries(checkboxes)
        .filter(([id, isChecked]) => isChecked)
        .map(([id, isChecked]) => id);
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
      sort,
      statusStyle,
      onPaginationClick,
      onHeaderClick,
      title: computed(() => t("ORDERS.PAGES.LIST.TITLE")),
      searchValue,
      onSearchList,
      selectedItemId,
      onSelectionChanged,
      setFilterDate(key: string, value: string) {
        const date = new Date(value);
        if (date instanceof Date && !isNaN(date.valueOf())) {
          filter[key] = date;
        }
      },
      getFilterDate(key: string) {
        const date = filter[key] as Date;
        if (date) {
          return moment(date).format("YYYY-MM-DD");
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
