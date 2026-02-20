<template>
  <component
    :is="resolvedIconComponent"
    v-if="resolvedIconComponent"
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
    <i class="vc-lucide-icon__fallback">❓</i>
  </span>
</template>

<script lang="ts" setup>
import { computed, markRaw, onMounted, ref } from "vue";
import type { IconSize, IconVariant } from "@ui/components/atoms/vc-icon/types";
import type { Component } from "vue";
import { useIcon } from "@ui/components/atoms/vc-icon/composables";
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
  strokeWidth: 1.5,
});

// Check if using custom size to conditionally apply CSS class
const hasCustomSize = computed(() => typeof props.customSize === "number" && props.customSize > 0);

// Component reference for Lucide icon
const resolvedIconComponent = ref<Component | null>(null);

// Use the shared icon composable for consistent scaling
const { iconStyle } = useIcon({
  type: "lucide",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

// Normalize the icon name for Lucide
const normalizedIconName = computed(() => {
  if (!props.icon) return "HelpCircleIcon";

  // Handle removal of lucide- prefix
  let name = props.icon;
  if (name.startsWith("lucide-")) {
    name = name.substring(7);
  }

  // Ensure name ends with 'Icon'
  if (!name.endsWith("Icon")) {
    name = `${name}Icon`;
  }

  // Convert to PascalCase if kebab-case
  if (name.includes("-")) {
    name = name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  // Ensure first letter is capitalized
  return name.charAt(0).toUpperCase() + name.slice(1);
});

// Combine the shared icon styles with Lucide-specific settings
const computedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  if (props.strokeWidth) {
    styles.strokeWidth = props.strokeWidth.toString();
  }

  // If using custom size, make sure size is applied with !important
  if (hasCustomSize.value) {
    if (styles.width) styles.width = `${styles.width.replace("px", "")}px !important`;
    if (styles.height) styles.height = `${styles.height.replace("px", "")}px !important`;
  }

  return styles;
});

// Dynamically import the Lucide icon
onMounted(async () => {
  try {
    // Import from lucide-vue-next
    const module = await import("lucide-vue-next");

    // Get the icon component safely with type checking
    const iconName = normalizedIconName.value;
    if (module && typeof module === "object" && iconName in module) {
      resolvedIconComponent.value = markRaw(module[iconName as keyof typeof module] as Component);
    } else {
      logger.warn(`Lucide icon not found: ${iconName}`);
    }
  } catch (error) {
    logger.error(`Error loading Lucide icon: ${normalizedIconName.value}`, error);
  }
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
