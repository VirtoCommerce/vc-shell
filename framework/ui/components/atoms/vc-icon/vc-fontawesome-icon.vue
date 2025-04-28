<template>
  <i :class="iconClass"></i>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { IconSize, IconVariant } from "./vc-icon.vue";

export interface Props {
  icon: string;
  size?: IconSize;
  variant?: IconVariant;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
});

// Normalize the icon name to ensure a correct prefix
const normalizedIcon = computed(() => {
  if (!props.icon) return "";

  // Handle cases where the icon is specified as "fa-icon-name" without the full prefix
  if (
    props.icon.startsWith("fa-") &&
    !props.icon.startsWith("fas ") &&
    !props.icon.startsWith("far ") &&
    !props.icon.startsWith("fab ") &&
    !props.icon.startsWith("fal ") &&
    !props.icon.startsWith("fad ")
  ) {
    return `fas ${props.icon}`;
  }

  return props.icon;
});

const iconClass = computed(() => {
  return [`vc-icon`, `vc-icon_${props.size}`, normalizedIcon.value, props.variant ? `vc-icon_${props.variant}` : ""];
});
</script>
