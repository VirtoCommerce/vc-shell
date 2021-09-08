<template>
  <div class="vc-progress">
    <div class="vc-progress__value" :style="`width: ${value}%`"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcProgress",

  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
});
</script>

<style lang="less">
:root {
  --progressbar-height: 16px;
  --progressbar-border-radius: 2px;
  --progressbar-background-color: #ffffff;
  --progressbar-foreground-color: #e1eff9;
  --progressbar-border-width: 1px;
  --progressbar-border-color: #e1eff9;
}

.vc-progress {
  border: var(--progressbar-border-width) solid var(--progressbar-border-color);
  border-radius: var(--progressbar-border-radius);
  height: var(--progressbar-height);
  background-color: var(--progressbar-background-color);
  transition: all 0.2s ease;
  box-sizing: border-box;

  &__value {
    background-color: var(--progressbar-foreground-color);
    transition: all 0.2s ease;
    height: 100%;
  }
}
</style>
