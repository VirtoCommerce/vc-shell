<template>
  <Icon
    :icon="iconName"
    :class="['vc-fa-icon', !hasCustomSize && `vc-fa-icon--${size}`, variant ? `vc-fa-icon--${variant}` : '']"
    :style="mergedStyle"
    aria-hidden="true"
  />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { IconSize, IconVariant } from "./types";
import { useIcon } from "./composables";

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

const iconName = computed(() => {
  const iconParts = props.icon.split(" ");
  let style = "solid";
  let name = props.icon;

  if (iconParts.length > 1) {
    const prefix = iconParts[0];
    name = iconParts.slice(1).join(" ").replace("fa-", "");

    switch (prefix) {
      case "fas":
        style = "solid";
        break;
      case "far":
        style = "regular";
        break;
      case "fab":
        style = "brands";
        break;
      case "fal":
        style = "light";
        break;
      case "fad":
        style = "duotone";
        break;
      default:
        name = props.icon.replace("fa-", "");
        break;
    }
  } else {
    name = name.replace("fa-", "");
  }

  return `fa-${style}:${name}`;
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
