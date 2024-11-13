<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 10"
    fill="none"
    :width="width"
    :height="height"
  >
    <path
      d="M1 5H11M11 5L7 1M11 5L7 9"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string;
  height?: number | string;
}>();
</script>
