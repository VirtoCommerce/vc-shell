<template>
  <div
    class="vc-skeleton"
    :class="{
      'vc-skeleton--animated': animated,
    }"
  >
    <div
      v-for="index in rows"
      :key="index"
      class="vc-skeleton__row"
      :style="{
        width: getRowWidth(index),
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    rows?: number;
    animated?: boolean;
  }>(),
  {
    rows: 1,
    animated: false,
  }
);

function getRowWidth(index: number) {
  if (index === props.rows) {
    return '60%';
  }
  return '100%';
}
</script>

<style lang="scss">
.vc-skeleton {
  @apply tw-w-full tw-flex tw-flex-col tw-gap-4;

  &__row {
    @apply tw-h-4 tw-bg-[--neutrals-200] tw-rounded;
  }

  &--animated &__row {
    @apply tw-animate-pulse;
  }
}
</style>
