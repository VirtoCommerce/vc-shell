<template>
  <div
    v-if="imgData && imgData.quantity > 0"
    class="tw-min-w-0 tw-max-w-full tw-block tw-w-[48px] tw-border tw-border-solid tw-border-[--image-border-color] tw-rounded-[3px] tw-relative"
  >
    <!-- Single Image -->
    <template v-if="imgData.quantity === 1">
      <div
        class="tw-w-full tw-h-full tw-pb-[100%]"
        :style="imageHandler(imgData.srcArr[0])"
      ></div>
    </template>

    <!-- Two Images -->
    <template v-else-if="imgData.quantity === 2">
      <div class="tw-flex tw-w-full tw-h-full tw-gap-[2px]">
        <div
          class="tw-w-1/2 tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div
          class="tw-w-1/2 tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[1])"
        ></div>
      </div>
    </template>

    <!-- Three Images -->
    <template v-else-if="imgData.quantity === 3">
      <div class="tw-flex tw-w-full tw-h-full tw-gap-[2px]">
        <div
          class="tw-w-1/2 tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div class="tw-w-1/2 tw-h-full tw-flex tw-flex-col tw-gap-[2px]">
          <div
            class="tw-h-1/2 tw-pb-[100%]"
            :style="imageHandler(imgData.srcArr[1])"
          ></div>
          <div
            class="tw-h-1/2 tw-pb-[100%]"
            :style="imageHandler(imgData.srcArr[2])"
          ></div>
        </div>
      </div>
    </template>

    <!-- Four or More Images -->
    <template v-else-if="imgData.quantity >= 4">
      <div class="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-gap-[2px] tw-w-full tw-h-full">
        <div
          class="tw-w-full tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[0])"
        ></div>
        <div
          class="tw-w-full tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[1])"
        ></div>
        <div
          class="tw-w-full tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[2])"
        ></div>
        <div
          class="tw-w-full tw-h-full tw-pb-[100%]"
          :style="imageHandler(imgData.srcArr[3])"
        ></div>
      </div>
    </template>
  </div>
  <!-- No Image -->
  <template v-if="imgData.quantity === 0">
    <VcImage
      size="s"
      bordered
      aspect="1x1"
    />
  </template>
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

<style lang="scss">
:root {
  --line-item-empty-image-color: var(--secondary-500);
}
</style>
