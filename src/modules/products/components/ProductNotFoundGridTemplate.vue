<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-box-open"
      class="!tw-text-[95px] !tw-text-[#329ED4]"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.EMPTY") }}
    </div>
    <VcButton @click="$emit('reset')">{{ $t("PRODUCTS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
import { VcButton } from "@vc-shell/framework";

export interface Emits {
  (event: "reset"): void;
}

defineEmits<Emits>();
</script>
