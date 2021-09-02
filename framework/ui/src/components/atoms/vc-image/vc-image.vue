<template>
  <div class="vc-image" :class="[`vc-image_${size}`]">
    <div
      :class="[
        `vc-image_${aspect}`,
        {
          'vc-image_rounded': rounded,
          'vc-image_bordered': bordered,
          'vc-image_clickable': clickable,
        },
      ]"
      :style="{ background: `url(${src}) center / cover no-repeat` }"
      @click="onClick"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
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
  },

  emits: ["click"],

  setup(props, { emit }) {
    return {
      onClick(): void {
        if (props.clickable) {
          emit("click");
        }
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --image-size-xs: 32px;
  --image-size-s: 48px;
  --image-size-m: 64px;
  --image-size-l: 96px;
  --image-size-xl: 128px;
}

.vc-image {
  display: inline-block;

  &_1x1 {
    padding-bottom: 100%;
  }

  &_16x9 {
    padding-bottom: 56.25%;
  }

  &_4x3 {
    padding-bottom: 75%;
  }

  &_3x2 {
    padding-bottom: 66.66%;
  }

  &_auto {
    width: 100%;
  }

  &_xs {
    width: var(--image-size-xs);
  }

  &_s {
    width: var(--image-size-s);
  }

  &_m {
    width: var(--image-size-m);
  }

  &_l {
    width: var(--image-size-l);
  }

  &_xl {
    width: var(--image-size-xl);
  }

  &_rounded {
    padding-bottom: var(--image-padding-bottom-1x1);
    border-radius: 50%;
  }

  &_bordered {
    border-radius: 3px;
    border: 1px solid #efefef;
  }

  &_clickable {
    cursor: pointer;
  }
}
</style>
