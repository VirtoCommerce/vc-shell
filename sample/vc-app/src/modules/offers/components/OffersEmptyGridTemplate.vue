<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <img :src="emptyImage" />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("OFFERS.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
    <VcButton @click="$emit('add')">{{ $t("OFFERS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-unresolved
import emptyImage from "/assets/empty.png";

export interface Emits {
  (event: "add"): void;
}

defineEmits<Emits>();
</script>
