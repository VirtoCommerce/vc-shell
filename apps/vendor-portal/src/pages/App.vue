<template>
  <vc-app
    :menuItems="menuItems"
    :toolbarItems="toolbarItems"
    :isReady="isReady"
    :isAuthorized="isAuthorized"
    logo="/assets/logo.svg"
    :version="version"
    :pages="pages"
  >
    <!-- Set up dashboard page -->
    <template v-slot:dashboard="scope">
      <dashboard-page v-bind="scope" />
    </template>

    <!-- Set up login form -->
    <template v-slot:login>
      <login-page
        logo="/assets/logo-white.svg"
        background="/assets/background.jpg"
        title="Vendor Portal"
      ></login-page>
    </template>
  </vc-app>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  ref,
  watch,
  reactive,
  inject,
  shallowRef,
} from "vue";
import LoginPage from "./Login.vue";
import DashboardPage from "./Dashboard.vue";
import UserDropdownButton from "../components/user-dropdown-button.vue";
import { OrdersList } from "../modules/orders";
import { OffersList } from "../modules/offers";
import { ProductsList } from "../modules/products";
import { useLogger, useI18n, useUser } from "@virtoshell/core";
import { useSignalR } from "@quangdao/vue-signalr";

export default defineComponent({
  name: "App",

  components: {
    LoginPage,
    DashboardPage,
  },

  setup() {
    const signalr = useSignalR();
    signalr.on("Send", (message: unknown) => console.dir(message));

    const { t } = useI18n();
    const log = useLogger();
    const { user, loadUser, signOut } = useUser();
    const isAuthorized = ref(false);
    const isReady = ref(false);

    const pages = inject("pages");
    const isDesktop = inject("isDesktop");
    const isMobile = inject("isMobile");

    onMounted(async () => {
      await loadUser();
      isReady.value = true;
      if (!isAuthorized.value) {
        window?.history?.pushState(null, "", "/login");
      }
    });

    watch(user, (value) => {
      isAuthorized.value = !!value?.userName;
    });

    log.debug(`Initializing App`);

    const toolbarItems = reactive([
      {
        icon: "fas fa-bell",
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
        isVisible: true,
        isAccent: true,
      },
      {
        component: shallowRef(UserDropdownButton),
        componentOptions: {
          avatar: "/assets/avatar.jpg",
          name: computed(() => user.value?.userName),
          role: computed(() =>
            user.value?.isAdministrator ? "Administrator" : "Operator"
          ),
          menuItems: [
            {
              title: t("SHELL.ACCOUNT.PROFILE"),
            },
            {
              title: t("SHELL.ACCOUNT.LOGOUT"),
              async clickHandler() {
                signOut();
              },
            },
          ],
        },
        isVisible: isDesktop,
      },
    ]);

    const menuItems = reactive([
      {
        title: t("SHELL.MENU.DASHBOARD"),
        icon: "fas fa-home",
        isVisible: true,
        clickHandler(app) {
          app.openDashboard();
          window?.history?.pushState(null, "", "/");
        },
      },
      {
        title: t("ORDERS.MENU.TITLE"),
        icon: "fas fa-file-alt",
        isVisible: true,
        component: shallowRef(OrdersList),
      },
      {
        title: t("PRODUCTS.MENU.TITLE"),
        icon: "fas fa-box-open",
        isVisible: true,
        component: shallowRef(ProductsList),
      },
      {
        title: t("OFFERS.MENU.TITLE"),
        icon: "fas fa-file-invoice",
        isVisible: true,
        component: shallowRef(OffersList),
      },
      {
        title: t("SHELL.ACCOUNT.LOGOUT"),
        icon: "fas fa-sign-out-alt",
        isVisible: isMobile,
        clickHandler() {
          signOut();
          window?.history?.pushState(null, "", "/login");
        },
      },
    ]);

    return {
      isAuthorized,
      isReady,
      pages,
      version: process.env.PACKAGE_VERSION,
      toolbarItems,
      menuItems,
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
  width: 100%;
  margin: 0;
  position: fixed;
  overflow: hidden;
  overscroll-behavior-y: none;
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
