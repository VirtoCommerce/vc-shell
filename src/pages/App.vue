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
    @logo:click="openDashboard"
    v-else
  >
    <!-- App Switcher -->
    <template
      v-slot:appSwitcher
      v-if="appsList && appsList.length"
    >
      <VcAppSwitcher
        :appsList="appsList"
        :base="base"
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
  IBladeToolbar,
  IMenuItems,
  useAppSwitcher,
  usePermissions,
  useSettings,
  useUser,
  useBladeNavigation,
  IOpenBlade,
  ExtendedComponent,
  useNotifications,
  VcNotificationDropdown,
  notification,
  PushNotification,
} from "@vc-shell/framework";
import { computed, inject, onMounted, reactive, ref, Ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChangePassword from "../components/change-password.vue";
import LanguageSelector from "../components/language-selector.vue";
import UserDropdownButton from "../components/user-dropdown-button.vue";
import { ImportProfileSelector, ImportNew } from "../modules/import";
import { OffersList } from "../modules/offers";
import { OrdersList, OrdersEdit } from "../modules/orders";
import { ProductsList, ProductsEdit } from "../modules/products";
import { MpProductsList } from "../modules/marketplace-products";
import { ReviewList } from "../modules/rating";
import { SellerDetails, TeamList, FulfillmentCenters } from "../modules/settings";
import { INewOrderPushNotification, IProductPushNotification, UserPermissions } from "../types";
// eslint-disable-next-line import/no-unresolved
import avatarImage from "/assets/avatar.jpg";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";
import useSellerDetails from "../modules/settings/composables/useSellerDetails";
import { useI18n } from "vue-i18n";
import { IImportPushNotification } from "./../api_client/marketplacevendor";

const base = import.meta.env.APP_PLATFORM_URL;

const { t, locale: currentLocale, availableLocales, getLocaleMessage } = useI18n({ useScope: "global" });
const { user, loadUser, signOut } = useUser();
const { checkPermission } = usePermissions();
const { getUiCustomizationSettings, uiSettings, applySettings } = useSettings();
const { blades, bladesRefs, parentBladeOptions, parentBladeParam, openBlade, closeBlade, onParentCall } =
  useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();
const { sellerDetails, getCurrentSeller } = useSellerDetails();
const { moduleNotifications, notifications, markAsRead, loadFromHistory, markAllAsRead } =
  useNotifications("OrderCreatedEventHandler");
const route = useRoute();
const router = useRouter();
const isAuthorized = ref(false);
const isReady = ref(false);
const isChangePasswordActive = ref(false);
const pages = inject<ExtendedComponent[]>("pages");
const isDesktop = inject<Ref<boolean>>("isDesktop");
const isMobile = inject<Ref<boolean>>("isMobile");
const version = import.meta.env.PACKAGE_VERSION;
const bladeNavigationRefs = ref();

onMounted(async () => {
  try {
    await loadUser();
    await getApps();
    langInit();
    await customizationHandler();
    await loadFromHistory();

    isReady.value = true;
  } catch (e) {
    if (!isAuthorized.value) {
      router.push("/login");
    }
    throw e;
  }
});

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      notification(message.title, {
        onClose() {
          markAsRead(message);
        },
      });
    });
  },
  { deep: true }
);

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
    options: {
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
    isAccent: computed(() => notifications.value.some((item) => item.isNew)),
    component: shallowRef(VcNotificationDropdown),
    options: {
      title: computed(() => t("SHELL.TOOLBAR.NOTIFICATIONS")),
      notifications: computed(() => notifications.value),
      onOpen() {
        if (notifications.value.some((x) => x.isNew)) {
          markAllAsRead();
        }
      },
      async onClick(notification: PushNotification) {
        if (notification) {
          switch (notification.notifyType) {
            case "ImportPushNotification":
              openBlade({
                parentBlade: shallowRef(ImportProfileSelector),
                descendantBlade: shallowRef(ImportNew),
                param: (notification as IImportPushNotification).profileId,
                options: {
                  importJobId: (notification as IImportPushNotification).jobId,
                },
              });
              break;
            case "PublicationRequestStatusChangedDomainEvent":
              openBlade({
                parentBlade: shallowRef(ProductsList),
                descendantBlade: shallowRef(ProductsEdit),
                param: (notification as IProductPushNotification).productId,
              });
              break;
            case "OrderCreatedEventHandler":
              openBlade({
                parentBlade: shallowRef(OrdersList),
                descendantBlade: shallowRef(OrdersEdit),
                param: (notification as INewOrderPushNotification).orderId,
              });
              break;
          }
        }
      },
    },
  },
  {
    component: shallowRef(UserDropdownButton),
    options: {
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
    options: {
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
    component: {
      url: "/",
    },
    clickHandler() {
      openDashboard();
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
        options: {
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
  openBlade({ parentBlade: args.parentBlade }, args.id);
}

const openDashboard = () => {
  console.debug(`openDashboard() called.`);

  // Close all opened pages with onBeforeClose callback
  closeBlade(0);

  router.push("/");
};

async function customizationHandler() {
  await getCurrentSeller();
  await getUiCustomizationSettings(base);

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
