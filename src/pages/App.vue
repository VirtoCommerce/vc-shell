<template>
  <VcLoading
    v-if="!isReady"
    active
    class="app__loader"
  />
  <VcApp
    :menuItems="menuItems"
    :mobileMenuItems="mobileMenuItems"
    :toolbarItems="toolbarItems"
    :isReady="isReady"
    :isAuthorized="isAuthorized"
    :logo="uiSettings.logo"
    :title="uiSettings.title"
    :version="version"
    :pages="pages"
    :bladesRefs="bladesRefs"
    @backlink:click="closeBlade($event)"
    @open="onOpen"
    @close="closeBlade($event)"
    v-else
  >
    <!-- App Switcher -->
    <template
      v-slot:appSwitcher
      v-if="appsList && appsList.length"
    >
      <VcAppSwitcher
        :appsList="appsList"
        @onClick="switchApp($event)"
      />
    </template>

    <template
      v-slot:bladeNavigation
      v-if="isAuthorized"
    >
      <VcBladeNavigation
        @onOpen="openBlade($event.blade, $event.id)"
        @onClose="closeBlade($event)"
        @onParentCall="(e) => onParentCall(e.id, e.args)"
        :blades="blades"
        :parentBladeOptions="parentBladeOptions"
        :parentBladeParam="parentBladeParam"
        ref="bladeNavigationRefs"
      ></VcBladeNavigation>
    </template>

    <template v-slot:notifications>
      <VcNotification
        v-for="item in popupNotifications"
        :key="item.id"
        :timeout="5000"
        @dismiss="dismiss(item)"
        @expired="markAsRead(item)"
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
import { HubConnection } from "@microsoft/signalr";
import {
  PushNotification,
  IBladeToolbar,
  IMenuItems,
  useAppSwitcher,
  useFunctions,
  useI18n,
  useNotifications,
  usePermissions,
  useSettings,
  useUser,
  useBladeNavigation,
  IOpenBlade,
  IBladeElement,
  ExtendedComponent,
} from "@vc-shell/framework";
import { computed, inject, onMounted, reactive, ref, Ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChangePassword from "../components/change-password.vue";
import LanguageSelector from "../components/language-selector.vue";
import NotificationDropdown from "../components/notification-dropdown/notification-dropdown.vue";
import UserDropdownButton from "../components/user-dropdown-button.vue";
import { ImportProfileSelector } from "../modules/import";
import { OffersList } from "../modules/offers";
import { OrdersList } from "../modules/orders";
import { ProductsList } from "../modules/products";
import { MpProductsList } from "../modules/marketplace-products";
import { ReviewList } from "../modules/rating";
import { SellerDetails, TeamList, FulfillmentCenters } from "../modules/settings";
import { UserPermissions } from "../types";
// eslint-disable-next-line import/no-unresolved
import avatarImage from "/assets/avatar.jpg";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";
import useSellerDetails from "../modules/settings/composables/useSellerDetails";

const { t, locale: currentLocale, availableLocales, getLocaleMessage } = useI18n();
const { user, loadUser, signOut } = useUser();
const { popupNotifications, notifications, addNotification, dismiss, markAsRead } = useNotifications();
const { checkPermission } = usePermissions();
const { getUiCustomizationSettings, uiSettings, applySettings } = useSettings();
const { delay } = useFunctions();
const { blades, bladesRefs, parentBladeOptions, parentBladeParam, openBlade, closeBlade, onParentCall } =
  useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();
const { sellerDetails, getCurrentSeller } = useSellerDetails();
const route = useRoute();
const router = useRouter();
const isAuthorized = ref(false);
const isReady = ref(false);
const isChangePasswordActive = ref(false);
const pages = inject<ExtendedComponent[]>("pages");
const signalR = inject<HubConnection>("connection");
const isDesktop = inject<Ref<boolean>>("isDesktop");
const isMobile = inject<Ref<boolean>>("isMobile");
const version = import.meta.env.PACKAGE_VERSION;
const bladeNavigationRefs = ref();

signalR.on("Send", (message: PushNotification) => {
  delay(() => addNotification(message), 100);
});

onMounted(async () => {
  await loadUser();
  await getApps();
  langInit();
  await customizationHandler();

  isReady.value = true;
  if (!isAuthorized.value) {
    router.push("/login");
  }
});

watch(
  user,
  (value) => {
    isAuthorized.value = !!value?.userName;
  },
  { immediate: true }
);

watch(
  () => bladeNavigationRefs.value?.bladesRefs,
  (newVal) => {
    bladesRefs.value = newVal;
  },
  { deep: true }
);

console.debug(`Initializing App`);

const toolbarItems = ref<IBladeToolbar[]>([
  {
    component: shallowRef(LanguageSelector),
    bladeOptions: {
      value: computed(() => currentLocale.value),
      title: computed(() => t("SHELL.TOOLBAR.LANGUAGE")),
      languageItems: computed(() =>
        availableLocales.map((locale: string) => ({
          lang: locale,
          title: (getLocaleMessage(locale) as { language_name: string }).language_name,
          clickHandler(lang: string) {
            currentLocale.value = lang;
            localStorage.setItem("VC_LANGUAGE_SETTINGS", lang);
          },
        }))
      ),
    },
    isVisible: computed(() => {
      return isDesktop.value ? isDesktop.value : isMobile.value ? route.path === "/" : false;
    }),
  },
  {
    isAccent: computed(() => {
      return !!notifications.value.filter((notification) => notification.isNew).length;
    }),
    component: shallowRef(NotificationDropdown),
    bladeOptions: {
      title: computed(() => t("SHELL.TOOLBAR.NOTIFICATIONS")),
    },
  },
  {
    component: shallowRef(UserDropdownButton),
    bladeOptions: {
      avatar: avatarImage,
      name: computed(() => user.value?.userName),
      role: computed(() => (user.value?.isAdministrator ? "Administrator" : "Seller account")),
      menuItems: [
        {
          title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
          clickHandler() {
            isChangePasswordActive.value = true;
          },
        },
        {
          title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
          clickHandler() {
            closeBlade(0);
            signOut();
            router.push({ name: "Login" });
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
    bladeOptions: {
      avatar: avatarImage,
      name: computed(() => user.value?.userName),
      role: computed(() => (user.value?.isAdministrator ? "Administrator" : "Seller account")),
    },
    isVisible: isMobile,
  },
]);

const menuItems = reactive<IMenuItems[]>([
  {
    title: computed(() => t("SHELL.MENU.DASHBOARD")),
    icon: "fas fa-home",
    isVisible: true,
    clickHandler(app: IBladeElement) {
      app.openDashboard();
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
    children: [
      {
        title: computed(() => t("PRODUCTS.MENU.MARKETPLACE_PRODUCTS")),
        component: shallowRef(MpProductsList),
        bladeOptions: {
          readonly: true,
        },
        isVisible: computed(() => checkPermission(UserPermissions.SellerProductsSearchFromAllSellers)),
      },
      {
        title: computed(() => t("PRODUCTS.MENU.MY_PRODUCTS")),
        component: shallowRef(ProductsList),
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
    title: computed(() => t("RATING.MENU.TITLE")),
    icon: "fas fa-star",
    isVisible: computed(() => checkPermission(UserPermissions.ManageSellerReviews)),
    component: shallowRef(ReviewList),
  },
  {
    title: computed(() => t("SETTINGS.MENU.TITLE")),
    icon: "fas fa-sliders-h",
    isVisible: computed(() =>
      checkPermission([
        UserPermissions.SellerUsersManage,
        UserPermissions.SellerDetailsEdit,
        UserPermissions.ManageSellerFulfillmentCenters,
      ])
    ),
    children: [
      {
        title: computed(() => t("SETTINGS.MENU.MY_TEAM")),
        component: shallowRef(TeamList),
        isVisible: computed(() => checkPermission(UserPermissions.SellerUsersManage)),
      },
      {
        title: computed(() => t("SETTINGS.MENU.FULFILLMENT_CENTERS")),
        component: shallowRef(FulfillmentCenters),
        isVisible: computed(() => checkPermission(UserPermissions.ManageSellerFulfillmentCenters)),
      },
      {
        title: computed(() => t("SETTINGS.MENU.SELLER_DETAILS")),
        component: shallowRef(SellerDetails),
        isVisible: computed(() => checkPermission(UserPermissions.SellerDetailsEdit)),
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

function onOpen(args: IOpenBlade) {
  openBlade({ parentBlade: args.parentBlade }, args.id, args.navigationCb);
}

async function customizationHandler() {
  await getCurrentSeller();
  await getUiCustomizationSettings();

  if (sellerDetails.value.logo) {
    applySettings({ logo: sellerDetails.value.logo });
  } else if (!uiSettings.value.logo) {
    applySettings({ logo: logoImage });
  }

  if (sellerDetails.value.name) {
    applySettings({ title: sellerDetails.value.name });
  } else if (!uiSettings.value.title) {
    applySettings({ title: undefined });
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
  @apply tw-font-roboto tw-h-full tw-w-full tw-m-0 tw-fixed tw-overflow-hidden tw-overscroll-y-none;
}

body {
  @apply tw-text-base;
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
  @apply tw-font-roboto;
}
::-webkit-input-placeholder {
  @apply tw-font-roboto;
}
:-moz-placeholder {
  @apply tw-font-roboto;
}
::-moz-placeholder {
  @apply tw-font-roboto;
}
:-ms-input-placeholder {
  @apply tw-font-roboto;
}

.vc-app.vc-theme_light {
  --background-color: #f2f2f2;
  --top-bar-color: #ffffff;
  --app-background: linear-gradient(180deg, #e4f5fb 5.06%, #e8f3f2 100%), linear-gradient(0deg, #e8f2f3, #e8f2f3),
    #eef2f8;
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
