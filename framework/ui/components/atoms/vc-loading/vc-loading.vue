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
    <div class="vc-loading-overlay__content">
      <span class="vc-loading-overlay__main-marker"></span>
      <div class="vc-loading-overlay__markers">
        <span
          v-for="item in 3"
          :key="`marker_${item}`"
          class="vc-loading-overlay__marker"
        ></span>
      </div>
      <span class="tw-sr-only">{{ active ? 'Loading...' : '' }}</span>
    </div>
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
  --loading-marker-color: var(--primary-500);
  --loading-overlay-bg: rgba(255, 255, 255, 0.6);
  --loading-marker-size: 16px;
  --loading-z-index: 9998;
}

.vc-loading-overlay {
  @apply tw-absolute tw-items-center tw-justify-center tw-flex-col tw-w-full tw-h-full tw-box-border tw-hidden;
  z-index: var(--loading-z-index);

  &--active {
    @apply tw-flex #{!important};
    @apply tw-backdrop-blur-[3px];
    background-color: var(--loading-overlay-bg);
  }

  &__content {
    @apply tw-relative tw-w-36 tw-h-10 tw-z-[1];
  }

  &__main-marker {
    @apply tw-absolute tw-top-3 tw-left-4 tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-translate-x-0 tw-animate-loadingMarker;
    width: var(--loading-marker-size);
    height: var(--loading-marker-size);
  }

  &__markers {
    @apply tw-translate-x-0 tw-mt-3 tw-ml-8 tw-animate-loadingMarkers;
  }

  &__marker {
    @apply tw-block tw-float-left tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-ml-4;
    width: var(--loading-marker-size);
    height: var(--loading-marker-size);
  }
}
</style>
