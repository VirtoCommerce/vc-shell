<template>
  <div>Blade</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBlade } from "@vc-shell/framework";

const { exposeToChildren } = useBlade();
const title = computed(() => "hello");
const reload = () => {};
const onItemClick = () => {};

exposeToChildren({
  title,
  reload,
  onItemClick,
});
</script>
