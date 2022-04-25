<template>
  <div class="vc-col flex flex-col min-w-0 basis-0" :style="{ flexGrow: size }">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  size: {
    type: String,
    default: "1",
  },
});
</script>

<style lang="scss">
.vc-col {
  .vc-app_mobile & {
    @apply grow #{!important};
  }
}
</style>
