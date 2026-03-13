<template>
  <div class="vc-image-upload">
    <!-- Has image: gallery-style tile -->
    <div
      v-if="image?.url"
      v-on-click-outside="deactivate"
      class="vc-image-upload__tile"
      :class="{ 'vc-image-upload__tile--active': isActive }"
      @click="onTileClick"
    >
      <!-- Skeleton shimmer -->
      <div
        v-if="!imageState.isLoaded.value"
        class="vc-image-upload__skeleton"
      />

      <!-- Image -->
      <img
        :src="image.url"
        :alt="image.altText || image.name || ''"
        class="vc-image-upload__image"
        :class="{ 'vc-image-upload__image--loaded': imageState.isLoaded.value }"
        @load="imageState.onLoad"
        @error="imageState.onError"
      />

      <!-- Slide-up tray -->
      <div class="vc-image-upload__tray">
        <div class="vc-image-upload__tray-actions">
          <button
            v-if="previewable"
            type="button"
            class="vc-image-upload__action-btn"
            :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN')"
            @click.stop="onPreviewClick"
          >
            <VcIcon
              icon="lucide-maximize"
              size="s"
            />
          </button>
          <button
            v-if="removable && !disabled"
            type="button"
            class="vc-image-upload__action-btn vc-image-upload__action-btn--danger"
            :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE')"
            @click.stop="emit('remove', image)"
          >
            <VcIcon
              icon="lucide-trash-2"
              size="s"
            />
          </button>
        </div>
        <div
          class="vc-image-upload__tray-name"
          :title="image.name"
        >
          {{ image.name }}
        </div>
      </div>
    </div>

    <!-- No image: show upload zone -->
    <VcFileUpload
      v-else-if="!disabled"
      :icon="icon"
      :multiple="false"
      :rules="rules"
      :name="name"
      :loading="loading"
      :accept="accept"
      :custom-text="placeholderText"
      @upload="(files: FileList) => emit('upload', files)"
    />

    <!-- Disabled + no image -->
    <div
      v-else
      class="vc-image-upload__empty"
    >
      <VcHint>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.GALLERY_IS_EMPTY") }}</VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRef } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import type { ICommonAsset, IValidationRules } from "@core/types";
import { VcFileUpload } from "@ui/components/molecules/vc-file-upload";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useI18n } from "vue-i18n";
import { useImageLoad } from "@ui/components/organisms/vc-gallery/composables/useImageLoad";
import { useGalleryPreview } from "@ui/components/organisms/vc-gallery/composables/useGalleryPreview";

export interface Props {
  image?: ICommonAsset;
  disabled?: boolean;
  loading?: boolean;
  accept?: string;
  rules?: keyof IValidationRules | IValidationRules;
  name?: string;
  icon?: string;
  placeholder?: { text: string; link: string };
  previewable?: boolean;
  removable?: boolean;
}

export interface Emits {
  (event: "upload", files: FileList): void;
  (event: "remove", image: ICommonAsset): void;
}

const props = withDefaults(defineProps<Props>(), {
  accept: ".jpg,.png,.jpeg,.webp,.heic,.svg",
  name: "Image",
  icon: "lucide-cloud-upload",
  previewable: true,
  removable: true,
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

const imageState = useImageLoad(toRef(() => props.image?.url));
const isActive = ref(false);

const imagesArray = computed(() => (props.image ? [props.image] : []));
const preview = useGalleryPreview(imagesArray);

const placeholderText = computed(() =>
  props.placeholder
    ? { dragHere: props.placeholder.text, browse: props.placeholder.link }
    : undefined,
);

function onPreviewClick() {
  if (props.previewable && props.image) {
    preview.openPreview(0);
  }
}

function onTileClick() {
  if (window.matchMedia("(hover: none)").matches) {
    isActive.value = !isActive.value;
  }
}

function deactivate() {
  isActive.value = false;
}
</script>

<style lang="scss">
.vc-image-upload {
  /* Constrain single-image tile to a reasonable max size */
  max-width: 200px;

  &__tile {
    @apply tw-relative tw-overflow-hidden tw-box-border tw-border tw-border-solid
      tw-bg-[var(--base-1,#fff)]
      tw-border-[var(--gallery-tile-border)]
      tw-rounded-[var(--gallery-tile-radius)]
      tw-aspect-square
      tw-transition-all tw-duration-200 tw-ease-out;
    box-shadow: var(--gallery-tile-shadow);
    -webkit-mask-image: radial-gradient(white, black);
  }

  &__image {
    @apply tw-w-full tw-h-full tw-block tw-object-cover
      tw-opacity-0 tw-transition-opacity tw-duration-300;

    &--loaded {
      @apply tw-opacity-100;
    }
  }

  &__skeleton {
    @apply tw-absolute tw-inset-0;
    background: linear-gradient(
      90deg,
      var(--gallery-skeleton-from) 25%,
      var(--gallery-skeleton-to) 50%,
      var(--gallery-skeleton-from) 75%
    );
    background-size: 200% 100%;
    animation: gallery-shimmer 1.5s infinite ease-in-out;
  }

  &__tray {
    @apply tw-absolute tw-bottom-0 tw-left-0 tw-right-0
      tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1.5
      tw-translate-y-full tw-transition-transform tw-duration-200 tw-ease-out;
    background: var(--gallery-tray-bg);
    backdrop-filter: blur(var(--gallery-tray-blur)) saturate(1.5);
  }

  &__tray-actions {
    @apply tw-flex tw-gap-1 tw-shrink-0;
  }

  &__action-btn {
    @apply tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7
      tw-rounded tw-cursor-pointer tw-transition-colors tw-duration-150
      tw-border-0 tw-bg-transparent;
    color: var(--gallery-action-btn-color);

    &:hover {
      color: var(--gallery-action-btn-hover);
      @apply tw-bg-[var(--primary-50)];
    }

    &--danger:hover {
      color: var(--gallery-action-btn-danger);
      @apply tw-bg-[var(--danger-50)];
    }
  }

  &__tray-name {
    @apply tw-truncate tw-text-xs tw-ml-auto;
    color: var(--gallery-action-btn-color);
  }

  @media (hover: hover) {
    &__tile:hover {
      transform: translateY(-2px);
      box-shadow: var(--gallery-tile-shadow-hover);
    }

    &__tile:hover &__tray {
      @apply tw-translate-y-0;
    }
  }

  &__tile--active &__tray {
    @apply tw-translate-y-0;
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-items-center;
  }
}

@keyframes gallery-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
