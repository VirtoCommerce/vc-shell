<template>
  <div
    :class="[
      'vc-progress tw-border tw-border-[length:var(--progressbar-border-width)] tw-border-[color:var(--progressbar-border-color)] tw-rounded-[var(--progressbar-border-radius)] tw-h-[var(--progressbar-height)] tw-transition  tw-duration-200 tw-box-border tw-bg-[color:var(--progressbar-background-color)]',
      variant,
    ]"
  >
    <div
      class="vc-progress__value tw-bg-[color:var(--progressbar-foreground-color)] tw-transition tw-duration-200 tw-h-full"
      :style="`width: ${value}%`"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { progressProps } from "./vc-progress-model";

defineProps(progressProps);
</script>

<style lang="scss">
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
  &.striped {
    .vc-progress__value {
      background: linear-gradient(45deg, transparent 50%, #acd2f2 50%, #acd2f2 75%, transparent 75%) left/30px 30px
          repeat-x,
        #e1f0fe;
      animation: change 1s linear infinite;
    }
  }
}
</style>
