<template>
  <i :class="`vc-icon vc-icon_${size} ${icon.toLowerCase()}`" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcIcon",

  props: {
    icon: {
      type: String,
      default: "fas fa-square-full",
    },

    size: {
      type: String,
      default: "m",
    },
  },
});
</script>

<style lang="less">
:root {
  --icon-size-xs: 12px;
  --icon-size-s: 14px;
  --icon-size-m: 18px;
  --icon-size-l: 20px;
  --icon-size-xl: 22px;
  --icon-size-xxl: 30px;
}

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
