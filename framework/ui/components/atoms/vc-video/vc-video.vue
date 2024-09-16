<template>
  <div class="tw-inline-block tw-relative">
    <VcLabel
      v-if="label"
      class="tw-mb-2"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <div class="tw-w-full tw-relative">
      <div v-if="source">
        <iframe
          :src="`${source}`"
          width="100%"
          height="300px"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen="false"
        >
        </iframe>
      </div>
      <div
        v-else
        class="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[--video-icon-color]"
      >
        <VcIcon
          icon="fas fa-film"
          size="xl"
        ></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon, VcLabel } from "./../../";

export interface Props {
  label?: string;
  tooltip?: string;
  source?: string;
}

export interface Emits {
  (event: "click"): void;
}

defineProps<Props>();

defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --video-icon-color: var(--primary-400);
}
</style>
