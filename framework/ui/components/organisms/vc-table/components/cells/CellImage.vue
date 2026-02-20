<template>
  <VcImage
    class="vc-table-cell-image"
    :bordered="true"
    size="s"
    aspect="1x1"
    :src="(value as string)"
    :empty-icon="emptyIcon"
    background="contain"
  />
</template>

<script setup lang="ts">
import { VcImage } from "@ui/components/atoms";

defineProps<{
  /** The image URL to display */
  value?: unknown;
  /** Icon to display when image is empty or missing */
  emptyIcon?: string;
}>();
</script>

<style lang="scss">
.vc-table-cell-image {
  @apply tw-flex-shrink-0;
}
</style>
