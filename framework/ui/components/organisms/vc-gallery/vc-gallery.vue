<template>
  <!-- Skeleton mode: blade is loading -->
  <div
    v-if="bladeLoading"
    class="vc-gallery vc-gallery--skeleton"
  >
    <VcSkeleton
      v-if="label"
      variant="block"
      :width="60 + (label?.length || 0) * 4"
      :height="11"
    />
    <div class="vc-gallery__skeleton-filmstrip">
      <VcSkeleton
        v-for="i in 4"
        :key="i"
        variant="block"
        class="vc-gallery__skeleton-tile"
      />
    </div>
  </div>

  <!-- Legacy shim: variant="file-upload" delegates to VcImageUpload -->
  <VcImageUpload
    v-else-if="isLegacySingleImageMode"
    :image="images?.[0]"
    :disabled="disabled"
    :loading="loading"
    :rules="rules"
    :name="name"
    :icon="uploadIcon"
    :accept="accept"
    :placeholder="legacyPlaceholder"
    :removable="itemActions?.remove !== false"
    :previewable="itemActions?.preview !== false"
    @upload="(files: FileList) => emit('upload', files)"
    @remove="(img: AssetLike) => emit('remove', img)"
  />

  <!-- Normal gallery mode -->
  <div
    v-else
    class="vc-gallery"
    :class="{
      'vc-gallery--drag-over': isDragOver,
      'vc-gallery--reordering': reorder.isDragging.value,
      'vc-gallery--mobile': isMobile,
      [`vc-gallery--${size}`]: true,
    }"
    :style="{ '--gallery-gap': `${gap}px` }"
    @dragenter.prevent="onGlobalDragEnter"
    @dragleave.prevent="onGlobalDragLeave"
    @dragover.prevent
    @drop.prevent="onGlobalDrop"
  >
    <!-- Header row: label always visible, upload button after first image -->
    <div
      v-if="label || (hasImages && !disabled)"
      class="vc-gallery__header"
    >
      <VcLabel
        v-if="label"
        class="vc-gallery__label"
        :required="required"
      >
        {{ label }}
      </VcLabel>
      <div
        v-if="!disabled && hasImages"
        class="vc-gallery__header-actions"
      >
        <button
          type="button"
          class="vc-gallery__upload-btn"
          :disabled="loading"
          @click="onHeaderUploadClick"
        >
          <VcIcon
            icon="lucide-cloud-upload"
            size="xs"
          />
          {{ t("COMPONENTS.ORGANISMS.VC_GALLERY.UPLOAD") }}
        </button>
        <span
          v-if="!isMobile"
          class="vc-gallery__dnd-hint"
          >{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.OR_DROP_HERE") }}</span
        >
        <input
          ref="fileInputRef"
          type="file"
          :multiple="multiple"
          :accept="accept"
          hidden
          @change="onFileInputChange"
        />
      </div>
    </div>

    <!-- Dropzone wrapper (only when images exist) -->
    <div
      v-if="hasImages"
      class="vc-gallery__dropzone"
      :class="{
        'vc-gallery__dropzone--loading': loading,
        'vc-gallery__dropzone--mobile': isMobile,
      }"
    >
      <!-- Filmstrip / Expanded grid (single Swiper instance, no DOM remount) -->
      <VcGalleryFilmstrip
        v-if="layout === 'filmstrip'"
        :images="localImages"
        :gap="gap"
        :has-overflow="filmstrip.hasOverflow.value"
        :loading="loading"
        :expanded="filmstrip.isExpanded.value"
        @swiper-init="filmstrip.onSwiperInit"
        @swiper-resize="filmstrip.onSwiperResize"
        @slides-updated="filmstrip.checkOverflow"
        @sortable-container="
          (el) => {
            reorder.galleryRef.value = el;
          }
        "
      >
        <template #item="{ image, index }">
          <slot
            name="item"
            :image="image"
            :index="index"
            :actions="{
              preview: () => preview.openPreview(index),
              edit: () => emit('edit', image),
              remove: () => emit('remove', image),
            }"
          >
            <VcGalleryItem
              :image="image"
              :readonly="disabled"
              :actions="itemActions"
              :disable-drag="isMobile || reorder.disableDrag.value"
              :image-fit="imagefit"
              :thumbnail-size="resolvedThumbnailSize"
              @preview="preview.openPreview(index)"
              @edit="emit('edit', $event)"
              @remove="emit('remove', $event)"
            />
          </slot>
        </template>
      </VcGalleryFilmstrip>

      <!-- Grid mode (layout="grid", no filmstrip) -->
      <div
        v-else-if="layout === 'grid'"
        :ref="
          (el) => {
            if (el) reorder.galleryRef.value = el as HTMLElement;
          }
        "
        class="vc-gallery__grid"
      >
        <div
          v-for="(image, i) in localImages"
          :key="`img_${image.id || i}`"
          class="vc-gallery__item"
        >
          <slot
            name="item"
            :image="image"
            :index="i"
            :actions="{
              preview: () => preview.openPreview(i),
              edit: () => emit('edit', image),
              remove: () => emit('remove', image),
            }"
          >
            <VcGalleryItem
              :image="image"
              :readonly="disabled"
              :actions="itemActions"
              :disable-drag="reorder.disableDrag.value"
              :image-fit="imagefit"
              :thumbnail-size="resolvedThumbnailSize"
              @preview="preview.openPreview(i)"
              @edit="emit('edit', $event)"
              @remove="emit('remove', $event)"
            />
          </slot>
        </div>
      </div>

      <!-- Loading overlay (inside dropzone so nav arrows stay visible) -->
      <!-- Expand toggle (inside dropzone) -->
      <button
        v-if="layout === 'filmstrip' && filmstrip.hasOverflow.value"
        type="button"
        class="vc-gallery__expand-toggle"
        :class="{ 'vc-gallery__expand-toggle--open': filmstrip.isExpanded.value }"
        @click="filmstrip.toggleExpand()"
      >
        <template v-if="filmstrip.isExpanded.value">
          {{ t("COMPONENTS.ORGANISMS.VC_GALLERY.COLLAPSE") }}
        </template>
        <template v-else>
          {{ t("COMPONENTS.ORGANISMS.VC_GALLERY.SHOW_ALL", { count: localImages.length }) }}
        </template>
        <VcIcon
          icon="lucide-chevron-down"
          size="xs"
        />
      </button>

      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="vc-gallery__loading-overlay"
      >
        <VcIcon
          icon="lucide-loader-2"
          size="xl"
          class="vc-gallery__loading-spinner"
        />
      </div>
    </div>

    <!-- Empty state / Full-width upload -->
    <div
      v-if="!hasImages && !disabled"
      class="vc-gallery__empty-upload"
    >
      <VcFileUpload
        :icon="uploadIcon"
        :multiple="multiple"
        :rules="rules"
        :name="name"
        :loading="loading"
        :accept="accept"
        :custom-text="uploadCustomText"
        @upload="upload.onUpload"
      />
    </div>

    <!-- Disabled + no images -->
    <div
      v-if="!hasImages && disabled"
      class="vc-gallery__empty"
    >
      <slot name="empty">
        <VcHint>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.GALLERY_IS_EMPTY") }}</VcHint>
      </slot>
    </div>

    <!-- Footer slot -->
    <slot
      name="footer"
      :images="localImages"
    />

    <!-- Drag-over overlay -->
    <div
      v-if="isDragOver && !disabled"
      class="vc-gallery__drop-overlay"
    >
      <VcIcon
        icon="lucide-cloud-upload"
        size="xxl"
      />
      <span>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.DROP_TO_UPLOAD") }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { IValidationRules } from "@core/types";
import type { AssetLike } from "@core/composables/useAssetsManager";
import { VcFileUpload } from "@ui/components/molecules/vc-file-upload";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { VcLabel } from "@ui/components/atoms/vc-label";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcGalleryFilmstrip from "./_internal/vc-gallery-filmstrip/vc-gallery-filmstrip.vue";
import VcImageUpload from "@ui/components/organisms/vc-image-upload/vc-image-upload.vue";
import { useGalleryReorder } from "./composables/useGalleryReorder";
import { useGalleryUpload } from "./composables/useGalleryUpload";
import { useGalleryPreview } from "./composables/useGalleryPreview";
import { useGalleryFilmstrip } from "./composables/useGalleryFilmstrip";
import type { ThumbnailSize } from "@core/utilities/thumbnail";
import { useI18n } from "vue-i18n";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { useBladeLoading } from "@ui/composables/useBladeLoading";

export interface Props {
  images?: AssetLike[];
  disabled?: boolean;
  multiple?: boolean;
  loading?: boolean;
  itemActions?: { preview?: boolean; edit?: boolean; remove?: boolean };
  rules?: keyof IValidationRules | IValidationRules;
  name?: string;
  accept?: string;
  // New props
  layout?: "filmstrip" | "grid";
  size?: "sm" | "md" | "lg";
  gap?: number;
  imagefit?: "contain" | "cover";
  /** Thumbnail size for gallery tiles. Auto-mapped from `size` if not set. */
  thumbnailSize?: ThumbnailSize;
  // Deprecated props (kept for backward compat)
  variant?: "gallery" | "file-upload";
  hideAfterUpload?: boolean;
  customText?: { dragHere: string; browse: string };
  uploadIcon?: string;
  label?: string;
  tooltip?: string;
  required?: boolean;
}

export interface Emits {
  (event: "upload", files: FileList, startingSortOrder?: number): void;
  (event: "sort", sorted: AssetLike[]): void;
  (event: "edit", image: AssetLike): void;
  (event: "remove", image: AssetLike): void;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  layout: "filmstrip",
  size: "md",
  gap: 8,
  imagefit: "contain",
  variant: "gallery",
  uploadIcon: "lucide-cloud-upload",
  name: "Gallery",
  accept: "image/*",
  itemActions: () => ({ preview: true, edit: true, remove: true }),
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const { isMobile } = useResponsive();
const bladeLoading = useBladeLoading();

// Deprecation warnings (dev only)
if (import.meta.env?.DEV) {
  if (props.variant && props.variant !== "gallery") {
    console.warn(`[VcGallery] prop "variant" is deprecated. Use <VcImageUpload> component for single-image uploads.`);
  }
  if (props.hideAfterUpload) {
    console.warn(`[VcGallery] prop "hideAfterUpload" is deprecated. Use <VcImageUpload> instead.`);
  }
  if (props.customText) {
    console.warn(`[VcGallery] prop "customText" is deprecated. Use <VcImageUpload> instead.`);
  }
  if (props.uploadIcon && props.uploadIcon !== "lucide-cloud-upload") {
    console.warn(`[VcGallery] prop "uploadIcon" is deprecated. Use #empty slot for custom upload UI.`);
  }
  if (props.tooltip) {
    console.warn(`[VcGallery] prop "tooltip" is deprecated. Use external <VcLabel> instead.`);
  }
}

// Legacy single-image mode detection
const isLegacySingleImageMode = computed(() => props.variant === "file-upload");
const legacyPlaceholder = computed(() =>
  props.customText ? { text: props.customText.dragHere, link: props.customText.browse } : undefined,
);

// Local images state
const localImages = ref<AssetLike[]>([]);
watch(
  () => props.images,
  (newVal) => {
    localImages.value = [...(newVal ?? [])];
  },
  { deep: true, immediate: true },
);

const hasImages = computed(() => localImages.value.length > 0);
const uploadCustomText = computed(() => ({
  dragHere: t("COMPONENTS.ORGANISMS.VC_GALLERY.DRAG_IMAGES_HERE"),
  browse: t("COMPONENTS.ORGANISMS.VC_GALLERY.BROWSE_IMAGES"),
}));

// Composables
const reorder = useGalleryReorder(localImages, {
  disabled: computed(() => !!props.disabled),
  onSort: (sorted) => emit("sort", sorted),
  onReorderStart: () => {
    // Disable Swiper touch during drag to prevent slide movement
    const swiper = filmstrip.swiperRef.value;
    if (swiper) {
      swiper.allowTouchMove = false;
    }
  },
  onReorderEnd: () => {
    // Re-enable Swiper and update after reorder
    const swiper = filmstrip.swiperRef.value;
    if (swiper) {
      swiper.allowTouchMove = true;
      swiper.update();
    }
  },
  onDragEdge: (direction) => {
    const swiper = filmstrip.swiperRef.value;
    if (!swiper) return;
    // Use translateTo for reliable scrolling in freeMode
    const step = 40; // px per tick
    const currentTranslate = swiper.getTranslate();
    const minTranslate = swiper.minTranslate();
    const maxTranslate = swiper.maxTranslate();

    if (direction === 1) {
      const target = Math.max(currentTranslate - step, maxTranslate);
      swiper.setTranslate(target);
      swiper.update();
    } else if (direction === -1) {
      const target = Math.min(currentTranslate + step, minTranslate);
      swiper.setTranslate(target);
      swiper.update();
    }
  },
});

const upload = useGalleryUpload(localImages, {
  onUpload: (files, sortOrder) => emit("upload", files, sortOrder),
});

const preview = useGalleryPreview(localImages);

// Thumbnail size: explicit prop or auto-map from gallery size
const tileThumbnailSizeMap: Record<string, ThumbnailSize> = { sm: "128x128", md: "216x216", lg: "348x348" };
const resolvedThumbnailSize = computed(() => props.thumbnailSize ?? tileThumbnailSizeMap[props.size]);

// Filmstrip
const filmstrip = useGalleryFilmstrip({
  imageCount: computed(() => localImages.value.length),
});

// Header upload (file input)
const fileInputRef = ref<HTMLInputElement>();

function onHeaderUploadClick() {
  fileInputRef.value?.click();
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length) {
    upload.onUpload(input.files);
    input.value = "";
  }
}

// Global drag-over (file from OS)
const isDragOver = ref(false);
let dragCounter = 0;

function onGlobalDragEnter(event: DragEvent) {
  if (event.dataTransfer?.types.includes("Files")) {
    dragCounter++;
    isDragOver.value = true;
  }
}

function onGlobalDragLeave(event: DragEvent) {
  if (!event.dataTransfer?.types.includes("Files")) return;
  dragCounter--;
  if (dragCounter <= 0) {
    isDragOver.value = false;
    dragCounter = 0;
  }
}

function onGlobalDrop(event: DragEvent) {
  isDragOver.value = false;
  dragCounter = 0;
  const files = event.dataTransfer?.files;
  if (files && files.length) {
    upload.onUpload(files);
  }
}
</script>

<style lang="scss">
:root {
  --gallery-gap: 8px;
  --gallery-tile-min: 160px;
  --gallery-tile-max: 200px;
  --gallery-upload-border: var(--secondary-300);
  --gallery-upload-border-hover: var(--primary-400);
  --gallery-upload-bg-hover: var(--primary-50);
  --gallery-drop-overlay-bg: rgba(255, 255, 255, 0.85);
  --gallery-drop-overlay-border: var(--primary-400);
}

.vc-gallery {
  @apply tw-relative;

  &--sm {
    --gallery-tile-min: 120px;
    --gallery-tile-max: 160px;
  }

  &--md {
    --gallery-tile-min: 160px;
    --gallery-tile-max: 200px;
  }

  &--lg {
    --gallery-tile-min: 200px;
    --gallery-tile-max: 260px;
  }

  // Mobile: adjusted tiles
  &--mobile {
    &.vc-gallery--sm {
      --gallery-tile-min: 120px;
    }

    &.vc-gallery--md {
      --gallery-tile-min: 140px;
    }

    &.vc-gallery--lg {
      --gallery-tile-min: 170px;
    }
  }

  &--skeleton {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__skeleton-filmstrip {
    @apply tw-flex tw-flex-row tw-overflow-hidden;
    gap: var(--gallery-grid-gap, 8px);
  }

  &__skeleton-tile {
    width: var(--gallery-tile-min);
    aspect-ratio: 1;
    @apply tw-shrink-0;
  }

  &--drag-over {
    @apply tw-rounded-lg tw-ring-2 tw-ring-[var(--gallery-drop-overlay-border)];
    background: var(--gallery-upload-bg-hover);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, var(--gallery-tile-min));
    gap: var(--gallery-gap);
    @apply tw-relative;
  }

  &__item {
    @apply tw-min-w-0;
  }

  // ── Header row ──
  &__header {
    @apply tw-flex tw-items-center tw-mb-2 tw-gap-2;
  }

  &__label {
    @apply tw-flex-1 tw-min-w-0;
  }

  &__header-actions {
    @apply tw-flex tw-items-center tw-gap-2;
  }

  &__upload-btn {
    @apply tw-flex tw-items-center tw-gap-1 tw-text-xs tw-font-medium
      tw-cursor-pointer tw-transition-all tw-duration-150
      tw-rounded-full tw-border tw-border-solid;
    color: var(--primary-500);
    border-color: var(--primary-200);
    background: var(--primary-50);
    padding: 4px 12px;

    &:hover {
      color: var(--primary-700);
      border-color: var(--primary-400);
      background: var(--primary-100);
    }

    &:disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }
  }

  &__dnd-hint {
    @apply tw-text-[11px];
    color: var(--secondary-400);
  }

  // ── Dropzone wrapper ──
  &__dropzone {
    @apply tw-relative tw-rounded-md tw-transition-all tw-duration-200;
    border: 1.5px dashed var(--secondary-300);
    padding: 6px;

    &--loading {
      animation: gallery-dropzone-pulse 1.5s ease-in-out infinite;
      border-color: var(--primary-300);
    }

    &--mobile {
      border-color: transparent;
    }
  }

  // ── Expand toggle ──
  &__expand-toggle {
    @apply tw-flex tw-items-center tw-justify-center tw-gap-1 tw-w-full
      tw-text-xs tw-font-medium tw-border-0
      tw-cursor-pointer tw-transition-all tw-duration-150
      tw-rounded-md tw-mt-1;
    color: var(--secondary-600);
    background: var(--secondary-50);
    padding: 6px 0;

    &:hover {
      color: var(--primary-600);
      background: var(--primary-50);
    }

    .vc-icon {
      @apply tw-transition-transform tw-duration-200;
    }

    &--open .vc-icon {
      @apply tw-rotate-180;
    }
  }

  &__empty-upload {
    @apply tw-w-full;

    .vc-file-upload__drop-zone {
      min-height: 160px;
    }
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-h-full tw-items-center;
  }

  &__item--dragging {
    .vc-gallery-item,
    .vc-image-tile {
      box-shadow:
        0 8px 24px -4px rgba(0, 0, 0, 0.15),
        0 0 0 2px var(--primary-400) !important;
      cursor: grabbing !important;
    }
  }

  &__item--ghost {
    opacity: 0.4;
  }

  // ── Loading overlay ──
  &__loading-overlay {
    @apply tw-absolute tw-inset-0 tw-z-[var(--z-local-sticky)] tw-flex tw-items-center tw-justify-center tw-rounded-md tw-pointer-events-none;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
  }

  &__loading-spinner {
    color: var(--primary-500);
    animation: gallery-loading-spin 1s linear infinite;
  }

  &__drop-overlay {
    @apply tw-absolute tw-inset-0 tw-z-[var(--z-local-sticky)] tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-pointer-events-none;
    background: var(--gallery-drop-overlay-bg);
    border: 2px solid var(--gallery-drop-overlay-border);
    backdrop-filter: blur(4px);
    color: var(--gallery-drop-overlay-border);
  }
}

@keyframes gallery-dropzone-pulse {
  0%,
  100% {
    border-color: var(--primary-300);
    background: transparent;
  }
  50% {
    border-color: var(--primary-400);
    background: var(--primary-50);
  }
}

@keyframes gallery-loading-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
