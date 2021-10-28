<template>
  <vc-blade
    title="Orders"
    :expanded="expanded"
    :closable="closable"
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
      :isFiltered="isFiltered"
      :currentPage="currentPage"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
    >
      <!-- Filters -->
      <template v-slot:filters>
        <h2 v-if="$isMobile.value">Filters</h2>
        <vc-container no-padding>
          <vc-row>
            <vc-col class="filter-col">
              <div class="group-title">Status filter</div>
              <div>
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Unpaid'"
                  @change="filter.status = 'Unpaid'"
                  >Unpaid</vc-checkbox
                >
                <vc-checkbox
                  class="vc-margin-bottom_s"
                  :modelValue="filter.status === 'Paid'"
                  @change="filter.status = 'Paid'"
                  >Paid</vc-checkbox
                >
              </div>
            </vc-col>
            <vc-col class="filter-col">
              <div class="group-title">Order date</div>
              <div>
                <vc-input
                  label="Start date"
                  type="date"
                  class="vc-margin-bottom_m"
                  :modelValue="getFilterDate('startDate')"
                  @update:modelValue="setFilterDate('startDate', $event)"
                ></vc-input>
                <vc-input
                  label="End date"
                  type="date"
                  :modelValue="getFilterDate('endDate')"
                  @update:modelValue="setFilterDate('endDate', $event)"
                ></vc-input>
              </div>
            </vc-col>
          </vc-row>
          <vc-row>
            <vc-col>
              <div class="vc-flex vc-flex-justify_end">
                <vc-button
                  outline
                  class="vc-margin-right_m"
                  @click="resetFilters"
                  >Reset filters</vc-button
                >
                <vc-button @click="applyFilters">Apply</vc-button>
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
            No orders found.
          </div>
          <vc-button @click="resetSearch">Reset search</vc-button>
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
            There are no orders yet
          </div>
        </div>
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        <div class="vc-orders-page__created">
          {{ moment(itemData.item.createdDate).fromNow() }}
        </div>
      </template>

      <!-- Override status column template -->
      <template v-slot:item_status="itemData">
        <vc-status v-bind="statusStyle(itemData.item.status)">
          {{ itemData.item.status }}
        </vc-status>
      </template>

      <!-- Override total column template -->
      <template v-slot:item_total="itemData">
        {{ itemData.item.total }} {{ itemData.item.currency }}
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
                <vc-hint>Total</vc-hint>
                <div class="vc-ellipsis vc-margin-top_xs">
                  {{ itemData.item.total }} {{ itemData.item.currency }}
                </div>
              </div>
              <div class="vc-ellipsis vc-flex-grow_1">
                <vc-hint>Created</vc-hint>
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
import { useI18n } from "@virtoshell/core";
import moment from "moment";
import OrdersDetails from "./orders-edit.vue";

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

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { orders, loadOrders, loading, pages, currentPage, totalCount } =
      useOrders();
    const { t } = useI18n();
    const filter = reactive({});
    const searchValue = ref();

    onMounted(async () => {
      await loadOrders();
    });

    const bladeToolbar = [
      {
        title: t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        async clickHandler() {
          await loadOrders();
        },
      },
      {
        title: t("ORDERS.PAGES.LIST.TOOLBAR.CONFIRM"),
        icon: "fas fa-check",
        disabled: true,
      },
      {
        title: t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL"),
        icon: "fas fa-times-circle",
        disabled: true,
      },
    ];

    const columns = ref([
      {
        id: "number",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.NUMBER"),
        width: 160,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "customerName",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.CUSTOMER"),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "total",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.TOTAL"),
        width: 120,
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: "status",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.STATUS"),
        width: 120,
        sortable: true,
      },
      {
        id: "createdDate",
        title: t("ORDERS.PAGES.LIST.TABLE.HEADER.CREATED"),
        sortable: true,
        width: 180,
      },
    ]);

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no orders yet",
    };

    const onItemClick = (item: { id: string }) => {
      emit("page:open", {
        component: OrdersDetails,
        param: item.id,
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

    const actionBuilder = (item) => {
      let result = [];

      result.push({
        icon: "fas fa-check",
        title: "Confirm",
        variant: "success",
        clickHandler() {
          alert("Confirm");
        },
      });
      result.push({
        icon: "fas fa-times",
        title: "Decline",
        variant: "danger",
        clickHandler() {
          alert("Decline");
        },
      });

      return result;
    };

    return {
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
      title: t("ORDERS.PAGES.LIST.TITLE"),
      searchValue,
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
      },
      filter,
      isFiltered: computed(() => Object.keys(filter).length),
      async applyFilters() {
        await loadOrders({
          ...filter,
        });
      },
      async resetFilters() {
        Object.keys(filter).forEach((key: string) => (filter[key] = undefined));
        await loadOrders({
          ...filter,
        });
      },
    };
  },
});
</script>

<style lang="less">
.vc-orders-page {
  &__created {
    color: #a5a5a5;
  }
}
</style>
