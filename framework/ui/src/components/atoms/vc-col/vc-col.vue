<template>
  <div class="vc-col" :style="{ flexGrow: size }">
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

<style lang="less">
.vc-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-basis: 0;

  .vc-app_mobile & {
    flex-grow: 1 !important;
  }
}
</style>
