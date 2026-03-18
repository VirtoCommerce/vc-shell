# useBladeRegistry

Provides read-only access to the blade registry -- a central map of all registered blade components, their routes, and metadata.

## Overview

The blade registry is the framework's central directory of all blade components available in the application. When a module is loaded, its blades are registered in this map along with their routes, permissions, and workspace flags. The registry enables runtime blade lookup by name, reverse lookup by URL route, and component resolution for dynamic blade navigation.

The `useBladeRegistry()` composable provides the read-only consumer API. Blade registration happens automatically during module setup via `createBladeRegistry()` -- module developers do not register blades manually.

Internally, the registry maintains a reactive `Map<string, IBladeRegistrationData>` and a reverse index from URL route segments to blade names. The reverse index enables O(1) route-to-blade lookups for deep linking and URL-based navigation.

## When to Use

- When you need to look up a blade component by name at runtime
- When resolving URL routes to blade components (deep linking)
- When inspecting which blades are registered (debugging, admin tools)
- Do NOT use for registering blades -- that happens automatically via module setup

## Basic Usage

```typescript
import { useBladeRegistry } from "@vc-shell/framework";

const { getBlade, getBladeComponent } = useBladeRegistry();

const data = getBlade("OrderDetails");
const component = getBladeComponent("OrderDetails");
```

## API

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `registeredBladesMap` | `ComputedRef<ReadonlyMap<string, IBladeRegistrationData>>` | Reactive readonly map of all registered blades |
| `getBlade` | `(name: string) => IBladeRegistrationData \| undefined` | Get registration data (component, route, permissions) by blade name |
| `getBladeComponent` | `(name: string) => BladeInstanceConstructor \| undefined` | Get the Vue component for a blade name (falls back to global components) |
| `getBladeByRoute` | `(route: string) => { name, data } \| undefined` | Reverse lookup: find a blade by its URL route segment (O(1)) |

### IBladeRegistrationData

| Property | Type | Description |
|----------|------|-------------|
| `component` | `BladeInstanceConstructor` | The Vue component for the blade |
| `route` | `string?` | URL route segment (e.g. `"orders"`) |
| `isWorkspace` | `boolean?` | Whether this blade opens as a workspace root |
| `routable` | `boolean?` | Whether this blade supports URL-based navigation |
| `permissions` | `string \| string[]?` | Required permissions to access this blade |

## Common Patterns

### Conditional navigation based on registration

```typescript
<script setup lang="ts">
import { useBladeRegistry, useBlade } from "@vc-shell/framework";

const { getBlade } = useBladeRegistry();
const { openBlade } = useBlade();

function navigateTo(bladeName: string, param?: string) {
  const registration = getBlade(bladeName);
  if (!registration) {
    console.warn(`Blade "${bladeName}" is not registered`);
    return;
  }
  openBlade({ name: bladeName, param });
}
</script>
```

### Deep link resolution

```typescript
import { useBladeRegistry } from "@vc-shell/framework";

const { getBladeByRoute } = useBladeRegistry();

// Resolve a URL segment to a blade
function resolveDeepLink(routeSegment: string) {
  const result = getBladeByRoute(routeSegment);
  if (result) {
    console.log(`Route "${routeSegment}" maps to blade "${result.name}"`);
    console.log(`Permissions required: ${result.data.permissions}`);
    return result;
  }
  console.warn(`No blade registered for route "${routeSegment}"`);
  return undefined;
}

// Works with or without leading slash
resolveDeepLink("orders");   // { name: "OrdersList", data: { ... } }
resolveDeepLink("/orders");  // Same result
```

### Listing all registered blades

```typescript
<script setup lang="ts">
import { useBladeRegistry } from "@vc-shell/framework";

const { registeredBladesMap } = useBladeRegistry();

const bladeNames = computed(() => [...registeredBladesMap.value.keys()]);
const workspaceBlades = computed(() =>
  [...registeredBladesMap.value.entries()]
    .filter(([, data]) => data.isWorkspace)
    .map(([name]) => name),
);
</script>
```

### Checking permissions before navigation

```typescript
import { useBladeRegistry, usePermissions } from "@vc-shell/framework";

const { getBlade } = useBladeRegistry();
const { hasAccess } = usePermissions();

function canAccessBlade(bladeName: string): boolean {
  const registration = getBlade(bladeName);
  if (!registration) return false;
  return hasAccess(registration.permissions);
}
```

## Notes

- The composable must be called after `createBladeRegistry()` has provided the registry via `BladeRegistryKey`. Calling it too early (e.g., outside a setup function or before app bootstrap) throws an error.
- `getBladeComponent()` falls back to Vue's global component registry if the blade is not found in the framework registry. This supports legacy components registered via `app.component()`.
- The `registeredBladesMap` is a `ComputedRef` wrapping a `ReadonlyMap`, so it updates reactively when new modules are loaded.

## Tip: Use getBlade for Validation

Before opening a blade programmatically, always check that it exists in the registry. This catches typos and missing module dependencies at runtime with a clear error instead of a cryptic render failure:

```typescript
const registration = getBlade("OderDetails"); // Typo: "Oder" instead of "Order"
if (!registration) {
  notification.error('Blade "OderDetails" not found. Is the module loaded?');
  return;
}
```

## Related

- [useBlade](../useBlade/) -- opens and manages blades by name
- [Dynamic Module Loading](../../plugins/modularity/) -- registers blades during module initialization
- `framework/injection-keys.ts` -- `BladeRegistryKey` (defined in the composable file, not in injection-keys.ts)
