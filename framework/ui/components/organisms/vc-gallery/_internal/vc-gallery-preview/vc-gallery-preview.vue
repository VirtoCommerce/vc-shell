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
      <div class="vc-gallery-preview__header">
        <span class="vc-gallery-preview__filename">{{ currentImage.name }}</span>
        <VcLink @click="copyLink(currentImage.url ?? '')">
          {{ t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_PREVIEW.COPY_IMAGE_LINK") }}
        </VcLink>
      </div>
    </template>
    <template #content>
      <div class="vc-gallery-preview__content">
        <div class="vc-gallery-preview__image-container">
          <!-- Crossfade transition -->
          <Transition
            name="vc-gallery-preview-fade"
            mode="out-in"
          >
            <img
              :key="localIndex"
              :src="currentImage.url"
              :alt="currentImage.altText || currentImage.name || ''"
              class="vc-gallery-preview__image"
            />
          </Transition>

          <!-- Nav buttons — visible on hover -->
          <button
            v-if="localIndex > 0"
            class="vc-gallery-preview__nav-btn vc-gallery-preview__nav-btn--left"
            @click="localIndex--"
          >
            <VcIcon
              icon="material-arrow_back"
              size="l"
            />
          </button>
          <button
            v-if="localIndex < images.length - 1"
            class="vc-gallery-preview__nav-btn vc-gallery-preview__nav-btn--right"
            @click="localIndex++"
          >
            <VcIcon
              icon="material-arrow_forward"
              size="l"
            />
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="images.length > 1"
          class="vc-gallery-preview__thumbnails"
        >
          <div class="vc-gallery-preview__thumb-strip">
            <button
              v-for="(item, i) in images"
              :key="i"
              class="vc-gallery-preview__thumb"
              :class="{ 'vc-gallery-preview__thumb--active': i === localIndex }"
              @click="localIndex = i"
            >
              <img
                :src="item.url"
                :alt="item.name || ''"
                class="vc-gallery-preview__thumb-img"
              />
            </button>
          </div>
          <span class="vc-gallery-preview__counter">
            {{ localIndex + 1 }} / {{ images.length }}
          </span>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { VcPopup, VcLink, VcIcon } from "@ui/components";
import { ICommonAsset } from "@core/types";
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

const currentImage = computed(() => props.images[localIndex.value]);

const copyLink = (link: string) => {
  const fullLink = link.charAt(0) === "/" ? `${location.origin}${link}` : link;
  navigator.clipboard?.writeText(fullLink);
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
  --gallery-preview-bg: rgba(0, 0, 0, 0.95);
  --gallery-preview-nav-size: 40px;
  --gallery-preview-nav-bg: rgba(255, 255, 255, 0.9);
  --gallery-preview-nav-icon: var(--secondary-600);
  --gallery-preview-nav-shadow: 0 2px 12px rgb(0 0 0 / 0.2);
  --gallery-preview-thumb-ring: var(--primary-400);
  --gallery-preview-counter-color: var(--secondary-400);
}

.vc-gallery-preview {
  &__header {
    @apply tw-flex tw-items-center tw-gap-2;
  }

  &__filename {
    @apply tw-font-medium;
  }

  &__content {
    @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center;
    background: var(--gallery-preview-bg);
  }

  &__image-container {
    @apply tw-grow tw-basis-0 tw-w-full tw-p-6 tw-relative tw-flex tw-items-center tw-justify-center;
  }

  &__image {
    @apply tw-max-w-full tw-max-h-full tw-object-contain tw-select-none;
  }

  &__nav-btn {
    @apply tw-absolute tw-top-1/2 -tw-translate-y-1/2
      tw-flex tw-items-center tw-justify-center
      tw-rounded-full tw-cursor-pointer tw-border-0
      tw-opacity-0 tw-transition-opacity tw-duration-200;
    width: var(--gallery-preview-nav-size);
    height: var(--gallery-preview-nav-size);
    background: var(--gallery-preview-nav-bg);
    color: var(--gallery-preview-nav-icon);
    box-shadow: var(--gallery-preview-nav-shadow);
    backdrop-filter: blur(8px);

    &--left {
      @apply tw-left-4;
    }

    &--right {
      @apply tw-right-4;
    }

    &:hover {
      @apply tw-opacity-100;
    }
  }

  &__image-container:hover &__nav-btn {
    @apply tw-opacity-100;
  }

  @media (hover: none) {
    &__nav-btn {
      @apply tw-opacity-100;
    }
  }

  &__thumbnails {
    @apply tw-flex tw-items-center tw-gap-4 tw-px-4 tw-pb-4 tw-pt-2 tw-w-full tw-box-border;
  }

  &__thumb-strip {
    @apply tw-flex tw-gap-2 tw-overflow-x-auto tw-flex-1;
    -webkit-overflow-scrolling: touch;
  }

  &__thumb {
    @apply tw-shrink-0 tw-w-16 tw-h-16 tw-rounded-md tw-overflow-hidden
      tw-cursor-pointer tw-border-2 tw-border-solid tw-border-transparent
      tw-opacity-50 tw-transition-all tw-duration-200 tw-p-0 tw-bg-transparent;

    &--active {
      @apply tw-opacity-100;
      border-color: var(--gallery-preview-thumb-ring);
      transform: scale(1.05);
    }

    &:hover {
      @apply tw-opacity-80;
    }
  }

  &__thumb-img {
    @apply tw-w-full tw-h-full tw-object-cover;
  }

  &__counter {
    @apply tw-text-sm tw-shrink-0 tw-tabular-nums;
    color: var(--gallery-preview-counter-color);
  }
}

.vc-gallery-preview-fade-enter-active,
.vc-gallery-preview-fade-leave-active {
  transition: opacity 200ms ease;
}
.vc-gallery-preview-fade-enter-from,
.vc-gallery-preview-fade-leave-to {
  opacity: 0;
}
</style>
