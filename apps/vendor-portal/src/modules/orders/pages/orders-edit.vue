<template>
  <vc-blade
    :title="order.number"
    :expanded="expanded"
    :closable="closable"
    :toolbarItems="bladeToolbar"
    @close="$emit('page:close')"
  >
    <vc-table :multiselect="false" :columns="columns" :items="items">
      <template v-slot:item_imageUrl="itemData">
        <vc-image
          :src="itemData.item.imageUrl"
          aspect="1x1"
          size="s"
        ></vc-image>
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
      <div class="vc-font-weight_bold vc-font-size_l">
        {{ order.currency }}{{ order.total }}
      </div>
    </div>
  </vc-blade>
</template>

<script lang="ts">
import { computed, Ref, ref, onMounted, defineComponent } from "vue";

import { useOrder } from "../composables";

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

    param: {
      type: String,
      default: undefined,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const { loading, order, loadOrder } = useOrder();

    onMounted(async () => {
      if (props.param) {
        await loadOrder({ id: props.param });
      }
    });

    const bladeToolbar = [
      { id: 1, title: "Refresh", icon: "fas fa-sync-alt" },
      { id: 1, title: "Confirm", icon: "fas fa-check" },
      { id: 1, title: "Cancel", icon: "fas fa-times-circle" },
    ];

    const columns = [
      {
        id: "imageUrl",
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
        id: "price",
        title: "Unit price",
        width: 120,
      },
      {
        id: "extendedPrice",
        title: "Total",
        width: 120,
      },
    ];

    return {
      bladeToolbar,
      columns,
      order,
      items: computed(() => order.value?.items),
    };
  },
});
</script>
