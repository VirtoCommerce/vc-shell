<template>
  <vc-layout :toolbar-items="toolbarItems" :account="account">
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
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1">
    </div>
  </vc-layout>
</template>

<script>
import {
  VcLayout,
  VcButton,
  VcDrawer,
  opened,
  openBlade,
  closeBlade,
  closeBlades,
} from "@virtocommerce/ui-kit";
import { defineComponent, ref } from "vue";
import { drawer, routes } from "./addons";

export default defineComponent({
  components: { VcLayout, VcButton, VcDrawer },

  setup() {
    const route = window.location.pathname;

    if (route) {
      let blade = null;
      for (var item in routes) {
        if (routes[item].url === route) {
          blade = routes[item];
          break;
        }
      }
      if (blade) {
        openBlade(blade.component, {});
      }
    }

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
      menuItems: drawer,
      toolbarItems,
      account,
      openedBlades: opened.value,

      openBlade(data) {
        const blade = routes[data.routeName];
        openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(data) {
        closeBlades();
        openBlade(data.component, data.componentOptions);
        history.pushState({}, data.title, data.url);
      },

      closeBlade(id) {
        closeBlade(id);
      },
    };
  },
});
</script>
