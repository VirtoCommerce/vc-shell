<template>
  <div class="font-medium text-base">
    <span class="text-[color:var(--table-counter-label-color)]"
      >{{ label }}&nbsp;</span
    >
    <span class="text-[color:var(--table-counter-value-color)]">{{
      value
    }}</span>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    default: "Total",
  },

  value: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss">
:root {
  --table-counter-label-color: #465769;
  --table-counter-value-color: #43b0e6;
}
</style>
