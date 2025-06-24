<template>
  <div
    class="vc-loading-overlay"
    :class="{
      'vc-loading-overlay--active': active,
    }"
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
}

.vc-loading-overlay {
  @apply tw-absolute tw-items-center tw-justify-center tw-flex-col tw-z-[9998] tw-w-full tw-h-full tw-box-border tw-hidden;

  &--active {
    @apply tw-flex #{!important};
    @apply tw-backdrop-blur-[3px];
  }

  &__content {
    @apply tw-relative tw-w-36 tw-h-10 tw-z-[1];
  }

  &__main-marker {
    @apply tw-absolute tw-w-4 tw-h-4 tw-top-3 tw-left-4 tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-translate-x-0 tw-animate-loadingMarker;
  }

  &__markers {
    @apply tw-translate-x-0 tw-mt-3 tw-ml-8 tw-animate-loadingMarkers;
  }

  &__marker {
    @apply tw-block tw-float-left tw-w-4 tw-h-4 tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-ml-4;
  }
}
</style>
