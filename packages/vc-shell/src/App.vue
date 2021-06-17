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
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1">
      <component
        v-for="blade in openedBlades"
        :key="blade.id"
        :is="blade.component"
        v-bind="blade.componentOptions"
        @navigate="openBlade($event)"
        @close="closeBlade(blade.id)"
      ></component>
    </div>
  </vc-layout>
</template>

<script>
  import { VcLayout, VcButton, VcDrawer, router } from "@virtocommerce/vc-ui-kit";
  import { defineComponent, ref } from "@vue/composition-api";
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
          router.openBlade(blade.component, {});
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
        openedBlades: router.opened.value,
        openBlade(data) {
          const blade = routes[data.routeName];
          router.openBlade(blade.component, data.componentOptions);
        },
        openWorkspace(data) {
          router.closeBlades();
          router.openBlade(data.component, data.componentOptions);
          history.pushState({}, data.title, data.url);
        },
        closeBlade(id) {
          router.closeBlade(id);
        },
      };
    },
  });
</script>
