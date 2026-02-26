<template>
  <div
    v-on-click-outside="deactivate"
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item--active': isActive,
      'vc-gallery-item--readonly': readonly,
    }"
    @click="onTileClick"
  >
    <!-- Skeleton shimmer -->
    <div
      v-if="!imageState.isLoaded.value"
      class="vc-gallery-item__skeleton"
    />

    <!-- Actual image -->
    <img
      v-if="image.url"
      :src="image.url"
      :alt="image.altText || image.name || ''"
      class="vc-gallery-item__image"
      :class="{ 'vc-gallery-item__image--loaded': imageState.isLoaded.value }"
      :style="{ objectFit: imageFit }"
      @load="imageState.onLoad"
      @error="imageState.onError"
    />

    <!-- Drag handle (top-left, visible on hover) -->
    <div
      v-if="!readonly && !disableDrag"
      class="vc-gallery-item__drag-handle"
    >
      <VcIcon
        icon="material-drag_indicator"
        size="s"
      />
    </div>

    <!-- Slide-up tray -->
    <div class="vc-gallery-item__tray">
      <div class="vc-gallery-item__tray-actions">
        <button
          v-if="actions?.preview !== false"
          class="vc-gallery-item__action-btn"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN')"
          @click.stop="$emit('preview', image)"
        >
          <VcIcon icon="material-open_in_full" size="s" />
        </button>
        <button
          v-if="!readonly && actions?.edit !== false"
          class="vc-gallery-item__action-btn"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.EDIT')"
          @click.stop="$emit('edit', image)"
        >
          <VcIcon icon="material-edit" size="s" />
        </button>
        <button
          v-if="!readonly && actions?.remove !== false"
          class="vc-gallery-item__action-btn vc-gallery-item__action-btn--danger"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE')"
          @click.stop="$emit('remove', image)"
        >
          <VcIcon icon="material-delete" size="s" />
        </button>
      </div>
      <div
        class="vc-gallery-item__tray-name"
        :title="image.name"
      >
        {{ image.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { ICommonAsset } from "@core/types";
import { VcIcon } from "@ui/components";
import { useI18n } from "vue-i18n";
import { useImageLoad } from "../../composables/useImageLoad";

export interface Props {
  image: ICommonAsset;
  readonly?: boolean;
  actions?: {
    preview?: boolean;
    edit?: boolean;
    remove?: boolean;
  };
  disableDrag?: boolean;
  imageFit?: "contain" | "cover";
}

const props = withDefaults(defineProps<Props>(), {
  image: () => ({}) as ICommonAsset,
  readonly: false,
  disableDrag: false,
  imageFit: "contain",
});

defineEmits<{
  (e: "preview", image: ICommonAsset): void;
  (e: "edit", image: ICommonAsset): void;
  (e: "remove", image: ICommonAsset): void;
}>();

const { t } = useI18n({ useScope: "global" });
const isActive = ref(false);
const imageState = useImageLoad(toRef(() => props.image.url));

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
:root {
  --gallery-tile-radius: 8px;
  --gallery-tile-border: var(--secondary-200);
  --gallery-tile-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --gallery-tile-shadow-hover: 0 4px 12px rgb(0 0 0 / 0.1);
  --gallery-tray-bg: rgba(255, 255, 255, 0.85);
  --gallery-tray-blur: 12px;
  --gallery-skeleton-from: var(--secondary-100);
  --gallery-skeleton-to: var(--secondary-200);
  --gallery-action-btn-color: var(--secondary-600);
  --gallery-action-btn-hover: var(--primary-500);
  --gallery-action-btn-danger: var(--danger-500);
  --gallery-drag-handle-color: var(--secondary-400);
}

.vc-gallery-item {
  @apply tw-relative tw-overflow-hidden tw-box-border tw-border tw-border-solid
    tw-bg-[var(--base-1,#fff)]
    tw-border-[var(--gallery-tile-border)]
    tw-rounded-[var(--gallery-tile-radius)]
    tw-aspect-square
    tw-transition-all tw-duration-200 tw-ease-out;
  box-shadow: var(--gallery-tile-shadow);

  &__image {
    @apply tw-w-full tw-h-full tw-block tw-opacity-0 tw-transition-opacity tw-duration-300;

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

  &__drag-handle {
    @apply tw-absolute tw-top-1 tw-left-1 tw-opacity-0 tw-transition-opacity tw-duration-200
      tw-cursor-move tw-z-[1] tw-p-0.5 tw-rounded;
    color: var(--gallery-drag-handle-color);
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
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--gallery-tile-shadow-hover);
    }

    &:hover &__tray {
      @apply tw-translate-y-0;
    }

    &:hover &__drag-handle {
      @apply tw-opacity-100;
    }
  }

  &--active &__tray {
    @apply tw-translate-y-0;
  }

  &--active &__drag-handle {
    @apply tw-opacity-100;
  }
}

@keyframes gallery-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
