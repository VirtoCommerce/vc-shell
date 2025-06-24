<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="['vc-svg-icon', !hasCustomSize && `vc-svg-icon--${size}`, variant ? `vc-svg-icon--${variant}` : '']"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <use
      v-if="resolvedIconPath"
      :xlink:href="resolvedIconPath"
    />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { IconSize, IconVariant } from "./types";
import { useIcon } from "./composables";

defineOptions({
  inheritAttrs: false,
});

interface Props {
  /**
   * Path to SVG icon or sprite
   */
  icon: string;

  /**
   * Icon size
   */
  size?: IconSize;

  /**
   * Variant for special coloring
   */
  variant?: IconVariant;

  /**
   * Base path prepended to icon path
   */
  basePath?: string;

  /**
   * Custom size in pixels
   */
  customSize?: number;

  /**
   * Stroke width for SVG icons
   */
  strokeWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  basePath: "/assets/icons",
});

// Check if using custom size to conditionally apply CSS class
const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

// Use the shared icon composable for consistent scaling
const { iconStyle } = useIcon({
  type: "svg",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

// Compute the full path to the icon
const resolvedIconPath = computed(() => {
  // Check if the icon is already a complete path
  if (props.icon.startsWith("/") || props.icon.includes("://") || props.icon.startsWith("#")) {
    return props.icon;
  }

  // Check if the icon is a reference to a sprite (contains #)
  const hashIndex = props.icon.indexOf("#");
  if (hashIndex > -1) {
    const spritePath = props.icon.substring(0, hashIndex);
    const iconId = props.icon.substring(hashIndex);
    return `${props.basePath}/${spritePath}${iconId}`;
  }

  // Apply basePath for relative paths
  return `${props.basePath}/${props.icon}`;
});

// Combine the shared icon styles with SVG-specific settings
const computedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  if (props.strokeWidth) {
    styles.strokeWidth = `${props.strokeWidth}`;
  }

  // If using custom size, make sure size is applied with !important
  if (hasCustomSize.value) {
    if (styles.width) styles.width = `${styles.width.replace("px", "")}px !important`;
    if (styles.height) styles.height = `${styles.height.replace("px", "")}px !important`;
  }

  return styles;
});
</script>

<style lang="scss">
.vc-svg-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
  vertical-align: middle;
  flex-shrink: 0;
  font-size: inherit;

  &--xs {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  &--s {
    width: var(--icon-size-s);
    height: var(--icon-size-s);
  }

  &--m {
    width: var(--icon-size-m);
    height: var(--icon-size-m);
  }

  &--l {
    width: var(--icon-size-l);
    height: var(--icon-size-l);
  }

  &--xl {
    width: var(--icon-size-xl);
    height: var(--icon-size-xl);
  }

  &--xxl {
    width: var(--icon-size-xxl);
    height: var(--icon-size-xxl);
  }

  &--xxxl {
    width: var(--icon-size-xxxl);
    height: var(--icon-size-xxxl);
  }

  &--warning {
    color: var(--icon-color-warning);
  }

  &--danger {
    color: var(--icon-color-danger);
  }

  &--success {
    color: var(--icon-color-success);
  }
}
</style>
