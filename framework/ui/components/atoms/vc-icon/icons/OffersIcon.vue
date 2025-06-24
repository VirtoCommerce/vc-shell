
<template>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" :width="width" :height="height">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Price tag shape -->
    <path d="M9.5 1H5C2.79086 1 1 2.79086 1 5V9.5C1 9.63261 1.05268 9.75979 1.14645 9.85355L10.1464 18.8536C10.3417 19.0488 10.6583 19.0488 10.8536 18.8536L18.8536 10.8536C19.0488 10.6583 19.0488 10.3417 18.8536 10.1464L9.85355 1.14645C9.75979 1.05268 9.63261 1 9.5 1Z" />
    <!-- Tag hole -->
    <circle cx="5" cy="5" r="2" fill="none" />
    <!-- Discount line -->
    <path d="M13 7L7 13" />
    <!-- Percentage symbol -->
    <circle cx="7" cy="7" r="0.5" fill="none" />
    <circle cx="13" cy="13" r="0.5" fill="none" />
  </g>
</svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
