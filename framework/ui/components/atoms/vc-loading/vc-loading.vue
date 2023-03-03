<template>
  <div
    class="tw-absolute tw-items-center tw-justify-center tw-flex-col tw-z-[9998] tw-hidden tw-w-full tw-h-full tw-box-border"
    :class="{
      '!tw-flex tw-backdrop-blur-[3px] tw-bg-[rgba(255, 255, 255, 0.5)]': active,
    }"
  >
    <div class="tw-relative tw-w-[142px] tw-h-[40px] tw-z-[1]">
      <span
        class="tw-absolute tw-w-4 tw-h-4 tw-top-[12px] tw-left-[15px] tw-bg-[#319ed4] tw-rounded-full tw-translate-x-0 tw-animate-loadingMarker"
      ></span>
      <div class="tw-translate-x-0 tw-mt-3 tw-ml-[31px] tw-animate-loadingMarkers">
        <span
          class="tw-block tw-float-left tw-w-4 tw-h-4 tw-bg-[#319ed4] tw-rounded-full tw-ml-4"
          v-for="item in 3"
          :key="`marker_${item}`"
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcLoadingProps } from "./vc-loading-model";

withDefaults(defineProps<VcLoadingProps>(), {
  active: false,
});
</script>
