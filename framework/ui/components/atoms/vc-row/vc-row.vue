<template>
  <div class="vc-row">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => any;
}>();
</script>

<style lang="scss">
.vc-row {
  @apply tw-flex tw-flex-nowrap tw-items-stretch;

  .vc-app_mobile & {
    @apply tw-grid;
  }
}
</style>
