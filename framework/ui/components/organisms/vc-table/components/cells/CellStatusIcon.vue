<template>
  <div class="vc-table-cell-status-icon">
    <VcStatusIcon v-if="typeof value === 'boolean'" :status="(value as boolean)" />
  </div>
</template>

<script setup lang="ts">
import { VcStatusIcon } from "@ui/components/atoms";

defineProps<{
  /** Boolean value indicating status (true = success, false = error) */
  value?: unknown;
}>();
</script>

<style lang="scss">
.vc-table-cell-status-icon {
  @apply tw-flex tw-justify-center;
}
</style>
