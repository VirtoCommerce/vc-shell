<template>
  <div class="vc-row tw-flex-nowrap tw-flex tw-items-stretch">
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
  .vc-app_mobile & {
    display: grid;
  }
}
</style>
