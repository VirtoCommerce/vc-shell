<template>
  <vc-blade
    title="Orders"
    :width="900"
    :expanded="expanded"
    :closable="false"
    @expand="expanded = true"
    @collapse="expanded = false"
    :toolbarItems="bladeToolbar"
  >
    <vc-table
      :multiselect="true"
      :headers="headers"
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
  setup() {
    const { orders, loadOrders } = useOrders();
    const { openBlade } = useBlade();
    const expanded = ref(true);

    onMounted(async () => {
      await loadOrders();
    });

    const bladeToolbar = [
      { id: 1, title: "Refresh", icon: "fas fa-sync-alt" },
      { id: 1, title: "Confirm", icon: "fas fa-check", disabled: true },
      { id: 1, title: "Cancel", icon: "fas fa-times-circle", disabled: true },
    ];

    const headers = [
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
      openBlade("orders-details", { componentOptions: { id: item.id } });
    };

    return {
      expanded,
      bladeToolbar,
      headers,
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
