
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 11" fill="none" :width="width" :height="height">
  <path d="M1 1.5L5 5.5L1 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
