<template>
  <i :class="[iconClass, variant ? `vc-icon_${variant}` : '']"></i>
</template>

<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
  icon: string;
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  variant?: "warning" | "danger" | "success";
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
});

// Normalize icon name to ensure it has the bi- prefix
const normalizedIcon = computed(() => {
  if (!props.icon) return "bi-question";
  return props.icon.startsWith("bi-") ? props.icon : `bi-${props.icon}`;
});

// Bootstrap Icons class
const iconClass = computed(() => {
  return [`vc-icon`, `vc-icon_${props.size}`, normalizedIcon.value];
});
</script>
