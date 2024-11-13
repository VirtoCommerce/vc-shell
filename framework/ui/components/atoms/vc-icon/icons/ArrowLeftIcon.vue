<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 10"
    fill="none"
    :width="width"
    :height="height"
  >
    <path
      d="M11 5H1M1 5L5 9M1 5L5 1"
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
