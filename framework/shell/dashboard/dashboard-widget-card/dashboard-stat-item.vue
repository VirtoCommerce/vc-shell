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

    // Shades chosen per colour as the lightest that clears AA on the widget card in
    // both themes, measured rather than picked: -600 fails in light for all three
    // (4.13 / 2.01 / 3.80) and danger fails in dark too (4.33). Amber needs a
    // deeper step than the others — that is a property of amber, not an
    // inconsistency.
    &--success {
      // light 6.88, dark 9.45
      @apply tw-text-[var(--success-700)];
    }

    &--warning {
      // light 6.22, dark 10.60 — -700 is still 3.98 in light
      @apply tw-text-[var(--warning-800)];
    }

    &--danger {
      // light 6.01, dark 5.76
      @apply tw-text-[var(--danger-700)];
    }
  }

  &__label {
    @apply tw-text-xs tw-text-[var(--dashboard-stat-item-label-color)] tw-mt-0.5 tw-truncate tw-max-w-full;
  }
}
</style>
