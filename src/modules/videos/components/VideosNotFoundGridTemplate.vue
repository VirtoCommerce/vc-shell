<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      class="vc-widget__icon"
      icon="fas fa-film"
      size="xxxl"
    ></VcIcon>
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("VIDEOS.PAGES.LIST.NOT_FOUND.EMPTY") }}
    </div>
    <VcButton @click="$emit('add')">{{ $t("VIDEOS.PAGES.LIST.NOT_FOUND.RESET") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
export interface Emits {
  (event: "add"): void;
}

defineEmits<Emits>();
</script>
