<template>
  <vc-layout :toolbarItems="toolbarItems" :account="account">
    <template #banner>
      <div>
        Running community edition, click to request a commercial license.
      </div>
      <vc-button variant="special" title="Purchase"></vc-button>
    </template>

    <template #left>
      <vc-drawer
        :items="menuItems"
        logo="/src/assets/logo.svg"
        @itemClick="openBlade($event.component, $event.componentOptions)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1">
      <component
        v-for="blade in openedBlades"
        :key="blade.id"
        :is="blade.component"
        v-bind="blade.componentOptions"
      ></component>
    </div>
  </vc-layout>
</template>

<script>
  import {
    VcLayout,
    VcButton,
    VcDrawer,
    openBlade,
    opened,
  } from "@virtocommerce/vc-ui-kit";
  import { defineComponent, ref } from "@vue/composition-api";
  import { StoreListBlade } from "@virtocommerce/ext-store";
  import { CatalogBlade } from "@virtocommerce/ext-product-catalog";
  import { AssetsBlade } from "@virtocommerce/ext-assets-management";

  export default defineComponent({
    components: { VcLayout, VcButton, VcDrawer },

    setup() {
      const menuItems = ref([
        {
          id: 1,
          title: "Catalog",
          icon: "folder",
          to: "/catalog",
          component: CatalogBlade,
          componentOptions: {},
        },
        {
          id: 2,
          title: "Assets",
          icon: "image",
          to: "/assets",
          component: AssetsBlade,
          componentOptions: {},
        },
        {
          id: 3,
          title: "Stores",
          icon: "archive",
          to: "/stores",
          component: StoreListBlade,
          componentOptions: {},
        },
      ]);

      const toolbarItems = ref([
        {
          id: "settings",
          icon: "cog",
          title: "Settings",
        },
        {
          id: "help",
          icon: "life-ring",
          title: "Help",
        },
        {
          id: "bell",
          icon: "bell",
          accent: true,
          title: "Notifications",
        },
      ]);

      const account = ref({
        avatar: "/src/assets/avatar.jpg",
        name: "Iurii A Taranov",
        role: "Administrator",
      });

      return {
        menuItems,
        toolbarItems,
        account,
        openedBlades: opened.value,
        openBlade,
      };
    },
  });
</script>
