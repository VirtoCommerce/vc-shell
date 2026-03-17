# DashboardWidgetCard

Modern dashboard widget card with header, optional KPI stats area, action buttons, content body, and footer. Used within the GridStack dashboard layout for displaying metrics, feeds, and charts.

## When to Use

- Use as the container for any dashboard widget (metrics, charts, activity feeds)
- When you need a consistent card layout with header, stats, and content areas
- Do NOT use for non-dashboard card layouts (use VcCard instead)

## Basic Usage

```vue
<script setup lang="ts">
import { DashboardWidgetCard } from "@vc-shell/framework";
</script>

<template>
  <DashboardWidgetCard header="Products" icon="lucide-package-open">
    <template #content>
      <div class="tw-p-4">Widget body content here</div>
    </template>
  </DashboardWidgetCard>
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `string` | `undefined` | Card title text |
| `icon` | `string` | `undefined` | Icon displayed next to the header |
| `loading` | `boolean` | `false` | Shows a loading overlay on the body |

## Slots

| Slot | Description |
|------|-------------|
| `header` | Override the entire header area |
| `actions` | Action buttons in the header row |
| `stats` | KPI stat items below the header |
| `content` | Main body content |
| `footer` | Footer area with links or actions |

## Common Patterns

### Card with stats and feed

```vue
<DashboardWidgetCard header="Orders" icon="lucide-shopping-cart">
  <template #stats>
    <DashboardStatItem :value="48" label="Total" />
    <DashboardStatItem :value="3" label="Pending" variant="warning" />
  </template>
  <template #content>
    <DashboardFeedList>
      <DashboardFeedRow v-for="row in rows" :key="row.id">
        {{ row.name }}
      </DashboardFeedRow>
    </DashboardFeedList>
  </template>
  <template #footer>
    <a href="#">View all orders</a>
  </template>
</DashboardWidgetCard>
```

## Related Components

- [DraggableDashboard](../draggable-dashboard/draggable-dashboard.docs.md) -- grid layout container
- [DashboardCharts](../dashboard-charts/dashboard-charts.docs.md) -- chart components for widget content
