<template>
  <VcBlade
    :loading="bladeLoading"
    :title="title"
    width="50%"
  >
    <div v-loading:500="innerLoading">content</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
const bladeLoading = ref(false);
const innerLoading = ref(false);
const title = "With Arg";
</script>
