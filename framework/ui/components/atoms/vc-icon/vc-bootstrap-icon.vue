<template>
  <i
    :class="[
      'vc-bootstrap-icon',
      !hasCustomSize && `vc-bootstrap-icon--${size}`,
      iconClass,
      variant ? `vc-bootstrap-icon--${variant}` : '',
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
   * @deprecated Bootstrap icons are deprecated. Use Lucide icons instead (e.g. "lucide-house").
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

// Direct custom size style — no scaling factors
const customSizeStyle = computed(() =>
  props.customSize ? { fontSize: `${props.customSize}px` } : undefined,
);

// Deprecation warning (dev-only)
onMounted(() => {
  if (import.meta.env.DEV) {
    console.warn(
      `[VcIcon] Bootstrap icon "${props.icon}" is deprecated. ` +
        `Migrate to Lucide: use "lucide-{name}" instead (e.g. "lucide-house" instead of "bi-house"). ` +
        `See https://lucide.dev/icons for available icons.`,
    );
  }
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
