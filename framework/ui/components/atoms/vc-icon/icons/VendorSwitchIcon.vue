
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" :width="width" :height="height">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- First profile -->
    <circle cx="6" cy="6" r="3" fill="none" />
    <path d="M2 14V13C2 11.3431 3.34315 10 5 10H7C8.65685 10 10 11.3431 10 13V14" />

    <!-- Second profile -->
    <circle cx="14" cy="6" r="3" fill="none" />
    <path d="M10 14V13C10 11.3431 11.3431 10 13 10H15C16.6569 10 18 11.3431 18 13V14" />

    <!-- Switch/exchange arrows -->
    <path d="M7 17L4 15L7 13" />
    <path d="M13 17L16 15L13 13" />
    <path d="M4 15H16" />
  </g>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
