<template>
  <div>
    <VcColumn field="name" />
  </div>
</template>

<script setup lang="ts">
import { VcColumn, useBlade } from "@vc-shell/framework";

const { closeSelf } = useBlade();
</script>
