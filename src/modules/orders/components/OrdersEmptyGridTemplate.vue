<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-shopping-cart"
      class="tw-text-[color:var(--orders-empty-grid-icon-color)]"
      size="xxxl"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("ORDERS.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
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
  --orders-empty-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
