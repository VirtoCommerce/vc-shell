<template>
  <span
    :class="[
      'vc-material-icon',
      'material-symbols-' + type,
      !hasCustomSize && `vc-material-icon--${size}`,
      variant ? `vc-material-icon--${variant}` : '',
    ]"
    :style="iconStyle"
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
   * Material icon name (e.g., "home", "settings", "account_circle")
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
   * Custom size in pixels
   */
  customSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  type: "outlined",
});

const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

const { iconStyle } = useIcon({
  type: "material",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});
</script>

<style lang="scss">
.vc-material-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-feature-settings: "liga"; // Enable ligatures for icons
  font-style: normal;
  font-weight: normal;
  letter-spacing: normal;
  line-height: 1;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  // Sizes
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

  // Variants
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

// Base class provided by the @material-symbols/font-300 package
.material-symbols-outlined,
.material-symbols-rounded,
.material-symbols-sharp {
  font-family: "Material Symbols Outlined", "Material Symbols Rounded", "Material Symbols Sharp";
}
</style>
