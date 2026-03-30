<template>
  <VcImageTile
    :src="image.url"
    :alt="image.altText || image.name || ''"
    :name="image.name"
    :image-fit="imageFit"
    :thumbnail-size="thumbnailSize"
    :actions="resolvedActions"
    class="vc-gallery-item"
    :class="{
      'vc-gallery-item--readonly': readonly,
      'vc-gallery-item--mobile': isMobile,
    }"
    @preview="$emit('preview', image)"
    @edit="$emit('edit', image)"
    @remove="$emit('remove', image)"
  >
    <template #overlay>
      <div
        v-if="!readonly && !disableDrag"
        class="vc-gallery-item__drag-handle"
        :class="{ 'vc-gallery-item__drag-handle--mobile': isMobile }"
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
import type { AssetLike } from "@core/composables/useAssetsManager";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcImageTile } from "@ui/components/molecules/vc-image-tile";
import { useResponsive } from "@framework/core/composables/useResponsive";
import type { ThumbnailSize } from "@core/utilities/thumbnail";

export interface Props {
  image: AssetLike;
  readonly?: boolean;
  actions?: {
    preview?: boolean;
    edit?: boolean;
    remove?: boolean;
  };
  disableDrag?: boolean;
  imageFit?: "contain" | "cover";
  thumbnailSize?: ThumbnailSize;
}

const props = withDefaults(defineProps<Props>(), {
  image: () => ({}) as AssetLike,
  readonly: false,
  disableDrag: false,
  imageFit: "contain",
});

const { isMobile } = useResponsive();

defineEmits<{
  (e: "preview", image: AssetLike): void;
  (e: "edit", image: AssetLike): void;
  (e: "remove", image: AssetLike): void;
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
    @apply tw-cursor-move tw-p-0.5 tw-rounded tw-shrink-0;
    color: var(--secondary-400);
  }
}
</style>
