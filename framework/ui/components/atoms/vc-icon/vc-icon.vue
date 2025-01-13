<template>
  <component
    :is="isCustomIcon ? safeIcon : 'i'"
    :class="[
      'vc-icon',
      `vc-icon_${size}`,
      variant ? `vc-icon_${variant}` : '',
      !isCustomIcon ? (icon as string).toLowerCase() : '',
    ]"
    v-bind="isCustomIcon ? { width: iconSize, height: iconSize } : {}"
  />
</template>

<script lang="ts" setup>
import { computed, markRaw } from "vue";
import type { Component } from "vue";

export interface Props {
  icon?: string | Component;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  variant?: "warning" | "danger" | "success";
}

const props = withDefaults(defineProps<Props>(), {
  icon: "fas fa-square-full",
  size: "m",
});

const isCustomIcon = computed(() => typeof props.icon !== "string");

const safeIcon = computed(() => (typeof props.icon !== "string" ? markRaw(props.icon) : props.icon));

const sizeMap = {
  xs: 12,
  s: 14,
  m: 18,
  l: 20,
  xl: 22,
  xxl: 30,
  xxxl: 64,
} as const;

const iconSize = computed(() => sizeMap[props.size]);
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

  --icon-color-success: var(--success-500);
  --icon-color-danger: var(--danger-500);
  --icon-color-warning: var(--warning-500);
}

$sizes: xs, s, m, l, xl, xxl, xxxl;
$variants: warning, danger, success;

.vc-icon {
  @apply tw-overflow-visible;
  @each $size in $sizes {
    &_#{$size} {
      @apply tw-text-[length:var(--icon-size-#{$size})];
    }
  }

  @each $variant in $variants {
    &_#{$variant} {
      @apply tw-text-[color:var(--icon-color-#{$variant})];

      :deep(path) {
        stroke: var(--icon-color-#{$variant});
      }
    }
  }
}
</style>
