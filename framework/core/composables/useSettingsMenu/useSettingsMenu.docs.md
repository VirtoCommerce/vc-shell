# useSettingsMenu

Accesses the settings menu service for registering and managing items in the application settings sidebar.

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

| Property | Type | Description |
|----------|------|-------------|
| `register` | `(options: RegisterSettingsMenuItemOptions) => string` | Register a settings menu item; returns the item ID |
| `unregister` | `(id: string) => void` | Remove a settings menu item by ID |
| `items` | `ComputedRef<ISettingsMenuItem[]>` | Reactive array of all registered settings menu items |

### Related Exports

| Export | Description |
|--------|-------------|
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

### Cleaning up on module unload

```typescript
import { useSettingsMenu } from "@vc-shell/framework";
import { onBeforeUnmount } from "vue";

const settingsMenu = useSettingsMenu();
const itemId = settingsMenu.register({ /* ... */ });

onBeforeUnmount(() => {
  settingsMenu.unregister(itemId);
});
```

## Notes

- Like other services, items can be pre-registered before the service exists using `addSettingsMenuItem()` from the settings-menu-service module. They are flushed when `provideSettingsMenu()` runs.
- The service is a singleton per provide scope -- `provideSettingsMenu()` reuses an existing service if already provided by an ancestor.
- The service disposes automatically when the providing component's scope is destroyed.

## Related

- [useMenuService](../useMenuService/) -- similar pattern for the main navigation menu
- [useDashboard](../useDashboard/) -- similar service pattern for dashboard widgets
