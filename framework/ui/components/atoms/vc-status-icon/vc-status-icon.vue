<template>
  <div
    class="vc-status-icon"
    role="img"
    :aria-label="status ? 'Active' : 'Inactive'"
  >
    <VcIcon
      v-if="status"
      icon="lucide-circle-check"
      class="vc-status-icon__icon vc-status-icon__icon--success"
      aria-hidden="true"
    ></VcIcon>
    <VcIcon
      v-else
      icon="lucide-circle-x"
      class="vc-status-icon__icon vc-status-icon__icon--inactive"
      aria-hidden="true"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@ui/components";
export interface Props {
  status?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
:root {
  --status-icon-success-color: var(--success-500);
  --status-icon-inactive-color: var(--neutrals-300);
}

.vc-status-icon {
  @apply tw-inline-flex tw-items-center tw-justify-center;

  &__icon--success {
    @apply tw-text-[color:var(--status-icon-success-color)];
  }

  &__icon--inactive {
    @apply tw-text-[color:var(--status-icon-inactive-color)];
  }
}
</style>
