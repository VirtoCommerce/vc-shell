<template>
  <div class="vc-status-icon">
    <template v-if="status">
      <VcIcon
        icon="fas fa-check-circle"
        class="vc-status-icon__icon vc-status-icon__icon--success"
      ></VcIcon>
    </template>
    <template v-else>
      <VcIcon
        icon="fas fa-times-circle"
        class="vc-status-icon__icon vc-status-icon__icon--info"
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

.vc-status-icon {
  &__icon--success {
    @apply tw-text-[color:var(--status-success-main-color)];
  }

  &__icon--info {
    @apply tw-text-[color:var(--status-info-main-color)];
  }
}
</style>
