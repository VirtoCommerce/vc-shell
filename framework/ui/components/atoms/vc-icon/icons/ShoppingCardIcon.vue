
<template>
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
<path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.0498 2.0498H4.0498L6.7098 14.4698C6.80738 14.9247 7.06048 15.3313 7.42552 15.6197C7.79056 15.908 8.24471 16.0602 8.7098 16.0498H18.4898C18.945 16.0491 19.3863 15.8931 19.7408 15.6076C20.0954 15.3222 20.3419 14.9243 20.4398 14.4798L22.0898 7.0498H5.1198" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

</template>

<script setup lang="ts">
defineProps<{
  width?: number | string
  height?: number | string
}>()
</script>
