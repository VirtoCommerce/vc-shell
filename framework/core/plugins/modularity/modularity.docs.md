# Modularity Plugin

The core plugin system for vc-shell. Defines how feature modules are packaged, registered, and integrated into the application at runtime.

## Overview

Every feature in a vc-shell application is delivered as a **module** -- a Vue plugin created with `defineAppModule()`. When installed, a module registers its blades in the `BladeRegistry`, merges locale messages into vue-i18n, wires up menu items, and configures notification types. This is the primary integration point between feature code and the framework.

Modules are loaded dynamically at startup via `useDynamicModules()` (see `core/plugins/modularity/`), which resolves version compatibility and installs each module plugin into the Vue app.

## Installation / Registration

```typescript
// my-module/index.ts
import { defineAppModule } from "@vc-shell/framework";
import OrdersList from "./pages/OrdersList.vue";
import OrderDetails from "./pages/OrderDetails.vue";
import en from "./locales/en";
import de from "./locales/de";

export default defineAppModule({
  blades: { OrdersList, OrderDetails },
  locales: { en, de },
  notifications: {
    "OrderChanged": {
      toast: { mode: "auto" },
    },
  },
});
```

The host application installs modules via `app.use(myModule)`, typically orchestrated by the dynamic module loader.

## API

### `defineAppModule(options): Plugin`

Creates a Vue plugin that registers all module assets during `install()`.

#### `DefineAppModuleOptions`

| Option | Type | Description |
|--------|------|-------------|
| `blades` | `Record<string, BladeInstanceConstructor>` | Blade components to register in BladeRegistry |
| `locales` | `Record<string, object>` | Locale message objects keyed by language code (e.g. `{ en, de }`) |
| `notifications` | `ModuleNotificationsConfig` | Notification type configurations (new API) |
| `notificationTemplates` | `Record<string, Component>` | **Deprecated.** Legacy notification templates with `notifyType` |

### `createAppModule(pages, locales?, notificationTemplates?, components?): Plugin`

**Deprecated.** Backward-compatible wrapper that delegates to `defineAppModule()`.

```typescript
// Migration:
// Before:
export default createAppModule(pages, locales);
// After:
export default defineAppModule({ blades: pages, locales });
```

## Registration Lifecycle

When `app.use(module)` is called, `defineAppModule` runs the following steps in order:

1. **Blade registration** -- Each entry in `blades` is registered in the `BladeRegistry` (injected via `BladeRegistryKey`). The blade's `name`, `url`, `isWorkspace`, `routable`, and `permissions` static properties are read from the component.

2. **Menu item registration** -- If a blade has both a `url` and a `menuItem` static property, a sidebar menu entry is created via `addMenuItem()`. The menu item inherits the blade's permissions.

3. **Notification registration (new API)** -- Each entry in `notifications` is registered in the `NotificationStore` via `store.registerType(type, config)`.

4. **Notification registration (legacy)** -- If `notifications` is not provided but `notificationTemplates` is, legacy templates with `notifyType` are registered. Blades with `notifyType` get automatic toast subscriptions (deprecated -- migrate to `useBladeNotifications()`).

5. **Locale merge** -- Each entry in `locales` is merged into the global vue-i18n instance via `i18n.global.mergeLocaleMessage(key, message)`.

## Usage

### Blade Static Properties

Blades registered via `defineAppModule` can declare static properties that control routing, permissions, and menu placement:

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "OrdersList" });

// Static properties (read by defineAppModule)
defineOptions({
  url: "/orders",
  isWorkspace: true,
  routable: true,
  permissions: ["order:read"],
  menuItem: {
    title: "Orders",
    icon: "fas fa-shopping-cart",
    priority: 10,
  },
});
</script>
```

### Notification Types (New API)

```typescript
export default defineAppModule({
  blades: { OrdersList },
  notifications: {
    "OrderChangedEvent": {
      toast: { mode: "auto" },
      // Optional: custom template component
      // template: OrderNotificationTemplate,
    },
    "OrderCreatedEvent": {
      toast: { mode: "auto" },
    },
  },
});
```

### Minimal Module (Blades Only)

```typescript
import { defineAppModule } from "@vc-shell/framework";
import DashboardWidget from "./components/DashboardWidget.vue";

export default defineAppModule({
  blades: { DashboardWidget },
});
```

### Module with Full Configuration

```typescript
import { defineAppModule } from "@vc-shell/framework";
import OrdersList from "./pages/OrdersList.vue";
import OrderDetails from "./pages/OrderDetails.vue";
import en from "./locales/en";
import de from "./locales/de";

export default defineAppModule({
  blades: { OrdersList, OrderDetails },
  locales: { en, de },
  notifications: {
    "OrderChangedEvent": { toast: { mode: "auto" } },
  },
});
```

## Related

- `framework/core/plugins/i18n/` -- i18n singleton that receives merged locale messages
- `framework/core/composables/useBladeRegistry/` -- BladeRegistry where blades are stored
- `framework/core/composables/useMenuService/` -- `addMenuItem()` for sidebar navigation
- `framework/core/notifications/` -- NotificationStore for notification type registration
- `framework/shared/components/blade-navigation/types.ts` -- `BladeInstanceConstructor` type definition
