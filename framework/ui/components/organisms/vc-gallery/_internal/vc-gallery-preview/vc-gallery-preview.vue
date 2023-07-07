<template>
  <VcPopup
    :title="currentImage.title"
    @close="$emit('close')"
  >
    <template #title>
      <div>
        <span>{{ currentImage.name }} (</span>
        <VcLink @click="copyLink(currentImage.url)">{{
          t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_PREVIEW.COPY_IMAGE_LINK")
        }}</VcLink>
        <span>)</span>
      </div>
    </template>
    <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center">
      <div class="tw-box-border p-5 tw-grow tw-basis-0 tw-w-full">
        <div
          class="bg-contain tw-bg-no-repeat tw-bg-center tw-w-full tw-h-full tw-box-border"
          :style="{ backgroundImage: 'url(' + currentImage.url + ')' }"
        ></div>
        <div
          v-if="localIndex > 0"
          class="tw-absolute tw-top-2/4 -tw-mt-9 tw-h-[72px] tw-w-[72px] tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[#f1f6fa] tw-cursor-pointer tw-text-[#a1c0d4] [--icon-size-xl: 36px] hover:tw-shadow-[0_0_20px_rgba(31,40,50,0.15)] tw-left-[25px]"
          @click="localIndex--"
        >
          <VcIcon
            icon="fas fa-arrow-left"
            size="xl"
          ></VcIcon>
        </div>
        <div
          v-if="localIndex < images.length - 1"
          class="tw-absolute tw-top-2/4 -tw-mt-9 tw-h-[72px] tw-w-[72px] tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[#f1f6fa] tw-cursor-pointer tw-text-[#a1c0d4] [--icon-size-xl: 36px] hover:tw-shadow-[0_0_20px_rgba(31,40,50,0.15)] tw-right-[25px]"
          @click="localIndex++"
        >
          <VcIcon
            icon="fas fa-arrow-right"
            size="xl"
          ></VcIcon>
        </div>
      </div>
      <div class="tw-p-4 tw-pb-[40px] tw-max-w-full tw-overflow-x-auto tw-box-border tw-shrink tw-flex">
        <div
          v-for="(item, i) in images"
          :key="i"
          class="tw-m-1 tw-opacity-60"
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
import { computed, ref, ComputedRef } from "vue";
import { VcPopup, VcLink, VcIcon, VcImage } from "../../../../";
import { IImage } from "./../../../../../../core/types";
import { useI18n } from "vue-i18n";

export interface Props {
  images?: IImage[];
  index: number | ComputedRef<number>;
}

export interface Emits {
  (event: "close"): void;
}

defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  index: 0,
});
const { t } = useI18n({ useScope: "global" });
const localIndex = ref(props.index);
const currentImage = computed(() => props.images[localIndex.value]);

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
        @apply tw-relative tw-opacity-100 after:tw-content-[""] after:tw-bg-[#43b0e6] after:tw-h-1 after:tw-w-full after:tw-rounded-[5px] after:tw-absolute after:tw-left-0 after:-tw-bottom-[12px];
      }
    }
  }
}
</style>
