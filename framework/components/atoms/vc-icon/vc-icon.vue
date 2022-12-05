<template>
  <i :class="`vc-icon vc-icon_${size} ${icon.toLowerCase()}`" />
</template>

<script lang="ts" setup>
export interface Props {
  icon?: string;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl";
}

withDefaults(defineProps<Props>(), {
  icon: "fas fa-square-full",
  size: "m",
});
</script>

<style lang="scss">
:root {
  --icon-size-xs: 12px;
  --icon-size-s: 14px;
  --icon-size-m: 18px;
  --icon-size-l: 20px;
  --icon-size-xl: 22px;
  --icon-size-xxl: 30px;
}

$sizes: xs, s, m, l, xl, xxl;

.vc-icon {
  @each $size in $sizes {
    &_#{$size} {
      @apply text-[length:var(--icon-size-#{$size})];
    }
  }
}
</style>
