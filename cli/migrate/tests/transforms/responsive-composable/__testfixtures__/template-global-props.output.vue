<template>
  <div :class="{ 'my-comp--mobile': isMobile }">
    <span v-if="isDesktop">Desktop only</span>
  </div>
</template>
<script setup lang="ts">
import { useBlade, useResponsive } from "@vc-shell/framework";

const { isDesktop, isMobile } = useResponsive();

const { openBlade } = useBlade();
</script>
