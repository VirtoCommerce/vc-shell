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
      <vc-table :multiselect="true" :headers="headers" :items="items">
        <template v-slot:item_created="itemData">
          <div class="vc-orders-page__created">{{ itemData.item.created }}</div>
        </template>
      </vc-table>
    </vc-blade>
  </vc-layout-workspace>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "@virtoshell/core";

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
    const router = useRouter();
    const expanded = ref(true);
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
        id: "customer",
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
        id: "created",
        title: "Created",
        sortable: true,
        width: 180,
      },
    ];

    const items = [
      {
        id: 1,
        number: "LL201228-00001",
        customer: "nevaeh.simmons@example.com",
        total: "1,157.90",
        currency: "USD",
        status: "Waiting",
        created: "12 days ago",
      },
      {
        id: 2,
        number: "LL792146382LU",
        customer: "alma.lawson@example.com",
        total: "23,200.90",
        currency: "USD",
        status: "Waiting",
        created: "12 days ago",
      },
      {
        id: 3,
        number: "LL314687942LU",
        customer: "tanya.hill@example.com",
        total: "1,157.90",
        currency: "USD",
        status: "Waiting",
        created: "12 days ago",
      },
      {
        id: 4,
        number: "LL967413495LU",
        customer: "bill.sanders@example.com",
        total: "23,200.90",
        currency: "USD",
        status: "Waiting",
        created: "12 days ago",
      },
      {
        id: 5,
        number: "LL646204341LU",
        customer: "deanna.curtis@example.com",
        total: "23,200.90",
        currency: "USD",
        status: "Waiting",
        created: "12 days ago",
      },
    ];

    return {
      expanded,
      bladeToolbar,
      headers,
      items,
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
