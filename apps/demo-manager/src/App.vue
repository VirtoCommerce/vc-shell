<template>
  <vc-app :options="options">
    <template v-slot:default="options">
      <router-view v-bind="options" @navClick="onNavClick"></router-view>
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
    console.dir(router.currentRoute.value);
    router.replace(router.currentRoute.value.fullPath);

    const toolbarItems = [
      {
        id: "settings",
        icon: "fas fa-cog",
        title: t("SHELL.TOOLBAR.SETTINGS"),
        onClick() {
          router.push("/settings");
        },
      },
      {
        id: "help",
        icon: "fas fa-life-ring",
        title: t("SHELL.TOOLBAR.HELP"),
        onClick() {
          router.push("/help");
        },
      },
      {
        id: "bell",
        icon: "fas fa-bell",
        accent: true,
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
      },
    ];

    const navItems = [
      { id: 1, title: "Orders", icon: "fas fa-layer-group", href: "/orders" },
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

    function onNavClick(item: { href: string }): void {
      router.push(item.href);
    }

    return {
      options: {
        branding: {
          logo: "/assets/logo.svg",
          background: "/assets/background.jpg",
          title: "Vendor Portal",
          version: process.env.PACKAGE_VERSION,
        },
        toolbarItems,
        navItems,
        account,
      },
      onNavClick,
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

.vc-app.vc-theme_light {
  --background-color: #f2f2f2;
  --top-bar-color: #ffffff;
  --app-bar-background-color: #ffffff;
  --app-bar-divider-color: #ffffff;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-toolbar-icon-color-hover: #465769;
  --app-bar-toolbar-icon-background-hover: #ffffff;
  --app-bar-account-info-name-color: #161d25;
  --app-bar-account-info-role-color: #7e8e9d;
  --nav-background-color: #ffffff;
  --nav-border-right-color: #ffffff;
  --nav-top-border-right-color: #ffffff;
  --nav-top-version-color: #838d9a;
  --nav-item-icon-color: #a1c0d4;
  --nav-item-title-color: #465769;
}
</style>
