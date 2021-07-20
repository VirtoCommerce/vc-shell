<template>
  <vc-layout :toolbar-items="toolbarItems" :account="account">
    <template #left>
      <vc-drawer
        :items="[]"
        :logo="branding.logo"
        :logo-mini="branding.logoMini"
        :version="branding.version"
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1"></div>
  </vc-layout>
</template>

<script lang="ts">
import { VcLayout, VcDrawer } from "@virtocommerce/ui-kit";
import { defineComponent, ref, inject } from "vue";
import { useI18n } from "vue-i18n"
import { useLogger } from 'vue-logger-plugin'

export default defineComponent({
  name: "VcApp",
  components: { VcLayout, VcDrawer },

  props: {
    branding: {
      type: Object,
      default() {
        return {
          title: undefined,
          logo: undefined,
          logoMini: undefined,
          background: undefined,
        };
      },
    },
    extensions: {
      type: Array,
      default() {
        return [];
      },
    },
    locale: {
      type: String,
      default: "en",
    },
    rtl: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: "light",
    },
    version: {
      type: String,
      default: undefined,
    },
  },

  emits: ["init", "resize"],

  setup() {
    const { t } = useI18n();
    const log = useLogger();
    log.info(`Initializing vc-app`);

    // eslint-disable-next-line
    const VcLoading: any = inject("VcLoading");
    // function t(val: string): string {
    //   return val;
    // }

    //const route = window.location.pathname;

    const toolbarItems = ref([
      {
        id: "settings",
        icon: "cog",
        title: t("SHELL.TOOLBAR.SETTINGS"),
        onClick() {
          if (!VcLoading.isVisible()) {
            VcLoading.show();
            setTimeout(() => {
              VcLoading.hide();
            }, 2000);
          }
        },
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
      log,
      toolbarItems,
      account,
      openedBlades: [],

      openBlade(): void {
        log.info(`shell/vc-app#openBlade: Start`);
        // const blade = routes[data.routeName];
        // routing.openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(): void {
        log.info(`shell/vc-app#openWorkspace: Start`);
        // routing.closeBlades();
        // routing.openBlade(data.component, data.componentOptions);
        // history.pushState({}, data.title, data.url);
      },

      closeBlade(): void {
        log.info(`shell/vc-app#closeBlade: Start`);
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
