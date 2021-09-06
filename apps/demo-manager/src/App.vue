<template>
  <vc-app
    :authorized="authorized"
    :account="account"
    :logo="logo"
    :background="background"
    :title="title"
    :version="version"
    :workspace="workspace"
    :toolbar="toolbar"
    :menu="menu"
  >
    <template v-slot:login>
      <login-page
        :logo="logo"
        :background="background"
        :title="title"
      ></login-page>
    </template>
  </vc-app>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import LoginPage from "./components/login-page.vue";
import { useLogger, useI18n, useUser, useBlade } from "@virtoshell/core";

export default defineComponent({
  name: "App",

  components: {
    LoginPage,
  },

  setup() {
    const { t } = useI18n();
    const log = useLogger();
    const { workspace } = useBlade();
    const { openWorkspace, openDashboard } = useBlade();
    const { user, loadUser, signOut, loading } = useUser();
    const authorized = ref(false);

    onMounted(async () => {
      //TODO: Add load indicator to entire workspace
      await loadUser();
    });

    watch(user, (value) => {
      authorized.value = !!value?.userName;
    });

    log.debug(`Initializing App`);

    const toolbar = [
      {
        id: "settings",
        icon: "fas fa-cog",
        title: t("SHELL.TOOLBAR.SETTINGS"),
        onClick() {
          openWorkspace("settings");
        },
      },
      {
        id: "help",
        icon: "fas fa-life-ring",
        title: t("SHELL.TOOLBAR.HELP"),
        onClick() {
          openWorkspace("help");
        },
      },
      {
        id: "bell",
        icon: "fas fa-bell",
        accent: true,
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
      },
    ];

    const menu = [
      {
        id: 0,
        title: t("SHELL.MENU.DASHBOARD"),
        icon: "fas fa-home",
        clickHandler() {
          openDashboard();
        },
      },
      {
        id: 1,
        title: t("ORDERS.MENU.TITLE"),
        icon: "fas fa-layer-group",
        clickHandler() {
          openWorkspace("orders-list");
        },
      },
      {
        id: 2,
        title: t("PRODUCTS.MENU.TITLE"),
        icon: "fas fa-cash-register",
        clickHandler() {
          openWorkspace("products-list");
        },
      },
      {
        id: 3,
        title: t("OFFERS.MENU.TITLE"),
        icon: "fas fa-cash-register",
        clickHandler() {
          openWorkspace("offers-list");
        },
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
            openWorkspace("profile");
          },
        },
        {
          id: 2,
          title: t("SHELL.ACCOUNT.LOGOUT"),
          onClick() {
            signOut();
          },
        },
      ],
    });

    return {
      authorized,
      workspace,
      logo: "/assets/logo.svg",
      background: "/assets/background.jpg",
      title: "Vendor Portal",
      version: process.env.PACKAGE_VERSION,
      toolbar,
      menu,
      account,
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
