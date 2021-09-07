<template>
  <vc-blade
    :uid="uid"
    title="Orders"
    :expanded="expanded"
    :closable="closable"
    @close="$closeBlade(uid)"
  >
    <!-- Set up blade toolbar -->
    <vc-blade-toolbar :items="bladeToolbar"></vc-blade-toolbar>

    <!-- Blade contents -->
    <vc-table
      :multiselect="true"
      :columns="columns"
      :items="orders.results"
      @itemClick="onItemClick"
    >
      <template v-slot:item_created="itemData">
        <div class="vc-orders-page__created">{{ itemData.item.created }}</div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useOrders } from "../../composables";
import { useBlade } from "@virtoshell/core";

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
    const { openBlade } = useBlade();

    onMounted(async () => {
      await loadOrders();
    });

    const bladeToolbar = [
      { id: 1, title: "Refresh", icon: "fas fa-sync-alt" },
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

    const onItemClick = (item: { id: string }) => {
      openBlade(props.uid, "orders-details", { param: item.id });
    };

    return {
      bladeToolbar,
      columns,
      orders,
      onItemClick,
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
