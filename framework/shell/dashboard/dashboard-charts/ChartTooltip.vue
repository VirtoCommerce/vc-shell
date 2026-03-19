<template>
  <div class="dashboard-chart-tooltip">
    <div
      v-if="title"
      class="dashboard-chart-tooltip__title"
    >
      {{ title }}
    </div>
    <div class="dashboard-chart-tooltip__items">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="dashboard-chart-tooltip__item"
      >
        <span
          class="dashboard-chart-tooltip__indicator"
          :style="{ background: item.color }"
        />
        <span class="dashboard-chart-tooltip__label">{{ item.label }}</span>
        <span class="dashboard-chart-tooltip__value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TooltipItem {
  label: string;
  value: string | number;
  color: string;
}

export interface Props {
  title?: string;
  items: TooltipItem[];
}

defineProps<Props>();
</script>

<style lang="scss">
@use "./chart-tooltip";
</style>
