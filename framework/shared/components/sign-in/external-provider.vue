<template>
  <VcButton
    outline
    class="vc-external-provider"
    @click="$emit('signIn')"
  >
    <div class="tw-flex tw-flex-row tw-items-center tw-gap-2">
      <VcImage
        :src="logo"
        class="vc-external-provider__icon"
        size="xxs"
      />{{ displayName }}
    </div>
  </VcButton>
</template>

<script lang="ts" setup>
import { VcButton, VcImage } from "./../../../ui/components";
export interface Props {
  logo: string;
  displayName: string;
}

export interface Emits {
  (event: "signIn"): void;
}

defineEmits<Emits>();
defineProps<Props>();
</script>
