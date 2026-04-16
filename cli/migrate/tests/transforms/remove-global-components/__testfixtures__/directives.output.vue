<template>
  <div v-loading="isLoading">
    <p>Content</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { vLoading } from "@vc-shell/framework/ui";

const isLoading = ref(false);
</script>
