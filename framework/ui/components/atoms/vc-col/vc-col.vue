<template>
  <div
    class="vc-col tw-flex tw-flex-col tw-min-w-0 tw-basis-0"
    :style="{ flexGrow: parseInt(size) }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  size: string;
}

withDefaults(defineProps<Props>(), {
  size: "1",
});
</script>

<style lang="scss">
.vc-col {
  .vc-app_mobile & {
    @apply tw-grow #{!important};
  }
}
</style>
