<template>
  <vc-app :options="options">
    <template v-slot:default="options">
      <router-view v-bind="options"></router-view>
    </template>
  </vc-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useLogger, useI18n, useRouter } from "@virtoshell/core";

export default defineComponent({
  name: "App",

  setup() {
    const { t } = useI18n();
    const log = useLogger();
    const router = useRouter();

    log.debug(`Initializing App`);

    const toolbarItems = [
      {
        id: "settings",
        icon: "cog",
        title: t("SHELL.TOOLBAR.SETTINGS"),
        onClick() {
          router.push("/settings");
        },
      },
      {
        id: "help",
        icon: "life-ring",
        title: t("SHELL.TOOLBAR.HELP"),
        onClick() {
          router.push("/help");
        },
      },
      {
        id: "bell",
        icon: "bell",
        accent: true,
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
      },
    ];

    const account = {
      avatar: "/assets/avatar.jpg",
      name: "Iurii A Taranov",
      role: "Administrator",
      dropdown: [
        {
          id: 1,
          title: t("SHELL.ACCOUNT.PROFILE"),
          onClick() {
            router.push("/profile");
          },
        },
        {
          id: 2,
          title: t("SHELL.ACCOUNT.LOGOUT"),
          onClick() {
            router.push("/login");
          },
        },
      ],
    };

    return {
      options: {
        branding: {
          logo: "/assets/logo.svg",
          background: "/assets/background.jpg",
          title: "Vendor Portal",
          version: process.env.PACKAGE_VERSION,
        },
        toolbarItems,
        account,
      },
    };
  },
});
</script>

<style lang="less">
html,
body,
#app {
  font-family: "Roboto";
  height: 100%;
  margin: 0;
}
</style>
