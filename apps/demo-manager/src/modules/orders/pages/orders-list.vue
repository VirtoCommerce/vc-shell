<template>
  <vc-blade
    :uid="uid"
    title="Orders"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
  >
    <!-- Blade contents -->
    <vc-table
      :expanded="expanded"
      :empty="empty"
      :loading="loading"
      :multiselect="true"
      :columns="columns"
      :items="orders.results"
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
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useOrders } from "../composables";
import { useRouter, useI18n } from "@virtoshell/core";
import moment from "moment";

export default defineComponent({
  props: {
    uid: {
      type: String,
      default: undefined,
    },

    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const { orders, loadOrders, loading, pages, currentPage } = useOrders();
    const { openBlade } = useRouter();
    const { t } = useI18n();

    onMounted(async () => {
      await loadOrders();
    });

    const bladeToolbar = [
      {
        id: 1,
        title: t("ORDERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
        onClick: async () => {
          await loadOrders();
        },
      },
      {
        id: 1,
        title: t("ORDERS.PAGES.LIST.TOOLBAR.CONFIRM"),
        icon: "fas fa-check",
        disabled: true,
      },
      {
        id: 1,
        title: t("ORDERS.PAGES.LIST.TOOLBAR.CANCEL"),
        icon: "fas fa-times-circle",
        disabled: true,
      },
    ];

    const columns = [
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
    ];

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no orders yet",
      action: "Add order",
      clickHandler: () => {
        openBlade(props.uid, "orders-details");
      },
    };

    const onItemClick = (item: { id: string }) => {
      openBlade(props.uid, "orders-details", { param: item.id });
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

    return {
      bladeToolbar,
      columns,
      orders,
      loading,
      onItemClick,
      moment,
      empty,
      pages,
      currentPage,
      statusStyle,
      onPaginationClick,
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
