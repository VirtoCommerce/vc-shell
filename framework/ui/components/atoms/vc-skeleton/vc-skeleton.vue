<template>
  <!-- Text variant: rows of skeleton lines (original behavior) -->
  <div
    v-if="variant === 'text'"
    class="vc-skeleton"
    :class="{
      'vc-skeleton--animated': animated,
    }"
    role="status"
    aria-busy="true"
    :aria-label="ariaLabel"
  >
    <span class="tw-sr-only">{{ ariaLabel }}</span>
    <div
      v-for="index in rows"
      :key="index"
      class="vc-skeleton__row"
      :style="{
        width: getRowWidth(index),
      }"
      aria-hidden="true"
    ></div>
  </div>

  <!-- Circle / Block variant: single shape element -->
  <div
    v-else
    class="vc-skeleton__shape"
    :class="[
      `vc-skeleton__shape--${variant}`,
      { 'tw-animate-pulse': animated },
    ]"
    :style="{
      width: normalizeSize(width),
      height: normalizeSize(height),
    }"
    role="status"
    aria-busy="true"
    :aria-label="ariaLabel"
  >
    <span class="tw-sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    /** Shape variant: text rows, circle, or rectangular block */
    variant?: "text" | "circle" | "block";
    /** Number of rows (only for variant="text") */
    rows?: number;
    /** Custom width (number treated as px, string used as-is) */
    width?: string | number;
    /** Custom height (number treated as px, string used as-is) */
    height?: string | number;
    animated?: boolean;
    /** Screen reader label */
    ariaLabel?: string;
  }>(),
  {
    variant: "text",
    rows: 1,
    animated: true,
    ariaLabel: "Loading...",
  },
);

function getRowWidth(index: number) {
  if (index === props.rows) {
    return "60%";
  }
  return "100%";
}

function normalizeSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}
</script>

<style lang="scss">
:root {
  --vc-skeleton-bg: var(--neutrals-200);
  --vc-skeleton-highlight: var(--neutrals-300);
  --vc-skeleton-border-radius: 6px;
  --vc-skeleton-row-height: 16px;
  --vc-skeleton-row-gap: 12px;
}

.vc-skeleton {
  @apply tw-w-full tw-flex tw-flex-col;
  gap: var(--vc-skeleton-row-gap);

  &__row {
    height: var(--vc-skeleton-row-height);
    @apply tw-bg-[color:var(--vc-skeleton-bg)] tw-rounded-[var(--vc-skeleton-border-radius)];
  }

  &--animated &__row {
    @apply tw-animate-pulse;
  }

  &__shape {
    @apply tw-bg-[color:var(--vc-skeleton-bg)];

    &--block {
      @apply tw-rounded-[var(--vc-skeleton-border-radius)];
    }

    &--circle {
      @apply tw-rounded-full;
    }
  }
}
</style>
