<template>
  <div>Blade</div>
</template>

<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { exposeToChildren } = useBlade();
const reload = () => {};

exposeToChildren({
  reload,
});
</script>
