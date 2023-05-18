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
      >OK</VcButton
    >
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "./../../../../";

export interface Emits {
  (event: "close"): void;
}

defineEmits<Emits>();
</script>
