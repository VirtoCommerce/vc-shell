<template>
  <div v-loading="isLoading">
    <p>Content</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isLoading = ref(false);
</script>
