<template>
  <i
    :class="[
      'vc-bootstrap-icon',
      !hasCustomSize && `vc-bootstrap-icon--${size}`,
      iconClass,
      variant ? `vc-bootstrap-icon--${variant}` : '',
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
   * Bootstrap icon name (e.g. "bi-house" or "house")
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
  type: "bootstrap",
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

// Compute proper Bootstrap icon class
const iconClass = computed(() => {
  if (!props.icon) return "";

  const icon = props.icon.startsWith("bi-") ? props.icon.substring(3) : props.icon;
  return `bi-${icon}`;
});
</script>

<style lang="scss">
.vc-bootstrap-icon {
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
