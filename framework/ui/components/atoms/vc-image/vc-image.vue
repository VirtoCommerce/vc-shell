<template>
  <div
    class="vc-image"
    :class="[`vc-image_${size}`]"
  >
    <div
      :class="[
        'vc-image__container',
        `vc-image_${aspect}`,
        {
          'vc-image__container--rounded': rounded,
          'vc-image__container--bordered': bordered,
          'vc-image__container--clickable': clickable,
        },
      ]"
      :style="imageHandler"
      @click="onClick"
    >
      <div
        v-if="!src"
        class="vc-image__placeholder"
      >
        <VcIcon
          :icon="emptyIcon"
          size="xl"
        ></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../vc-icon";
import { computed } from "vue";

export interface Props {
  aspect?: "1x1" | "16x9" | "4x3" | "3x2";
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
  src?: string;
  size?: "auto" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  background?: "cover" | "contain" | "auto";
  emptyIcon?: string;
}

export interface Emits {
  (event: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  aspect: "1x1",
  size: "auto",
  background: "cover",
  emptyIcon: "fas fa-image",
});

const emit = defineEmits<Emits>();

function ensureHttps(url: string): string {
  if (!url) return url;

  try {
    const urlObject = new URL(url);
    if (urlObject.protocol === "http:" && window.location.protocol === "https:") {
      urlObject.protocol = "https:";
      return urlObject.href;
    }
  } catch (e) {
    console.warn("Invalid URL:", url);
  }
  return url;
}

const imageHandler = computed(() => {
  if (props.src) {
    const secureUrl = ensureHttps(props.src);
    return `background: url(${CSS.escape(secureUrl)}) center / ${props.background} no-repeat`;
  }
  return undefined;
});

function onClick(): void {
  if (props.clickable) {
    emit("click");
  }
}
</script>

<style lang="scss">
:root {
  --image-size-xxs: 24px;
  --image-size-xs: 32px;
  --image-size-s: 48px;
  --image-size-m: 64px;
  --image-size-l: 96px;
  --image-size-xl: 128px;
  --image-size-xxl: 145px;

  --image-border-radius: 3px;
  --image-border-color: var(--neutrals-200);
  --image-empty-icon-color: var(--secondary-500);
}

$aspects: (
  1x1: 100%,
  16x9: 56.25%,
  4x3: 75%,
  3x2: 66.66%,
);

$sizes: xxs, xs, s, m, l, xl, xxl;

.vc-image {
  @apply tw-inline-block tw-relative;

  @each $name, $aspect in $aspects {
    &_#{$name} {
      @apply tw-pb-[#{$aspect}];
    }
  }

  @each $size in $sizes {
    &_#{$size} {
      @apply tw-w-[var(--image-size-#{$size})] tw-max-w-full tw-min-w-0;
    }
  }

  &_auto {
    @apply tw-w-full;
  }

  &__container {
    @apply tw-relative;
  }

  &__container--rounded {
    @apply tw-rounded-full;
  }

  &__container--bordered {
    @apply tw-rounded-[var(--image-border-radius)] tw-border tw-border-solid tw-border-[color:var(--image-border-color)];
  }

  &__container--clickable {
    @apply tw-cursor-pointer;
  }

  &__placeholder {
    @apply tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[color:var(--image-empty-icon-color)];
  }
}
</style>
