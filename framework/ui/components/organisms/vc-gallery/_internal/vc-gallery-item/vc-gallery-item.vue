<template>
  <div
    v-on-click-outside="onClose"
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item--readonly': readonly,
      'vc-gallery-item--hover': hover,
    }"
    @tap.stop="hover = !hover"
  >
    <VcImage
      aspect="1x1"
      :src="image.url"
      background="contain"
    ></VcImage>
    <div class="vc-gallery-item__overlay">
      <div class="vc-gallery-item__overlay-content">
        <VcIcon
          v-if="!readonly && !disableDrag"
          class="vc-gallery-item__move"
          icon="material-drag_indicator"
          size="s"
        ></VcIcon>
        <div
          class="vc-gallery-item__image-name"
          :title="image.name"
        >
          {{ image.name }}
        </div>
      </div>
      <div class="vc-gallery-item__actions">
        <div
          v-if="actions && actions.preview"
          class="vc-gallery-item__button"
          @click="$emit('preview', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="material-open_in_full"
          ></VcIcon>
          <div class="vc-gallery-item__button-text">
            {{ t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN") }}
          </div>
        </div>
        <div
          v-if="!readonly && actions && actions.edit"
          class="vc-gallery-item__button"
          @click="$emit('edit', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="material-edit"
          ></VcIcon>
          <div class="vc-gallery-item__button-text">
            {{ $t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.EDIT") }}
          </div>
        </div>
        <div
          v-if="!readonly && actions && actions.remove"
          class="vc-gallery-item__button"
          @click="$emit('remove', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="material-delete"
          ></VcIcon>
          <div class="vc-gallery-item__button-text">
            {{ $t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { ICommonAsset } from "@core/types";
import { VcImage, VcIcon } from "@ui/components";
import { useI18n } from "vue-i18n";

export interface Props {
  image: ICommonAsset;
  readonly?: boolean | undefined;
  actions?: {
    preview: boolean | undefined;
    edit: boolean | undefined;
    remove: boolean | undefined;
  };
  disableDrag?: boolean | undefined;
}

withDefaults(defineProps<Props>(), {
  image: () => ({}) as ICommonAsset,
  readonly: false,
  actions: () => ({
    name: undefined,
    preview: undefined,
    edit: undefined,
    remove: undefined,
  }),
  disableDrag: false,
});

defineEmits(["preview", "edit", "remove"]);
const { t } = useI18n({ useScope: "global" });
const hover = ref(false);

function onClose() {
  hover.value = false;
}
</script>

<style lang="scss">
:root {
  --gallery-item-border-color: var(--secondary-200);
  --gallery-item-overlay-bg-color: var(--primary-100);
  --gallery-item-move-icon-color: var(--secondary-300);
  --gallery-item-button-icon-color: var(--primary-500);
}

.vc-gallery-item {
  @apply tw-relative tw-w-[155px] tw-h-[155px] tw-box-border tw-border tw-border-solid tw-border-[var(--gallery-item-border-color)] tw-rounded-md tw-p-1;

  &__overlay {
    @apply tw-bg-[var(--gallery-item-overlay-bg-color)] tw-opacity-0 tw-flex tw-flex-col tw-p-2 tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-transition-opacity tw-duration-200;
  }

  &:hover &__overlay,
  .vc-app_touch &--hover &__overlay {
    @apply tw-opacity-100;
  }

  &__move {
    @apply tw-text-[var(--gallery-item-move-icon-color)] tw-cursor-move tw-mr-2;
  }

  &__button {
    @apply tw-cursor-pointer tw-flex tw-flex-col tw-items-center;

    &-icon {
      @apply tw-text-[var(--gallery-item-button-icon-color)];
    }

    &-text {
      @apply tw-mt-2 tw-text-sm;
    }
  }

  &__overlay-content {
    @apply tw-flex;
  }

  &__image-name {
    @apply tw-truncate tw-text-sm;
  }

  &__actions {
    @apply tw-flex tw-grow tw-basis-0 tw-items-center tw-justify-around;
  }
}
</style>
