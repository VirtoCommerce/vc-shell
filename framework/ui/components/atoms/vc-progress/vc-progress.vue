<template>
  <div
    :class="[
      'vc-progress tw-border-[length:var(--progressbar-border-width)] tw-border-[color:var(--progressbar-border-color)] tw-rounded-[var(--progressbar-border-radius)] tw-h-[var(--progressbar-height)] tw-transition tw-duration-200 tw-box-border tw-bg-[color:var(--progressbar-background-color)]',
      variant === 'striped' ? 'vc-progress--striped' : '',
    ]"
  >
    <div
      class="vc-progress__value tw-bg-[color:var(--progressbar-foreground-color)] tw-transition tw-duration-200 tw-h-full"
      :style="`width: ${value}%`"
    ></div>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  value?: number;
  variant?: "default" | "striped";
}

withDefaults(defineProps<Props>(), {
  value: 0,
  variant: "default",
});
</script>

<style lang="scss">
:root {
  --progressbar-height: 16px;
  --progressbar-border-radius: 2px;
  --progressbar-background-color: var(--additional-50);
  --progressbar-foreground-color: var(--accent-200);
  --progressbar-border-width: 1px;
  --progressbar-border-color: var(--neutrals-200);
  --progressbar-striped-bg: linear-gradient(
        45deg,
        transparent 50%,
        var(--accent-200) 50%,
        var(--accent-200) 75%,
        transparent 75%
      )
      left/30px 30px repeat-x,
    var(--accent-50);
  --progressbar-striped-color: var(--accent-200);
}

@keyframes change {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 30px 0;
  }
}

.vc-progress {
  &--striped {
    .vc-progress__value {
      background: var(--progressbar-striped-bg);
      animation: change 1s linear infinite;
    }
  }
}
</style>
