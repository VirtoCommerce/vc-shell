<template>
  <div class="vc-image" :class="[`vc-image_${size}`]">
    <div
      :class="[
        `vc-image_${aspect}`,
        {
          'rounded-full pb-[var(--image-padding-bottom-1x1)]': rounded,
          'rounded-[3px] border border-solid border-[color:#efefef]': bordered,
          'cursor-pointer': clickable,
        },
        'relative',
      ]"
      :style="{
        background: src ? `url(${src}) center / cover no-repeat` : undefined,
      }"
      @click="onClick"
    >
      <div
        v-if="!src"
        class="absolute w-full h-full flex items-center justify-center text-[#83a3be]"
      >
        <VcIcon icon="fas fa-image" size="xl"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
});

const emit = defineEmits(["click"]);

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

$paddings: (
  1x1: 100%,
  16x9: 56.25%,
  4x3: 75%,
  3x2: 66.66%,
);

$aspects: xs, s, m, l, xl, xxl;

.vc-image {
  @apply inline-block relative;

  @each $name, $padding in $paddings {
    &_#{$name} {
      @apply pb-[#{$padding}];
    }
  }

  @each $aspect in $aspects {
    &_#{$aspect} {
      @apply w-[var(--image-size-#{$aspect})];
    }
  }

  &_auto {
    @apply w-full;
  }
}
</style>
