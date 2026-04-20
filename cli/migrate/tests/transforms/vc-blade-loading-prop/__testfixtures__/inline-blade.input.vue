<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    width="50%"
  >
    <div>content</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
const loading = ref(false);
const title = "Inline";
</script>
