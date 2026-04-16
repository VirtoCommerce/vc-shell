<template>
  <div>
    <VcButton @click="save">Save</VcButton>
    <VcInput v-model="name" label="Name" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const save = () => {};
</script>
