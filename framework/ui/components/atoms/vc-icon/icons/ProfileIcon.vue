
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" :width="width" :height="height">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- User head -->
    <circle cx="10" cy="5" r="4" fill="none" />
    <!-- User body -->
    <path d="M3 19V17C3 14.2386 5.23858 12 8 12H12C14.7614 12 17 14.2386 17 17V19" />
  </g>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
