<template>
  <div
    class="vc-status"
    :class="[
      `vc-status_${variant}`,
      { 'vc-status_outline': outline },
      { 'vc-status_extended': extend },
    ]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  variant: {
    type: String,
    default: "info",
    enum: ["info", "warning", "danger", "success", "light-danger"],
  },

  outline: {
    type: Boolean,
    default: true,
  },

  extend: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss">
:root {
  --status-padding: 4px 14px;
  --status-padding-extended: 12px;

  --status-font-size: var(--font-size-m);
  --status-font-weight: var(--font-weight-normal);

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
  @apply inline-block rounded-[var(--status-border-radius)] py-1 px-3.5 text-base font-normal whitespace-nowrap;

  @each $variant in $variants {
    &_#{$variant} {
      @apply text-[color:var(--status-#{$variant}-color)] border border-solid border-[color:var(--status-#{$variant}-main-color)] bg-[color:var(--status-#{$variant}-main-color)];

      &.vc-status_outline {
        @apply text-[color:var(--status-#{$variant}-main-color)] border border-solid border-[color:var(--status-#{$variant}-main-color)] bg-white;
      }
    }
  }

  &.vc-status_extended {
    @apply whitespace-normal p-[var(--status-padding-extended)] rounded-[var(--status-border-radius-extended)];
  }
}
</style>
