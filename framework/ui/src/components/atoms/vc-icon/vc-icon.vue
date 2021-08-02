<template>
  <i
    :class="`vc-icon vc-icon_${size} fa${
      family.toLowerCase()[0]
    } fa-${icon.toLowerCase()}`"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    icon: {
      type: String,
      default: "square-full",
    },

    family: {
      type: String,
      default: "solid",
    },

    size: {
      type: String,
      default: "m",
    },
  },
});
</script>

<style lang="less">
.vc-icon {
  &_xs {
    font-size: var(--icon-size-xs);
  }

  &_s {
    font-size: var(--icon-size-s);
  }

  &_m {
    font-size: var(--icon-size-m);
  }

  &_l {
    font-size: var(--icon-size-l);
  }

  &_xl {
    font-size: var(--icon-size-xl);
  }

  &_xxl {
    font-size: var(--icon-size-xxl);
  }
}
</style>
