import { computed } from "vue";
import type { Component } from "vue";
import type { IconType } from "@ui/components/atoms/vc-icon/types";

interface UseIconTypeOptions {
  /**
   * Icon (string or component)
   */
  icon: string | Component;
}

/**
 * Composable for determining the icon type
 */
export function useIconType(options: UseIconTypeOptions) {
  const { icon } = options;

  // Determining the icon type
  const iconType = computed((): IconType => {
    if (typeof icon !== "string") {
      return "custom";
    }

    // Determining by prefixes
    if (icon.startsWith("fa-") || icon.includes("fa-")) {
      return "fontawesome";
    }

    if (icon.startsWith("bi-")) {
      return "bootstrap";
    }

    if (icon.startsWith("lucide-")) {
      return "lucide";
    }

    if (icon.startsWith("material-")) {
      return "material";
    }

    // For backward compatibility with Lucide, having the Icon suffix
    if (icon.endsWith("Icon")) {
      return "lucide";
    }

    // For backward compatibility with Material Icons without a prefix
    return "material";
  });

  // Normalize the icon name (remove prefixes)
  const normalizedIconName = computed(() => {
    if (typeof icon !== "string") {
      return icon;
    }

    if (iconType.value === "material" && icon.startsWith("material-")) {
      return icon.replace(/^material-/, "");
    }

    if (iconType.value === "lucide" && icon.startsWith("lucide-")) {
      const baseName = icon.replace(/^lucide-/, "");
      // In Lucide, you need to convert the name to PascalCase and add the Icon suffix
      const pascalCase = baseName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      return pascalCase.endsWith("Icon") ? pascalCase : `${pascalCase}Icon`;
    }

    return icon;
  });

  return {
    iconType,
    normalizedIconName,
    isMaterialIcon: computed(() => iconType.value === "material"),
    isBootstrapIcon: computed(() => iconType.value === "bootstrap"),
    isLucideIcon: computed(() => iconType.value === "lucide"),
    isFontAwesomeIcon: computed(() => iconType.value === "fontawesome"),
    isCustomIcon: computed(() => iconType.value === "custom"),
  };
}
