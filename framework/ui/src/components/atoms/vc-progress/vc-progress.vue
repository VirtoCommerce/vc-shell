<template>
  <div :class="['vc-progress', variant]">
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

    variant: {
      type: String,
      default: "default",
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

@keyframes change {
  from {
    background-position: 0 0, left;
  }
  to {
    background-position: 30px 0, left;
  }
}

.vc-progress {
  border: var(--progressbar-border-width) solid var(--progressbar-border-color);
  border-radius: var(--progressbar-border-radius);
  height: var(--progressbar-height);
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: var(--progressbar-background-color);

  &__value {
    background-color: var(--progressbar-foreground-color);
    transition: all 0.2s ease;
    height: 100%;
  }

  &.striped {
    .vc-progress__value {
      background: linear-gradient(
            45deg,
            transparent 50%,
            #acd2f2 50%,
            #acd2f2 75%,
            transparent 75%
          )
          left/30px 30px repeat-x,
        #e1f0fe;
      animation: change 1s linear infinite;
    }
  }
}
</style>
