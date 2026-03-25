<template>
  <VcLink class="vc-table-cell-link">{{ value }}</VcLink>
</template>

<script setup lang="ts">
import { VcLink } from "@ui/components/atoms";

defineProps<{
  /** The link text to display */
  value?: unknown;
}>();
</script>

<style lang="scss">
.vc-table-cell-link {
  @apply tw-truncate;
}
</style>
