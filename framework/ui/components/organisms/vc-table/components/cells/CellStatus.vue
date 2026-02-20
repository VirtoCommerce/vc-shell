<template>
  <VcStatus class="vc-table-cell-status">{{ value }}</VcStatus>
</template>

<script setup lang="ts">
import { VcStatus } from "@ui/components/atoms";

defineProps<{
  /** The status text to display in a status badge */
  value?: unknown;
}>();
</script>

<style lang="scss">
.vc-table-cell-status {
  @apply tw-inline-flex;
}
</style>
