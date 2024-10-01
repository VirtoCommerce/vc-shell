<template>
  <div class="tw-flex tw-justify-center tw-mt-4 tw-flex-wrap tw-gap-2">
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
import type { Component, AsyncComponentLoader } from "vue";
import { ExternalSignInProviderInfo } from "../../../core/api/platform";

export interface Props {
  providers: ExternalSignInProviderInfo[];
}

defineProps<Props>();

const components = import.meta.glob("./*.vue");

const loadProviderComponent = (providerName: string): Component | null => {
  const componentPath = `./${providerName.toLowerCase()}.vue`;
  const loader: AsyncComponentLoader = components[componentPath];

  if (loader !== undefined) {
    return defineAsyncComponent({
      loader,
      onError(error) {
        console.error(`Failed to load ${providerName} provider component`, error);
      },
    });
  } else {
    console.error(`Component for provider "${providerName}" not found at path "${componentPath}"`);
    return null;
  }
};
</script>
