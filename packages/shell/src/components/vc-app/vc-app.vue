<template>
  <vc-layout :toolbar-items="toolbarItems" :account="account">
    <template #left>
      <vc-drawer
        :items="[]"
        logo="/assets/logo.svg"
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1"></div>
  </vc-layout>
</template>

<script lang="ts">
import { VcLayout, VcDrawer } from "@virtocommerce/ui-kit";
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "VcApp",
  components: { VcLayout, VcDrawer },

  props: ["menuItems"],

  setup() {
    //const { t } = useI18n({ useScope: "global" });
    function t(val: string): string {
      return val;
    }

    const route = window.location.pathname;

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
      toolbarItems,
      account,
      openedBlades: [],

      openBlade(data: unknown): void {
        // const blade = routes[data.routeName];
        // routing.openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(data: unknown): void {
        // routing.closeBlades();
        // routing.openBlade(data.component, data.componentOptions);
        // history.pushState({}, data.title, data.url);
      },

      closeBlade(id: number): void {
        // routing.closeBlade(id);
      },
    };
  },
});
</script>

<style lang="less">
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>
