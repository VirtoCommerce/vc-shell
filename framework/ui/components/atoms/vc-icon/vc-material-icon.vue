<template>
  <span
    :class="[
      'vc-material-icon',
      !hasCustomSize && `vc-material-icon--${size}`,
      variant ? `vc-material-icon--${variant}` : '',
      materialIconClass,
    ]"
    :style="computedStyle"
    aria-hidden="true"
  >
    {{ icon }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { IconSize, IconVariant } from "./types";
import { useIcon } from "./composables";

interface Props {
  /**
   * Material icon name
   */
  icon: string;

  /**
   * Icon size
   */
  size?: IconSize;

  /**
   * Type of the Material icon (outlined, rounded, sharp)
   */
  type?: "outlined" | "rounded" | "sharp";

  /**
   * Icon color variant
   */
  variant?: IconVariant;

  /**
   * Fill value (0-1)
   */
  fill?: number;

  /**
   * Weight value (100-700)
   */
  weight?: number;

  /**
   * Grade value (-25 to 200)
   */
  grade?: number;

  /**
   * Custom size in pixels
   */
  customSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  type: "outlined",
  fill: 0,
  weight: 300,
  grade: 0,
});

// Check if using custom size to conditionally apply CSS class
const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

// Use the shared icon composable for consistent scaling
const { iconStyle } = useIcon({
  type: "material",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

// Compute the Google Material Symbols class based on type
const materialIconClass = computed(() => {
  switch (props.type) {
    case "rounded":
      return "material-symbols-rounded";
    case "sharp":
      return "material-symbols-sharp";
    case "outlined":
    default:
      return "material-symbols-outlined";
  }
});

// Combine the shared icon styles with Material-specific settings
const computedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  // Apply Material variation settings
  styles.fontVariationSettings = `'FILL' ${props.fill}, 'wght' ${props.weight}, 'GRAD' ${props.grade}`;

  // If using custom size, make sure fontSize is applied with !important
  if (hasCustomSize.value && styles.fontSize) {
    styles.fontSize = `${styles.fontSize.replace("px", "")}px !important`;
  }

  return styles;
});
</script>

<style lang="scss">
.vc-material-icon {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-size: inherit;

  &--xs {
    font-size: var(--icon-size-xs);
  }

  &--s {
    font-size: var(--icon-size-s);
  }

  &--m {
    font-size: var(--icon-size-m);
  }

  &--l {
    font-size: var(--icon-size-l);
  }

  &--xl {
    font-size: var(--icon-size-xl);
  }

  &--xxl {
    font-size: var(--icon-size-xxl);
  }

  &--xxxl {
    font-size: var(--icon-size-xxxl);
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
