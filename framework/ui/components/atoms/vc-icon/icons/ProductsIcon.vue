
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" :width="width" :height="height">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Package box outline -->
    <path d="M1 5L10 1L19 5V15L10 19L1 15V5Z" />
    <!-- Middle line separating top and bottom -->
    <path d="M10 9L19 5" />
    <path d="M10 9L1 5" />
    <!-- Vertical line from middle to bottom -->
    <path d="M10 9V19" />
    <!-- Additional details -->
    <path d="M5 3L14 7" />
  </g>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
