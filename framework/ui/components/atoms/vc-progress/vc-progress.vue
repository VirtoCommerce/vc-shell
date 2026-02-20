<template>
  <div
    class="vc-progress"
    :class="{
      'vc-progress--striped': variant === 'striped',
    }"
    role="progressbar"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <div
      class="vc-progress__value"
      :style="{ transform: `translateX(-${100 - clampedValue}%)` }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
  value?: number;
  variant?: "default" | "striped";
  /** Accessible label describing what the progress represents */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  variant: "default",
  ariaLabel: "Progress",
});

const clampedValue = computed(() => Math.max(0, Math.min(100, props.value)));
</script>

<style lang="scss">
:root {
  --progressbar-height: 8px;
  --progressbar-border-radius: 9999px;
  --progressbar-background-color: var(--neutrals-200);
  --progressbar-foreground-color: var(--primary-500);
  --progressbar-striped-bg:
    linear-gradient(45deg, transparent 50%, var(--primary-400) 50%, var(--primary-400) 75%, transparent 75%) left/30px
      30px repeat-x,
    var(--primary-500);
  --progressbar-striped-color: var(--primary-400);
}

@keyframes progress-stripe {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 30px 0;
  }
}

.vc-progress {
  @apply tw-relative tw-rounded-[var(--progressbar-border-radius)] tw-h-[var(--progressbar-height)] tw-box-border tw-bg-[color:var(--progressbar-background-color)] tw-overflow-hidden;

  &__value {
    @apply tw-bg-[color:var(--progressbar-foreground-color)] tw-h-full tw-w-full tw-rounded-[inherit];
    transition: transform 300ms ease-out;
  }

  &--striped .vc-progress__value {
    background: var(--progressbar-striped-bg);
    animation: progress-stripe 1s linear infinite;
  }
}
</style>
