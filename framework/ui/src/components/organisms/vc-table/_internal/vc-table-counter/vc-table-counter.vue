<template>
  <div class="vc-table-counter">
    <span class="vc-table-counter__label">{{ label }}&nbsp;</span>
    <span class="vc-table-counter__value">{{ value }}</span>
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

<style lang="less">
:root {
  --table-counter-label-color: #465769;
  --table-counter-value-color: #43b0e6;
}

.vc-table-counter {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-m);

  &__label {
    color: var(--table-counter-label-color);
  }

  &__value {
    color: var(--table-counter-value-color);
  }
}
</style>
