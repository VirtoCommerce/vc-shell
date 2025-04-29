<template>
  <VcApp
    :is-ready="isReady"
    :logo="logoImage"
    title="{{AppNameSentenceCase}}"
    :version="version"
  >
  </VcApp>
</template>

<script lang="ts" setup>
import { useUser } from "@vc-shell/framework";
import { onMounted, ref } from "vue";
// eslint-disable-next-line import/no-unresolved
import logoImage from "/assets/logo.svg";

const isReady = ref(false);
const version = import.meta.env.PACKAGE_VERSION;

const { isAuthenticated } = useUser();

onMounted(async () => {
  try {
    if (isAuthenticated.value) {
      isReady.value = true;
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

console.debug(`Initializing App`);
</script>

<style lang="scss">
@use "./../styles/index.scss";
</style>
