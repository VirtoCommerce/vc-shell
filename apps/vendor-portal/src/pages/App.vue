<template>
  <VcLoading v-if="!isReady" active class="app__loader"></VcLoading>
  <VcApp
    :menuItems="menuItems"
    :mobileMenuItems="mobileMenuItems"
    :toolbarItems="toolbarItems"
    :isReady="isReady"
    :isAuthorized="isAuthorized"
    logo="/assets/logo.svg"
    :version="version"
    :pages="pages"
    v-else
  >
    <!-- Set up dashboard page -->
    <template v-slot:dashboard="scope">
      <DashboardPage v-bind="scope" />
    </template>

    <!-- Set up login form -->
    <template v-slot:login>
      <LoginPage
        logo="/assets/logo-white.svg"
        background="/assets/background.jpg"
        title="Vendor Portal"
      ></LoginPage>
    </template>

    <template v-slot:notifications>
      <VcNotification
        v-for="item in popupNotifications"
        :key="item.id"
        :timeout="5000"
        @dismiss="dismiss(item)"
        @expired="markAsReaded(item)"
      >
        {{ item.title }}
      </VcNotification>
    </template>

    <template v-slot:passwordChange>
      <change-password
        v-if="isChangePasswordActive"
        @close="isChangePasswordActive = false"
      ></change-password>
    </template>
  </VcApp>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  ref,
  watch,
  reactive,
  inject,
  shallowRef,
  Ref,
} from "vue";
import LoginPage from "./Login.vue";
import DashboardPage from "./Dashboard.vue";
import UserDropdownButton from "../components/user-dropdown-button.vue";
import ChangePassword from "../components/change-password.vue";
import { OrdersList } from "../modules/orders";
import { OffersList } from "../modules/offers";
import { ProductsList } from "../modules/products";
import { ImportProfileSelector } from "../modules/import";
import {
  useLogger,
  useI18n,
  useUser,
  useNotifications,
  useSettings,
  usePermissions,
} from "@virtoshell/core";
import { IBladeToolbar, IMenuItems, UserPermissions } from "../types";
import NotificationDropdown from "../components/notification-dropdown/notification-dropdown.vue";
import { PushNotification } from "@virtoshell/api-client";
import LanguageSelector from "../components/language-selector.vue";
import { useRoute, useRouter } from "vue-router";
import { SellerDetails, TeamList } from "../modules/settings";
import { HubConnection } from "@microsoft/signalr";

const {
  t,
  locale: currentLocale,
  availableLocales,
  getLocaleMessage,
} = useI18n();
const log = useLogger();
const { user, loadUser, signOut } = useUser();
const {
  popupNotifications,
  notifications,
  addNotification,
  dismiss,
  markAsReaded,
} = useNotifications();
const { checkPermission } = usePermissions();
const { getUiCustomizationSettings } = useSettings();
const route = useRoute();
const router = useRouter();
const isAuthorized = ref(false);
const isReady = ref(false);
const isChangePasswordActive = ref(false);
const pages = inject("pages");
const signalR = inject<HubConnection>("connection");
const isDesktop = inject<Ref<boolean>>("isDesktop");
const isMobile = inject<Ref<boolean>>("isMobile");
const version = import.meta.env.PACKAGE_VERSION;

signalR.on("Send", (message: PushNotification) => {
  addNotification(message);
});

onMounted(async () => {
  await loadUser();
  langInit();
  await getUiCustomizationSettings();
  isReady.value = true;
  if (!isAuthorized.value) {
    router.push("/login");
  }
});

watch(user, (value) => {
  isAuthorized.value = !!value?.userName;
});

log.debug(`Initializing App`);

const toolbarItems = ref<IBladeToolbar[]>([
  {
    component: shallowRef(LanguageSelector),
    componentOptions: {
      value: computed(() => currentLocale.value),
      title: computed(() => t("SHELL.TOOLBAR.LANGUAGE")),
      languageItems: computed(() =>
        availableLocales.map((locale) => ({
          lang: locale,
          title: getLocaleMessage(locale).language_name,
          clickHandler(lang: string) {
            currentLocale.value = lang;
            localStorage.setItem("VC_LANGUAGE_SETTINGS", lang);
          },
        }))
      ),
    },
    isVisible: computed(() => {
      return isDesktop.value
        ? isDesktop.value
        : isMobile.value
        ? route.path === "/"
        : false;
    }),
  },
  {
    isAccent: computed(() => {
      return !!notifications.value.filter((notification) => notification.isNew)
        .length;
    }),
    component: shallowRef(NotificationDropdown),
    componentOptions: {
      title: computed(() => t("SHELL.TOOLBAR.NOTIFICATIONS")),
    },
  },
  {
    component: shallowRef(UserDropdownButton),
    componentOptions: {
      avatar: "/assets/avatar.jpg",
      name: computed(() => user.value?.userName),
      role: computed(() =>
        user.value?.isAdministrator ? "Administrator" : "Seller account"
      ),
      menuItems: [
        {
          title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
          clickHandler() {
            isChangePasswordActive.value = true;
          },
        },
        {
          title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
          async clickHandler() {
            signOut();
            router.push("/login");
          },
        },
      ],
    },
    isVisible: isDesktop,
  },
]);

const mobileMenuItems = ref<IBladeToolbar[]>([
  {
    component: shallowRef(UserDropdownButton),
    componentOptions: {
      avatar: "/assets/avatar.jpg",
      name: computed(() => user.value?.userName),
      role: computed(() =>
        user.value?.isAdministrator ? "Administrator" : "Seller account"
      ),
    },
    isVisible: isMobile,
  },
]);

const menuItems = reactive<IMenuItems[]>([
  {
    title: computed(() => t("SHELL.MENU.DASHBOARD")),
    icon: "fas fa-home",
    isVisible: true,
    clickHandler(app) {
      app.openDashboard();
      router.push("/");
    },
  },
  {
    title: computed(() => t("ORDERS.MENU.TITLE")),
    icon: "fas fa-file-alt",
    isVisible: true,
    component: shallowRef(OrdersList),
  },
  {
    title: computed(() => t("PRODUCTS.MENU.TITLE")),
    icon: "fas fa-box-open",
    isVisible: true,
    component: shallowRef(),
    children: [
      {
        title: computed(() => t("PRODUCTS.MENU.MARKETPLACE_PRODUCTS")),
        component: shallowRef(ProductsList),
        componentOptions: {
          url: "all-products",
          readonly: true,
          query: {
            isPublished: true,
            searchFromAllSellers: true,
          },
        },
      },
      {
        title: computed(() => t("PRODUCTS.MENU.MY_PRODUCTS")),
        component: shallowRef(ProductsList),
        componentOptions: {
          url: "products",
        },
      },
    ],
  },
  {
    title: computed(() => t("OFFERS.MENU.TITLE")),
    icon: "fas fa-file-invoice",
    isVisible: true,
    component: shallowRef(OffersList),
  },
  {
    title: computed(() => t("IMPORT.MENU.TITLE")),
    icon: "fas fa-file-import",
    isVisible: true,
    component: shallowRef(ImportProfileSelector),
  },
  {
    title: computed(() => t("SETTINGS.MENU.TITLE")),
    icon: "fas fa-sliders-h",
    isVisible: computed(() =>
      checkPermission([
        UserPermissions.SellerUsersManage,
        UserPermissions.SellerDetailsEdit,
      ])
    ),
    component: shallowRef(),
    children: [
      {
        title: computed(() => t("SETTINGS.MENU.MY_TEAM")),
        component: shallowRef(TeamList),
        isVisible: computed(() =>
          checkPermission(UserPermissions.SellerUsersManage)
        ),
      },
      {
        title: computed(() => t("SETTINGS.MENU.SELLER_DETAILS")),
        component: shallowRef(SellerDetails),
        isVisible: computed(() =>
          checkPermission(UserPermissions.SellerDetailsEdit)
        ),
      },
    ],
  },
  {
    title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
    icon: "fas fa-key",
    isVisible: isMobile,
    clickHandler() {
      isChangePasswordActive.value = true;
    },
  },
  {
    title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
    icon: "fas fa-sign-out-alt",
    isVisible: isMobile,
    clickHandler() {
      signOut();
      router.push("/login");
    },
  },
]);

function langInit() {
  const lang = localStorage.getItem("VC_LANGUAGE_SETTINGS");

  if (lang) {
    currentLocale.value = lang;
  } else {
    currentLocale.value = "en";
  }
}
</script>

<style lang="scss">
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
  @apply font-roboto h-full w-full m-0 fixed overflow-hidden overscroll-y-none;
}

body {
  @apply text-base;
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
  @apply font-roboto;
}
::-webkit-input-placeholder {
  @apply font-roboto;
}
:-moz-placeholder {
  @apply font-roboto;
}
::-moz-placeholder {
  @apply font-roboto;
}
:-ms-input-placeholder {
  @apply font-roboto;
}

.vc-app.vc-theme_light {
  --background-color: #f2f2f2;
  --top-bar-color: #ffffff;
  --app-background: linear-gradient(180deg, #e4f5fb 5.06%, #e8f3f2 100%),
    linear-gradient(0deg, #e8f2f3, #e8f2f3), #eef2f8;
  --app-bar-background-color: #ffffff;
  --app-bar-divider-color: #ffffff;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-toolbar-icon-color-hover: #465769;
  --app-bar-toolbar-icon-background-hover: #ffffff;
  --app-bar-account-info-name-color: #161d25;
  --app-bar-account-info-role-color: #7e8e9d;
}

.app {
  &__loader {
    background: var(--app-background);
  }
}
</style>
