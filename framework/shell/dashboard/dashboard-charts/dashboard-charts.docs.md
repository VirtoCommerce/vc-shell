# DashboardCharts

Suite of dashboard chart components (line, bar, donut) built on Unovis. Each chart accepts a generic data array, a `ChartConfig` for series colors/labels, and supports hover tooltips, legends, and optional range filtering.

## Overview

Dashboard widgets frequently need to visualize data: revenue trends, order volumes, category distributions, and similar metrics. The vc-shell framework provides three chart components that wrap the Unovis visualization library with a simplified, consistent API.

All three chart types share a common prop interface (`data`, `config`, `xKey`, `yKeys`) and support tooltips, legends, and range filtering. The `ChartConfig` object maps data keys to display labels and colors, making it easy to configure multiple series.

The charts are designed to work inside `DashboardWidgetCard` components, automatically adapting to the card's dimensions. They use CSS custom properties from the vc-shell theme for default colors, ensuring visual consistency with the rest of the application.

## When to Use

- Use inside DashboardWidgetCard to visualize time-series or categorical data
- When you need line charts, grouped bar charts, or donut/pie charts
- Do NOT use for complex interactive charts requiring custom Unovis configuration -- use Unovis directly

## Components

| Component | Description |
|-----------|-------------|
| `DashboardLineChart` | Time-series or continuous data with connected points |
| `DashboardBarChart` | Grouped or single bar charts for categorical comparison |
| `DashboardDonutChart` | Circular chart for part-to-whole relationships |

## Basic Usage

```vue
<script setup lang="ts">
import { DashboardLineChart, DashboardBarChart, DashboardDonutChart } from "@vc-shell/framework";
import type { ChartConfig } from "@vc-shell/framework";

const data = [
  { month: 0, revenue: 4200 },
  { month: 1, revenue: 5100 },
  { month: 2, revenue: 4800 },
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

## ChartConfig Type

The `ChartConfig` object maps data field names to their visual configuration:

```typescript
type ChartConfig = Record<string, {
  label: string;    // Display name in legend and tooltip
  color: string;    // CSS color value (hex, var(), rgb, etc.)
}>;
```

## Common Patterns

### Multi-series Line Chart

```vue
<script setup lang="ts">
const salesData = [
  { month: 0, electronics: 12000, clothing: 8000, food: 5000 },
  { month: 1, electronics: 14000, clothing: 7500, food: 5500 },
  { month: 2, electronics: 11000, clothing: 9000, food: 6000 },
];

const salesConfig: ChartConfig = {
  electronics: { label: "Electronics", color: "var(--primary-500)" },
  clothing: { label: "Clothing", color: "var(--success-500)" },
  food: { label: "Food", color: "var(--warning-500)" },
};
</script>

<template>
  <DashboardLineChart
    :data="salesData"
    :config="salesConfig"
    x-key="month"
    :y-keys="['electronics', 'clothing', 'food']"
  />
</template>
```

### Bar Chart with Formatted Axes

```vue
<DashboardBarChart
  :data="quarterlyData"
  :config="quarterConfig"
  x-key="quarter"
  :y-keys="['electronics', 'clothing']"
  :x-tick-format="(v) => ['Q1', 'Q2', 'Q3', 'Q4'][v]"
  :y-tick-format="(v) => '$' + (v / 1000).toFixed(0) + 'k'"
/>
```

### Donut Chart

```vue
<DashboardDonutChart
  :data="categoryData"
  :config="categoryConfig"
  value-key="count"
  central-label="1,000"
  central-sub-label="Total Products"
/>
```

### Chart Inside a Widget Card

```vue
<DashboardWidgetCard header="Revenue Trend" icon="lucide-trending-up">
  <template #content>
    <DashboardLineChart
      :data="revenueData"
      :config="revenueConfig"
      x-key="period"
      :y-keys="['revenue', 'profit']"
      :range-start="rangeStart"
      :range-end="rangeEnd"
    />
  </template>
</DashboardWidgetCard>
```

## Tip: Use CSS Variables for Theme-Consistent Colors

Reference vc-shell theme CSS variables in your `ChartConfig` colors. This ensures charts adapt automatically when the user switches themes:

```typescript
const config: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--primary-500)" },
  cost: { label: "Cost", color: "var(--danger-500)" },
  profit: { label: "Profit", color: "var(--success-500)" },
};
```

## Common Mistake

The `xKey` and `yKeys` props must match actual property names in your data objects. TypeScript will catch mismatches at compile time, but when using dynamic data, verify the keys exist:

```typescript
// Data uses "month" but config says "period" -- chart will be empty
const data = [{ month: 0, revenue: 100 }];
// Bad: xKey doesn't match data
<DashboardLineChart :data="data" x-key="period" ... />
// Good: xKey matches data property
<DashboardLineChart :data="data" x-key="month" ... />
```

## Related Components

- [DashboardWidgetCard](../dashboard-widget-card/dashboard-widget-card.docs.md) -- card container for charts
- [DraggableDashboard](../draggable-dashboard/draggable-dashboard.docs.md) -- grid layout
- [Unovis](https://unovis.dev/) -- underlying visualization library
