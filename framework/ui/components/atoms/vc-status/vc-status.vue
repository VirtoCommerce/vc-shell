<template>
  <div
    class="vc-status"
    :class="[`vc-status_${variant}`, { 'vc-status_outline': outline }, { 'vc-status_extended': extend }]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  variant?: "info" | "warning" | "danger" | "success" | "light-danger" | "info-dark" | "primary";
  outline?: boolean;
  extend?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "info",
  outline: true,
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

  --status-border-radius: 2px;
  --status-border-radius-extended: 4px;
  --status-border-width: 1px;

  --status-info-color: var(--additional-950);
  --status-info-main-color: var(--info-500);

  --status-warning-color: var(--additional-950);
  --status-warning-main-color: var(--warning-500);

  --status-danger-color: var(--additional-950);
  --status-danger-main-color: var(--danger-500);

  --status-success-color: var(--additional-950);
  --status-success-main-color: var(--success-500);

  --status-light-danger-color: var(--additional-950);
  --status-light-danger-main-color: var(--danger-300);

  --status-info-dark-color: var(--additional-50);
  --status-info-dark-main-color: var(--info-600);

  --status-primary-color: var(--additional-950);
  --status-primary-main-color: var(--primary-500);

  --status-outline-bg-color: var(--additional-50);
}

$variants: info, warning, danger, success, light-danger, info-dark, primary;

.vc-status {
  @apply tw-inline-block tw-font-normal tw-whitespace-nowrap tw-text-sm tw-truncate tw-text-center tw-border tw-border-solid tw-box-border tw-w-full;

  @apply tw-py-1 tw-px-3.5 tw-rounded-[var(--status-border-radius)];

  border-width: var(--status-border-width);

  @each $variant in $variants {
    &.vc-status_#{$variant} {
      @apply tw-text-[color:var(--status-#{$variant}-color)] tw-border-[color:var(--status-#{$variant}-main-color)] tw-bg-[color:var(--status-#{$variant}-main-color)];

      &.vc-status_outline {
        @apply tw-text-[color:var(--status-#{$variant}-main-color)] tw-bg-[color:var(--status-outline-bg-color)];
      }
    }
  }

  &.vc-status_extended {
    @apply tw-whitespace-normal tw-rounded-[var(--status-border-radius-extended)];

    padding: var(--status-padding-extended);
  }
}
</style>
