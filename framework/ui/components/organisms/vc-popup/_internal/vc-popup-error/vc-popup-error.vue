<template>
  <div class="tw-flex tw-flex-col tw-overflow-hidden tw-p-2">
    <VcContainer
      no-padding
      style="word-break: break-word"
    >
      <slot></slot>
    </VcContainer>
  </div>

  <div class="tw-flex tw-my-4 tw-mx-5">
    <VcButton
      class="tw-ml-auto"
      @click="$emit('close')"
      >{{ t("COMPONENTS.ORGANISMS.VC_POPUP.OK") }}</VcButton
    >
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "./../../../../";
import { useI18n } from "vue-i18n";

export interface Emits {
  (event: "close"): void;
}

defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });
</script>
