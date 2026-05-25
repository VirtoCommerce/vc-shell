<template>
  <VcBlade
    :title="$t('ORDERS.PAGES.LIST.TITLE')"
    :loading="loading"
  >
    <VcDataTable
      :items="items"
      :pagination="pagination"
      :total-count="pagination.totalCount"
      :total-label="$t('ORDERS.PAGES.LIST.TABLE.TOTALS')"
      state-key="orders_list"
      @row-click="openDetails"
      @pagination-click="pagination.goToPage"
    >
      <VcColumn
        id="number"
        :title="$t('ORDERS.PAGES.LIST.TABLE.NUMBER')"
        :sortable="true"
      />
      <VcColumn
        id="status"
        :title="$t('ORDERS.PAGES.LIST.TABLE.STATUS')"
      />
    </VcDataTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBlade } from "@vc-shell/framework";
import { VcBlade, VcColumn, VcDataTable } from "@vc-shell/framework/ui";
import { useOrdersList, type OrderListItem } from "../composables";

defineBlade({
  name: "OrdersList",
  url: "/orders",
  isWorkspace: true,
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-shopping-cart",
    priority: 10,
  },
});

const { openBlade, exposeToChildren } = useBlade();
const { items, pagination, loading, load } = useOrdersList();

function openDetails(event: { data: OrderListItem }) {
  openBlade({ name: "OrderDetails", param: event.data.id });
}

exposeToChildren({ reload: load });

onMounted(() => load());
</script>
