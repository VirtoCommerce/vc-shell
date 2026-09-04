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
  /**
   * The label's ink. Defaults to the theme's surface colour — white in light,
   * near-black in dark — which is what the neutral variant and an unmodified
   * banner need: that grey background is too dark for black (4.43:1) and the
   * theme-following token clears AA in both (4.74:1 and 4.72:1).
   *
   * The coloured variants override it below.
   */
  color: var(--environment-banner-text-color, var(--additional-50));
  pointer-events: none;
  box-shadow: 0 2px 6px rgb(0 0 0 / 15%);
  background: var(--environment-banner-color, var(--neutrals-500));

  &__label {
    white-space: nowrap;
  }

  /**
   * Black on every accent background, measured across all seven variants in both
   * themes: white ranges 1.70:1 to 3.32:1 in light and fails on primary and danger
   * in dark, while black clears AA everywhere (4.56:1 on the worst, dark danger,
   * to 12.33:1 on light amber).
   *
   * A fixed value rather than a token because the palette has none that fits:
   * every candidate flips with the theme — `--additional-950` is #000000 in light
   * but #ebebeb in dark — while these backgrounds stay mid-tone in both, so a
   * flipping ink fails in one of them. The backgrounds themselves are untouched;
   * each variant keeps the colour it was designed with.
   */
  &--primary {
    --environment-banner-color: var(--primary-500);
    --environment-banner-text-color: #000000;
  }
  &--secondary {
    --environment-banner-color: var(--secondary-500);
    --environment-banner-text-color: #000000;
  }
  &--info {
    --environment-banner-color: var(--info-500);
    --environment-banner-text-color: #000000;
  }
  &--success {
    --environment-banner-color: var(--success-500);
    --environment-banner-text-color: #000000;
  }
  &--warning {
    --environment-banner-color: var(--warning-500);
    --environment-banner-text-color: #000000;
  }
  &--danger {
    --environment-banner-color: var(--danger-500);
    --environment-banner-text-color: #000000;
  }
  &--neutral {
    --environment-banner-color: var(--neutrals-500);
  }
}
</style>
