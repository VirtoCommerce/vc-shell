<template>
  <div
    v-if="imgData"
    class="tw-w-12 tw-h-12 tw-border tw-border-solid tw-border-[#efefef] tw-rounded-[3px] tw-relative"
  >
    <!-- Single Image -->
    <template v-if="imgData.quantity === 1">
      <div
        class="tw-w-full tw-h-full"
        :style="imageHandler(imgData.srcArr[0])"
      ></div>
    </template>

    <!-- Two Images -->
    <template v-else-if="imgData.quantity === 2">
      <div class="tw-flex tw-w-full tw-h-full tw-gap-[2px]">
        <div
          class="tw-w-1/2 tw-h-full"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div
          class="tw-w-1/2 tw-h-full"
          :style="imageHandler(imgData.srcArr[1])"
        ></div>
      </div>
    </template>

    <!-- Three Images -->
    <template v-else-if="imgData.quantity === 3">
      <div class="tw-flex tw-w-full tw-h-full tw-gap-[2px]">
        <div
          class="tw-w-1/2 tw-h-full"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div class="tw-w-1/2 tw-h-full tw-flex tw-flex-col tw-gap-[2px]">
          <div
            class="tw-h-1/2"
            :style="imageHandler(imgData.srcArr[1])"
          ></div>
          <div
            class="tw-h-1/2"
            :style="imageHandler(imgData.srcArr[2])"
          ></div>
        </div>
      </div>
    </template>

    <!-- Four or More Images -->
    <template v-else-if="imgData.quantity >= 4">
      <div class="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-gap-[2px] tw-w-full tw-h-full">
        <div
          class="tw-w-full tw-h-full"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div
          class="tw-w-full tw-h-full"
          :style="imageHandler(imgData.srcArr[1])"
        ></div>
        <div
          class="tw-w-full tw-h-full"
          :style="imageHandler(imgData.srcArr[2])"
        ></div>
        <div
          class="tw-w-full tw-h-full"
          :style="imageHandler(imgData.srcArr[3])"
        ></div>
      </div>
    </template>

    <!-- No Image -->
    <template v-else>
      <div class="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[#83a3be]">
        <VcIcon
          icon="fas fa-image"
          size="xl"
        ></VcIcon>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { CustomerOrder } from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed } from "vue";

export interface Props {
  context: {
    item: CustomerOrder;
  };
}

const props = defineProps<Props>();

const imgData = computed(() => {
  const itemsWithImages = props.context.item.items?.filter((item) => item.imageUrl) ?? [];
  return {
    quantity: itemsWithImages.length,
    srcArr: itemsWithImages.map((item) => item.imageUrl),
  };
});

const imageHandler = (src: string | undefined) => {
  return src ? { background: `url(${CSS.escape(src)}) center / cover no-repeat` } : {};
};
</script>
