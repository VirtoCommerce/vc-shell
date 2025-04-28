<template>
  <span
    :class="[iconClass, variant ? `vc-icon_${variant}` : '']"
    :style="computedStyle"
    >{{ normalizedIcon }}</span
  >
</template>

<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
  icon: string;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  variant?: "warning" | "danger" | "success";
  type?: "outlined" | "rounded" | "sharp";
  fill?: number;
  weight?: number;
  grade?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  type: "outlined",
  fill: 0,
  weight: 200,
  grade: 0,
});

// Font variation settings
const computedStyle = computed(() => {
  return {
    fontVariationSettings: `'FILL' ${props.fill}, 'wght' ${props.weight}, 'GRAD' ${props.grade}`,
  };
});

// Normalize icon name to remove any type suffixes that might have been missed
const normalizedIcon = computed(() => {
  if (!props.icon) return "";

  // Remove material- prefix if present
  let iconName = props.icon;
  if (iconName.startsWith("material-")) {
    iconName = iconName.substring(9); // length of "material-"
  }

  // Remove possible type suffixes if they still exist
  return iconName.replace(/-outlined$|-rounded$|-sharp$/, "");
});

// Material Symbols class based on type
const iconClass = computed(() => {
  const typeClass = {
    outlined: "material-symbols-outlined",
    rounded: "material-symbols-rounded",
    sharp: "material-symbols-sharp",
  }[props.type];

  return [`vc-icon`, `vc-icon_${props.size}`, typeClass];
});
</script>
