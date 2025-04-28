<template>
  <div
    v-if="useContainer"
    :class="['vc-icon-container', `vc-icon-container_${size}`]"
  >
    <DefineTemplate>
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
        v-bind="componentProps"
      />
    </DefineTemplate>
    <ReuseTemplate v-bind="$attrs" />
  </div>

  <ReuseTemplate
    v-else
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import { computed, markRaw, resolveComponent } from "vue";
import type { Component } from "vue";
import VcMaterialIcon from "./vc-material-icon.vue";
import VcBootstrapIcon from "./vc-bootstrap-icon.vue";
import VcLucideIcon from "./vc-lucide-icon.vue";
import VcFontawesomeIcon from "./vc-fontawesome-icon.vue";
import { createReusableTemplate } from "@vueuse/core";

export type IconType = "fontawesome" | "material" | "bootstrap" | "lucide" | "custom";
export type IconSize = "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
export type IconVariant = "warning" | "danger" | "success";

export interface Props {
  /**
   * The icon to display. Can be a string identifier or a component instance.
   * For string identifiers, use the following format:
   * - "fa-*" or "fas fa-*" for Font Awesome icons (e.g. "fas fa-home")
   * - "bi-*" for Bootstrap icons (e.g. "bi-house")
   * - "material-*" for Material icons (e.g. "material-home")
   * - "lucide-*" for Lucide icons (e.g. "lucide-home")
   * All icons must use the appropriate prefix to identify their type.
   */
  icon?: string | Component;

  /**
   * Size of the icon. The component provides predefined sizes from xs to xxxl.
   * Each size corresponds to a specific pixel size as defined in the CSS variables.
   * You can also use external CSS to set font-size for more flexibility.
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
}

const props = withDefaults(defineProps<Props>(), {
  icon: "fas fa-square-full",
  size: "m",
  useContainer: true,
});

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

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

  if (detectIconType.value === "material" && props.icon.startsWith("material-")) {
    return props.icon.replace(/^material-/, "");
  }

  if (detectIconType.value === "lucide" && props.icon.startsWith("lucide-")) {
    const baseName = props.icon.replace(/^lucide-/, "");
    return baseName.endsWith("Icon") ? baseName : `${baseName}Icon`;
  }

  return props.icon;
});

// Check if icon is a Material Design symbol
const isMaterialIcon = computed(() => detectIconType.value === "material");

// Check if icon is a Bootstrap Icon
const isBootstrapIcon = computed(() => detectIconType.value === "bootstrap");

// Check if icon is a Lucide Icon
const isLucideIcon = computed(() => detectIconType.value === "lucide");

// Check if icon is a Font Awesome Icon
const isFontAwesomeIcon = computed(() => detectIconType.value === "fontawesome");

// Check if the icon is a component or can be resolved as a component
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

  // Check for Lucide icons - they could be resolved as components
  if (isLucideIcon.value) {
    try {
      const iconName =
        typeof normalizedIconName.value === "string" ? normalizedIconName.value : String(normalizedIconName.value);
      const resolved = resolveComponent(iconName);
      return resolved !== iconName;
    } catch (e) {
      return false;
    }
  }

  // Check if string is a component name that can be resolved
  try {
    const resolved = resolveComponent(props.icon);
    return resolved !== props.icon; // If resolved is different from original string, it's a component name
  } catch (e) {
    return false;
  }
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

  // Try to resolve component by name (mostly for Lucide icons)
  try {
    const iconName =
      typeof normalizedIconName.value === "string" ? normalizedIconName.value : String(normalizedIconName.value);
    const resolved = resolveComponent(iconName);
    return resolved !== iconName ? resolved : "i"; // Return resolved component or fallback to 'i'
  } catch (e) {
    return "i";
  }
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

  return isCustomIcon.value ? safeIcon.value : "i";
});

// Prepare props for the rendered component
const componentProps = computed(() => {
  if (isMaterialIcon.value) {
    // Clean the name from possible suffixes of the icon type
    const cleanIconName =
      typeof normalizedIconName.value === "string"
        ? normalizedIconName.value.replace(/-outlined$|-rounded$|-sharp$/, "")
        : normalizedIconName.value;

    return {
      icon: cleanIconName,
      size: props.size,
      variant: props.variant,
      type: "outlined",
      fill: 0,
      weight: 300,
      grade: 0,
      customSize: props.customSize,
    };
  }

  if (isBootstrapIcon.value) {
    // For Bootstrap icons
    const iconName = typeof props.icon === "string" ? props.icon : "";

    return {
      icon: iconName,
      size: props.size,
      variant: props.variant,
      customSize: props.customSize,
    };
  }

  if (isLucideIcon.value) {
    // For Lucide icons
    const iconName =
      typeof normalizedIconName.value === "string" ? normalizedIconName.value : String(normalizedIconName.value);

    return {
      icon: iconName,
      size: props.size,
      variant: props.variant,
      strokeWidth: 1.25,
      customSize: props.customSize,
    };
  }

  if (isFontAwesomeIcon.value) {
    // For Font Awesome icons
    return {
      icon: typeof props.icon === "string" ? props.icon : "",
      size: props.size,
      variant: props.variant,
      customSize: props.customSize,
    };
  }

  if (isCustomIcon.value) {
    return {
      width: props.customSize || iconSize.value,
      height: props.customSize || iconSize.value,
      color: props.variant ? `var(--icon-color-${props.variant})` : "currentColor",
    };
  }

  return {};
});

const sizeMap = {
  xs: 12,
  s: 14,
  m: 18,
  l: 20,
  xl: 22,
  xxl: 30,
  xxxl: 64,
} as const;

// Calculate icon size based on props
const iconSize = computed(() => props.customSize || sizeMap[props.size]);
</script>

<style lang="scss" scoped>
/* Base sizes */
:deep(.vc-icon) {
  --icon-size-xs: 12px;
  --icon-size-s: 14px;
  --icon-size-m: 18px;
  --icon-size-l: 20px;
  --icon-size-xl: 22px;
  --icon-size-xxl: 30px;
  --icon-size-xxxl: 64px;

  /* Container sizes (10% larger than icon) */
  --icon-container-xs: calc(var(--icon-size-xs) * 1.1);
  --icon-container-s: calc(var(--icon-size-s) * 1.1);
  --icon-container-m: calc(var(--icon-size-m) * 1.1);
  --icon-container-l: calc(var(--icon-size-l) * 1.1);
  --icon-container-xl: calc(var(--icon-size-xl) * 1.1);
  --icon-container-xxl: calc(var(--icon-size-xxl) * 1.1);
  --icon-container-xxxl: calc(var(--icon-size-xxxl) * 1.1);

  /* Optical adjustments for different icon libraries */
  --material-icons-scale: 1.2; /* Material icons need to be larger */
  --fontawesome-icons-scale: 0.9; /* FontAwesome icons need to be smaller */
  --bootstrap-icons-scale: 1; /* Bootstrap icons are our baseline */
  --lucide-icons-scale: 1; /* Lucide icons match bootstrap */

  /* Colors for variants */
  --icon-color-success: var(--success-500);
  --icon-color-danger: var(--danger-500);
  --icon-color-warning: var(--warning-500);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease-in-out;

  /* Allow font-size to control icon size by default */
  width: 1em;
  height: 1em;
  font-size: inherit;
}

/* Size classes - these can be overridden by external CSS */
:deep(.vc-icon_xs) {
  font-size: var(--icon-size-xs);
}

:deep(.vc-icon_s) {
  font-size: var(--icon-size-s);
}

:deep(.vc-icon_m) {
  font-size: var(--icon-size-m);
}

:deep(.vc-icon_l) {
  font-size: var(--icon-size-l);
}

:deep(.vc-icon_xl) {
  font-size: var(--icon-size-xl);
}

:deep(.vc-icon_xxl) {
  font-size: var(--icon-size-xxl);
}

:deep(.vc-icon_xxxl) {
  font-size: var(--icon-size-xxxl);
}

.vc-icon {
  &-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-container_xs {
    width: var(--icon-container-xs);
    height: var(--icon-container-xs);
  }

  &-container_s {
    width: var(--icon-container-s);
    height: var(--icon-container-s);
  }

  &-container_m {
    width: var(--icon-container-m);
    height: var(--icon-container-m);
  }

  &-container_l {
    width: var(--icon-container-l);
    height: var(--icon-container-l);
  }

  &-container_xl {
    width: var(--icon-container-xl);
    height: var(--icon-container-xl);
  }

  &-container_xxl {
    width: var(--icon-container-xxl);
    height: var(--icon-container-xxl);
  }

  &-container_xxxl {
    width: var(--icon-container-xxxl);
    height: var(--icon-container-xxxl);
  }
}

/* Variants */
:deep(.vc-icon_warning) {
  color: var(--icon-color-warning);
}

:deep(.vc-icon_danger) {
  color: var(--icon-color-danger);
}

:deep(.vc-icon_success) {
  color: var(--icon-color-success);
}

/* Material Icons specific styles */
:deep(.material-symbols-outlined),
:deep(.material-symbols-rounded),
:deep(.material-symbols-sharp) {
  font-family: "Material Symbols Outlined", "Material Symbols Rounded", "Material Symbols Sharp";
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  transform: scale(var(--material-icons-scale)); /* Optical adjustment */
}

/* Bootstrap Icons specific styles */
:deep([class^="bi-"]),
:deep([class*=" bi-"]) {
  font-family: bootstrap-icons !important;
  font-style: normal;
  font-weight: normal !important;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: scale(var(--bootstrap-icons-scale)); /* Optical adjustment */
}

/* Font Awesome Icons */
:deep([class^="fa-"]),
:deep([class*=" fa-"]),
:deep([class^="fas"]),
:deep([class*=" fas"]),
:deep([class^="far"]),
:deep([class*=" far"]),
:deep([class^="fal"]),
:deep([class*=" fal"]),
:deep([class^="fab"]),
:deep([class*=" fab"]),
:deep([class^="fad"]),
:deep([class*=" fad"]) {
  font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "Font Awesome 6 Duotone", "Font Awesome 6 Pro";
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: scale(var(--fontawesome-icons-scale)); /* Optical adjustment */
}

/* Font weight adjustments for Font Awesome */
:deep(.fas),
:deep(.fa-solid) {
  font-weight: 900;
}

:deep(.far),
:deep(.fa-regular) {
  font-weight: 400;
}

:deep(.fal),
:deep(.fa-light) {
  font-weight: 300;
}

:deep(.fab),
:deep(.fa-brands) {
  font-family: "Font Awesome 6 Brands";
}

/* Lucide Icons specific styles */
:deep(svg.vc-icon) {
  transform: scale(var(--lucide-icons-scale)); /* Optical adjustment */
}

.vc-icon {
  &-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
