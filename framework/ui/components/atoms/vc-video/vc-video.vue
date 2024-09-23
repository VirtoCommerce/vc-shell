<template>
  <div class="vc-video">
    <VcLabel
      v-if="label"
      class="vc-video__label"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        {{ tooltip }}
      </template>
    </VcLabel>

    <div class="vc-video__container">
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
        class="vc-video__placeholder"
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

.vc-video {
  @apply tw-inline-block tw-relative;

  &__label {
    @apply tw-mb-2;
  }

  &__container {
    @apply tw-w-full tw-relative;
  }

  &__placeholder {
    @apply tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[color:var(--video-icon-color)];
  }
}
</style>
