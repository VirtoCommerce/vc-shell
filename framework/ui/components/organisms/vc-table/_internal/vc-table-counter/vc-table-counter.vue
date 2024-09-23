<template>
  <div class="vc-table-counter">
    <span class="vc-table-counter__label">{{ label }}&nbsp;</span>
    <span class="vc-table-counter__value">{{ value }}</span>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  label: string;
  value: number;
}

withDefaults(defineProps<Props>(), {
  label: "Total",
  value: 0,
});
</script>

<style lang="scss">
:root {
  --table-counter-label-color: var(--base-text-color, var(--secondary-950));
  --table-counter-value-color: var(--info-500);
}

.vc-table-counter {
  @apply tw-font-medium tw-text-sm;

  &__label {
    @apply tw-text-[color:var(--table-counter-label-color)];
  }

  &__value {
    @apply tw-text-[color:var(--table-counter-value-color)];
  }
}
</style>
