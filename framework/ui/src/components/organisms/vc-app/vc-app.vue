<template>
  <vc-layout-workspace :toolbar-items="toolbarItems" :account="account">
    <template #left>
      <vc-nav
        :items="[]"
        :logo="branding.logo"
        :logo-mini="branding.logoMini"
        :version="branding.version"
        @itemClick="openWorkspace($event)"
      ></vc-nav>
    </template>

    <div class="vc-flex vc-flex-grow_1"></div>
  </vc-layout-workspace>
</template>

<script lang="ts">
import VcLayoutWorkspace from "../../layouts/vc-layout-workspace/vc-layout-workspace.vue";
import VcNav from "../../organisms/vc-nav/vc-nav.vue";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "VcApp",
  components: { VcLayoutWorkspace, VcNav },

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
    const toolbarItems = ref([
      {
        id: "settings",
        icon: "cog",
        title: "SHELL.TOOLBAR.SETTINGS",
      },
      {
        id: "help",
        icon: "life-ring",
        title: "SHELL.TOOLBAR.HELP",
      },
      {
        id: "bell",
        icon: "bell",
        accent: true,
        title: "SHELL.TOOLBAR.NOTIFICATIONS",
      },
    ]);

    const account = ref({
      avatar: "/assets/avatar.jpg",
      name: "Iurii A Taranov",
      role: "Administrator",
      dropdown: [
        {
          id: 1,
          title: "SHELL.ACCOUNT.PROFILE",
        },
        {
          id: 2,
          title: "SHELL.ACCOUNT.LOGOUT",
        },
      ],
    });

    return {
      toolbarItems,
      account,
      openedBlades: [],

      openBlade(): void {
        // const blade = routes[data.routeName];
        // routing.openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(): void {
        // routing.closeBlades();
        // routing.openBlade(data.component, data.componentOptions);
        // history.pushState({}, data.title, data.url);
      },

      closeBlade(): void {
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
