<template>
  <div
    v-on-click-outside="deactivate"
    class="vc-image-tile"
    :class="{
      'vc-image-tile--active': isActive,
    }"
    @click="onTileClick"
  >
    <!-- Skeleton shimmer -->
    <div
      v-if="!imageState.isLoaded.value"
      class="vc-image-tile__skeleton"
    />

    <!-- Image -->
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="vc-image-tile__image"
      :class="{ 'vc-image-tile__image--loaded': imageState.isLoaded.value }"
      :style="{ objectFit: imageFit }"
      @load="imageState.onLoad"
      @error="imageState.onError"
    />

    <!-- Overlay slot (e.g. drag handle) -->
    <slot name="overlay" />

    <!-- Slide-up tray -->
    <div class="vc-image-tile__tray">
      <div class="vc-image-tile__tray-actions">
        <!-- Built-in actions -->
        <button
          v-if="actions?.preview !== false"
          type="button"
          class="vc-image-tile-action"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN')"
          @click.stop="$emit('preview')"
        >
          <VcIcon icon="lucide-maximize" size="s" />
        </button>
        <button
          v-if="actions?.edit"
          type="button"
          class="vc-image-tile-action"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.EDIT')"
          @click.stop="$emit('edit')"
        >
          <VcIcon icon="lucide-pencil" size="s" />
        </button>
        <button
          v-if="actions?.remove"
          type="button"
          class="vc-image-tile-action vc-image-tile-action--danger"
          :title="t('COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE')"
          @click.stop="$emit('remove')"
        >
          <VcIcon icon="lucide-trash-2" size="s" />
        </button>

        <!-- Extra actions slot -->
        <slot name="actions" />
      </div>
      <div
        v-if="name"
        class="vc-image-tile__tray-name"
        :title="name"
      >
        {{ name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRef } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useI18n } from "vue-i18n";
import { useImageLoad } from "@ui/components/organisms/vc-gallery/composables/useImageLoad";

export interface VcImageTileActions {
  preview?: boolean;
  edit?: boolean;
  remove?: boolean;
}

export interface VcImageTileProps {
  src?: string;
  alt?: string;
  name?: string;
  imageFit?: "contain" | "cover";
  actions?: VcImageTileActions;
}

const props = withDefaults(defineProps<VcImageTileProps>(), {
  imageFit: "contain",
});

defineEmits<{
  (e: "preview"): void;
  (e: "edit"): void;
  (e: "remove"): void;
}>();

const { t } = useI18n({ useScope: "global" });
const imageState = useImageLoad(toRef(() => props.src));
const isActive = ref(false);

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
  --image-tile-radius: 8px;
  --image-tile-border: var(--secondary-200);
  --image-tile-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --image-tile-shadow-hover: 0 4px 12px rgb(0 0 0 / 0.1);
  --image-tile-tray-bg: rgba(255, 255, 255, 0.85);
  --image-tile-tray-blur: 12px;
  --image-tile-skeleton-from: var(--secondary-100);
  --image-tile-skeleton-to: var(--secondary-200);
  --image-tile-action-color: var(--secondary-600);
  --image-tile-action-hover: var(--primary-500);
  --image-tile-action-danger: var(--danger-500);
}

.vc-image-tile {
  @apply tw-relative tw-overflow-hidden tw-box-border tw-border tw-border-solid
    tw-bg-[var(--base-1,#fff)]
    tw-border-[var(--image-tile-border)]
    tw-rounded-[var(--image-tile-radius)]
    tw-aspect-square
    tw-transition-all tw-duration-200 tw-ease-out;
  box-shadow: var(--image-tile-shadow);
  -webkit-mask-image: radial-gradient(white, black);

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
      var(--image-tile-skeleton-from) 25%,
      var(--image-tile-skeleton-to) 50%,
      var(--image-tile-skeleton-from) 75%
    );
    background-size: 200% 100%;
    animation: image-tile-shimmer 1.5s infinite ease-in-out;
  }

  &__tray {
    @apply tw-absolute tw-bottom-0 tw-left-0 tw-right-0
      tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1.5
      tw-translate-y-full tw-transition-transform tw-duration-200 tw-ease-out;
    background: var(--image-tile-tray-bg);
    backdrop-filter: blur(var(--image-tile-tray-blur)) saturate(1.5);
  }

  &__tray-actions {
    @apply tw-flex tw-gap-1 tw-shrink-0;
  }

  &__tray-name {
    @apply tw-truncate tw-text-xs tw-ml-auto;
    color: var(--image-tile-action-color);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--image-tile-shadow-hover);
    }

    &:hover &__tray {
      @apply tw-translate-y-0;
    }
  }

  &--active &__tray {
    @apply tw-translate-y-0;
  }
}

.vc-image-tile-action {
  @apply tw-flex tw-items-center tw-justify-center tw-w-7 tw-h-7
    tw-rounded tw-cursor-pointer tw-transition-colors tw-duration-150
    tw-border-0 tw-bg-transparent;
  color: var(--image-tile-action-color);

  &:hover {
    color: var(--image-tile-action-hover);
    @apply tw-bg-[var(--primary-50)];
  }

  &--danger:hover {
    color: var(--image-tile-action-danger);
    @apply tw-bg-[var(--danger-50)];
  }
}

@keyframes image-tile-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
