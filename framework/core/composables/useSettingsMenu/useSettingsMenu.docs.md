# useSettingsMenu

Accesses the settings menu service for registering and managing items in the application settings sidebar.

## Overview

The vc-shell application includes a settings page where users can configure preferences such as theme, language, and notification settings. Modules can extend this settings page by registering their own menu items, each pointing to a settings blade or component.

The `useSettingsMenu()` composable provides access to the `ISettingsMenuService` singleton, which manages the registration and lifecycle of settings menu items. It follows the same provide/inject service pattern used by other framework services like `useMenuService()` and `useDashboard()`.

The service must be provided by an ancestor component (via `provideSettingsMenu()`) before any descendant calls `useSettingsMenu()`. The framework handles this provision during app bootstrap, so module developers can call `useSettingsMenu()` directly in their module setup code.

## When to Use

- When a module needs to add entries to the settings page
- When dynamically registering or removing settings menu items
- Do NOT call before `provideSettingsMenu()` has been called in an ancestor component

## Basic Usage

```typescript
import { useSettingsMenu } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
const items = settingsMenu.items.value;
```

## API

### Returns (`ISettingsMenuService`)

| Property     | Type                                                   | Description                                          |
| ------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| `register`   | `(options: RegisterSettingsMenuItemOptions) => string` | Register a settings menu item; returns the item ID   |
| `unregister` | `(id: string) => void`                                 | Remove a settings menu item by ID                    |
| `items`      | `ComputedRef<ISettingsMenuItem[]>`                     | Reactive array of all registered settings menu items |

### Related Exports

| Export                  | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `provideSettingsMenu()` | Create and provide the service in a root component |

## Common Patterns

### Registering a settings page from a module

```typescript
import { useSettingsMenu } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();

const itemId = settingsMenu.register({
  id: "notification-preferences",
  title: "Notifications",
  icon: "fas fa-bell",
  component: NotificationSettingsPage,
  group: "General",
  priority: 10,
});
```

### Registering multiple settings items with grouping

```typescript
import { useSettingsMenu } from "@vc-shell/framework";
import { markRaw } from "vue";

const settingsMenu = useSettingsMenu();

// Group related settings under a common section
settingsMenu.register({
  id: "catalog-general",
  title: "General",
  icon: "lucide-settings",
  component: markRaw(CatalogGeneralSettings),
  group: "Catalog",
  priority: 1,
});

settingsMenu.register({
  id: "catalog-seo",
  title: "SEO Settings",
  icon: "lucide-search",
  component: markRaw(CatalogSeoSettings),
  group: "Catalog",
  priority: 2,
});

settingsMenu.register({
  id: "catalog-import-export",
  title: "Import / Export",
  icon: "lucide-arrow-left-right",
  component: markRaw(CatalogImportExportSettings),
  group: "Catalog",
  priority: 3,
});
```

### Cleaning up on module unload

```typescript
import { useSettingsMenu } from "@vc-shell/framework";
import { onBeforeUnmount } from "vue";

const settingsMenu = useSettingsMenu();
const itemId = settingsMenu.register({
  id: "my-settings",
  title: "My Module Settings",
  icon: "lucide-wrench",
  component: markRaw(MySettingsPage),
  group: "Modules",
  priority: 10,
});

onBeforeUnmount(() => {
  settingsMenu.unregister(itemId);
});
```

### Conditional registration based on permissions

```typescript
import { useSettingsMenu } from "@vc-shell/framework";
import { usePermissions } from "@vc-shell/framework";

const settingsMenu = useSettingsMenu();
const { hasAccess } = usePermissions();

if (hasAccess("catalog:manage")) {
  settingsMenu.register({
    id: "catalog-advanced",
    title: "Advanced Catalog Settings",
    icon: "lucide-settings-2",
    component: markRaw(AdvancedCatalogSettings),
    group: "Catalog",
    priority: 99,
  });
}
```

## Notes

- Like other services, items can be pre-registered before the service exists using `addSettingsMenuItem()` from the settings-menu-service module. They are flushed when `provideSettingsMenu()` runs.
- The service is a singleton per provide scope -- `provideSettingsMenu()` reuses an existing service if already provided by an ancestor.
- The service disposes automatically when the providing component's scope is destroyed.
- If `useSettingsMenu()` is called without a provided service, it throws an `InjectionError` with a descriptive message.

## Tip: Use markRaw for Component References

When passing component references to `register()`, wrap them with `markRaw()` to prevent Vue from making them reactive. Reactive component objects can cause performance issues and unexpected behavior:

```typescript
import { markRaw } from "vue";

// Good: prevents unnecessary reactivity
settingsMenu.register({
  component: markRaw(MySettingsPage),
  // ...
});

// Bad: Vue makes the component object deeply reactive
settingsMenu.register({
  component: MySettingsPage,
  // ...
});
```

## Related

- [useMenuService](../useMenuService/) -- similar pattern for the main navigation menu
- [useDashboard](../useDashboard/) -- similar service pattern for dashboard widgets
- `framework/core/services/settings-menu-service.ts` -- the underlying service implementation
- `framework/injection-keys.ts` -- `SettingsMenuServiceKey`
