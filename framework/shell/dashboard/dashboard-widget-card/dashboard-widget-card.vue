<template>
  <div class="dashboard-widget-card">
    <div class="dashboard-widget-card__header">
      <slot name="header">
        <div class="dashboard-widget-card__header-content">
          <div
            v-if="icon"
            class="dashboard-widget-card__icon-wrapper"
          >
            <VcIcon
              class="dashboard-widget-card__icon"
              :icon="icon"
              size="l"
            />
          </div>
          <div class="dashboard-widget-card__title">{{ props.header }}</div>
        </div>
      </slot>
      <div
        v-if="$slots.actions"
        class="dashboard-widget-card__actions"
      >
        <slot name="actions"></slot>
      </div>
    </div>

    <div
      v-if="$slots.stats"
      class="dashboard-widget-card__stats"
    >
      <slot name="stats"></slot>
    </div>

    <div
      v-loading="loading"
      class="dashboard-widget-card__body"
    >
      <slot name="content"></slot>
    </div>

    <div
      v-if="$slots.footer"
      class="dashboard-widget-card__footer"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
export interface Props {
  header?: string;
  icon?: string;
  loading?: boolean;
}

const props = defineProps<Props>();

defineSlots<{
  header?: (props: any) => any;
  actions?: (props: any) => any;
  stats?: (props: any) => any;
  content?: (props: any) => any;
  footer?: (props: any) => any;
}>();
</script>

<style lang="scss">
:root {
  // Legacy variables (preserved for backward compat)
  --dashboard-widget-card-header-color: var(--additional-50);
  --dashboard-widget-card-header-text-color: var(--neutrals-950);
  --dashboard-widget-card-icon-color: var(--primary-600);
  --dashboard-widget-card-header-border-color: var(--neutrals-200);

  // New variables
  --dashboard-widget-card-background: var(--additional-50);
  --dashboard-widget-card-border-color: var(--neutrals-200);
  --dashboard-widget-card-border-radius: 8px;
  --dashboard-widget-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --dashboard-widget-card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --dashboard-widget-card-icon-bg: var(--primary-50);
  --dashboard-widget-card-stats-bg: var(--neutrals-50);
  --dashboard-widget-card-footer-color: var(--primary-700);
}

.dashboard-widget-card {
  @apply tw-overflow-hidden tw-h-full tw-flex tw-flex-col;
  background: var(--dashboard-widget-card-background);
  border: 1px solid var(--dashboard-widget-card-border-color);
  border-radius: var(--dashboard-widget-card-border-radius);
  box-shadow: var(--dashboard-widget-card-shadow);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--dashboard-widget-card-shadow-hover);
  }

  &__header {
    @apply tw-px-5 tw-py-4 tw-flex tw-justify-between tw-items-center tw-gap-3;
  }

  &__header-content {
    @apply tw-flex tw-items-center tw-gap-3 tw-min-w-0;
  }

  &__icon-wrapper {
    @apply tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-rounded-lg tw-flex-shrink-0;
    background: var(--dashboard-widget-card-icon-bg);
  }

  &__icon {
    @apply tw-text-[var(--dashboard-widget-card-icon-color)];
  }

  &__title {
    @apply tw-text-lg tw-font-semibold tw-truncate;
    color: var(--dashboard-widget-card-header-text-color);
  }

  &__actions {
    @apply tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0;
  }

  &__stats {
    @apply tw-px-5 tw-py-3 tw-flex tw-items-center tw-gap-6;
    background: var(--dashboard-widget-card-stats-bg);
    border-top: 1px solid var(--dashboard-widget-card-border-color);
    border-bottom: 1px solid var(--dashboard-widget-card-border-color);
  }

  &__body {
    @apply tw-flex-1 tw-min-h-0;
  }

  &__footer {
    @apply tw-px-5 tw-py-3 tw-text-center;
    border-top: 1px solid var(--dashboard-widget-card-border-color);

    a,
    button {
      @apply tw-text-sm tw-font-medium tw-no-underline;
      color: var(--dashboard-widget-card-footer-color);
      transition: opacity 0.15s ease;

      &:hover {
        @apply tw-underline;
        opacity: 0.85;
      }
    }
  }
}

// Shared activity-feed row style for dashboard card content
.dashboard-feed-row {
  @apply tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-2.5 tw-cursor-pointer tw-transition-colors;

  &:hover {
    background: var(--dashboard-widget-card-icon-bg, var(--primary-50));
  }
}
</style>
