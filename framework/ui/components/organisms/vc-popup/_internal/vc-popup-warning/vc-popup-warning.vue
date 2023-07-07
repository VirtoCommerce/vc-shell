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
    <div class="tw-ml-auto">
      <VcButton
        text
        class="tw-mr-5 tw-text-[#FF4A4A]"
        @click="$emit('confirm')"
        >{{ t("COMPONENTS.ORGANISMS.VC_POPUP.CONFIRM") }}</VcButton
      >
      <VcButton @click="$emit('close')">{{ t("COMPONENTS.ORGANISMS.VC_POPUP.CANCEL") }}</VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { VcButton } from "./../../../../";

export interface Emits {
  (event: "close"): void;
  (event: "confirm"): void;
}

defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });
</script>
