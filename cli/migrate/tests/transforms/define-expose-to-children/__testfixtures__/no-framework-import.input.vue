<template>
  <div>Blade page</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineBlade({
  name: "MyBlade",
  url: "/my",
});

const title = computed(() => "hello");

defineExpose({
  title,
});
</script>
