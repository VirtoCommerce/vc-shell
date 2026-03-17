# useBladeRegistry

Provides read-only access to the blade registry -- a central map of all registered blade components, their routes, and metadata.

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

### Listing all registered blades

```typescript
<script setup lang="ts">
import { useBladeRegistry } from "@vc-shell/framework";

const { registeredBladesMap } = useBladeRegistry();

const bladeNames = computed(() => [...registeredBladesMap.value.keys()]);
</script>
```

## Related

- [useBlade](../useBlade/) -- opens and manages blades by name
- [Dynamic Module Loading](../../plugins/modularity/) -- registers blades during module initialization
