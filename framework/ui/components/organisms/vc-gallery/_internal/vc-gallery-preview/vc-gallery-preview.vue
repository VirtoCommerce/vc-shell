<template>
  <VcPopup
    v-if="currentImage"
    is-mobile-fullscreen
    is-fullscreen
    modal-width="vc-gallery-preview__modal"
    @close="$emit('close')"
  >
    <template #header>
      <div class="vc-gallery-preview__header">
        <VcIcon
          icon="lucide-image"
          size="m"
          class="vc-gallery-preview__header-icon"
        />
        <span
          class="vc-gallery-preview__filename"
          :title="currentImage.name"
        >
          {{ currentImage.name }}
        </span>
        <button
          type="button"
          class="vc-gallery-preview__action-btn"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_PREVIEW.COPY_IMAGE_LINK')"
          @click="onCopyLink"
        >
          <VcIcon
            :icon="copied ? 'lucide-check' : 'lucide-link'"
            size="s"
          />
        </button>
      </div>
    </template>

    <template #content>
      <div class="vc-gallery-preview__body">
        <!-- Main image swiper -->
        <div class="vc-gallery-preview__stage">
          <Swiper
            :modules="mainModules"
            :initial-slide="localIndex"
            :space-between="0"
            :keyboard="{ enabled: true }"
            :simulate-touch="true"
            :grab-cursor="true"
            class="vc-gallery-preview__main-swiper"
            @swiper="onMainSwiperInit"
            @slide-change="onMainSlideChange"
          >
            <SwiperSlide
              v-for="(image, i) in images"
              :key="i"
              class="vc-gallery-preview__slide"
            >
              <img
                :src="image.url"
                :alt="image.altText || image.name || ''"
                loading="lazy"
                class="vc-gallery-preview__image"
              />
            </SwiperSlide>
          </Swiper>

          <!-- Nav buttons (desktop only) -->
          <template v-if="!isMobile">
            <button
              v-if="localIndex > 0"
              type="button"
              class="vc-gallery-preview__nav vc-gallery-preview__nav--prev"
              @click="slidePrev"
            >
              <VcIcon
                icon="lucide-chevron-left"
                size="l"
              />
            </button>
            <button
              v-if="localIndex < images.length - 1"
              type="button"
              class="vc-gallery-preview__nav vc-gallery-preview__nav--next"
              @click="slideNext"
            >
              <VcIcon
                icon="lucide-chevron-right"
                size="l"
              />
            </button>
          </template>
        </div>

        <!-- Thumbnail swiper -->
        <div
          v-if="images.length > 1"
          class="vc-gallery-preview__filmstrip"
        >
          <Swiper
            :modules="thumbModules"
            :slides-per-view="'auto'"
            :space-between="6"
            :center-insufficient-slides="true"
            :slide-to-clicked-slide="true"
            :free-mode="{ enabled: true, sticky: false }"
            class="vc-gallery-preview__thumb-swiper"
            @swiper="onThumbSwiperInit"
          >
            <SwiperSlide
              v-for="(item, i) in images"
              :key="i"
              class="vc-gallery-preview__thumb-slide"
            >
              <button
                type="button"
                class="vc-gallery-preview__thumb"
                :class="{ 'vc-gallery-preview__thumb--active': i === localIndex }"
                @click="slideTo(i)"
              >
                <img
                  :src="item.url"
                  :alt="item.name || ''"
                  loading="lazy"
                  class="vc-gallery-preview__thumb-img"
                />
              </button>
            </SwiperSlide>
          </Swiper>
          <span class="vc-gallery-preview__counter"> {{ localIndex + 1 }}&thinsp;/&thinsp;{{ images.length }} </span>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Keyboard, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { VcPopup } from "@ui/components/organisms/vc-popup";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { useI18n } from "vue-i18n";
import { useResponsive } from "@framework/core/composables/useResponsive";

export interface Props {
  images?: AssetLike[];
  index: number;
}

export interface Emits {
  (event: "close"): void;
}

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  index: 0,
});
const { t } = useI18n({ useScope: "global" });
const { isMobile } = useResponsive();
const localIndex = ref(props.index);
const copied = ref(false);

const mainModules = [Keyboard];
const thumbModules = [FreeMode];

const mainSwiper = ref<SwiperType>();
const thumbSwiper = ref<SwiperType>();

const currentImage = computed(() => props.images[localIndex.value]);

watch(
  () => props.index,
  (nextIndex) => {
    localIndex.value = nextIndex;
    mainSwiper.value?.slideTo(nextIndex);
  },
);

function onMainSwiperInit(swiper: SwiperType) {
  mainSwiper.value = swiper;
}

function onThumbSwiperInit(swiper: SwiperType) {
  thumbSwiper.value = swiper;
}

function onMainSlideChange(swiper: SwiperType) {
  localIndex.value = swiper.activeIndex;
  // Sync thumbnail swiper to keep active thumb visible
  thumbSwiper.value?.slideTo(swiper.activeIndex);
}

function slideTo(index: number) {
  mainSwiper.value?.slideTo(index);
}

function slidePrev() {
  mainSwiper.value?.slidePrev();
}

function slideNext() {
  mainSwiper.value?.slideNext();
}

function onCopyLink() {
  const link = currentImage.value?.url ?? "";
  const fullLink = link.charAt(0) === "/" ? `${location.origin}${link}` : link;
  navigator.clipboard?.writeText(fullLink);

  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  // Prevent page scroll behind preview
  document.body.style.overflow = "hidden";
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
  document.body.style.overflow = "";
});
</script>

<style lang="scss">
:root {
  --gp-stage-bg: var(--neutrals-50);
  --gp-nav-size: 44px;
  --gp-nav-bg: rgba(255, 255, 255, 0.92);
  --gp-nav-color: var(--secondary-700);
  --gp-nav-shadow: 0 1px 6px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04);
  --gp-thumb-ring: var(--primary-400);
  --gp-thumb-size: 56px;
  --gp-border: var(--secondary-200);
  --gp-counter-color: var(--secondary-500);
  --gp-header-icon: var(--secondary-400);
  --gp-action-btn-bg: var(--neutrals-100);
  --gp-action-btn-hover: var(--neutrals-200);
  --gp-action-btn-color: var(--secondary-600);
  --gp-copied-color: var(--success-500);
}

/* ---------- Header ---------- */
.vc-gallery-preview {
  &__header {
    @apply tw-flex tw-items-center tw-gap-2 tw-min-w-0 tw-mr-2;
  }

  &__header-icon {
    @apply tw-shrink-0;
    color: var(--gp-header-icon);
  }

  &__filename {
    @apply tw-font-medium tw-truncate tw-min-w-0;
  }

  &__action-btn {
    @apply tw-shrink-0 tw-flex tw-items-center tw-justify-center
      tw-w-7 tw-h-7 tw-rounded tw-border-0 tw-cursor-pointer
      tw-transition-colors tw-duration-150;
    background: var(--gp-action-btn-bg);
    color: var(--gp-action-btn-color);

    &:hover {
      background: var(--gp-action-btn-hover);
    }
  }

  &__action-btn .vc-icon--lucide-check {
    color: var(--gp-copied-color);
  }

  /* ---------- Body ---------- */
  &__body {
    @apply tw-flex tw-flex-col tw-h-full tw-min-h-0;
    min-width: 0;
    overflow: hidden;
  }

  /* ---------- Image stage ---------- */
  &__stage {
    @apply tw-relative tw-flex tw-items-center tw-justify-center
      tw-flex-1 tw-min-h-0 tw-overflow-hidden;
    background: var(--gp-stage-bg);
    border-top: 1px solid var(--gp-border);
  }

  &__main-swiper {
    @apply tw-w-full tw-h-full;
    position: absolute;
    inset: 0;
  }

  &__slide {
    @apply tw-flex tw-items-center tw-justify-center tw-h-full;
  }

  &__image {
    @apply tw-max-w-full tw-max-h-full tw-object-contain tw-select-none tw-p-4;

    @media (min-width: 768px) {
      @apply tw-p-8;
    }
  }

  /* ---------- Nav buttons (desktop) ---------- */
  &__nav {
    @apply tw-absolute tw-top-1/2 -tw-translate-y-1/2
      tw-flex tw-items-center tw-justify-center
      tw-rounded-full tw-cursor-pointer tw-border-0
      tw-opacity-0 tw-transition-all tw-duration-200;
    width: var(--gp-nav-size);
    height: var(--gp-nav-size);
    background: var(--gp-nav-bg);
    color: var(--gp-nav-color);
    box-shadow: var(--gp-nav-shadow);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 2;

    &--prev {
      @apply tw-left-4;
    }

    &--next {
      @apply tw-right-4;
    }

    &:hover {
      @apply tw-opacity-100 tw-scale-105;
    }

    &:active {
      @apply tw-scale-95;
    }
  }

  &__stage:hover &__nav {
    @apply tw-opacity-100;
  }

  /* ---------- Filmstrip (thumbnails) ---------- */
  &__filmstrip {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-shrink-0;
    background: var(--popup-bg, #fff);
    border-top: 1px solid var(--gp-border);
  }

  &__thumb-swiper {
    @apply tw-flex-1 tw-min-w-0 tw-overflow-hidden;
  }

  &__thumb-slide {
    width: var(--gp-thumb-size) !important;
  }

  &__thumb {
    @apply tw-shrink-0 tw-rounded-md tw-overflow-hidden
      tw-cursor-pointer tw-border-2 tw-border-solid
      tw-p-0 tw-bg-transparent
      tw-opacity-60 tw-transition-all tw-duration-200;
    width: var(--gp-thumb-size);
    height: var(--gp-thumb-size);
    border-color: var(--gp-border);
    display: block;

    &:hover {
      @apply tw-opacity-90;
    }

    &--active {
      @apply tw-opacity-100;
      border-color: var(--gp-thumb-ring);
    }
  }

  &__thumb-img {
    @apply tw-w-full tw-h-full tw-object-cover;
  }

  &__counter {
    @apply tw-text-xs tw-shrink-0 tw-tabular-nums tw-font-medium;
    color: var(--gp-counter-color);
  }
}
</style>
