<template>
  <div
    class="vc-col"
    :style="{ flexGrow: size }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  size?: number;
}

withDefaults(defineProps<Props>(), {
  size: 1,
});

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => any;
}>();
</script>

<style lang="scss">
:root {
  --col-gap: 0;
}

.vc-col {
  @apply tw-flex tw-flex-col tw-min-w-0 tw-basis-0;
  gap: var(--col-gap);
}
</style>
