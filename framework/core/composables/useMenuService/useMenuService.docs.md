# useMenuService

Accesses the navigation menu service for adding, removing, and badging menu items in the application sidebar.

## When to Use

- When registering navigation menu items from a module
- When dynamically adding or removing menu entries at runtime
- When setting badge indicators (counts, status dots) on menu items
- Do NOT call before `provideMenuService()` has been called in an ancestor component

## Basic Usage

```typescript
import { useMenuService } from "@vc-shell/framework";

const menuService = useMenuService();
menuService.addMenuItem({
  title: "Orders",
  icon: "fas fa-shopping-cart",
  routeId: "OrdersList",
  priority: 10,
});
```

## API

### Returns (`MenuService`)

| Property | Type | Description |
|----------|------|-------------|
| `addMenuItem` | `(item: MenuItem) => void` | Add a menu item (deduplicates by identity) |
| `removeMenuItem` | `(item: MenuItem) => void` | Remove a menu item |
| `menuItems` | `Ref<MenuItem[]>` | Reactive array of all registered menu items |
| `menuBadges` | `Ref<Map<string, MenuItemBadgeConfig>>` | Reactive map of badge configs keyed by menu item identity |

### Standalone Exports

| Export | Description |
|--------|-------------|
| `addMenuItem(item)` | Pre-register a menu item before the service is initialized |
| `removeRegisteredMenuItem(item)` | Remove a pre-registered menu item |
| `setMenuBadge(menuId, config)` | Set a badge on a menu item |
| `getMenuBadge(menuId)` | Get badge config for a menu item |
| `removeMenuBadge(menuId)` | Remove a badge from a menu item |
| `getMenuBadges()` | Get all active badge configs |
| `provideMenuService()` | Create and provide the service in a root component |

## Common Patterns

### Registering menu items during module setup

```typescript
import { addMenuItem } from "@vc-shell/framework";

// In module's initialize function
addMenuItem({
  title: "Products",
  icon: "fas fa-box",
  routeId: "ProductsList",
  priority: 20,
  group: "Catalog",
});
```

### Setting a badge count

```typescript
<script setup lang="ts">
import { setMenuBadge } from "@vc-shell/framework";

// Show unread count on the Orders menu item
setMenuBadge("OrdersList", {
  content: unreadCount.value,
  variant: "danger",
});
</script>
```

## Notes

- `addMenuItem()` can be called before the service exists. Items are buffered and flushed when `provideMenuService()` runs.
- Menu items are sorted by `priority` (lower number = higher in the list) and grouped by `group`.
- Identity deduplication uses a priority chain: `id > routeId > url > group+title`.

## Related

- [useSettingsMenu](../useSettingsMenu/) -- similar pattern for the settings sidebar menu
- [useDashboard](../useDashboard/) -- similar pre-registration pattern for dashboard widgets
