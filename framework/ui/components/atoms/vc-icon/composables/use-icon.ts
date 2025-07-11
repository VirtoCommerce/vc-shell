import { computed, unref } from "vue";
import type { IconSize, IconType, IconVariant } from "../types";
import type { MaybeRef } from "@vueuse/core";

interface UseIconOptions {
  /**
   * Icon type
   */
  type: MaybeRef<IconType>;

  /**
   * Icon size
   */
  size?: MaybeRef<IconSize>;

  /**
   * Icon color variant
   */
  variant?: MaybeRef<IconVariant>;

  /**
   * Custom size in pixels
   */
  customSize?: MaybeRef<number | undefined>;
}

// Standard scaling factors for different icon types
const DEFAULT_SCALE_FACTORS: Record<IconType, number> = {
  fontawesome: 1, // base size (as a reference)
  material: 1.3, // material icons are slightly larger
  bootstrap: 0.95, // bootstrap icons are slightly smaller
  lucide: 1, // lucide (svg) icons are noticeably smaller
  custom: 1, // custom components - default without scaling
  svg: 1, // svg icons - default without scaling
};

/**
 * Composable for working with icons
 */
export function useIcon(options: UseIconOptions) {
  const { type: iconType, size = "m", variant, customSize } = options;

  // Calculate the scaling factor for the icon type
  const scaleFactor = computed(() => {
    const type = unref(iconType);
    return DEFAULT_SCALE_FACTORS[type] || 1;
  });

  // Calculate the styles for the icon with the scaling factor
  const iconStyle = computed(() => {
    const customSizeValue = unref(customSize);
    const type = unref(iconType);

    if (customSizeValue !== undefined) {
      const scaledSize = customSizeValue * scaleFactor.value;

      // Different styles for different icon types
      if (type === "fontawesome" || type === "bootstrap") {
        // Using font-size directly for font-based icons with high priority
        return { fontSize: `${scaledSize}px` };
      } else if (type === "material") {
        // Material icons may need additional styling
        return {
          fontSize: `${scaledSize}px`,
          transform: `scale(${scaleFactor.value})`,
          transformOrigin: "center center",
        };
      } else if (type === "lucide" || type === "svg") {
        // SVG-based icons need width and height
        return {
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
        };
      } else if (type === "custom") {
        // Default for custom icons
        return {
          fontSize: `${scaledSize}px`,
          width: "auto",
          height: "auto",
        };
      } else {
        // Fallback for unknown types
        return {
          fontSize: `${scaledSize}px`,
        };
      }
    }

    // Otherwise - base styles
    const styles: Record<string, string> = {};

    // For SVG and Lucide icons, we need width and height
    if (type === "svg" || type === "lucide") {
      styles.width = "1em";
      styles.height = "1em";
    }

    // For Material icons, we need scaling through transform
    if (type === "material") {
      styles.transform = `scale(${scaleFactor.value})`;
      styles.transformOrigin = "center center";
    }

    return styles;
  });

  // Calculate the classes for the icon
  const iconClass = computed(() => {
    const sizeValue = unref(size);
    const variantValue = unref(variant);

    const classes = ["vc-icon", `vc-icon_${sizeValue}`];

    if (variantValue) {
      classes.push(`vc-icon_${variantValue}`);
    }

    // Add a class to determine the icon type, so that icons can be styled by type
    classes.push(`vc-icon--${unref(iconType)}`);

    return classes;
  });

  return {
    iconStyle,
    iconClass,
    scaleFactor,
  };
}
