<template>
  <VcApp
    :is-ready="isReady"
    :logo="uiSettings.logo"
    :title="uiSettings.title"
    :version="version"
  >
  </VcApp>
</template>

<script lang="ts" setup>
import { useSettings, useUser } from "@vc-shell/framework";
import { onMounted, ref } from "vue";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";

const { isAuthenticated } = useUser();
const { uiSettings, applySettings } = useSettings();
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

console.debug(`Initializing App`);

async function customizationHandler() {
  applySettings({
    title: uiSettings.value?.title || undefined,
    logo: uiSettings.value?.logo || logoImage,
  });
}
</script>

<style lang="scss">
@import "./../styles/index.scss";
</style>
