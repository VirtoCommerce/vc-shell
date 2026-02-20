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
          :src="source"
          :title="label || 'Video'"
          width="100%"
          height="300px"
          frameborder="0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        >
        </iframe>
      </div>
      <div
        v-else
        class="vc-video__placeholder"
        role="img"
        aria-label="No video source"
      >
        <VcIcon
          icon="lucide-film"
          size="xl"
          aria-hidden="true"
        ></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon, VcLabel } from "@ui/components";

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
  --video-icon-color: var(--neutrals-400);
  --video-placeholder-bg: var(--neutrals-100);
  --video-border-radius: 6px;
  --video-border-color: var(--neutrals-200);
}

.vc-video {
  @apply tw-inline-block tw-relative;

  &__label {
    @apply tw-mb-2;
  }

  &__container {
    @apply tw-w-full tw-relative tw-rounded-[var(--video-border-radius)] tw-overflow-hidden tw-border tw-border-solid tw-border-[color:var(--video-border-color)];
  }

  &__placeholder {
    @apply tw-w-full tw-h-[200px] tw-flex tw-items-center tw-justify-center tw-text-[color:var(--video-icon-color)] tw-bg-[color:var(--video-placeholder-bg)];
  }
}
</style>
