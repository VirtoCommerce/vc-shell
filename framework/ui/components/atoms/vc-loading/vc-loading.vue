<template>
  <div
    class="tw-absolute tw-items-center tw-justify-center tw-flex-col tw-z-[9998] tw-hidden tw-w-full tw-h-full tw-box-border"
    :class="{
      '!tw-flex tw-backdrop-blur-[3px] tw-bg-[color:var(--loading-overlay-bg)]': active,
    }"
  >
    <div class="tw-relative tw-w-[142px] tw-h-[40px] tw-z-[1]">
      <span
        class="tw-absolute tw-w-4 tw-h-4 tw-top-[12px] tw-left-[15px] tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-translate-x-0 tw-animate-loadingMarker"
      ></span>
      <div class="tw-translate-x-0 tw-mt-3 tw-ml-[31px] tw-animate-loadingMarkers">
        <span
          v-for="item in 3"
          :key="`marker_${item}`"
          class="tw-block tw-float-left tw-w-4 tw-h-4 tw-bg-[color:var(--loading-marker-color)] tw-rounded-full tw-ml-4"
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
  --loading-overlay-bg: rgba(255, 255, 255, 0.5);
}
</style>
