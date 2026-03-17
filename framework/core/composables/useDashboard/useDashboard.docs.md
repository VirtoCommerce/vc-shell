# useDashboard

Accesses the dashboard service for registering and managing dashboard widgets. Widgets are permission-aware and support layout positioning.

## When to Use

- When registering dashboard widgets from a module
- When reading or updating widget layout positions at runtime
- Do NOT call before `provideDashboardService()` has been called in an ancestor component

## Basic Usage

```typescript
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();
const widgets = dashboard.getWidgets();
```

## API

### Returns (`IDashboardService`)

| Property | Type | Description |
|----------|------|-------------|
| `registerWidget` | `(widget: DashboardWidget) => void` | Register a widget with the dashboard |
| `getWidgets` | `() => DashboardWidget[]` | Get all registered widgets (filtered by user permissions) |
| `updateWidgetPosition` | `(widgetId: string, position: DashboardWidgetPosition) => void` | Update a widget's grid position |
| `getLayout` | `() => ReadonlyMap<string, DashboardWidgetPosition>` | Get the current layout map |

### Related Exports

| Export | Description |
|--------|-------------|
| `provideDashboardService()` | Call in a root component to create and provide the service |
| `registerDashboardWidget(widget)` | Pre-register a widget before the service is initialized (module setup) |

## Common Patterns

### Registering a widget in module setup

```typescript
import { registerDashboardWidget } from "@vc-shell/framework";

// In module's initialize function (runs before service is available)
registerDashboardWidget({
  id: "orders-summary",
  component: OrdersSummaryWidget,
  title: "Orders Summary",
  permissions: ["order:read"],
});
```

### Accessing widgets in a dashboard view

```typescript
<script setup lang="ts">
import { useDashboard } from "@vc-shell/framework";

const dashboard = useDashboard();
const widgets = computed(() => dashboard.getWidgets());
</script>
```

## Notes

- `registerDashboardWidget()` can be called before the service exists (e.g., during module plugin install). Widgets are buffered and flushed when `provideDashboardService()` runs.
- Widget visibility is automatically filtered by the current user's permissions via `usePermissions`.
- The service is a singleton per provide scope -- `provideDashboardService()` reuses an existing service if already provided by an ancestor.

## Related

- [usePermissions](../usePermissions/) -- permission checks used for widget visibility
- [useMenuService](../useMenuService/) -- similar service pattern for navigation menu
