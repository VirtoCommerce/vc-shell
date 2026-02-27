<template>
  <VcPopup
    v-if="currentImage"
    is-mobile-fullscreen
    modal-width="vc-gallery-preview__modal"
    @close="$emit('close')"
  >
    <template #header>
      <div class="vc-gallery-preview__header">
        <VcIcon
          icon="material-image"
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
            :icon="copied ? 'material-check' : 'material-link'"
            size="s"
          />
        </button>
      </div>
    </template>

    <template #content>
      <div class="vc-gallery-preview__body">
        <!-- Image viewing area -->
        <div class="vc-gallery-preview__stage">
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

          <!-- Nav: previous -->
          <button
            v-if="localIndex > 0"
            type="button"
            class="vc-gallery-preview__nav vc-gallery-preview__nav--prev"
            @click="localIndex--"
          >
            <VcIcon icon="material-chevron_left" size="l" />
          </button>

          <!-- Nav: next -->
          <button
            v-if="localIndex < images.length - 1"
            type="button"
            class="vc-gallery-preview__nav vc-gallery-preview__nav--next"
            @click="localIndex++"
          >
            <VcIcon icon="material-chevron_right" size="l" />
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="images.length > 1"
          class="vc-gallery-preview__filmstrip"
        >
          <div class="vc-gallery-preview__thumbs">
            <button
              v-for="(item, i) in images"
              :key="i"
              type="button"
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
            {{ localIndex + 1 }}&thinsp;/&thinsp;{{ images.length }}
          </span>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { VcPopup, VcIcon } from "@ui/components";
import type { ICommonAsset } from "@core/types";
import { useI18n } from "vue-i18n";

export interface Props {
  images?: ICommonAsset[];
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
const localIndex = ref(props.index);
const copied = ref(false);

const currentImage = computed(() => props.images[localIndex.value]);

watch(
  () => props.index,
  (nextIndex) => {
    localIndex.value = nextIndex;
  },
);

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
  if (event.key === "ArrowLeft" && localIndex.value > 0) {
    localIndex.value--;
  } else if (event.key === "ArrowRight" && localIndex.value < props.images.length - 1) {
    localIndex.value++;
  } else if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
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

/* ---------- Modal sizing ---------- */
.vc-gallery-preview__modal {
  width: 90vw;
  max-width: 1400px;
  height: calc(90vh - 40px);

  /* Override VcPopup internals: remove padding so preview goes edge-to-edge,
     and stretch content to full panel height */
  .vc-popup__content {
    @apply tw-p-0 tw-min-h-0 tw-flex-col;
  }

  .vc-popup__content-inner {
    @apply tw-items-stretch tw-min-h-0;
  }

  .vc-popup__content-wrapper {
    @apply tw-self-stretch tw-flex-col tw-min-h-0;
  }
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

  /* Copied state: icon turns green */
  &__action-btn .vc-icon--material-check {
    color: var(--gp-copied-color);
  }

  /* ---------- Body ---------- */
  &__body {
    @apply tw-flex tw-flex-col tw-h-full tw-min-h-0;
  }

  /* ---------- Image stage ---------- */
  &__stage {
    @apply tw-relative tw-flex tw-items-center tw-justify-center
      tw-flex-1 tw-min-h-0 tw-overflow-hidden;
    background: var(--gp-stage-bg);
    border-top: 1px solid var(--gp-border);
  }

  &__image {
    @apply tw-max-w-full tw-max-h-full tw-object-contain tw-select-none tw-p-8;
  }

  /* ---------- Nav buttons ---------- */
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

  @media (hover: none) {
    &__nav {
      @apply tw-opacity-100;
    }
  }

  /* ---------- Filmstrip ---------- */
  &__filmstrip {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-shrink-0;
    background: var(--popup-bg, #fff);
    border-top: 1px solid var(--gp-border);
  }

  &__thumbs {
    @apply tw-flex tw-gap-1.5 tw-overflow-x-auto tw-flex-1;
    -webkit-overflow-scrolling: touch;

    /* Hide scrollbar */
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__thumb {
    @apply tw-shrink-0 tw-rounded-md tw-overflow-hidden
      tw-cursor-pointer tw-border-2 tw-border-solid
      tw-p-0 tw-bg-transparent
      tw-opacity-60 tw-transition-all tw-duration-200;
    width: var(--gp-thumb-size);
    height: var(--gp-thumb-size);
    border-color: var(--gp-border);

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

/* ---------- Crossfade transition ---------- */
.vc-gallery-preview-fade-enter-active,
.vc-gallery-preview-fade-leave-active {
  transition: opacity 180ms ease;
}
.vc-gallery-preview-fade-enter-from,
.vc-gallery-preview-fade-leave-to {
  opacity: 0;
}
</style>
