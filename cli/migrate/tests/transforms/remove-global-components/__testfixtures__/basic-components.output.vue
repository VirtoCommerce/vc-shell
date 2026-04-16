<template>
  <div>
    <VcButton @click="save">Save</VcButton>
    <VcInput v-model="name" label="Name" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { VcButton, VcInput } from "@vc-shell/framework/ui";

const name = ref("");
const save = () => {};
</script>
