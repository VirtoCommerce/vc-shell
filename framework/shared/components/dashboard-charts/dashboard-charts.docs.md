# DashboardCharts

Suite of dashboard chart components (line, bar, donut) built on Unovis. Each chart accepts a generic data array, a `ChartConfig` for series colors/labels, and supports hover tooltips, legends, and optional range filtering.

## When to Use

- Use inside DashboardWidgetCard to visualize time-series or categorical data
- When you need line charts, grouped bar charts, or donut/pie charts
- Do NOT use for complex interactive charts requiring custom Unovis configuration

## Basic Usage

```vue
<script setup lang="ts">
import { DashboardLineChart, DashboardBarChart, DashboardDonutChart } from "@vc-shell/framework";
import type { ChartConfig } from "@vc-shell/framework";

const data = [
  { month: 0, revenue: 4200 },
  { month: 1, revenue: 5100 },
];

const config: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--primary-500)" },
};
</script>

<template>
  <DashboardLineChart
    :data="data"
    :config="config"
    x-key="month"
    :y-keys="['revenue']"
  />
</template>
```

## Key Props (shared across chart types)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | -- | Array of data points |
| `config` | `ChartConfig` | -- | Series color and label configuration |
| `xKey` | `keyof T` | -- | Key for x-axis values (line/bar) |
| `yKeys` | `(keyof T)[]` | -- | Keys for y-axis series (line/bar) |
| `showTooltip` | `boolean` | `true` | Enable hover tooltips |
| `showLegend` | `boolean` | `true` | Show color legend below chart |
| `rangeStart` | `number` | `undefined` | Filter data from this x value |
| `rangeEnd` | `number` | `undefined` | Filter data up to this x value |

### Donut-specific props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `valueKey` | `keyof T` | -- | Key for segment values |
| `centralLabel` | `string` | `undefined` | Large text in donut center |
| `centralSubLabel` | `string` | `undefined` | Small text below central label |
| `arcWidth` | `number` | `60` | Donut arc thickness |

## Common Patterns

### Bar chart with formatted axes

```vue
<DashboardBarChart
  :data="salesData"
  :config="salesConfig"
  x-key="quarter"
  :y-keys="['electronics', 'clothing']"
  :x-tick-format="(v) => ['Q1','Q2','Q3','Q4'][v]"
  :y-tick-format="(v) => '$' + (v / 1000).toFixed(0) + 'k'"
/>
```

## Related Components

- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) -- card container for charts
- [DraggableDashboard](../draggable-dashboard/draggable-dashboard.docs.md) -- grid layout
