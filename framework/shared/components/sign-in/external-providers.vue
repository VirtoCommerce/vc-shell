<template>
  <div class="tw-flex tw-justify-center tw-mt-4 tw-flex-wrap tw-gap-2">
    <ExternalProvider
      v-for="provider in providers"
      :key="provider.authenticationType"
      :logo="provider.logoUrl"
      :display-name="provider.displayName"
      :authentication-type="provider.authenticationType"
      @sign-in="signIn(provider.authenticationType)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { ExternalSignInProviderInfo } from "../../../core/api/platform";
import { useExternalProvider } from "./useExternalProvider";
import { default as ExternalProvider } from "./external-provider.vue";

export interface Props {
  providers: ExternalSignInProviderInfo[];
}

defineProps<Props>();

const { signIn } = useExternalProvider();
</script>
