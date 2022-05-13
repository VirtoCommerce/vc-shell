<template>
  <div
    class="absolute items-center justify-center flex-col z-[9998] hidden w-full h-full box-border"
    :class="{
      '!flex backdrop-blur-[3px] bg-[rgba(255, 255, 255, 0.5)]': active,
    }"
  >
    <div class="relative w-[142px] h-[40px] z-[1]">
      <span
        class="absolute w-4 h-4 top-[12px] left-[15px] bg-[#319ed4] rounded-full translate-x-0 animate-loadingMarker"
      ></span>
      <div class="translate-x-0 mt-3 ml-[31px] animate-loadingMarkers">
        <span
          class="block float-left w-4 h-4 bg-[#319ed4] rounded-full ml-4"
          v-for="item in 3"
          :key="`marker_${item}`"
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
</script>
