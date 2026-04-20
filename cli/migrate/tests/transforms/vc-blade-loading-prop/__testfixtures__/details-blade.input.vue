<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    width="60%"
  >
    <VcForm>
      <div v-loading="innerLoading">inner spinner stays</div>
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcBlade, VcForm, vLoading } from "@vc-shell/framework/ui";

const loading = ref(false);
const innerLoading = ref(false);
const title = "Details";
const bladeToolbar = [];
</script>
