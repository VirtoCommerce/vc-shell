<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      icon="fas fa-shopping-cart"
      class="tw-text-[color:var(--orders-not-found-grid-icon-color)]"
      size="xxxl"
    />
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("ORDERS.PAGES.LIST.NOT_FOUND.EMPTY") }}
    </div>
    <vc-button @click="$emit('reset')">{{ $t("ORDERS.PAGES.LIST.NOT_FOUND.RESET") }}</vc-button>
  </div>
</template>

<script setup lang="ts">
export interface Emits {
  (event: "reset"): void;
}

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --orders-not-found-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
