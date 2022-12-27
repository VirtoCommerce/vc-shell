<template>
  <div class="tw-font-medium tw-text-base">
    <span class="tw-text-[color:var(--table-counter-label-color)]"
      >{{ label }}&nbsp;</span
    >
    <span class="tw-text-[color:var(--table-counter-value-color)]">{{
      value
    }}</span>
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
  --table-counter-label-color: #465769;
  --table-counter-value-color: #43b0e6;
}
</style>
