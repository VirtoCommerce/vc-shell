<template>
  <div class="vc-thumbnail" :class="[`vc-thumbnail_${size}`]">
    <div
      :class="[
        `vc-thumbnail_${aspect}`,
        {
          'vc-thumbnail_rounded': rounded,
          'vc-thumbnail_clickable': clickable,
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
  --thumbnail-padding-bottom-1x1: 100%;
  --thumbnail-padding-bottom-16x9: 56.25%;
  --thumbnail-padding-bottom-4x3: 75%;
  --thumbnail-padding-bottom-3x2: 66.66%;

  --thumbnail-size-xs: 32px;
  --thumbnail-size-s: 48px;
  --thumbnail-size-m: 64px;
  --thumbnail-size-l: 96px;
  --thumbnail-size-xl: 128px;
}

.vc-thumbnail {
  display: inline-block;

  &_1x1 {
    padding-bottom: var(--thumbnail-padding-bottom-1x1);
  }

  &_16x9 {
    padding-bottom: var(--thumbnail-padding-bottom-16x9);
  }

  &_4x3 {
    padding-bottom: var(--thumbnail-padding-bottom-4x3);
  }

  &_3x2 {
    padding-bottom: var(--thumbnail-padding-bottom-3x2);
  }

  &_auto {
    width: 100%;
  }

  &_xs {
    width: var(--thumbnail-size-xs);
  }

  &_s {
    width: var(--thumbnail-size-s);
  }

  &_m {
    width: var(--thumbnail-size-m);
  }

  &_l {
    width: var(--thumbnail-size-l);
  }

  &_xl {
    width: var(--thumbnail-size-xl);
  }

  &_rounded {
    padding-bottom: var(--thumbnail-padding-bottom-1x1);
    border-radius: 50%;
  }

  &_clickable {
    cursor: pointer;
  }
}
</style>
