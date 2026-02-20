<template>
  <i
    :class="[
      'vc-fa-icon',
      !hasCustomSize && `vc-fa-icon--${size}`,
      iconClasses,
      variant ? `vc-fa-icon--${variant}` : '',
    ]"
    :style="mergedStyle"
    aria-hidden="true"
  ></i>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { IconSize, IconVariant } from "@ui/components/atoms/vc-icon/types";
import { useIcon } from "@ui/components/atoms/vc-icon/composables";

interface Props {
  /**
   * Font Awesome icon class name (e.g. "fas fa-user" or "fa-user")
   */
  icon: string;

  /**
   * Icon size
   */
  size?: IconSize;

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
});

// Check if using custom size to conditionally apply CSS class
const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

// Use the shared icon composable for consistent scaling
const { iconStyle } = useIcon({
  type: "fontawesome",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

// Create the merged style with !important to override any CSS classes
const mergedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  // If using custom size, make sure fontSize is applied with !important
  if (hasCustomSize.value && styles.fontSize) {
    styles.fontSize = `${styles.fontSize.replace("px", "")}px !important`;
  }

  return styles;
});

// Compute the FontAwesome class from the icon string
const iconClasses = computed(() => {
  // If icon already has a style prefix (fas, far, fal, fab), use it as is
  if (
    props.icon.startsWith("fas ") ||
    props.icon.startsWith("far ") ||
    props.icon.startsWith("fal ") ||
    props.icon.startsWith("fab ") ||
    props.icon.startsWith("fad ")
  ) {
    return props.icon;
  }

  // If icon starts with fa-, add the default style prefix
  if (props.icon.startsWith("fa-")) {
    return `fas ${props.icon}`;
  }

  // If icon contains fa- but doesn't start with a style prefix, assume the style prefix is included
  if (props.icon.includes("fa-")) {
    return props.icon;
  }

  // Otherwise, assume it's a bare icon name and add both the style prefix and fa- prefix
  return `fas fa-${props.icon}`;
});
</script>

<style lang="scss">
.vc-fa-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
