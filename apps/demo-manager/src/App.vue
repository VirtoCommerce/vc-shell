<template>
  <vc-app :options="options">
    <template v-slot:default="options">
      <router-view v-bind="options" @navClick="onNavClick"></router-view>
    </template>
  </vc-app>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from "vue";
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
        title: t("PRODUCTS.MENU.TITLE"),
        icon: "fas fa-cash-register",
        href: "/products",
      },
    ];

    const account = reactive({
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
    });

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

  /* Layout variables */
  --app-bar-height: 60px;
  --app-bar-background-color: var(--top-bar-color);
  --app-bar-toolbar-icon-background-hover: #2e3d4e;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-divider-color: #2e3d4e;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-account-info-role-color: #838d9a;
}

html,
body,
#app {
  font-family: "Roboto";
  height: 100%;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6,
button,
input,
select,
textarea {
  font-family: "Roboto";
}
::-webkit-input-placeholder {
  font-family: "Roboto";
}
:-moz-placeholder {
  font-family: "Roboto";
}
::-moz-placeholder {
  font-family: "Roboto";
}
:-ms-input-placeholder {
  font-family: "Roboto";
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
}
</style>
