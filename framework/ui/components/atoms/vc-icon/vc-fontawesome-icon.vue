<template>
  <i
    :class="[
      'vc-fa-icon',
      !hasCustomSize && `vc-fa-icon--${size}`,
      iconClasses,
      variant ? `vc-fa-icon--${variant}` : '',
    ]"
    :style="customSizeStyle"
    aria-hidden="true"
  ></i>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import type { IconSize, IconVariant } from "@ui/components/atoms/vc-icon/types";

interface Props {
  /**
   * @deprecated FontAwesome icons are deprecated. Use Lucide icons instead (e.g. "lucide-home").
   * Font Awesome icon class name (e.g. "fas fa-user" or "fa-user").
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

// Direct custom size style — no scaling factors
const customSizeStyle = computed(() => (props.customSize ? { fontSize: `${props.customSize}px` } : undefined));

// Deprecation warning (dev-only)
onMounted(() => {
  if (import.meta.env.DEV) {
    console.warn(
      `[VcIcon] FontAwesome icon "${props.icon}" is deprecated. ` +
        `Migrate to Lucide: use "lucide-{name}" instead (e.g. "lucide-home" instead of "fa-home"). ` +
        `See https://lucide.dev/icons for available icons.`,
    );
  }
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
