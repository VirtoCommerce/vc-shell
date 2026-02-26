<template>
  <div class="vc-image-upload">
    <!-- Has image: show preview + actions -->
    <div
      v-if="image?.url"
      class="vc-image-upload__preview"
    >
      <div class="vc-image-upload__image-wrapper">
        <img
          :src="image.url"
          :alt="image.altText || image.name || ''"
          class="vc-image-upload__image"
          :class="{ 'vc-image-upload__image--loaded': imageState.isLoaded.value }"
          @load="imageState.onLoad"
          @error="imageState.onError"
          @click="onPreviewClick"
        />
        <div
          v-if="!imageState.isLoaded.value"
          class="vc-image-upload__skeleton"
        />
      </div>
      <div class="vc-image-upload__info">
        <span
          class="vc-image-upload__filename"
          :title="image.name"
        >
          {{ image.name }}
        </span>
        <span
          v-if="image.readableSize"
          class="vc-image-upload__filesize"
        >
          {{ image.readableSize }}
        </span>
        <div class="vc-image-upload__actions">
          <button
            v-if="previewable"
            class="vc-image-upload__action-btn"
            :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN')"
            @click="onPreviewClick"
          >
            <VcIcon
              icon="material-open_in_full"
              size="s"
            />
          </button>
          <button
            v-if="removable && !disabled"
            class="vc-image-upload__action-btn vc-image-upload__action-btn--danger"
            :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE')"
            @click="emit('remove', image)"
          >
            <VcIcon
              icon="material-delete"
              size="s"
            />
          </button>
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
import { computed, toRef } from "vue";
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
</script>

<style lang="scss">
:root {
  --image-upload-radius: 8px;
  --image-upload-border: var(--secondary-200);
  --image-upload-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --image-upload-action-color: var(--secondary-600);
  --image-upload-action-hover: var(--primary-500);
  --image-upload-action-danger: var(--danger-500);
}

.vc-image-upload {
  &__preview {
    @apply tw-flex tw-items-start tw-gap-3 tw-p-3
      tw-border tw-border-solid tw-rounded-lg;
    border-color: var(--image-upload-border);
    border-radius: var(--image-upload-radius);
    box-shadow: var(--image-upload-shadow);
  }

  &__image-wrapper {
    @apply tw-relative tw-shrink-0;
  }

  &__image {
    @apply tw-w-20 tw-h-20 tw-rounded-md tw-object-cover tw-cursor-pointer
      tw-opacity-0 tw-transition-opacity tw-duration-300;

    &--loaded {
      @apply tw-opacity-100;
    }
  }

  &__skeleton {
    @apply tw-w-20 tw-h-20 tw-rounded-md tw-absolute tw-inset-0;
    background: linear-gradient(
      90deg,
      var(--gallery-skeleton-from, #f0f0f0) 25%,
      var(--gallery-skeleton-to, #e0e0e0) 50%,
      var(--gallery-skeleton-from, #f0f0f0) 75%
    );
    background-size: 200% 100%;
    animation: gallery-shimmer 1.5s infinite ease-in-out;
  }

  &__info {
    @apply tw-flex tw-flex-col tw-gap-1 tw-min-w-0;
  }

  &__filename {
    @apply tw-text-sm tw-font-medium tw-truncate;
  }

  &__filesize {
    @apply tw-text-xs;
    color: var(--secondary-400);
  }

  &__actions {
    @apply tw-flex tw-gap-1 tw-mt-1;
  }

  &__action-btn {
    @apply tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7
      tw-rounded tw-cursor-pointer tw-transition-colors tw-duration-150
      tw-border-0 tw-bg-transparent;
    color: var(--image-upload-action-color);

    &:hover {
      color: var(--image-upload-action-hover);
      @apply tw-bg-[var(--primary-50)];
    }

    &--danger:hover {
      color: var(--image-upload-action-danger);
      @apply tw-bg-[var(--danger-50)];
    }
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-items-center;
  }
}
</style>
