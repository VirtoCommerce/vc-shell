<template>
  <VcLoading
    v-if="!isReady"
    active
    class="app__loader"
  />
  <VcApp
    v-else
    :menu-items="menuItems"
    :mobile-menu-items="mobileMenuItems"
    :toolbar-items="toolbarItems"
    :is-ready="isReady"
    :is-authorized="isAuthorized"
    :logo="uiSettings.logo"
    :title="uiSettings.title"
    :version="version"
    :pages="pages"
    :blades-refs="bladesRefs"
    @backlink:click="closeBlade($event)"
    @close="closeBlade($event)"
    @logo:click="openDashboard"
  >
    <!-- App Switcher -->
    <template
      v-if="appsList && appsList.length"
      #appSwitcher
    >
      <VcAppSwitcher
        :apps-list="appsList"
        @on-click="switchApp($event)"
      />
    </template>

    <template
      v-if="isAuthorized"
      #bladeNavigation
    >
      <VcBladeNavigation
        ref="bladeNavigationRefs"
        :blades="blades"
        :workspace-options="workspaceOptions"
        :workspace-param="workspaceParam"
        @on-close="closeBlade($event)"
        @on-parent-call="(e) => onParentCall(e.id, e.args)"
        @vue:mounted="resolveLastBlade(pages)"
      ></VcBladeNavigation>
    </template>

    <template #modals>
      <VcPopupContainer />
    </template>
  </VcApp>
</template>

<script lang="ts" setup>
import {
  useAppSwitcher,
  usePermissions,
  useSettings,
  useUser,
  useBladeNavigation,
  useNotifications,
  VcNotificationDropdown,
  notification,
  usePopup,
  useMenuComposer,
  ChangePassword,
  LanguageSelector,
  UserDropdownButton,
  BladePageComponent,
  NotificationTemplateConstructor,
} from "@vc-shell/framework";
import { computed, inject, onMounted, reactive, ref, Ref, watch, markRaw, defineComponent, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
// import { ImportProfileSelector } from "../modules/import";
import * as modules from "vc-vendor-portal-modules";
import { UserPermissions } from "./../modules/types";
// eslint-disable-next-line import/no-unresolved
import avatarImage from "/assets/avatar.jpg";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";
import { useI18n } from "vue-i18n";

const { open } = usePopup({
  component: ChangePassword,
});

const { t, locale: currentLocale, availableLocales, getLocaleMessage } = useI18n({ useScope: "global" });
const { user, signOut, isAdministrator } = useUser();
const { hasAccess } = usePermissions();
const { getUiCustomizationSettings, uiSettings, applySettings } = useSettings();
const { blades, bladesRefs, workspaceOptions, workspaceParam, closeBlade, onParentCall, resolveLastBlade } =
  useBladeNavigation();
const { navigationMenuComposer, toolbarComposer } = useMenuComposer();
const { appsList, switchApp, getApps } = useAppSwitcher();
const { sellerDetails, getCurrentSeller } = modules.default.Settings.UseSellerDetails();
const { moduleNotifications, notifications, markAsRead, loadFromHistory, markAllAsRead } =
  useNotifications("OrderCreatedEventHandler");
const route = useRoute();
const router = useRouter();
const isAuthorized = ref(false);
const isReady = ref(false);
const pages = inject<BladePageComponent[]>("pages");
const internalRoutes = inject("bladeRoutes");
provide("internalRoutes", internalRoutes);
const notificationTemplates = inject<NotificationTemplateConstructor[]>("notificationTemplates");
const isDesktop = inject<Ref<boolean>>("isDesktop");
const isMobile = inject<Ref<boolean>>("isMobile");
const version = import.meta.env.PACKAGE_VERSION;
const bladeNavigationRefs = ref();

onMounted(async () => {
  try {
    if (isAuthorized.value) {
      await getApps();
      langInit();
      await loadFromHistory();

      await customizationHandler();

      isReady.value = true;
    }
  } catch (e) {
    router.push("/login");

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

const toolbarItems = computed(() =>
  toolbarComposer([
    {
      component: markRaw(LanguageSelector),
      options: {
        value: currentLocale.value as string,
        title: t("SHELL.TOOLBAR.LANGUAGE"),
        languageItems: availableLocales.map((locale: string) => ({
          lang: locale,
          title: (getLocaleMessage(locale) as { language_name: string }).language_name,
          clickHandler(lang: string) {
            currentLocale.value = lang;
            localStorage.setItem("VC_LANGUAGE_SETTINGS", lang);
          },
        })),
      },
      isVisible: isDesktop.value ? isDesktop.value : isMobile.value ? route.path === "/" : false,
    },
    {
      isAccent: notifications.value.some((item) => item.isNew),
      component: markRaw(VcNotificationDropdown),
      options: {
        title: t("SHELL.TOOLBAR.NOTIFICATIONS"),
        notifications: notifications.value,
        templates: notificationTemplates,
        onOpen() {
          if (notifications.value.some((x) => x.isNew)) {
            markAllAsRead();
          }
        },
      },
    },
    {
      component: markRaw(UserDropdownButton),
      options: {
        avatar: avatarImage,
        name: user.value?.userName,
        role: user.value?.isAdministrator ? "Administrator" : "Seller account",
        menuItems: [
          {
            title: t("SHELL.ACCOUNT.CHANGE_PASSWORD"),
            clickHandler() {
              open();
            },
          },
          {
            title: t("SHELL.ACCOUNT.LOGOUT"),
            async clickHandler() {
              const isPrevented = await closeBlade(0);
              if (!isPrevented) {
                signOut();
                router.push({ name: "Login" });
              }
            },
          },
        ],
      },
      isVisible: isDesktop.value,
    },
  ])
);

const mobileMenuItems = computed(() =>
  toolbarComposer([
    {
      component: markRaw(UserDropdownButton),
      options: {
        avatar: avatarImage,
        name: user.value?.userName,
        role: user.value?.isAdministrator ? "Administrator" : "Seller account",
      },
      isVisible: isMobile.value,
    },
  ])
);
const { resolveBladeByName } = useBladeNavigation();
const menuItems = reactive(
  navigationMenuComposer([
    {
      title: computed(() => t("SHELL.MENU.DASHBOARD")),
      icon: "fas fa-home",
      isVisible: true,
      component: defineComponent({
        url: "/",
      }),
      clickHandler() {
        openDashboard();
      },
    },
    {
      title: computed(() => t("ORDERS.MENU.TITLE")),
      icon: "fas fa-file-alt",
      isVisible: true,
      component: modules.default.Orders.OrdersList,
    },
    {
      title: computed(() => t("PRODUCTS.MENU.TITLE")),
      icon: "fas fa-box-open",
      isVisible: true,
      children: [
        {
          title: computed(() => t("PRODUCTS.MENU.MARKETPLACE_PRODUCTS")),
          component: resolveBladeByName("MpProducts"),
          isVisible: computed(() => hasAccess(UserPermissions.SellerProductsSearchFromAllSellers)),
        },
        {
          title: computed(() => t("PRODUCTS.MENU.MY_PRODUCTS")),
          component: resolveBladeByName("Products"),
        },
      ],
    },
    {
      title: computed(() => t("OFFERS.MENU.TITLE")),
      icon: "fas fa-file-invoice",
      isVisible: true,
      component: resolveBladeByName("Offers"),
    },
    {
      title: computed(() => t("IMPORT.MENU.TITLE")),
      icon: "fas fa-file-import",
      isVisible: true,
      component: resolveBladeByName("ImportProfileSelector"),
    },
    {
      title: computed(() => t("RATING.MENU.TITLE")),
      icon: "fas fa-star",
      isVisible: computed(() => hasAccess(UserPermissions.ManageSellerReviews)),
      component: modules.default.Rating.ReviewList,
    },
    {
      title: computed(() => t("SETTINGS.MENU.TITLE")),
      icon: "fas fa-sliders-h",
      isVisible: computed(() =>
        hasAccess([
          UserPermissions.SellerUsersManage,
          UserPermissions.SellerDetailsEdit,
          UserPermissions.ManageSellerFulfillmentCenters,
        ])
      ),
      children: [
        {
          title: computed(() => t("SETTINGS.MENU.MY_TEAM")),
          component: modules.default.Settings.TeamList,
          isVisible: computed(() => hasAccess(UserPermissions.SellerUsersManage)),
        },
        {
          title: computed(() => t("SETTINGS.MENU.FULFILLMENT_CENTERS")),
          component: modules.default.Settings.FulfillmentCenters,
          isVisible: computed(() => hasAccess(UserPermissions.ManageSellerFulfillmentCenters)),
        },
        {
          title: computed(() => t("SETTINGS.MENU.SELLER_DETAILS")),
          component: modules.default.Settings.SellerDetails,
          isVisible: computed(() => hasAccess(UserPermissions.SellerDetailsEdit)),
        },
      ],
    },
    {
      title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
      icon: "fas fa-key",
      isVisible: isMobile,
      clickHandler() {
        open();
      },
    },
    {
      title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
      icon: "fas fa-sign-out-alt",
      isVisible: isMobile,
      async clickHandler() {
        const isPrevented = await closeBlade(0);
        if (!isPrevented) {
          signOut();
          router.push({ name: "Login" });
        }
      },
    },
  ])
);

function langInit() {
  const lang = localStorage.getItem("VC_LANGUAGE_SETTINGS");

  if (lang) {
    currentLocale.value = lang;
  } else {
    currentLocale.value = "en";
  }
}

const openDashboard = async () => {
  console.debug(`openDashboard() called.`);

  // Close all opened pages with onBeforeClose callback
  const isPrevented = await closeBlade(0);

  !isPrevented && router.push("/");
};

async function customizationHandler() {
  if (!isAdministrator.value) {
    await getCurrentSeller();
  }
  await getUiCustomizationSettings();

  if (sellerDetails.value.logo) {
    applySettings({ logo: sellerDetails.value.logo });
  } else {
    applySettings({ logo: logoImage });
  }

  if (sellerDetails.value.name) {
    applySettings({ title: sellerDetails.value.name });
  } else {
    applySettings({ title: "Vendor Portal" });
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
