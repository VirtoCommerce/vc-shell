<template>
  <div class="vc-container">
    <div class="vc-container__inner">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcContainer",
});
</script>

<style lang="less">
:root {
  --container-scroll-color: #c5c5c5;
  --container-scroll-color-hover: #a6a6a6;
  --container-scroll-width: 8px;
}

.vc-container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  box-sizing: border-box;
  display: flex;

  &__inner {
    overflow-y: auto;
    flex: 1;
    scrollbar-color: var(--container-scroll-color);
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: var(--container-scroll-width);
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: "transparent";
    }

    &::-webkit-scrollbar-thumb {
      background: var(--container-scroll-color);
      border-radius: calc(var(--container-scroll-width) / 2);
      overflow: hidden;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--container-scroll-color-hover);
    }
  }
}
</style>
