<template>
  <div class="vc-external-providers">
    <component
      :is="loadProviderComponent(provider.authenticationType!)"
      v-for="provider in providers"
      :key="provider"
      :logo="'/' + provider.logoUrl"
      :display-name="provider.displayName"
      :authentication-type="provider.authenticationType"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineAsyncComponent } from "vue";
import type { Component } from "vue";
import { ExternalSignInProviderInfo } from "../../../core/api/platform";

export interface Props {
  providers: ExternalSignInProviderInfo[];
}

defineProps<Props>();

const loadProviderComponent = (providerName: string) => {
  return defineAsyncComponent<Component>({
    loader: () => import(`./${providerName.toLowerCase()}.vue`),
    onError(error) {
      console.error(`Failed to load ${providerName} provider component`, error);
    },
  });
};
</script>

<style lang="scss">
.vc-external-providers {
  @apply tw-flex tw-justify-center tw-mt-4 tw-flex-wrap tw-gap-2;
}
</style>
