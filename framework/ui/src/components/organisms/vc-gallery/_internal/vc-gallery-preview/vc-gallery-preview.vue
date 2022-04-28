<template>
  <VcPopup :title="currentImage.title" @close="$emit('close')">
    <template v-slot:title>
      <div>
        <span>{{ currentImage.name }} (</span>
        <VcLink @click="copyLink(currentImage.src)">copy image link</VcLink>
        <span>)</span>
      </div>
    </template>
    <div class="w-full h-full box-border flex flex-col items-center">
      <div class="box-border p-5 grow w-full">
        <div
          class="bg-contain bg-no-repeat bg-center w-full h-full box-border"
          :style="{ backgroundImage: 'url(' + currentImage.url + ')' }"
        ></div>
        <div
          v-if="localIndex > 0"
          class="absolute top-2/4 -mt-9 h-[72px] w-[72px] flex items-center justify-center rounded-full bg-[#f1f6fa] cursor-pointer text-[#a1c0d4] [--icon-size-xl: 36px] hover:shadow-[0_0_20px_rgba(31,40,50,0.15)] left-[25px]"
          @click="localIndex--"
        >
          <VcIcon icon="fas fa-arrow-left" size="xl"></VcIcon>
        </div>
        <div
          v-if="localIndex < images.length - 1"
          class="absolute top-2/4 -mt-9 h-[72px] w-[72px] flex items-center justify-center rounded-full bg-[#f1f6fa] cursor-pointer text-[#a1c0d4] [--icon-size-xl: 36px] hover:shadow-[0_0_20px_rgba(31,40,50,0.15)] right-[25px]"
          @click="localIndex++"
        >
          <VcIcon icon="fas fa-arrow-right" size="xl"></VcIcon>
        </div>
      </div>
      <div
        class="p-4 pb-[40px] max-w-full overflow-x-auto box-border shrink flex"
      >
        <div
          v-for="(item, i) in images"
          :key="i"
          class="m-1 opacity-60"
          :class="{
            'vc-gallery-preview__images-item_current': i === localIndex,
          }"
        >
          <VcImage
            :src="item.url"
            size="xl"
            :bordered="true"
            :clickable="true"
            @click="localIndex = i"
          ></VcImage>
        </div>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import VcPopup from "../../../vc-popup/vc-popup.vue";

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },

  index: {
    type: Number,
    default: 0,
  },
});

const localIndex = ref(props.index);
const currentImage = computed(() => props.images[localIndex.value] || {});

const copyLink = (link: string) => {
  if (link.charAt(0) === "/") {
    navigator.clipboard?.writeText(`${location.origin}${link}`);
  } else {
    navigator.clipboard?.writeText(link);
  }
};
</script>

<style lang="scss">
.vc-gallery-preview {
  &__images {
    &-item {
      &_current {
        @apply relative opacity-100 after:content-[""] after:bg-[#43b0e6] after:h-1 after:w-full after:rounded-[5px] after:absolute after:left-0 after:-bottom-[12px];
      }
    }
  }
}
</style>
