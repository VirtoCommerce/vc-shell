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
import { computed, markRaw, resolveComponent } from "vue";
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

// Check if the icon is a component or can be resolved as a component
const isCustomIcon = computed(() => {
  if (typeof props.icon !== "string") {
    return true; // Component instance passed directly
  }

  // Check if string is a component name that can be resolved
  const resolved = resolveComponent(props.icon);
  return resolved !== props.icon; // If resolved is different from original string, it's a component name
});

// Get the component instance for rendering
const safeIcon = computed(() => {
  if (typeof props.icon !== "string") {
    return markRaw(props.icon); // Use markRaw for direct component instances
  }

  // Try to resolve component by name
  const resolved = resolveComponent(props.icon);
  return resolved !== props.icon ? resolved : "i"; // Return resolved component or fallback to 'i'
});

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
  overflow: visible;
}

@each $size in $sizes {
  .vc-icon_#{$size} {
    font-size: var(--icon-size-#{$size});
  }
}

@each $variant in $variants {
  .vc-icon_#{$variant} {
    color: var(--icon-color-#{$variant});

    :deep(path) {
      stroke: var(--icon-color-#{$variant});
    }
  }
}
</style>
