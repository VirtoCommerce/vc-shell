<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-tags"
      class="tw-text-[color:var(--special-prices-empty-grid-icon-color)]"
      size="xxxl"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("SPECIAL_PRICES.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
    <VcButton @click="$emit('add')">{{ $t("SPECIAL_PRICES.PAGES.LIST.EMPTY.ADD") }}</VcButton>
  </div>
</template>

<script setup lang="ts">
export interface Emits {
  (event: "add"): void;
}

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --special-prices-empty-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
