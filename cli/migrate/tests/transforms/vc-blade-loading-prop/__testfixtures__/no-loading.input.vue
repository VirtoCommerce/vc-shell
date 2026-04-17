<template>
  <VcBlade :loading="loading" :title="title">
    <div>content</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
const loading = ref(false);
const title = "Already migrated";
</script>
