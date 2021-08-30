<template>
  <vc-app :options="options">
    <template v-slot:default="options">
      <router-view v-bind="options" @navClick="onNavClick"></router-view>
    </template>
  </vc-app>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from "vue";
import { useLogger, useI18n, useRouter, useUser } from "@virtoshell/core";

export default defineComponent({
  name: "App",

  setup() {
    const { t } = useI18n();
    const log = useLogger();
    const router = useRouter();
    const { user, loadUser, signOut, loading } = useUser();

    onMounted(async () => {
      //TODO: Add load indicator to entire workspace
      const user = await loadUser();
      console.log("user:", user);
      if (!user.userName) {
        router.push("/login");
      }
    });

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
      {
        id: 2,
        title: "Products",
        icon: "fas fa-layer-group",
        href: "/products",
      },
    ];

    const account = {
      avatar: "/assets/avatar.jpg",
      name: computed(() => user.value?.userName),
      role: computed(() =>
        user.value?.isAdministrator ? "Administrator" : "Operator"
      ),
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
            signOut();
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
      loading,
    };
  },
});
</script>

<style lang="less">
.vc-theme_light {
  --background-color: #f5f6f9;
  --top-bar-color: #161d25;
  --basic-black-color: #333333;
  --tooltips-color: #a5a5a5;

  --primary-color: #43b0e6;
  --primary-color-hover: #319ed4;
  --primary-color-disabled: #a9ddf6;

  --special-color: #f89406;
  --special-color-hover: #eb8b03;
  --special-color-disabled: #fed498;

  --breadcrumbs-outline-color: #a1c0d4;
  --breadcrumbs-outline-color-hover: #8fb0c6;
  --breadcrumbs-outline-color-current: #838d9a;
  --breadcrumbs-opacity-disabled: 0.4;

  /* Font Settings */
  --font-size-xs: 11px;
  --font-size-s: 12px;
  --font-size-m: 13px;
  --font-size-l: 14px;
  --font-size-xl: 16px;
  --font-size-header: 23px;

  --line-height-xs: 14px;
  --line-height-s: 16px;
  --line-height-m: 18px;
  --line-height-l: 19px;
  --line-height-xl: 22px;
  --line-height-header: 28px;

  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* Spacing */
  --padding-xs: 4px;
  --padding-s: 8px;
  --padding-m: 12px;
  --padding-l: 16px;
  --padding-xl: 20px;

  --margin-xs: 4px;
  --margin-s: 8px;
  --margin-m: 12px;
  --margin-l: 16px;
  --margin-xl: 20px;

  /* Layout variables */
  --app-bar-height: 60px;
  --app-bar-background-color: var(--top-bar-color);
  --app-bar-toolbar-icon-background-hover: #2e3d4e;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-divider-color: #2e3d4e;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-account-info-role-color: #838d9a;

  /* Blade variables */
  --vc-blade-border-color: #e7ebf1;

  --vc-blade-topbar-height: 30px;
  --vc-blade-topbar-background-color: #34414f;
  --vc-blade-topbar-button-color: #ffffff;
  --vc-blade-topbar-button-disabled-color: #727c87;

  --vc-blade-header-height: 48px;
  --vc-blade-header-background-color: #465769;
  --vc-blade-header-icon-color: #ffffff;
  --vc-blade-header-title-color: #ffffff;
  --vc-blade-header-subtitle-color: #bbbbbb;

  --vc-blade-toolbar-height: 48px;
  --vc-blade-toolbar-background-color: #465769;
  --vc-blade-toolbar-item-color: #ffffff;
  --vc-blade-toolbar-item-hover-background-color: #2e3d4e;
  --vc-blade-toolbar-item-disabled-color: #727c87;

  /* Button variables */
  --vc-button-primary-color: #43b0e6;
  --vc-button-primary-color-hover: #319ed4;
  --vc-button-special-color: #f89406;
  --vc-button-special-color-hover: #eb8b03;
  --vc-button-height: 28px;
  --vc-button-small-height: 22px;

  /* Drawer variables */
  --nav-width: 240px;
  --nav-width-collapsed: 60px;
  --nav-background-color: var(--background-color);
  --nav-top-height: var(--app-bar-height);
  --nav-top-background-color: var(--app-bar-background-color);
  --nav-top-border-right-color: #2e3d4e;
  --nav-border-right-color: #e7ebf1;
  --nav-top-image-height: 30px;
  --nav-top-version-color: #838d9a;

  --nav-item-height: 40px;
  --nav-item-icon-width: 20px;
  --nav-item-icon-color: #000000;
  --nav-item-handler-width: 20px;
  --nav-item-background-color: var(--nav-background-color);
  --nav-item-background-color-hover: #eff7fc;
  --nav-item-border-bottom-color: #e7ebf1;
  --nav-item-title-font-weight: var(--font-weight-medium);
  --nav-item-title-font-size: var(--font-size-l);
  --nav-item-title-padding-right: 5px;
  --nav-item-title-padding-left: 9px;
  --nav-item-title-color: #161d25;
  --nav-item-handler-color: #bdd1df;

  /* Icon variables */
  --icon-size-xs: 12px;
  --icon-size-s: 14px;
  --icon-size-m: 18px;
  --icon-size-l: 20px;
  --icon-size-xl: 22px;
  --icon-size-xxl: 30px;
}

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
