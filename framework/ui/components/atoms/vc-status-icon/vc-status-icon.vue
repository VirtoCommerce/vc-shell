<template>
  <div>
    <template v-if="status">
      <VcIcon
        icon="fas fa-check-circle"
        class="tw-text-[color:var(--status-success-main-color)]"
      ></VcIcon>
    </template>
    <template v-else>
      <VcIcon
        icon="fas fa-times-circle"
        class="tw-text-[color:var(--status-info-main-color)]"
      ></VcIcon>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../../components";
export interface Props {
  status?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
:root {
  --status-success-main-color: var(--success-400);
  --status-info-main-color: var(--info-300);
}
</style>
