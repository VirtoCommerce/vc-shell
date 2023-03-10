<template>
  <div
    class="vc-col tw-flex tw-flex-col tw-min-w-0 tw-basis-0"
    :style="{ flexGrow: parseInt(size) }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { colProps } from "./vc-col-model";

defineProps(colProps);
</script>

<style lang="scss">
.vc-col {
  .vc-app_mobile & {
    @apply tw-grow #{!important};
  }
}
</style>
