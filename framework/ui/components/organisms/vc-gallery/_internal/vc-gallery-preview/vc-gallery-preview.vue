<template>
  <VcPopup
    v-if="currentImage"
    :title="currentImage?.title"
    is-mobile-fullscreen
    is-fullscreen
    modal-width="tw-w-full"
    @close="$emit('close')"
    @keydown.passive="handleKeyDown"
  >
    <template #header>
      <div>
        <span>{{ currentImage.name }} (</span>
        <VcLink @click="copyLink(currentImage.url ?? '')">{{
          t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_PREVIEW.COPY_IMAGE_LINK")
        }}</VcLink>
        <span>)</span>
      </div>
    </template>
    <template #content>
      <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center">
        <div class="tw-box-border p-5 tw-grow tw-basis-0 tw-w-full">
          <div
            class="tw-w-full tw-h-full tw-box-border"
            :style="imageHandler"
          ></div>
          <button
            v-if="localIndex > 0"
            class="tw-absolute tw-top-2/4 -tw-mt-9 tw-h-[72px] tw-w-[72px] tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[--gallery-preview-btn-bg-color] tw-cursor-pointer tw-text-[color:var(--gallery-preview-btn-icon-color)] [--icon-size-xl: 36px] hover:[box-shadow:var(--gallery-preview-btn-shadow)] tw-left-[25px]"
            @click="localIndex--"
          >
            <VcIcon
              icon="fas fa-arrow-left"
              size="xl"
            ></VcIcon>
          </button>
          <button
            v-if="localIndex < images.length - 1"
            class="tw-absolute tw-top-2/4 -tw-mt-9 tw-h-[72px] tw-w-[72px] tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-[--gallery-preview-btn-bg-color] tw-cursor-pointer tw-text-[color:var(--gallery-preview-btn-icon-color)] [--icon-size-xl: 36px] hover:[box-shadow:var(--gallery-preview-btn-shadow)] tw-right-[25px]"
            @click="localIndex++"
          >
            <VcIcon
              icon="fas fa-arrow-right"
              size="xl"
            ></VcIcon>
          </button>
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
              background="contain"
              :bordered="true"
              :clickable="true"
              @click="localIndex = i"
            ></VcImage>
          </div>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { VcPopup, VcLink, VcIcon, VcImage } from "../../../../";
import { ICommonAsset } from "./../../../../../../core/types";
import { useI18n } from "vue-i18n";

export interface Props {
  images?: ICommonAsset[];
  index: number;
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

const imageHandler = computed(() => {
  if (currentImage.value.url) {
    return `background: url(${CSS.escape(currentImage.value.url)}) center / contain no-repeat`;
  }
  return undefined;
});

const currentImage = computed(() => props.images[localIndex.value]);

const copyLink = (link: string) => {
  if (link.charAt(0) === "/") {
    navigator.clipboard?.writeText(`${location.origin}${link}`);
  } else {
    navigator.clipboard?.writeText(link);
  }
};

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowLeft" && localIndex.value > 0) {
    localIndex.value--;
  } else if (event.key === "ArrowRight" && localIndex.value < props.images.length - 1) {
    localIndex.value++;
  }
}
</script>

<style lang="scss">
:root {
  --gallery-preview-btn-bg-color: var(--secondary-50);
  --gallery-preview-btn-icon-color: var(--secondary-400);
  --gallery-preview-btn-shadow-color: var(--neutrals-900);
  --gallery-preview-btn-shadow: 0 0 20px rgb(from var(--gallery-preview-btn-shadow-color) r g b / 15%);
  --gallery-preview-overlay-color: var(--primary-400);
}

.vc-gallery-preview {
  &__images {
    &-item {
      &_current {
        @apply tw-relative tw-opacity-100 after:tw-content-[""] after:tw-bg-[--gallery-preview-overlay-color] after:tw-h-1 after:tw-w-full after:tw-rounded-[5px] after:tw-absolute after:tw-left-0 after:-tw-bottom-[12px];
      }
    }
  }
}
</style>
