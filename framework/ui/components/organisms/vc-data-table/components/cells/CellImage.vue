<template>
  <VcImage
    class="vc-table-cell-image"
    :bordered="true"
    size="s"
    aspect="1x1"
    :src="src"
    :empty-icon="emptyIcon"
    background="contain"
    :thumbnail-size="isExternalImage(asset) ? undefined : 'sm'"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcImage } from "@ui/components/atoms";
import { isExternalImage } from "@core/utilities/thumbnail";

const props = defineProps<{
  /** The image URL, or the image object (`url`, `relativeUrl`) so an image from another host skips the thumbnail */
  value?: unknown;
  /** Icon to display when image is empty or missing */
  emptyIcon?: string;
}>();

const asset = computed(() =>
  props.value && typeof props.value === "object" ? (props.value as { url?: string; relativeUrl?: unknown }) : undefined,
);
const src = computed(() => (asset.value ? asset.value.url : (props.value as string | undefined)));
</script>

<style lang="scss">
.vc-table-cell-image {
  @apply tw-flex-shrink-0;
}
</style>
