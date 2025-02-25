
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" :width="width" :height="height">
  <path
    d="M6 11H11M1 6H11M1 1H11"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>

</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
