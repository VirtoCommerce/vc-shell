<template>
  <div class="vc-image" :class="[`vc-image_${size}`]">
    <div
      :class="[
        `vc-image_${aspect}`,
        {
          'tw-rounded-full tw-pb-[var(--image-padding-bottom-1x1)]': rounded,
          'tw-rounded-[3px] tw-border tw-border-solid tw-border-[color:#efefef]': bordered,
          'tw-cursor-pointer': clickable,
        },
        'tw-relative',
      ]"
      :style="imageHandler"
      @click="onClick"
    >
      <div
        v-if="!src"
        class="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[#83a3be]"
      >
        <VcIcon icon="fas fa-image" size="xl"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  aspect: {
    type: String,
    default: "1x1",
  },

  rounded: {
    type: Boolean,
    default: false,
  },

  bordered: {
    type: Boolean,
    default: false,
  },

  clickable: {
    type: Boolean,
    default: false,
  },

  src: {
    type: String,
    default: undefined,
  },

  size: {
    type: String,
    default: "auto",
  },

  background: {
    type: String,
    default: "cover",
  },
});

const emit = defineEmits(["click"]);

const imageHandler = computed(() => {
  if (props.src) {
    return `background: url(${encodeURI(props.src)}) center / ${
      props.background
    } no-repeat`;
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

.vc-image {
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
