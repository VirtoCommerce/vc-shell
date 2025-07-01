<template>
  <Icon
    :icon="iconName"
    :class="[
      'vc-lucide-icon',
      !hasCustomSize && `vc-lucide-icon--${size}`,
      variant ? `vc-lucide-icon--${variant}` : '',
    ]"
    :style="computedStyle"
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
  type: "lucide",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

// Combine the shared icon styles with Lucide-specific settings
const computedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  // If using custom size, make sure size is applied with !important
  // if (hasCustomSize.value) {
  //   if (styles.width) styles.width = `${styles.width.replace("px", "")}px !important`;
  //   if (styles.height) styles.height = `${styles.height.replace("px", "")}px !important`;
  // }

  return styles;
});

const iconName = computed(() => {
  let name = props.icon;

  // Convert from PascalCaseIcon or kebab-caseIcon to kebab-case.
  name = name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();

  if (name.endsWith("-icon")) {
    name = name.slice(0, -5);
  }

  return `lucide:${name}`;
});
</script>

<style lang="scss">
.vc-lucide-icon {
  & * {
    stroke-width: var(--vc-lucide-icon-stroke-width, 1.5);
  }

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
