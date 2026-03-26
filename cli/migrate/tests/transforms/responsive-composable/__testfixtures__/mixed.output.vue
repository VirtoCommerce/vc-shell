<template>
  <div :class="{ 'my-comp--mobile': isMobile }">
    <span v-if="isDesktop">Desktop</span>
    <span v-if="isPhone">Phone</span>
  </div>
</template>
<script setup lang="ts">
import { useBlade, useResponsive } from "@vc-shell/framework";

const { isDesktop, isMobile, isPhone } = useResponsive();

const { openBlade } = useBlade();
</script>
