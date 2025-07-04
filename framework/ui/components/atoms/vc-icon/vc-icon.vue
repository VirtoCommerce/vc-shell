<template>
  <div
    v-if="useContainer"
    :class="['vc-icon-container', `vc-icon-container_${size}`]"
    :style="containerStyle"
    v-bind="$attrs"
  >
    <component
      :is="renderComponent"
      :class="[
        'vc-icon',
        `vc-icon_${size}`,
        variant ? `vc-icon_${variant}` : '',
        !isCustomIcon && !isMaterialIcon && !isLucideIcon && !isBootstrapIcon && !isFontAwesomeIcon
          ? (icon as string).toLowerCase()
          : '',
      ]"
      :style="iconStyle"
      v-bind="componentProps"
    />
  </div>

  <component
    :is="renderComponent"
    v-else
    :class="[
      'vc-icon',
      `vc-icon_${size}`,
      variant ? `vc-icon_${variant}` : '',
      !isCustomIcon && !isMaterialIcon && !isLucideIcon && !isBootstrapIcon && !isFontAwesomeIcon
        ? (icon as string).toLowerCase()
        : '',
    ]"
    :style="iconStyle"
    v-bind="{ ...componentProps, ...$attrs }"
  />
</template>

<script lang="ts" setup>
import { computed, markRaw, resolveComponent } from "vue";
import type { Component } from "vue";
import VcMaterialIcon from "./vc-material-icon.vue";
import VcBootstrapIcon from "./vc-bootstrap-icon.vue";
import VcLucideIcon from "./vc-lucide-icon.vue";
import VcFontawesomeIcon from "./vc-fontawesome-icon.vue";
import VcSvgIcon from "./vc-svg-icon.vue";

export type IconType = "fontawesome" | "material" | "bootstrap" | "lucide" | "custom" | "svg";
export type IconSize = "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
export type IconVariant = "warning" | "danger" | "success";

export interface Props {
  /**
   * Icon to display. Can be a string identifier or a component instance.
   * For string identifiers, use the following format:
   * - "fa-*" or "fas fa-*" for Font Awesome icons (e.g. "fas fa-home")
   * - "bi-*" for Bootstrap icons (e.g. "bi-house")
   * - "material-*" for Material icons (e.g. "material-home")
   * - "lucide-*" for Lucide icons (e.g. "lucide-home")
   * - "svg:path/to/icon.svg" for SVG icons
   * All icons must use the corresponding prefix to determine their type.
   */
  icon?: string | Component;

  /**
   * Icon size. The component provides predefined sizes from xs to xxxl.
   * Each size corresponds to a specific size in pixels, as defined in the CSS variables.
   */
  size?: IconSize;

  /**
   * Color variant for the icon. Applies predefined colors from the design system.
   * Available variants include warning (yellow), danger (red), and success (green).
   */
  variant?: IconVariant;

  /**
   * Whether to wrap the icon in a fixed-size container.
   * The container is slightly larger than the icon to provide proper spacing.
   */
  useContainer?: boolean;

  /**
   * Custom size in pixels. If provided, this will override the size prop.
   * This is useful when you need a specific size that's not in the predefined sizes.
   */
  customSize?: number;

  /**
   * Base path to SVG icons (only for SVG icons)
   */
  basePath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "fas fa-square-full",
  size: "m",
  useContainer: true,
  basePath: "/assets/icons",
});

// Sizes in px for each size value
const sizeMap = {
  xs: 12,
  s: 14,
  m: 18,
  l: 20,
  xl: 22,
  xxl: 30,
  xxxl: 64,
} as const;

// Function to detect icon type if not explicitly specified
const detectIconType = computed((): IconType => {
  if (typeof props.icon !== "string") {
    return "custom";
  }

  // Icon package prefixes
  if (props.icon.startsWith("fa-") || props.icon.includes("fa-")) {
    return "fontawesome";
  }

  if (props.icon.startsWith("bi-")) {
    return "bootstrap";
  }

  if (props.icon.startsWith("lucide-")) {
    return "lucide";
  }

  if (props.icon.startsWith("material-")) {
    return "material";
  }

  // SVG icon prefix
  if (props.icon.startsWith("svg:")) {
    return "svg";
  }

  // For backward compatibility with Lucide icons ending with Icon
  if (props.icon.endsWith("Icon")) {
    return "lucide";
  }

  return "custom";
});

// Get the normalized icon name without prefix
const normalizedIconName = computed(() => {
  if (typeof props.icon !== "string") {
    return props.icon;
  }

  const type = detectIconType.value;

  switch (type) {
    case "material":
      return props.icon.replace(/^material-/, "");
    case "lucide":
      return props.icon.replace(/^lucide-/, "");
    default:
      return props.icon;
  }
});

// Check if icon is a Material Design symbol
const isMaterialIcon = computed(() => detectIconType.value === "material");

// Check if icon is a Bootstrap Icon
const isBootstrapIcon = computed(() => detectIconType.value === "bootstrap");

// Check if icon is a Lucide Icon
const isLucideIcon = computed(() => detectIconType.value === "lucide");

// Check if icon is a Font Awesome Icon
const isFontAwesomeIcon = computed(() => detectIconType.value === "fontawesome");

// Check if icon is a component or can be resolved as a component
const isCustomIcon = computed(() => {
  if (typeof props.icon !== "string") {
    return true; // Component instance passed directly
  }

  // Skip for known icon libraries with prefixes
  if (
    ["fontawesome", "bootstrap"].includes(detectIconType.value) ||
    (detectIconType.value === "material" && props.icon.startsWith("material-")) ||
    (detectIconType.value === "lucide" && props.icon.startsWith("lucide-"))
  ) {
    return false;
  }

  // For Lucide icons, assume they can be resolved (safer approach)
  if (isLucideIcon.value) {
    return true; // Assume Lucide icons are available as components
  }

  // For other cases, assume it's not a component to avoid resolveComponent calls
  return false;
});

// Get the component instance for rendering
const safeIcon = computed(() => {
  if (typeof props.icon !== "string") {
    return markRaw(props.icon); // Use markRaw for direct component instances
  }

  // Skip resolveComponent for known icon types, they are handled by specialized components
  if (["fontawesome", "bootstrap", "material"].includes(detectIconType.value)) {
    return "i";
  }

  // For Lucide icons, return the normalized name directly
  if (isLucideIcon.value) {
    const iconName =
      typeof normalizedIconName.value === "string" ? normalizedIconName.value : String(normalizedIconName.value);
    return iconName; // Let Vue handle component resolution in template
  }

  return "i";
});

// Determine which component to render
const renderComponent = computed(() => {
  if (isMaterialIcon.value) {
    return VcMaterialIcon;
  }

  if (isBootstrapIcon.value) {
    return VcBootstrapIcon;
  }

  if (isLucideIcon.value) {
    return VcLucideIcon;
  }

  if (isFontAwesomeIcon.value) {
    return VcFontawesomeIcon;
  }

  if (isSvgIcon.value) {
    return VcSvgIcon;
  }

  return isCustomIcon.value ? safeIcon.value : "i";
});

// Calculate the actual pixel size based on props
const calculatedSize = computed(() => {
  if (props.customSize) {
    return props.customSize;
  }
  return sizeMap[props.size];
});

// Icon styles
const iconStyle = computed(() => {
  const styles: Record<string, string> = {};

  // If the size is set through customSize, apply it directly
  if (props.customSize) {
    // For text icons (FontAwesome, Bootstrap, Material) use font-size
    if (isFontAwesomeIcon.value || isBootstrapIcon.value || isMaterialIcon.value) {
      styles.fontSize = `${props.customSize}px`;
    }

    // For SVG and component icons, set explicit width and height
    if (isCustomIcon.value || isLucideIcon.value || isSvgIcon.value) {
      styles.width = `${props.customSize}px`;
      styles.height = `${props.customSize}px`;
    }
  } else {
    // For text icons, set font-size: inherit to inherit from the container
    if (isFontAwesomeIcon.value || isBootstrapIcon.value || isMaterialIcon.value || isLucideIcon.value) {
      styles.fontSize = "inherit";
    }
  }

  return styles;
});

// Container styles
const containerStyle = computed(() => {
  if (props.customSize) {
    return {
      fontSize: `${props.customSize}px`,
    };
  }
  return {};
});

// Prepare props for the rendered component
const componentProps = computed(() => {
  const type = detectIconType.value;

  switch (type) {
    case "lucide":
    case "material":
    case "bootstrap":
    case "fontawesome":
      return { icon: normalizedIconName.value, size: props.size, variant: props.variant, customSize: props.customSize };
    case "svg":
      return {
        icon: svgPath.value,
        size: props.size,
        variant: props.variant,
        strokeWidth: 1.5,
        customSize: props.customSize, // Set custom size without scaling
        basePath: props.basePath,
      };
    default:
      // For custom components, no extra props needed
      return {
        size: props.size,
        width: calculatedSize.value,
        height: calculatedSize.value,
        color: props.variant ? `var(--icon-color-${props.variant})` : "currentColor",
      };
  }
});

// Check if icon is an SVG icon
const isSvgIcon = computed(() => detectIconType.value === "svg");

// Get the path to the SVG if it's an SVG icon
const svgPath = computed(() => {
  if (!isSvgIcon.value || typeof props.icon !== "string") {
    return "";
  }

  // Remove the svg: prefix if present
  return props.icon.startsWith("svg:") ? props.icon.substring(4) : props.icon;
});
</script>

<style lang="scss">
/* Base sizes */
:root {
  /* Define icon sizes */
  --icon-size-xs: 12px;
  --icon-size-s: 14px;
  --icon-size-m: 18px;
  --icon-size-l: 20px;
  --icon-size-xl: 22px;
  --icon-size-xxl: 30px;
  --icon-size-xxxl: 64px;

  /* Colors for variants */
  --icon-color-success: var(--success-500);
  --icon-color-danger: var(--danger-500);
  --icon-color-warning: var(--warning-500);
}

/* Base styles for all icons */
.vc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;

  /* Ensure SVG icons respect font-size */
  svg {
    width: 1em;
    height: 1em;
    display: block;
  }
}

/* Size classes - these use CSS variables */
.vc-icon_xs {
  font-size: var(--icon-size-xs);
}

.vc-icon_s {
  font-size: var(--icon-size-s);
}

.vc-icon_m {
  font-size: var(--icon-size-m);
}

.vc-icon_l {
  font-size: var(--icon-size-l);
}

.vc-icon_xl {
  font-size: var(--icon-size-xl);
}

.vc-icon_xxl {
  font-size: var(--icon-size-xxl);
}

.vc-icon_xxxl {
  font-size: var(--icon-size-xxxl);
}

/* Variants */
.vc-icon_warning {
  color: var(--icon-color-warning);
}

.vc-icon_danger {
  color: var(--icon-color-danger);
}

.vc-icon_success {
  color: var(--icon-color-success);
}

/* Styles for the container */
.vc-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  font-size: inherit; /* Inherit font-size from the parent */
}

.vc-icon-container_xs {
  min-width: calc(var(--icon-size-xs) * 1.33);
  min-height: calc(var(--icon-size-xs) * 1.33);
  font-size: var(--icon-size-xs); /* Set font-size for the container */
}

.vc-icon-container_s {
  min-width: calc(var(--icon-size-s) * 1.33);
  min-height: calc(var(--icon-size-s) * 1.33);
  font-size: var(--icon-size-s); /* Set font-size for the container */
}

.vc-icon-container_m {
  min-width: calc(var(--icon-size-m) * 1.33);
  min-height: calc(var(--icon-size-m) * 1.33);
  font-size: var(--icon-size-m); /* Set font-size for the container */
}

.vc-icon-container_l {
  min-width: calc(var(--icon-size-l) * 1.33);
  min-height: calc(var(--icon-size-l) * 1.33);
  font-size: var(--icon-size-l); /* Set font-size for the container */
}

.vc-icon-container_xl {
  min-width: calc(var(--icon-size-xl) * 1.33);
  min-height: calc(var(--icon-size-xl) * 1.33);
  font-size: var(--icon-size-xl); /* Set font-size for the container */
}

.vc-icon-container_xxl {
  min-width: calc(var(--icon-size-xxl) * 1.33);
  min-height: calc(var(--icon-size-xxl) * 1.33);
  font-size: var(--icon-size-xxl); /* Set font-size for the container */
}

.vc-icon-container_xxxl {
  min-width: calc(var(--icon-size-xxxl) * 1.33);
  min-height: calc(var(--icon-size-xxxl) * 1.33);
  font-size: var(--icon-size-xxxl); /* Set font-size for the container */
}
</style>
