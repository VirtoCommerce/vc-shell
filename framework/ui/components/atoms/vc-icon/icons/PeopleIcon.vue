
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" :width="width" :height="height">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main person -->
    <circle cx="8" cy="8" r="3" fill="none" />
    <path d="M2 19V17C2 14.7909 3.79086 13 6 13H10C12.2091 13 14 14.7909 14 17V19" />

    <!-- Secondary person (partial, behind) -->
    <path d="M15 8C15 9.65685 13.6569 11 12 11" />
    <path d="M18 19V17C18 15.3431 17.1652 13.9089 15.8944 13.1913" />
  </g>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
