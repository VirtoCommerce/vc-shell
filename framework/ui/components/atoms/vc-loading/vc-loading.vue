<template>
  <div
    class="vc-loading-overlay"
    :class="{
      'vc-loading-overlay--active': active,
    }"
    role="status"
    :aria-busy="active"
    aria-live="polite"
  >
    <div class="vc-loading-overlay__bar">
      <div class="vc-loading-overlay__bar-fill"></div>
    </div>
    <span class="tw-sr-only">{{ active ? "Loading..." : "" }}</span>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  active?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
:root {
  --loading-bar-color: var(--primary-500);
  --loading-bar-track: var(--primary-100);
  --loading-overlay-bg: rgba(255, 255, 255, 0.6);
  --loading-bar-width: 140px;
  --loading-bar-height: 4px;
  --loading-z-index: 9998;
}

.vc-loading-overlay {
  @apply tw-absolute tw-items-center tw-justify-center tw-w-full tw-h-full tw-box-border tw-hidden;
  z-index: var(--loading-z-index);

  &--active {
    @apply tw-flex #{!important};
    @apply tw-backdrop-blur-[3px];
    background-color: var(--loading-overlay-bg);
  }

  &__bar {
    width: var(--loading-bar-width);
    height: var(--loading-bar-height);
    border-radius: 9999px;
    background: var(--loading-bar-track);
    overflow: hidden;
    position: relative;
  }

  &__bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 40%;
    border-radius: 9999px;
    background: linear-gradient(90deg, var(--loading-bar-track), var(--loading-bar-color));
    animation: vc-bar-sweep 1.5s ease-in-out infinite;
  }
}

@keyframes vc-bar-sweep {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}
</style>
