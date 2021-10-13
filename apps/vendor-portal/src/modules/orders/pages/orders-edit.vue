<template>
  <vc-blade
    title="Order #123"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <vc-table :multiselect="false" :columns="columns" :items="items">
      <template v-slot:item_pic="itemData">
        <vc-image :src="itemData.item.pic" aspect="1x1" size="s"></vc-image>
      </template>
      <template v-slot:item_name="itemData">
        <div class="vc-flex vc-flex-column">
          <div>{{ itemData.item.name }}</div>
          <vc-hint>SKU: {{ itemData.item.sku }}</vc-hint>
        </div>
      </template>
    </vc-table>
    <div class="vc-flex vc-flex-row vc-flex-justify_space-between vc-padding_l">
      <div class="vc-font-weight_bold vc-font-size_l">Total</div>
      <div class="vc-font-weight_bold vc-font-size_l">USD 6,490.60</div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  url: "order",

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

  setup() {
    const bladeToolbar = [
      { id: 1, title: "Refresh", icon: "fas fa-sync-alt" },
      { id: 1, title: "Confirm", icon: "fas fa-check" },
      { id: 1, title: "Cancel", icon: "fas fa-times-circle" },
    ];

    const columns = [
      {
        id: "pic",
        title: "",
        width: 48,
        class: "vc-padding-right_none",
      },
      {
        id: "name",
        title: "Name",
      },
      {
        id: "quantity",
        title: "Quantity",
        width: 120,
      },
      {
        id: "unitPrice",
        title: "Unit price",
        width: 120,
      },
      {
        id: "total",
        title: "Total",
        width: 120,
      },
    ];

    const items = [
      {
        id: 1,
        pic: "/assets/1.jpg",
        name: "Lobster Cracker",
        sku: "754387598",
        quantity: "34",
        unitPrice: "2.20",
        total: "74.80",
      },
      {
        id: 2,
        pic: "/assets/2.jpg",
        name: "Lobster Cracker",
        sku: "754387598",
        quantity: "34",
        unitPrice: "2.20",
        total: "74.80",
      },
      {
        id: 3,
        pic: "/assets/3.jpg",
        name: "Lobster Cracker",
        sku: "754387598",
        quantity: "34",
        unitPrice: "2.20",
        total: "74.80",
      },
      {
        id: 4,
        pic: "/assets/4.jpg",
        name: "Lobster Cracker",
        sku: "754387598",
        quantity: "34",
        unitPrice: "2.20",
        total: "74.80",
      },
      {
        id: 5,
        pic: "/assets/5.jpg",
        name: "Lobster Cracker",
        sku: "754387598",
        quantity: "34",
        unitPrice: "2.20",
        total: "74.80",
      },
    ];

    return {
      bladeToolbar,
      columns,
      items,
    };
  },
});
</script>
