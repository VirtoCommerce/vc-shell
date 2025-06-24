
<template>
<svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
<path d="M11 9L7 5L11 1M5 9L1 5L5 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
