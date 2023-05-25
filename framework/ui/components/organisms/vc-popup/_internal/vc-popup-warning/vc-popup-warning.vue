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
        >Confirm</VcButton
      >
      <VcButton @click="$emit('close')">Cancel</VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "./../../../../";

export interface Emits {
  (event: "close"): void;
  (event: "confirm"): void;
}

defineEmits<Emits>();
</script>
