# Core Services

Singleton service layer for registering and querying application-level entities: menu items, widgets, toolbar buttons, dashboard widgets, settings panels, app-bar items, and more.

## Overview

Every service follows the same architecture:

1. **Factory function** (`createXxxService()`) -- creates a new service instance with reactive internal state.
2. **Preregistration bus** -- a module-level `createPreregistrationBus()` that buffers registrations made before the service is initialized. Once `replayInto(service)` is called, buffered items are flushed into the live service.
3. **Module-level helper** (e.g., `addMenuItem()`, `registerWidget()`) -- lets modules register items at import time, before the Vue app mounts.
4. **Corresponding `use*` composable** (in `core/composables/`) -- injects the service instance via provide/inject for use inside components.

### Internal Building Blocks (`_internal/`)

| Helper                      | Purpose                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `createPreregistrationBus`  | Generic bus that stores items by key and replays them into a service. Supports live-register (after service is up) and broadcast. |
| `createBladeScopedRegistry` | Reactive `Map<bladeId, Item[]>` with register/unregister/update/clear. Used by WidgetService and ToolbarService.                  |
| `createSimpleMapRegistry`   | Reactive `Map<id, Item>` with sorted computed output. Used by SettingsMenuService and AppBarMenuService.                          |

## Services

| Service                        | Factory                              | Module-level API                                                | Key Type               |
| ------------------------------ | ------------------------------------ | --------------------------------------------------------------- | ---------------------- |
| **MenuService**                | `createMenuService()`                | `addMenuItem()`, `removeRegisteredMenuItem()`, `setMenuBadge()` | `MenuItem`             |
| **WidgetService**              | `createWidgetService()`              | `registerWidget()`, `registerExternalWidget()`                  | `IWidget`              |
| **ToolbarService**             | `createToolbarService()`             | `registerToolbarItem()`                                         | `IToolbarItem`         |
| **DashboardService**           | `createDashboardService()`           | `registerDashboardWidget()`                                     | `DashboardWidget`      |
| **SettingsMenuService**        | `createSettingsMenuService()`        | `addSettingsMenuItem()`                                         | `ISettingsMenuItem`    |
| **AppBarWidgetService**        | `createAppBarWidgetService()`        | `addAppBarWidget()`                                             | `AppBarWidget`         |
| **AppBarMobileButtonsService** | `createAppBarMobileButtonsService()` | (direct API)                                                    | `AppBarButtonContent`  |
| **GlobalSearchService**        | `createGlobalSearchService()`        | (direct API)                                                    | per-blade search state |
| **LanguageService**            | `createLanguageService()`            | (direct API)                                                    | locale strings         |

## Usage

### Registering at module level (before app mount)

```typescript
import { addMenuItem, registerWidget, registerToolbarItem } from "@vc-shell/framework";

// These calls are buffered and replayed when the service initializes
addMenuItem({
  title: "Orders",
  routeId: "OrdersList",
  icon: "lucide-shopping-cart",
  priority: 10,
});

registerWidget({ id: "order-stats", component: OrderStatsWidget }, "OrderDetails");
```

### Using inside a component

```typescript
import { useMenu, useToolbar } from "@vc-shell/framework";

const { menuItems } = useMenu(); // reactive menu tree
const { toolbarItems } = useToolbar(); // toolbar items for current blade
```

### Menu badges

```typescript
import { setMenuBadge, removeMenuBadge } from "@vc-shell/framework";

setMenuBadge("OrdersList", { value: computed(() => pendingCount.value) });
removeMenuBadge("OrdersList");
```

## Tips

- Services are created once per app instance and provided via Vue's provide/inject.
- The preregistration bus deduplicates by key -- re-registering the same key overwrites the previous entry.
- `WidgetService` supports both blade-scoped widgets (`registerWidget`) and cross-blade external widgets (`registerExternalWidget`).
- `ToolbarService` supports a wildcard blade ID `"*"` for global toolbar items that appear on every blade.
- `MenuService` builds a tree from flat items: items with `group` or `groupConfig` are nested under group nodes, sorted by `priority`.
- `DashboardService` accepts a `hasAccess` callback for permission-based widget filtering.

## Related

- `framework/core/composables/` -- `useMenu`, `useToolbar`, `useWidgets`, `useDashboard`, etc.
- `framework/core/services/_internal/` -- shared registry and bus implementations
- `framework/core/plugins/` -- services are created and provided during plugin installation
