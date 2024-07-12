<template>
  <VcApp
    :is-ready="isReady"
    :logo="uiSettings.logo"
    :title="uiSettings.title"
    :version="version"
    :avatar="uiSettings.avatar"
  >
  </VcApp>
</template>

<script lang="ts" setup>
import { useSettings, useUser, useNotifications, notification, useApiClient } from "@vc-shell/framework";
import { onMounted, provide, ref, watch } from "vue";
import * as modules from "@vcmp-vendor-portal/modules";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";
import { SellerUser, VcmpSellerSecurityClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useSellerUser } from "../composables";
import { useRoute, useRouter } from "vue-router";

const { isAdministrator, isAuthenticated, signOut } = useUser();
const { uiSettings, applySettings } = useSettings();
const { item: sellerDetails, load: getCurrentSeller } = modules.default.SellerDetails.composables.useSellerDetails();
const { getCurrentUser } = useSellerUser();
const { moduleNotifications, markAsRead } = useNotifications("OrderCreatedEventHandler");
const { getApiClient } = useApiClient(VcmpSellerSecurityClient);
const route = useRoute();
const router = useRouter();
const isReady = ref(false);

const version = import.meta.env.PACKAGE_VERSION;

onMounted(async () => {
  try {
    if (isAuthenticated.value) {
      await customizationHandler();

      isReady.value = true;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      notification(message.title ?? "", {
        onClose() {
          markAsRead(message);
        },
      });
    });
  },
  { deep: true },
);

console.debug(`Initializing App`);

async function customizationHandler() {
  try {
    let currentUser: SellerUser | null = null;
    let avatar: string | undefined = undefined;

    if (!isAdministrator.value) {
      currentUser = !isAdministrator.value && (await getCurrentUser());
      avatar = currentUser.iconUrl;
    }

    const sellerId = await GetSellerId();
    if (!sellerId) {
      if (!isAdministrator.value) {
        await getCurrentSeller();
      }

      applySettings({
        logo: sellerDetails.value?.logo || logoImage,
        title: sellerDetails.value?.name || "Vendor Portal",
        avatar: avatar,
      });
    } else {
      const seller = await (await getApiClient()).getSellerById(sellerId);
      applySettings({
        logo: seller?.logo || logoImage,
        title: seller?.name || "Vendor Portal",
        avatar: avatar,
      });
    }
  } catch (e) {
    console.error(e);
    signOut();
    router.push({ name: "Login" });
  }
}

async function GetSellerId(): Promise<string> {
  const result = route?.params?.sellerId as string;
  return result;
}

provide("currentSeller", sellerDetails);
</script>

<style lang="scss">
:root {
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
  --app-bar-background-color: var(--top-bar-color);
  --app-bar-toolbar-icon-background-hover: #2e3d4e;
  --app-bar-toolbar-item-width: 50px;
  --app-bar-toolbar-icon-color: #7e8e9d;
  --app-bar-account-info-role-color: #838d9a;

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
</style>
