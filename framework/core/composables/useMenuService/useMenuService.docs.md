# useMenuService

Accesses the navigation menu service for adding, removing, and badging menu items in the application sidebar. The service supports a pre-registration pattern that allows modules to declare menu items before the service is initialized, and a grouping system that organizes items into collapsible sections.

## Quick Start

```typescript
import { addMenuItem } from "@vc-shell/framework";

// In a module's initialize function (runs before service is available)
addMenuItem({
  title: "Orders",
  icon: "fas fa-shopping-cart",
  routeId: "OrdersList",
  priority: 10,
});
```

When the application shell calls `provideMenuService()`, all pre-registered items are flushed into the live service.

## Pre-Registration vs. Live Service

The menu system supports two usage modes depending on timing.

### Pre-registration (module setup)

Use the standalone `addMenuItem` function when registering menu items during module plugin installation. This runs before the Vue component tree is mounted:

```typescript
// modules/orders/index.ts
import { addMenuItem } from "@vc-shell/framework";

export default {
  install(app) {
    addMenuItem({
      title: "Orders",
      icon: "fas fa-shopping-cart",
      routeId: "OrdersList",
      priority: 10,
    });

    addMenuItem({
      title: "Returns",
      icon: "fas fa-undo",
      routeId: "ReturnsList",
      priority: 20,
    });
  },
};
```

### Live service (inside components)

Use `useMenuService()` inside a component's `<script setup>` to access the live service instance after it has been provided:

```typescript
<script setup lang="ts">
import { useMenuService } from "@vc-shell/framework";

const menuService = useMenuService();

// Read all registered menu items reactively
const items = computed(() => menuService.menuItems.value);
</script>
```

> **Important:** Calling `useMenuService()` before `provideMenuService()` has been called by an ancestor component throws an `InjectionError`. Module setup code should always use the standalone `addMenuItem()` function instead.

## Grouping Menu Items

Menu items with a `group` or `groupConfig` property are grouped into collapsible sections in the sidebar.

### Using groupConfig (recommended)

```typescript
addMenuItem({
  title: "Products",
  icon: "fas fa-box",
  routeId: "ProductsList",
  priority: 10,
  groupConfig: {
    id: "catalog",
    title: "Catalog",
    icon: "fas fa-folder",
    priority: 5,
    permissions: "catalog:read",
  },
});

addMenuItem({
  title: "Categories",
  icon: "fas fa-tags",
  routeId: "CategoriesList",
  priority: 20,
  groupConfig: {
    id: "catalog", // same group ID -- items are grouped together
  },
});
```

Both items appear under a single "Catalog" group. The group inherits properties from the first registration that provides them, and subsequent registrations with the same `id` can update the group's `title`, `icon`, `priority`, or `permissions`.

### Using group (legacy)

```typescript
addMenuItem({
  title: "Products",
  icon: "fas fa-box",
  routeId: "ProductsList",
  priority: 10,
  group: "Catalog",
  groupIcon: "fas fa-folder",
});
```

> **Note:** The `group` and `groupIcon` properties are deprecated. Use `groupConfig` for more precise control over group identity and display.

## Badges and Indicators

Badges display numeric counts or dot indicators on menu items. They can be set at any time, including before the service is initialized.

### Setting a badge count

```typescript
import { setMenuBadge } from "@vc-shell/framework";

// Show a count on the Orders menu item (identified by routeId)
setMenuBadge("OrdersList", { content: 5, variant: "danger" });
```

### Shorthand badge values

```typescript
import { setMenuBadge } from "@vc-shell/framework";

// Number shorthand
setMenuBadge("OrdersList", 12);

// String shorthand
setMenuBadge("OrdersList", "New");

// Reactive ref
const pendingCount = ref(0);
setMenuBadge("OrdersList", pendingCount);

// Computed value
const unread = computed(() => orders.value.filter((o) => !o.isRead).length);
setMenuBadge("OrdersList", unread);
```

### Dot indicator

```typescript
setMenuBadge("SettingsPage", { isDot: true, variant: "warning" });
```

### Removing a badge

```typescript
import { removeMenuBadge } from "@vc-shell/framework";

removeMenuBadge("OrdersList");
```

## Removing Menu Items

Remove previously registered items using the standalone function or the live service. The item is matched by its identity (priority: `id` > `routeId` > `url` > `group+title`):

```typescript
import { removeRegisteredMenuItem } from "@vc-shell/framework";

// Remove by routeId
removeRegisteredMenuItem({ routeId: "ReturnsList" } as MenuItem);
```

## Recipes

### Dynamic Badge Based on API Data

```typescript
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { setMenuBadge, useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);
const pendingCount = ref(0);

onMounted(async () => {
  const client = await getApiClient();
  const result = await client.searchOrders({ status: "Pending", take: 0 });
  pendingCount.value = result.totalCount ?? 0;
  setMenuBadge("OrdersList", { content: pendingCount.value, variant: "danger" });
});
</script>
```

### Conditional Menu Registration by Permissions

```typescript
import { addMenuItem, usePermissions } from "@vc-shell/framework";

export function registerOrderMenuItems() {
  addMenuItem({
    title: "Orders",
    icon: "fas fa-shopping-cart",
    routeId: "OrdersList",
    priority: 10,
    permissions: "order:read", // only visible to users with this permission
  });

  // Admin-only menu item
  addMenuItem({
    title: "Order Settings",
    icon: "fas fa-cog",
    routeId: "OrderSettings",
    priority: 90,
    permissions: ["order:manage", "admin:settings"],
  });
}
```

## Common Mistakes

### Calling useMenuService() during module setup

```typescript
// Wrong -- service is not provided yet during plugin install
export default {
  install(app) {
    const menuService = useMenuService(); // throws InjectionError
    menuService.addMenuItem({ ... });
  },
};

// Correct -- use the standalone function
export default {
  install(app) {
    addMenuItem({ title: "Orders", icon: "fas fa-cart", routeId: "OrdersList", priority: 10 });
  },
};
```

### Duplicate menu items from missing identity

```typescript
// Wrong -- no id or routeId, identity falls back to deep hash, may duplicate
addMenuItem({ title: "Orders", icon: "fas fa-cart", priority: 10 });
addMenuItem({ title: "Orders", icon: "fas fa-cart", priority: 10 });

// Correct -- provide routeId for stable deduplication
addMenuItem({ title: "Orders", icon: "fas fa-cart", routeId: "OrdersList", priority: 10 });
addMenuItem({ title: "Orders", icon: "fas fa-cart", routeId: "OrdersList", priority: 10 }); // deduped
```

### Setting badge on wrong identifier

```typescript
// Wrong -- using the menu item title instead of routeId
setMenuBadge("Orders", 5);

// Correct -- use routeId (the blade registration name)
setMenuBadge("OrdersList", 5);
```

## API Reference

### useMenuService()

Returns the injected `MenuService` instance. Throws `InjectionError` if the service has not been provided.

#### MenuService Interface

| Property | Type | Description |
|----------|------|-------------|
| `addMenuItem` | `(item: MenuItem) => void` | Add a menu item (deduplicates by identity) |
| `removeMenuItem` | `(item: MenuItem) => void` | Remove a menu item |
| `menuItems` | `Ref<MenuItem[]>` | Reactive array of all registered menu items (grouped and sorted) |
| `menuBadges` | `Ref<Map<string, MenuItemBadgeConfig>>` | Reactive map of badge configs keyed by routeId or groupId |

### Standalone Exports

| Function | Description |
|----------|-------------|
| `addMenuItem(item)` | Pre-register a menu item before the service is initialized |
| `removeRegisteredMenuItem(item)` | Remove a pre-registered item (works before and after service init) |
| `setMenuBadge(id, config)` | Set a badge on a menu item by routeId or groupId |
| `getMenuBadge(id)` | Get badge config for a menu item |
| `removeMenuBadge(id)` | Remove a badge from a menu item |
| `getMenuBadges()` | Get the reactive badge registry map |
| `provideMenuService()` | Create and provide the service in a root component |

### MenuItem Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Display text |
| `icon` | `string` | Yes | Icon class (e.g., `"fas fa-shopping-cart"`) |
| `priority` | `number` | Yes | Sort order (lower = higher in the list) |
| `routeId` | `string` | No | Blade route name (also used as identity key) |
| `url` | `string` | No | External URL |
| `id` | `string \| number` | No | Explicit identity key |
| `permissions` | `string \| string[]` | No | Required permissions for visibility |
| `group` | `string` | No | Group name (deprecated, use `groupConfig`) |
| `groupIcon` | `string` | No | Group icon (deprecated, use `groupConfig`) |
| `groupConfig` | `object` | No | Group configuration: `{ id, title?, icon?, priority?, permissions?, badge? }` |
| `inGroupPriority` | `number` | No | Sort order within a group (deprecated, use item's `priority`) |
| `badge` | `MenuItemBadgeConfig` | No | Inline badge configuration |
| `children` | `MenuItem[]` | No | Child items (populated automatically for groups) |

### MenuItemBadgeConfig

Accepts a full object or shorthand values:

| Form | Example | Description |
|------|---------|-------------|
| `number` | `5` | Numeric count |
| `string` | `"New"` | Text label |
| `Ref<number \| string>` | `ref(3)` | Reactive value |
| `ComputedRef<number \| string>` | `computed(() => count.value)` | Computed value |
| `() => number \| string` | `() => items.length` | Getter function |
| `MenuItemBadge` | `{ content: 5, variant: "danger", isDot: false }` | Full config object |

#### MenuItemBadge Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | `string \| number \| Ref \| ComputedRef \| Function` | -- | Badge content |
| `variant` | `"primary" \| "success" \| "warning" \| "danger" \| "info" \| "secondary"` | `"primary"` | Color variant |
| `isDot` | `boolean` | `false` | Show as dot indicator only (ignores content) |

## Related

- [useSettingsMenu](../useSettingsMenu/) -- similar pattern for the settings sidebar menu
- [useDashboard](../useDashboard/) -- similar pre-registration pattern for dashboard widgets
- [usePermissions](../usePermissions/) -- permission checks used for menu item visibility
