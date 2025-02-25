
<template>
<svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
<path d="M7 1L11 5L7 9M1 1L5 5L1 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
