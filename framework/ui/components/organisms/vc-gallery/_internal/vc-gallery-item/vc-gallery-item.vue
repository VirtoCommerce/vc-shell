<template>
  <div
    v-on-click-outside="onClose"
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item_readonly': readonly,
      'vc-gallery-item_hover': hover,
    }"
    @tap.stop="hover = !hover"
  >
    <VcImage
      aspect="1x1"
      :src="image['url']"
      background="contain"
    ></VcImage>
    <div class="vc-gallery-item__overlay">
      <div class="tw-flex">
        <VcIcon
          v-if="!readonly && !disableDrag"
          class="vc-gallery-item__move"
          icon="fas fa-arrows-alt"
          size="s"
        ></VcIcon>
        <div
          class="tw-truncate"
          :title="image['name']"
        >
          {{ image["name"] }}
        </div>
      </div>
      <div class="tw-flex tw-grow tw-basis-0 tw-items-center tw-justify-around">
        <div
          v-if="actions && actions.preview"
          class="vc-gallery-item__button"
          @click="$emit('preview', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-eye"
          ></VcIcon>
          <div class="tw-mt-2">{{ t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.FULLSCREEN") }}</div>
        </div>
        <div
          v-if="!readonly && actions && actions.edit"
          class="vc-gallery-item__button"
          @click="$emit('edit', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-pen"
          ></VcIcon>
          <div class="tw-mt-2">{{ $t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.EDIT") }}</div>
        </div>
        <div
          v-if="!readonly && actions && actions.remove"
          class="vc-gallery-item__button"
          @click="$emit('remove', image)"
        >
          <VcIcon
            class="vc-gallery-item__button-icon"
            icon="fas fa-trash"
          ></VcIcon>
          <div class="tw-mt-2">{{ $t("COMPONENTS.ORGANISMS.VC_GALLERY.INTERNAL.VC_GALLERY_ITEM.DELETE") }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { IImage } from "./../../../../../../core/types";
import { VcImage, VcIcon } from "./../../../../";
import { useI18n } from "vue-i18n";

export interface Props {
  image: IImage;
  readonly?: boolean | undefined;
  actions?:
    | {
        name?: string | undefined;
        preview: boolean | undefined;
        edit: boolean | undefined;
        remove: boolean | undefined;
      }
    | undefined;
  disableDrag?: boolean | undefined;
}

withDefaults(defineProps<Props>(), {
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
.vc-gallery-item {
  @apply tw-relative tw-w-[155px] tw-h-[155px] tw-box-border tw-border tw-border-solid tw-border-[#d3dae9] tw-rounded-md tw-p-1;

  &__overlay {
    @apply tw-bg-[rgba(238,246,252,0.97)] tw-flex-col tw-p-2 tw-opacity-0 tw-flex tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-transition  tw-duration-200;
  }

  &:hover &__overlay,
  .vc-app_touch &_hover &__overlay {
    @apply tw-opacity-100;
  }

  &__move {
    @apply tw-text-[#a1c0d4] tw-cursor-move tw-mr-2;
  }

  &__button {
    @apply tw-cursor-pointer tw-flex tw-flex-col tw-items-center;

    &-icon {
      @apply tw-text-[#319ed4];
    }
  }
}
</style>
