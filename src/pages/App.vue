<template>
  <VcApp
    :is-ready="isReady"
    :logo="uiSettings.logo"
    :title="uiSettings.title"
    :version="version"
    :name="name"
    :avatar="uiSettings.avatar"
    :role="uiSettings.role"
  >
  </VcApp>
</template>

<script lang="ts" setup>
import { useSettings, useUser, useApiClient, updateSignalRCreatorSymbol } from "@vc-shell/framework";
import { computed, inject, onMounted, provide, ref } from "vue";
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
const { getApiClient } = useApiClient(VcmpSellerSecurityClient);
const route = useRoute();
const router = useRouter();
const isReady = ref(false);
const name = ref();
const version = import.meta.env.PACKAGE_VERSION;
const updateSignalRCreator = inject(updateSignalRCreatorSymbol) as (creator: string | undefined) => void;

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

console.debug(`Initializing App`);

async function customizationHandler() {
  try {
    let currentUser: SellerUser | null = null;
    let avatar: string | undefined = undefined;
    let role: string | undefined = undefined;

    if (!isAdministrator.value) {
      currentUser = (await getCurrentUser()) || null;
      avatar = currentUser?.iconUrl;
      role = currentUser?.role;
      name.value = currentUser?.fullName;
    }

    const sellerId = GetSellerId();
    if (!sellerId) {
      if (!isAdministrator.value) {
        await getCurrentSeller();
        updateSignalRCreator(sellerDetails.value?.id);
      }

      applySettings({
        logo: sellerDetails.value?.logo || logoImage,
        title: sellerDetails.value?.name || "Vendor Portal",
        avatar: avatar,
        role: role,
      });
    } else {
      updateSignalRCreator(sellerId);
      const seller = await (await getApiClient()).getSellerById(sellerId);
      applySettings({
        logo: seller?.logo || logoImage,
        title: seller?.name || "Vendor Portal",
        avatar: avatar,
        role: role,
      });
    }
  } catch (e) {
    console.error(e);
    signOut();
    router.push({ name: "Login" });
  }
}

function GetSellerId(): string {
  const result = route?.params?.sellerId as string;
  return result;
}

provide(
  "currentSeller",
  computed(() => sellerDetails.value || { id: GetSellerId() }),
);
</script>

<style lang="scss">
@import "./../styles/index.scss";
</style>
