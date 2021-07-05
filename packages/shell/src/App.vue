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
        logo="/assets/logo.svg"
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1"></div>
  </vc-layout>
</template>

<script>
import { VcLayout, VcButton, VcDrawer, routing } from "@virtocommerce/ui-kit";
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { drawer, routes } from "./addons";

export default defineComponent({
  components: { VcLayout, VcButton, VcDrawer },

  setup() {
    const { t } = useI18n({ useScope: "global" });
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
        routing.openBlade(blade.component, {});
      }
    }

    const toolbarItems = ref([
      {
        id: "settings",
        icon: "cog",
        title: t("SHELL.TOOLBAR.SETTINGS"),
      },
      {
        id: "help",
        icon: "life-ring",
        title: t("SHELL.TOOLBAR.HELP"),
      },
      {
        id: "bell",
        icon: "bell",
        accent: true,
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
      },
    ]);

    const account = ref({
      avatar: "/assets/avatar.jpg",
      name: "Iurii A Taranov",
      role: "Administrator",
      dropdown: [
        {
          id: 1,
          title: t("SHELL.ACCOUNT.PROFILE"),
        },
        {
          id: 2,
          title: t("SHELL.ACCOUNT.LOGOUT"),
        },
      ],
    });

    return {
      menuItems: drawer,
      toolbarItems,
      account,
      openedBlades: routing.opened.value,

      openBlade(data) {
        const blade = routes[data.routeName];
        routing.openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(data) {
        routing.closeBlades();
        routing.openBlade(data.component, data.componentOptions);
        history.pushState({}, data.title, data.url);
      },

      closeBlade(id) {
        routing.closeBlade(id);
      },
    };
  },
});
</script>

<style lang="less">
@import "~@virtocommerce/ui-kit/dist/ui-kit.css";

html,
body,
#app {
  margin: 0;
  height: 100%;
  font-family: "Roboto";
  font-size: var(--font-size-m);
}
</style>
