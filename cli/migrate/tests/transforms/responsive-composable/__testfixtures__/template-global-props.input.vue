<template>
  <div :class="{ 'my-comp--mobile': $isMobile.value }">
    <span v-if="$isDesktop.value">Desktop only</span>
  </div>
</template>
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

const { openBlade } = useBlade();
</script>
