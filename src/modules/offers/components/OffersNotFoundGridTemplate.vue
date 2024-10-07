<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-shapes"
      class="tw-text-[color:var(--offers-not-found-grid-icon-color)]"
      size="xxxl"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("OFFERS.PAGES.LIST.NOT_FOUND.EMPTY") }}
    </div>
    <VcButton @click="$emit('reset')">{{ $t("OFFERS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
import { VcButton, VcIcon } from "@vc-shell/framework";

export interface Emits {
  (event: "reset"): void;
}

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --offers-not-found-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
