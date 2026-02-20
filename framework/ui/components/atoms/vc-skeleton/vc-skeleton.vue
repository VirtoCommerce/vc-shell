<template>
  <div
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
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    rows?: number;
    animated?: boolean;
    /** Screen reader label */
    ariaLabel?: string;
  }>(),
  {
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
</script>

<style lang="scss">
:root {
  --skeleton-bg: var(--neutrals-200);
  --skeleton-highlight: var(--neutrals-300);
  --skeleton-border-radius: 6px;
  --skeleton-row-height: 16px;
  --skeleton-row-gap: 12px;
}

.vc-skeleton {
  @apply tw-w-full tw-flex tw-flex-col;
  gap: var(--skeleton-row-gap);

  &__row {
    height: var(--skeleton-row-height);
    @apply tw-bg-[color:var(--skeleton-bg)] tw-rounded-[var(--skeleton-border-radius)];
  }

  &--animated &__row {
    @apply tw-animate-pulse;
  }
}
</style>
