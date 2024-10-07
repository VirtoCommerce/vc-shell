<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-box-open"
      class="tw-text-[color:var(--products-empty-grid-icon-color)]"
      size="xxxl"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("PRODUCTS.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
    <VcButton @click="$emit('add')">{{ $t("PRODUCTS.PAGES.LIST.EMPTY.ADD") }}</VcButton>
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
  --products-empty-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
