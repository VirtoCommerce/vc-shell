<template>
  <vc-blade
    :icon="icon"
    :title="title"
    :subtitle="subtitle"
    :width="width"
    :closable="false"
    :toolbarItems="toolbarItems.value"
    :searchable="true"
  >
    <vc-table
      :headers="headers.value"
      :items="items.value"
      :multiselect="true"
      @itemClick="openDetails($event)"
    >
      <template v-slot:item_actions>
        <vc-icon icon="fas fa-ellipsis-v" style="color: #43b0e6"></vc-icon>
      </template>

      <template v-slot:item_title="itemData">
        <div class="vc-flex vc-flex vc-flex-align_center vc-fill_width">
          <vc-icon
            :icon="itemData.item.icon"
            size="xl"
            style="color: #a5a5a5"
          ></vc-icon>
          <div
            class="
              vc-font-size_m
              vc-font-weight_bold
              vc-flex-grow_1
              vc-margin-horizontal_m
            "
          >
            {{ itemData.item.title }}
          </div>
          <vc-icon icon="fas fa-chevron-right" style="color: #a5a5a5"></vc-icon>
        </div>
      </template>
    </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { VcBlade, VcTable, VcIcon } from "@virtoshell/ui";
import { defineComponent, ref, onMounted } from "vue";
import { useStores } from "../composables";

export default defineComponent({
  components: { VcBlade, VcTable, VcIcon },
  props: {
    icon: {
      type: String,
      default: "archive",
    },
    title: {
      type: String,
      default: "Stores",
    },
    subtitle: {
      type: String,
      default: "Manage stores",
    },
    width: {
      type: String,
      default: "400",
    },
  },

  setup(_props, { emit }) {
    const { loadStores, stores } = useStores();

    onMounted(async () => {
      await loadStores();
    });

    const toolbarItems = ref([
      { id: 1, icon: "fas fa-sync-alt", title: "Refresh" },
      { id: 2, icon: "fas fa-plus", title: "Add" },
    ]);

    const headers = ref([
      {
        id: "actions",
        title: "",
        width: 30,
        class: "vc-table__body-cell_bordered",
      },
      {
        id: "title",
        title: "Name",
        sortable: true,
      },
    ]);

    const items = ref([
      {
        id: 1,
        icon: "fas fa-cloud",
        title: "B2B-mixed (virtual)",
      },
      {
        id: 2,
        icon: "fas fa-folder",
        title: "Clothing",
      },
      {
        id: 3,
        icon: "fas fa-folder",
        title: "Desktops",
      },
    ]);

    return {
      stores,
      toolbarItems,
      headers,
      items,

      openDetails(options: unknown): void {
        emit("navigate", {
          routeName: "extStoreDetails",
          componentOptions: options,
        });
      },
    };
  },
});
</script>
