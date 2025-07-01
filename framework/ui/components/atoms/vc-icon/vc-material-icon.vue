<template>
  <Icon
    v-if="finalIconName"
    :icon="finalIconName"
    :class="[
      'vc-material-icon',
      !hasCustomSize && `vc-material-icon--${size}`,
      variant ? `vc-material-icon--${variant}` : '',
    ]"
    :style="computedStyle"
    aria-hidden="true"
  />
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { Icon, loadIcon } from "@iconify/vue";
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
  type: "material",
  size: props.size,
  variant: props.variant,
  customSize: props.customSize,
});

const finalIconName = ref("");

watch(
  () => props.icon,
  (icon) => {
    const collection = "material-symbols-light";

    const cleanIconName = icon.replace(/_/g, "-");
    const baseIcon = `${collection}:${cleanIconName}`;
    const outlineIcon = `${collection}:${cleanIconName}-outline`;

    loadIcon(outlineIcon)
      .then(() => {
        finalIconName.value = outlineIcon;
      })
      .catch(() => {
        finalIconName.value = baseIcon;
      });
  },
  { immediate: true },
);

// Combine the shared icon styles with Material-specific settings
const computedStyle = computed(() => {
  const styles = { ...iconStyle.value };

  // font-variation-settings is not applicable for SVG icons
  // If using custom size, make sure fontSize is applied with !important
  if (hasCustomSize.value && styles.fontSize) {
    styles.fontSize = `${styles.fontSize.replace("px", "")}px !important`;
  }

  return styles;
});
</script>

<style lang="scss">
.vc-material-icon {
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
