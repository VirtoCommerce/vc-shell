<template>
  <i :class="[`vc-icon vc-icon_${size} ${(icon as string).toLowerCase()}`, variant ? `vc-icon_${variant}` : '']" />
</template>

<script lang="ts" setup>
export interface Props {
  icon?: string;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  variant?: "warning" | "danger" | "success";
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
  --icon-size-xxxl: 64px;

  --icon-color-success: #99c17a;
  --icon-color-danger: #f34747;
  --icon-color-warning: #f89406;
}

$sizes: xs, s, m, l, xl, xxl, xxxl;
$variants: warning, danger, success;

.vc-icon {
  @each $size in $sizes {
    &_#{$size} {
      @apply tw-text-[length:var(--icon-size-#{$size})];
    }
  }

  @each $variant in $variants {
    &_#{$variant} {
      @apply tw-text-[color:var(--icon-color-#{$variant})];
    }
  }
}
</style>
