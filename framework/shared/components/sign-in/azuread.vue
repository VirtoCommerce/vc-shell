<template>
  <ExternalProvider
    :logo="logo"
    :display-name="displayName"
    @sign-in="signIn(authenticationType, '/signin-oidc')"
  />
</template>

<script lang="ts" setup>
import { default as ExternalProvider } from "./external-provider.vue";
import { useExternalProvider } from "./useExternalProvider";

export interface Props {
  logo: string;
  displayName: string;
  authenticationType: string;
}

defineProps<Props>();

const { signIn } = useExternalProvider();
</script>

<style lang="scss" scoped></style>
