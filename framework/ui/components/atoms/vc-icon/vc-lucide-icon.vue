<template>
  <component
    :is="resolvedIcon"
    :class="['vc-icon', `vc-icon_${size}`, variant ? `vc-icon_${variant}` : '']"
    :stroke-width="strokeWidth"
  />
</template>

<script lang="ts" setup>
import { computed, resolveComponent } from "vue";

export interface Props {
  icon: string;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  variant?: "warning" | "danger" | "success";
  strokeWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  strokeWidth: 2,
});

// Normalize icon name to extract the base name without prefixes
const normalizedIconName = computed(() => {
  if (!props.icon) return "";

  // Remove lucide- prefix if present
  let baseName = props.icon;
  if (baseName.startsWith("lucide-")) {
    baseName = baseName.substring(7); // length of "lucide-"
  }

  // Convert to PascalCase and add Icon suffix if needed
  // For example, convert "alert-triangle" to "AlertTriangle"
  if (baseName.includes("-")) {
    baseName = baseName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  } else {
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }

  // Add Icon suffix if not already present
  if (!baseName.endsWith("Icon")) {
    baseName += "Icon";
  }

  return baseName;
});

// Try to resolve the icon component
const resolvedIcon = computed(() => {
  if (!props.icon) return null;

  try {
    const iconName = normalizedIconName.value;
    const resolved = resolveComponent(iconName);
    return resolved !== iconName ? resolved : null;
  } catch (e) {
    console.error(`Failed to resolve Lucide icon: ${props.icon} (normalized: ${normalizedIconName.value})`, e);
    return null;
  }
});
</script>
