<template>
  <div
    :class="[
      'border border-[length:var(--progressbar-border-width)] border-[color:var(--progressbar-border-color)] rounded-[var(--progressbar-border-radius)] h-[var(--progressbar-height)] transition duration-200 box-border bg-[color:var(--progressbar-background-color)]',
      variant,
    ]"
  >
    <div
      class="bg-[color:var(--progressbar-foreground-color)] transition duration-200 h-full"
      :style="`width: ${value}%`"
    ></div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  value: {
    type: Number,
    default: 0,
  },

  variant: {
    type: String,
    default: "default",
    enum: ["default", "striped"],
  },
});
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
