<template>
  <aside
    class="vc-environment-banner"
    :class="`vc-environment-banner--${color}`"
    :aria-label="`Environment indicator: ${name}`"
  >
    <span class="vc-environment-banner__label">{{ name }}</span>
  </aside>
</template>

<script lang="ts" setup>
export interface Props {
  name: string;
  /**
   * Badge color. Accepts a free string (matches `ComputedRef<string>` from
   * useEnvironmentName). Known values: primary | secondary | info | success |
   * warning | danger | neutral. Anything else falls back to neutral via CSS.
   */
  color?: string;
}

withDefaults(defineProps<Props>(), {
  color: "neutral",
});
</script>

<style lang="scss">
// Centered badge pinned to the top, matching the platform environment banner
// (vc-env-badge). Colors use vc-shell theme tokens.
.vc-environment-banner {
  @apply tw-fixed tw-top-0 tw-z-[2000] tw-inline-flex tw-items-center tw-justify-center;
  left: 50%;
  transform: translateX(-50%);
  height: 28px;
  padding: 0 14px;
  border-radius: 0 0 0.5rem 0.5rem;
  font-size: 13px;
  line-height: 1;
  font-weight: 700;
  color: var(--additional-50);
  pointer-events: none;
  box-shadow: 0 2px 6px rgb(0 0 0 / 15%);
  background: var(--environment-banner-color, var(--neutrals-500));

  &__label {
    white-space: nowrap;
  }

  &--primary {
    --environment-banner-color: var(--primary-500);
  }
  &--secondary {
    --environment-banner-color: var(--secondary-500);
  }
  &--info {
    --environment-banner-color: var(--info-500);
  }
  &--success {
    --environment-banner-color: var(--success-500);
  }
  &--warning {
    --environment-banner-color: var(--warning-500);
  }
  &--danger {
    --environment-banner-color: var(--danger-500);
  }
  &--neutral {
    --environment-banner-color: var(--neutrals-500);
  }
}
</style>
