<template>
  <VcImageTile
    :src="image.url"
    :alt="image.altText || image.name || ''"
    :name="image.name"
    :image-fit="imageFit"
    :actions="resolvedActions"
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item--readonly': readonly,
    }"
    @preview="$emit('preview', image)"
    @edit="$emit('edit', image)"
    @remove="$emit('remove', image)"
  >
    <template #overlay>
      <div
        v-if="!readonly && !disableDrag"
        class="vc-gallery-item__drag-handle"
      >
        <VcIcon
          icon="lucide-grip-vertical"
          size="s"
        />
      </div>
    </template>
  </VcImageTile>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ICommonAsset } from "@core/types";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcImageTile } from "@ui/components/molecules/vc-image-tile";

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

const resolvedActions = computed(() => ({
  preview: props.actions?.preview !== false,
  edit: !props.readonly && props.actions?.edit !== false,
  remove: !props.readonly && props.actions?.remove !== false,
}));
</script>

<style lang="scss">
.vc-gallery-item {
  &__drag-handle {
    @apply tw-absolute tw-top-1 tw-left-1 tw-opacity-0 tw-transition-opacity tw-duration-200
      tw-cursor-move tw-z-[1] tw-p-0.5 tw-rounded;
    color: var(--secondary-400);
  }

  @media (hover: hover) {
    &:hover &__drag-handle {
      @apply tw-opacity-100;
    }
  }

  &:global(.vc-image-tile--active) &__drag-handle {
    @apply tw-opacity-100;
  }
}
</style>
