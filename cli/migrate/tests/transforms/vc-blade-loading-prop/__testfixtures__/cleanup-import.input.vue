<template>
  <VcBlade
    v-loading="loading"
    :title="title"
  >
    <div>content</div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade, vLoading } from "@vc-shell/framework/ui";

const loading = ref(false);
const title = "X";
</script>
