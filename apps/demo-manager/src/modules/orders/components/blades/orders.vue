<template>
  <vc-layout-workspace
    :branding="branding"
    :toolbarItems="toolbarItems"
    :account="account"
    @navClick="$emit('navClick', $event)"
  >
    <vc-blade
      title="Orders"
      :width="900"
      :expanded="expanded"
      :closable="false"
      @expand="expanded = true"
      @collapse="expanded = false"
      :toolbarItems="bladeToolbar"
    >
      <vc-table :multiselect="true" :headers="headers" :items="orders.results">
        <template v-slot:item_created="itemData">
          <div class="vc-orders-page__created">{{ itemData.item.created }}</div>
        </template>
      </vc-table>
    </vc-blade>
  </vc-layout-workspace>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useOrders } from "../../composables";

export default defineComponent({
  props: {
    branding: {
      type: Object,
      default: () => ({}),
    },

    toolbarItems: {
      type: Array,
      default() {
        return [];
      },
    },

    account: {
      type: Object,
      default() {
        return {
          name: "Unknown",
          role: undefined,
          avatar: undefined,
        };
      },
    },
  },

  setup() {
    const { orders, loadOrders } = useOrders();
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
    return {
      expanded,
      bladeToolbar,
      headers,
      orders,
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
