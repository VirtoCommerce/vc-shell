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
  variant?: "info" | "warning" | "danger" | "success" | "light-danger";
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
  --status-padding-extended: 12px;

  --status-border-radius: 2px;
  --status-border-radius-extended: 4px;
  --status-border-width: 1px;

  --status-info-color: #ffffff;
  --status-info-main-color: #bdd1df;

  --status-warning-color: #ffffff;
  --status-warning-main-color: #f89406;

  --status-danger-color: #ffffff;
  --status-danger-main-color: #ef796f;

  --status-success-color: #ffffff;
  --status-success-main-color: #87b563;

  --status-light-danger-color: #333333;
  --status-light-danger-main-color: #ffefef;
}

$variants: info, warning, danger, success, light-danger;

.vc-status {
  @apply tw-inline-block tw-rounded-[var(--status-border-radius)] tw-py-1 tw-px-3.5 tw-text-base tw-font-normal tw-whitespace-nowrap;

  @each $variant in $variants {
    &_#{$variant} {
      @apply tw-text-[color:var(--status-#{$variant}-color)] tw-border tw-border-solid tw-border-[color:var(--status-#{$variant}-main-color)] tw-bg-[color:var(--status-#{$variant}-main-color)];

      &.vc-status_outline {
        @apply tw-text-[color:var(--status-#{$variant}-main-color)] tw-border tw-border-solid tw-border-[color:var(--status-#{$variant}-main-color)] tw-bg-white;
      }
    }
  }

  &.vc-status_extended {
    @apply tw-whitespace-normal tw-p-[var(--status-padding-extended)] tw-rounded-[var(--status-border-radius-extended)];
  }
}
</style>
