# 35. defineOptions() → defineBlade()

## What Changed

Blade-specific metadata (`url`, `isWorkspace`, `permissions`, `menuItem`, `routable`) has been moved out of the Vue `defineOptions()` macro into a dedicated `defineBlade()` compile-time macro.

The `notifyType` property is removed entirely — notification templates are now registered via the notification system, not blade options.

## Why

`defineOptions()` is a Vue compiler macro intended for standard component options (`name`, `inheritAttrs`). Mixing in blade-navigation metadata (routing, permissions, menu) created a coupling between the Vue component system and the vc-shell blade framework. `defineBlade()` separates these concerns:

- **Vue** gets only `name` (via auto-generated `defineOptions`)
- **Blade framework** gets routing/menu/permissions (via a compile-time global registry)

## How It Works

`defineBlade()` is a global macro — no import needed. At build time, the `viteBladePlugin` Vite plugin transforms it into two pieces:

1. `defineOptions({ name: "..." })` inside `<script setup>` (Vue component name)
2. A separate `<script>` block that calls `__registerBladeConfig(name, config)` at module evaluation time, before any component is mounted

This ensures blade configs are available when modules register their pages during `app.use()`.

## Migration

### Before

```vue
<script setup lang="ts">
defineOptions({
  name: "Orders",
  url: "/orders",
  isWorkspace: true,
  notifyType: "OrderChangedDomainEvent",
  permissions: ["seller:orders:view"],
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-shopping-cart",
    priority: 1,
  },
});
</script>
```

### After

```vue
<script setup lang="ts">
defineBlade({
  name: "Orders",
  url: "/orders",
  isWorkspace: true,
  permissions: ["seller:orders:view"],
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-shopping-cart",
    priority: 1,
  },
});
</script>
```

Key differences:
- `defineOptions` → `defineBlade`
- `notifyType` removed (handle via `useBladeNotifications()` instead)
- No import required — `defineBlade` is a global macro declared in `@vc-shell/framework/globals`

### Child blades (no routing metadata)

Blades that don't act as workspaces and have no URL still benefit from `defineBlade`:

```vue
<!-- Before -->
<script setup lang="ts">
defineOptions({ name: "OrderDetails", url: "/order" });
</script>

<!-- After -->
<script setup lang="ts">
defineBlade({ name: "OrderDetails", url: "/order" });
</script>
```

### Non-blade components

Components that use `defineOptions` **without** blade fields (`url`, `isWorkspace`, `permissions`, `menuItem`, `routable`) are **not affected** — keep using `defineOptions` as usual.

## Automated Migration

The `@vc-shell/migrate` CLI includes a codemod for this change:

```bash
# Preview changes (dry run)
npx @vc-shell/migrate --to 2.0.0 --transform define-options-to-blade --dry-run

# Apply changes
npx @vc-shell/migrate --to 2.0.0 --transform define-options-to-blade
```

The codemod:
- Finds `defineOptions()` calls containing blade fields (`url`, `isWorkspace`, `menuItem`, `routable`, `permissions`)
- Renames `defineOptions` → `defineBlade`
- Removes `notifyType` property
- Skips components without blade fields (notification templates, regular components)

## Build-Time Warning

If you forget to migrate, the Vite plugin emits a warning during development:

```
[vc-shell:define-blade] src/modules/orders/pages/list.vue uses defineOptions() with blade fields. Migrate to defineBlade().
```

The app will still build and work — `defineOptions` with blade fields continues to function — but blade metadata won't be available in the global registry until you migrate.

## defineBlade API Reference

```ts
defineBlade({
  name: string;                        // Required — Vue component name
  url?: `/${string}`;                  // URL segment (e.g. "/orders")
  isWorkspace?: boolean;               // true = top-level workspace blade
  routable?: boolean;                  // false = skip URL routing (default: true when url is set)
  permissions?: string | string[];     // Required permission(s) to access the blade
  menuItem?: {                         // Sidebar menu entry (workspace blades only)
    title: string;                     //   i18n key for display text
    icon: string;                      //   Icon name (e.g. "lucide-shopping-cart")
    priority: number;                  //   Sort order in sidebar
    groupConfig?: {                    //   Optional menu group
      id: string;
      title?: string;
      icon?: string;
      priority?: number;
      permissions?: string | string[];
      badge?: MenuItemBadgeConfig;
    };
    permissions?: string | string[];   //   Menu-item level permissions
    badge?: MenuItemBadgeConfig;       //   Badge config (counter, dot, etc.)
  };
});
```

## How to Find

```bash
# Find remaining defineOptions with blade fields (needs migration)
grep -rn 'defineOptions' src/ --include="*.vue" | grep -E 'url:|isWorkspace|permissions|menuItem'

# Find already-migrated defineBlade usage
grep -rn 'defineBlade' src/ --include="*.vue"
```
