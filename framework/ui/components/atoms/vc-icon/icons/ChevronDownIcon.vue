
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" :width="width" :height="height">
  <path d="M14 7L9.5 11.5L5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
