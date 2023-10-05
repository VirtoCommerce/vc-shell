<template>
  <div
    class="vc-video"
    :class="[`vc-video_${size}`]"
  >
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

    <div
      :class="[
        `vc-video_${aspect}`,
        {
          'tw-rounded-full tw-pb-[var(--video-padding-bottom-1x1)]': rounded,
          'tw-rounded-[3px] tw-border tw-border-solid tw-border-[color:#efefef]': bordered,
          'tw-cursor-pointer': clickable,
        },
        'tw-relative',
      ]"
    >
      <div v-if="source">
        <iframe
          :src="`${source}`"
          width="100%"
          height="300"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen="false"
        >
        </iframe>
      </div>
      <div
        v-else
        class="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[#83a3be]"
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
  aspect?: string;
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
  source?: string;
  size?: "auto" | "1x1" | "16x9" | "4x3" | "3x2" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  background?: "cover" | "contain" | "auto";
}

export interface Emits {
  (event: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  aspect: "1x1",
  size: "auto",
  background: "cover",
});

const emit = defineEmits<Emits>();
</script>

<style lang="scss">
:root {
  --image-size-xs: 32px;
  --image-size-s: 48px;
  --image-size-m: 64px;
  --image-size-l: 96px;
  --image-size-xl: 128px;
  --image-size-xxl: 145px;
}

$aspects: (
  1x1: 100%,
  16x9: 56.25%,
  4x3: 75%,
  3x2: 66.66%,
);

$paddings: xs, s, m, l, xl, xxl;

.vc-video {
  @apply tw-inline-block tw-relative;

  @each $name, $aspect in $aspects {
    &_#{$name} {
      @apply tw-pb-[#{$aspect}];
    }
  }

  @each $padding in $paddings {
    &_#{$padding} {
      @apply tw-w-[var(--image-size-#{$padding})];
    }
  }

  &_auto {
    @apply tw-w-full;
  }
}
</style>
