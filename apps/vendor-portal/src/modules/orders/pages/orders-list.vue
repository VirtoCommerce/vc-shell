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
      :items="orders.results"
      :itemActionBuilder="actionBuilder"
      :totalCount="orders.totalCount"
      :pages="pages"
      :currentPage="currentPage"
      @itemClick="onItemClick"
      @paginationClick="onPaginationClick"
    >
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
import { computed, defineComponent, onMounted, ref } from "vue";
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
    const { orders, loadOrders, loading, pages, currentPage } = useOrders();
    const { t } = useI18n();

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
