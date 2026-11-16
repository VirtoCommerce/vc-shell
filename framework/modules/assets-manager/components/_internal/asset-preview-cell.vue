<template>
  <div class="tw-flex tw-items-center tw-justify-center">
    <VcImage
      v-if="isImage(name)"
      :bordered="true"
      size="s"
      aspect="1x1"
      :src="url"
      background="contain"
    />
    <div
      v-else
      class="assets-manager__file-badge"
      :style="{ backgroundColor: getExtensionColor(name) }"
    >
      {{ getExtensionLabel(name) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { isImage, getExtensionColor, getExtensionLabel } from "@core/utilities/assets";
import { VcImage } from "@ui/components";

defineProps<{
  name: string;
  url?: string;
}>();
</script>

<style lang="scss">
.assets-manager__file-badge {
  @apply tw-flex tw-items-center tw-justify-center;
  @apply tw-px-2.5 tw-py-1;
  @apply tw-rounded;
  @apply tw-text-xs tw-font-bold tw-tracking-wide;
  @apply tw-text-white;
}
</style>
