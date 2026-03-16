<template>
  <component
    :is="resolvedIconComponent"
    v-if="resolvedIconComponent"
    :stroke-width="props.strokeWidth"
    :class="[
      'vc-lucide-icon',
      !hasCustomSize && `vc-lucide-icon--${size}`,
      variant ? `vc-lucide-icon--${variant}` : '',
    ]"
    :style="computedStyle"
    aria-hidden="true"
  />
  <span
    v-else
    :class="['vc-lucide-icon', !hasCustomSize && `vc-lucide-icon--${size}`]"
  >
    <i class="vc-lucide-icon__fallback"></i>
  </span>
</template>

<script lang="ts" setup>
import { computed, markRaw } from "vue";
import type { Component } from "vue";
import type { IconSize, IconVariant } from "@ui/components/atoms/vc-icon/types";
import * as LucideIcons from "lucide-vue-next";
import { createLogger } from "@core/utilities";

const logger = createLogger("vc-lucide-icon");

interface Props {
  /**
   * Lucide icon name or reference
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
   * Stroke width for SVG
   */
  strokeWidth?: number;

  /**
   * Custom size in pixels
   */
  customSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  strokeWidth: 2,
});

// Check if using custom size to conditionally apply CSS class
const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

// Normalize the icon name for Lucide: "lucide-arrow-right" → "ArrowRightIcon"
const normalizedIconName = computed(() => {
  if (!props.icon) return "HelpCircleIcon";

  let name = props.icon;
  if (name.startsWith("lucide-")) {
    name = name.substring(7);
  }

  // Strip trailing "Icon" or "icon" suffix (case-insensitive) to avoid double-suffix
  if (name.toLowerCase().endsWith("icon")) {
    name = name.slice(0, -4);
  }

  // Convert to PascalCase if kebab-case
  if (name.includes("-")) {
    name = name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  // Ensure first letter is capitalized and append Icon suffix
  return name.charAt(0).toUpperCase() + name.slice(1) + "Icon";
});

// Synchronous component resolution from static import
const resolvedIconComponent = computed(() => {
  const iconName = normalizedIconName.value;
  const icon = (LucideIcons as Record<string, unknown>)[iconName];

  if (!icon || (typeof icon !== "object" && typeof icon !== "function")) {
    logger.warn(`Lucide icon not found: ${iconName}`);
    return null;
  }

  return markRaw(icon as Component);
});

// Computed styles: customSize override only (strokeWidth is passed as a prop to Lucide component)
const computedStyle = computed(() => {
  if (hasCustomSize.value && props.customSize) {
    return {
      width: `${props.customSize}px`,
      height: `${props.customSize}px`,
    };
  }
  return {};
});
</script>

<style lang="scss">
.vc-lucide-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
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

  &__fallback {
    font-style: normal;
    color: currentColor;
  }
}
</style>
