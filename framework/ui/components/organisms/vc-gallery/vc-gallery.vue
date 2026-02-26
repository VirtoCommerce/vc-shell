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
    @remove="(img: ICommonAsset) => emit('remove', img)"
  />

  <!-- Normal gallery mode -->
  <div
    v-else
    class="vc-gallery"
    :class="{
      'vc-gallery--drag-over': isDragOver,
      [`vc-gallery--${size}`]: true,
    }"
    :style="{ '--gallery-gap': `${gap}px` }"
    @dragenter.prevent="onGlobalDragEnter"
    @dragleave.prevent="onGlobalDragLeave"
    @dragover.prevent
    @drop.prevent="onGlobalDrop"
  >
    <template v-if="hasImages || !disabled">
      <div
        :ref="(el) => { if (el) reorder.galleryRef.value = el as HTMLElement }"
        class="vc-gallery__grid"
      >
        <!-- Image tiles -->
        <div
          v-for="(image, i) in localImages"
          :key="`img_${image.id || i}`"
          class="vc-gallery__item"
          @mousedown="reorder.reorderHandlers.onItemMouseDown"
          @dragstart="reorder.reorderHandlers.onItemDragStart($event, image)"
          @dragover="reorder.reorderHandlers.onItemDragOver"
          @dragleave="reorder.reorderHandlers.onItemDragLeave"
          @drop="reorder.reorderHandlers.onItemDrop($event, image)"
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
            @upload="upload.onUpload"
          />
        </div>
      </div>

      <!-- Reorder indicator line -->
      <div
        :ref="(el) => { if (el) reorder.reorderLineRef.value = el as HTMLElement }"
        class="vc-gallery__reorder-line"
      />
    </template>

    <!-- Empty state / Full-width upload -->
    <template v-if="!hasImages && !disabled">
      <slot name="empty">
        <div class="vc-gallery__empty-upload">
          <VcFileUpload
            :icon="uploadIcon"
            :multiple="multiple"
            :rules="rules"
            :name="name"
            :loading="loading"
            :accept="accept"
            @upload="upload.onUpload"
          />
        </div>
      </slot>
    </template>

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
      <VcIcon icon="lucide-cloud-upload" size="xxl" />
      <span>{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.DROP_TO_UPLOAD") }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, toValue } from "vue";
import type { ICommonAsset, IValidationRules } from "@core/types";
import { VcFileUpload, VcHint, VcIcon } from "@ui/components";
import VcGalleryItem from "./_internal/vc-gallery-item/vc-gallery-item.vue";
import VcImageUpload from "@ui/components/organisms/vc-image-upload/vc-image-upload.vue";
import { useGalleryReorder } from "./composables/useGalleryReorder";
import { useGalleryUpload } from "./composables/useGalleryUpload";
import { useGalleryPreview } from "./composables/useGalleryPreview";
import { useI18n } from "vue-i18n";

export interface Props {
  images?: ICommonAsset[];
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
  (event: "sort", sorted: ICommonAsset[]): void;
  (event: "edit", image: ICommonAsset): void;
  (event: "remove", image: ICommonAsset): void;
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
    console.warn(
      `[VcGallery] prop "variant" is deprecated. Use <VcImageUpload> component for single-image uploads.`,
    );
  }
  if (props.hideAfterUpload) {
    console.warn(`[VcGallery] prop "hideAfterUpload" is deprecated. Use <VcImageUpload> instead.`);
  }
  if (props.customText) {
    console.warn(`[VcGallery] prop "customText" is deprecated. Use <VcImageUpload> instead.`);
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
const localImages = ref<ICommonAsset[]>([]);
watch(
  () => props.images,
  (newVal) => {
    localImages.value = [...toValue(newVal)];
  },
  { deep: true, immediate: true },
);

const hasImages = computed(() => localImages.value.length > 0);

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

function onGlobalDragLeave() {
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
  --gallery-reorder-color: var(--primary-400);
  --gallery-reorder-glow: 0 0 8px var(--primary-400);
  --gallery-upload-border: var(--secondary-300);
  --gallery-upload-border-hover: var(--primary-400);
  --gallery-upload-bg-hover: var(--primary-50);
  --gallery-drop-overlay-bg: rgba(255, 255, 255, 0.85);
  --gallery-drop-overlay-border: var(--primary-400);
}

.vc-gallery {
  @apply tw-relative;

  &--sm &__grid { grid-template-columns: repeat(auto-fill, minmax(120px, 160px)); }
  &--md &__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 200px)); }
  &--lg &__grid { grid-template-columns: repeat(auto-fill, minmax(200px, 260px)); }

  &__grid {
    display: grid;
    gap: var(--gallery-gap);
    @apply tw-relative;
  }

  &__item {
    @apply tw-min-w-0;
  }

  &__upload-tile {
    @apply tw-aspect-square tw-rounded-lg
      tw-border-2 tw-border-dashed
      tw-border-[var(--gallery-upload-border)]
      tw-transition-all tw-duration-200
      tw-overflow-hidden;

    &:hover {
      border-color: var(--gallery-upload-border-hover);
      background: var(--gallery-upload-bg-hover);
    }
  }

  &__upload-tile .vc-file-upload__drop-zone {
    @apply tw-border-0 tw-h-full tw-w-full tw-rounded-none;
    min-height: unset;
    background: transparent;
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

  &__reorder-line {
    @apply tw-absolute tw-top-0 tw-bottom-0 tw-z-[2] tw-hidden tw-rounded-sm;
    width: 3px;
    background: var(--gallery-reorder-color);
    box-shadow: var(--gallery-reorder-glow);
  }

  &__drop-overlay {
    @apply tw-absolute tw-inset-0 tw-z-10
      tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2
      tw-rounded-lg tw-pointer-events-none;
    background: var(--gallery-drop-overlay-bg);
    border: 2px solid var(--gallery-drop-overlay-border);
    backdrop-filter: blur(4px);
    color: var(--gallery-drop-overlay-border);
  }
}
</style>
