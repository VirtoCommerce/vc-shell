<template>
  <div v-if="isMobile">Mobile</div>
</template>
<script setup lang="ts">
import { useResponsive } from "@vc-shell/framework";

const { isDesktop, isMobile } = useResponsive();
</script>
