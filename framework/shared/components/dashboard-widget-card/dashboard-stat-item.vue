<template>
  <div class="dashboard-stat-item">
    <div
      class="dashboard-stat-item__value"
      :class="variant ? `dashboard-stat-item__value--${variant}` : ''"
    >
      {{ value }}
    </div>
    <div class="dashboard-stat-item__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
export interface DashboardStatItemProps {
  /** The metric value to display */
  value: string | number;
  /** Descriptive label below the value */
  label: string;
  /** Color variant for the value */
  variant?: "default" | "success" | "warning" | "danger";
}

defineProps<DashboardStatItemProps>();
</script>

<style lang="scss">
:root {
  --dashboard-stat-item-value-color: var(--neutrals-950);
  --dashboard-stat-item-label-color: var(--neutrals-500);
}

.dashboard-stat-item {
  @apply tw-flex tw-flex-col tw-items-center tw-min-w-0;

  &__value {
    @apply tw-text-lg tw-font-semibold tw-leading-tight tw-text-[var(--dashboard-stat-item-value-color)] tw-truncate tw-max-w-full;

    &--success {
      @apply tw-text-[var(--success-600)];
    }

    &--warning {
      @apply tw-text-[var(--warning-600)];
    }

    &--danger {
      @apply tw-text-[var(--danger-600)];
    }
  }

  &__label {
    @apply tw-text-xs tw-text-[var(--dashboard-stat-item-label-color)] tw-mt-0.5 tw-truncate tw-max-w-full;
  }
}
</style>
