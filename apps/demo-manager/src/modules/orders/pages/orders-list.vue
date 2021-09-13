<template>
  <vc-blade
    :uid="uid"
    title="Orders"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$closeBlade(uid)"
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
      @itemClick="onItemClick"
    >
      <template v-slot:item_created="itemData">
        <div class="vc-orders-page__created">{{ itemData.item.created }}</div>
      </template>

      <!-- Override createdDate column template -->
      <template v-slot:item_createdDate="itemData">
        {{ moment(itemData.item.createdDate).fromNow() }}
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useOrders } from "../composables";
import { useRouter } from "@virtoshell/core";
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
    const { orders, loadOrders } = useOrders();
    const { openBlade } = useRouter();
    const loading = ref(false);

    onMounted(async () => {
      loading.value = true;
      await loadOrders();
      loading.value = false;
    });

    const bladeToolbar = [
      {
        id: 1,
        title: "Refresh",
        icon: "fas fa-sync-alt",
        onClick: async () => {
          loading.value = true;
          await loadOrders();
          loading.value = false;
        },
      },
      { id: 1, title: "Confirm", icon: "fas fa-check", disabled: true },
      { id: 1, title: "Cancel", icon: "fas fa-times-circle", disabled: true },
    ];

    const columns = [
      {
        id: "number",
        title: "Order number",
        width: 160,
      },
      {
        id: "customerName",
        title: "Customer",
      },
      {
        id: "total",
        title: "Total",
        width: 120,
      },
      {
        id: "currency",
        title: "Currency",
        width: 100,
      },
      {
        id: "status",
        title: "Status",
        width: 120,
      },
      {
        id: "createdDate",
        title: "Created",
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

    return {
      bladeToolbar,
      columns,
      orders,
      loading,
      onItemClick,
      moment,
      empty,
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
