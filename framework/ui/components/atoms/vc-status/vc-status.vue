<template>
  <div
    class="vc-status"
    :class="[
      `vc-status--${variant}`,
      {
        'vc-status--extended': extend,
        'vc-status--dot': dot,
      },
    ]"
    role="status"
    :aria-label="dot ? variant : undefined"
  >
    <div class="vc-status__content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  variant?: "info" | "warning" | "danger" | "success" | "light-danger" | "info-dark" | "primary";
  extend?: boolean;
  dot?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "info",
  dot: false,
});

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props?: any) => any;
}>();
</script>

<style lang="scss">
:root {
  --status-padding: 4px 14px;
  --status-padding-extended: 8px;
  --status-dot-size: 10px;
  --status-text-color: var(--neutrals-700);

  --status-border-radius: 9999px;
  --status-border-radius-extended: 6px;
  --status-border-width: 1px;

  --status-border-color: var(--neutrals-200);
  --status-bg-color: var(--additional-50);

  --status-info-color: var(--info-700);
  --status-info-main-color: var(--info-500);
  --status-info-bg-color: var(--info-50);

  --status-warning-color: var(--warning-700);
  --status-warning-main-color: var(--warning-500);
  --status-warning-bg-color: var(--warning-50);

  --status-danger-color: var(--danger-700);
  --status-danger-main-color: var(--danger-500);
  --status-danger-bg-color: var(--danger-50);

  --status-success-color: var(--success-700);
  --status-success-main-color: var(--success-500);
  --status-success-bg-color: var(--success-50);

  --status-light-danger-color: var(--danger-700);
  --status-light-danger-main-color: var(--danger-300);
  --status-light-danger-bg-color: var(--danger-50);

  --status-info-dark-color: var(--additional-50);
  --status-info-dark-main-color: var(--info-600);
  --status-info-dark-bg-color: var(--info-600);

  --status-primary-color: var(--primary-700);
  --status-primary-main-color: var(--primary-500);
  --status-primary-bg-color: var(--primary-50);
}

$variants: info, warning, danger, success, light-danger, info-dark, primary;

.vc-status {
  @apply tw-inline-block tw-font-normal tw-whitespace-nowrap tw-text-xs tw-truncate tw-text-center tw-border tw-border-solid tw-box-border;
  @apply tw-py-1 tw-px-3 tw-rounded-[var(--status-border-radius)];
  @apply tw-flex tw-items-center tw-justify-center tw-flex-row tw-relative;
  @apply tw-border-[length:var(--status-border-width)] tw-bg-[color:var(--status-bg-color)] tw-border-[color:var(--status-border-color)];

  &.vc-status--dot {
    @apply tw-p-0 tw-w-[var(--status-dot-size)] tw-h-[var(--status-dot-size)] tw-max-w-[var(--status-dot-size)] tw-rounded-full tw-border-0 #{!important};
  }

  @each $variant in $variants {
    &.vc-status--#{$variant} {
      @apply tw-bg-[color:var(--status-bg-color)] tw-max-w-fit;
      @apply tw-border-[color:var(--status-border-color)] #{!important};

      &::before {
        @apply tw-content-[''] tw-bg-[color:var(--status-#{$variant}-main-color)] tw-w-2 tw-h-2 tw-rounded-full tw-mr-2 tw-shrink-0;
      }

      &.vc-status--dot {
        @apply tw-bg-[color:var(--status-#{$variant}-main-color)];
        &::before {
          @apply tw-content-none;
        }
      }

      &.vc-status--extended {
        @apply tw-whitespace-normal tw-rounded-[var(--status-border-radius-extended)] tw-justify-start;
        @apply tw-max-w-full tw-p-[var(--status-padding-extended)] tw-bg-[color:var(--status-#{$variant}-bg-color)] tw-border-none;

        &::before {
          @apply tw-content-none;
        }

        .vc-status__content {
          @apply tw-whitespace-normal tw-text-[color:var(--status-#{$variant}-color)] #{!important};
        }
      }
    }
  }

  &__content {
    @apply tw-truncate tw-text-[color:var(--status-text-color)] tw-font-medium;
    .vc-status--dot & {
      @apply tw-hidden;
    }
  }
}
</style>
