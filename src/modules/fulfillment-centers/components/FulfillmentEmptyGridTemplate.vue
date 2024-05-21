<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-warehouse"
      class="!tw-text-[95px] !tw-text-[#329ED4]"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("FULFILLMENT_CENTERS.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
    <VcButton @click="$emit('add')">{{ $t("FULFILLMENT_CENTERS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
export interface Emits {
  (event: "add"): void;
}

defineEmits<Emits>();
</script>
