<template>
  <!-- Legacy shim: variant="file-upload" delegates to VcImageUpload -->
  <VcImageUpload
    v-if="isLegacySingleImageMode"
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
      [`vc-gallery--${size}`]: true,
    }"
    :style="{ '--gallery-gap': `${gap}px` }"
    @dragenter.prevent="onGlobalDragEnter"
    @dragleave.prevent="onGlobalDragLeave"
    @dragover.prevent
    @drop.prevent="onGlobalDrop"
  >
    <template v-if="hasImages || !disabled">
      <TransitionGroup
        :ref="
          (comp: any) => {
            if (comp?.$el) reorder.galleryRef.value = comp.$el;
          }
        "
        tag="div"
        :name="reorder.isDragging.value ? 'vc-gallery-swap' : ''"
        class="vc-gallery__grid"
      >
        <!-- Image tiles -->
        <div
          v-for="(image, i) in localImages"
          :key="`img_${image.id || i}`"
          class="vc-gallery__item"
          :class="{ 'vc-gallery__item--dragging': reorder.isDragging.value && reorder.draggedId.value === image.id }"
          @mousedown="reorder.reorderHandlers.onItemMouseDown"
          @mouseup="reorder.reorderHandlers.onItemMouseUp"
          @mouseleave="reorder.reorderHandlers.onItemMouseUp"
          @dragstart="reorder.reorderHandlers.onItemDragStart($event, image)"
          @dragover="reorder.reorderHandlers.onItemDragOver"
          @dragleave="reorder.reorderHandlers.onItemDragLeave"
          @drop="reorder.reorderHandlers.onItemDrop"
          @dragend="reorder.reorderHandlers.onItemDragEnd"
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
              @preview="preview.openPreview(i)"
              @edit="emit('edit', $event)"
              @remove="emit('remove', $event)"
            />
          </slot>
        </div>

        <!-- Upload tile (when images exist) -->
        <div
          v-if="!disabled && hasImages"
          key="__upload__"
          class="vc-gallery__upload-tile"
        >
          <VcFileUpload
            class="vc-gallery__upload-zone"
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
      </TransitionGroup>
    </template>

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
import { VcIcon } from "@ui/components/atoms/vc-icon";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcImageUpload from "@ui/components/organisms/vc-image-upload/vc-image-upload.vue";
import { useGalleryReorder } from "./composables/useGalleryReorder";
import { useGalleryUpload } from "./composables/useGalleryUpload";
import { useGalleryPreview } from "./composables/useGalleryPreview";
import { useI18n } from "vue-i18n";

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
  size?: "sm" | "md" | "lg";
  gap?: number;
  imagefit?: "contain" | "cover";
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
  size: "md",
  gap: 8,
  imagefit: "contain",
  variant: "gallery",
  uploadIcon: "lucide-cloud-upload",
  name: "Gallery",
  itemActions: () => ({ preview: true, edit: true, remove: true }),
});

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

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
  if (props.label) {
    console.warn(`[VcGallery] prop "label" is deprecated. Use external <VcLabel> instead.`);
  }
  if (props.tooltip) {
    console.warn(`[VcGallery] prop "tooltip" is deprecated. Use external <VcLabel> instead.`);
  }
  if (props.required) {
    console.warn(`[VcGallery] prop "required" is deprecated. Use external <VcLabel> instead.`);
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
});

const upload = useGalleryUpload(localImages, {
  onUpload: (files, sortOrder) => emit("upload", files, sortOrder),
});

const preview = useGalleryPreview(localImages);

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

  &--drag-over {
    @apply tw-rounded-lg tw-ring-2 tw-ring-[var(--gallery-drop-overlay-border)];
    background: var(--gallery-upload-bg-hover);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--gallery-tile-min), var(--gallery-tile-max)));
    gap: var(--gallery-gap);
    @apply tw-relative;
  }

  &__item {
    @apply tw-min-w-0;
  }

  &__upload-tile {
    @apply tw-aspect-square tw-rounded-lg tw-border-2 tw-border-dashed tw-border-[var(--gallery-upload-border)] tw-transition-all tw-duration-200 tw-overflow-hidden;

    &:hover {
      border-color: var(--gallery-upload-border-hover);
      background: var(--gallery-upload-bg-hover);
    }
  }

  &__upload-tile .vc-file-upload__container {
    @apply tw-h-full;
  }

  &__upload-tile .vc-file-upload__drop-zone {
    @apply tw-border-0 tw-h-full tw-w-full tw-rounded-none tw-p-2 tw-justify-center;
    min-height: unset;
    background: transparent;
  }

  &__upload-tile .vc-file-upload__text {
    @apply tw-mt-2 tw-text-[11px] tw-leading-4 tw-whitespace-normal;
  }

  &__upload-tile .vc-file-upload__link {
    @apply tw-text-[11px] tw-whitespace-normal;
  }

  &__upload-tile .vc-file-upload__icon {
    @apply tw-text-2xl;
  }

  &__empty-upload {
    @apply tw-w-full;
  }

  &__empty-upload .vc-file-upload__drop-zone {
    @apply tw-min-h-[160px];
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-p-5 tw-h-full tw-items-center;
  }

  &__item--dragging .vc-gallery-item {
    box-shadow:
      0 8px 24px -4px rgba(0, 0, 0, 0.15),
      0 0 0 2px var(--primary-400) !important;
    cursor: grabbing !important;
  }

  &--reordering .vc-gallery-item {
    @media (hover: hover) {
      &:hover {
        transform: none;
        box-shadow: var(--gallery-tile-shadow);
      }

      &:hover .vc-gallery-item__tray {
        @apply tw-translate-y-full;
      }
    }
  }

  &__drop-overlay {
    @apply tw-absolute tw-inset-0 tw-z-10 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-pointer-events-none;
    background: var(--gallery-drop-overlay-bg);
    border: 2px solid var(--gallery-drop-overlay-border);
    backdrop-filter: blur(4px);
    color: var(--gallery-drop-overlay-border);
  }
}

// FLIP animation for live-swap reorder
.vc-gallery-swap-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.vc-gallery-swap-enter-active,
.vc-gallery-swap-leave-active {
  transition: none !important;
}
</style>
