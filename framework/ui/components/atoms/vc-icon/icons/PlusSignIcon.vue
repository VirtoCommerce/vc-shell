<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    fill="none"
    :width="width"
    :height="height"
  >
    <path
      d="M4.5 9H9M9 9H13.5M9 9V13.5M9 9V4.5"
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
