<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <img :src="emptyImage" />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("OFFERS.PAGES.LIST.NOT_FOUND.EMPTY") }}
    </div>
    <VcButton @click="$emit('reset')">{{ $t("OFFERS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png?url";
import { VcButton } from "@vc-shell/framework";

export interface Emits {
  (event: "reset"): void;
}

defineEmits<Emits>();
</script>
