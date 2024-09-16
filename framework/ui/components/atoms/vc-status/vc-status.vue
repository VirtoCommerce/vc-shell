<template>
  <div
    class="vc-status"
    :class="[`vc-status_${variant}`, { 'vc-status_outline': outline }, { 'vc-status_extended': extend }]"
  >
    <slot></slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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

  --status-info-color: var(--neutrals-50);
  --status-info-main-color: var(--info-300);

  --status-warning-color: var(--neutrals-50);
  --status-warning-main-color: var(--warning-500);

  --status-danger-color: var(--neutrals-50);
  --status-danger-main-color: var(--danger-500);

  --status-success-color: var(--neutrals-50);
  --status-success-main-color: var(--success-400);

  --status-light-danger-color: var(--neutrals-700);
  --status-light-danger-main-color: var(--danger-50);

  --status-info-dark-color: var(--neutrals-50);
  --status-info-dark-main-color: var(--info-600);

  --status-primary-main-color: var(--primary-500);
  --status-primary-color: var(--neutrals-50);

  --status-outline-bg-color: var(--additional-50);
}

$variants: info, warning, danger, success, light-danger, info-dark, primary;

.vc-status {
  @apply tw-inline-block tw-rounded-[var(--status-border-radius)] tw-py-1 tw-px-3.5 tw-text-base tw-font-normal tw-whitespace-nowrap;

  @each $variant in $variants {
    &_#{$variant} {
      @apply tw-text-[color:var(--status-#{$variant}-color)] tw-border tw-border-solid tw-border-[color:var(--status-#{$variant}-main-color)] tw-bg-[color:var(--status-#{$variant}-main-color)];

      &.vc-status_outline {
        @apply tw-text-[color:var(--status-#{$variant}-main-color)] tw-border tw-border-solid tw-border-[color:var(--status-#{$variant}-main-color)] tw-bg-[--status-outline-bg-color];
      }
    }
  }

  &.vc-status_extended {
    @apply tw-whitespace-normal tw-p-[var(--status-padding-extended)] tw-rounded-[var(--status-border-radius-extended)];
  }
}
</style>
