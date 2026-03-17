# useBlade

Unified composable for blade navigation, identity, communication, guards, and error management. Works both inside and outside blade context with graceful degradation.

## When to Use

- When opening blades from any component (works everywhere)
- When accessing blade identity (id, param, options) inside a blade
- When communicating between parent and child blades
- When registering close guards or managing blade errors
- Do NOT use `closeSelf`, `callParent`, or identity properties outside a blade -- they throw at runtime

## Basic Usage

```typescript
import { useBlade } from "@vc-shell/framework";

const { openBlade, closeSelf, param } = useBlade();

// Open a child blade
await openBlade({ name: "OrderDetails", param: orderId });
```

## API

### Returns

#### Identity (blade context required)

| Property | Type | Description |
|----------|------|-------------|
| `id` | `ComputedRef<string>` | Current blade's unique ID |
| `param` | `ComputedRef<string \| undefined>` | Route parameter passed when opening the blade |
| `options` | `ComputedRef<Record<string, unknown> \| undefined>` | Additional options passed to the blade |
| `query` | `ComputedRef<Record<string, string> \| undefined>` | URL query parameters |
| `closable` | `ComputedRef<boolean>` | Whether the blade has a parent (can be closed) |
| `expanded` | `ComputedRef<boolean>` | Whether this blade is the active (rightmost) blade |
| `name` | `ComputedRef<string>` | Blade's registered name |

#### Navigation (works everywhere)

| Method | Type | Description |
|--------|------|-------------|
| `openBlade` | `(event: BladeOpenEvent & { isWorkspace? }) => Promise<void>` | Open a blade as child, or as workspace root if `isWorkspace: true` |

#### Actions (blade context required)

| Method | Type | Description |
|--------|------|-------------|
| `closeSelf` | `() => Promise<boolean>` | Close the current blade (respects close guards) |
| `closeChildren` | `() => Promise<void>` | Close all child blades |
| `replaceWith` | `(event: BladeOpenEvent) => Promise<void>` | Replace current blade with a different one |

#### Communication (blade context required)

| Method | Type | Description |
|--------|------|-------------|
| `callParent` | `<T>(method: string, args?) => Promise<T>` | Invoke a method exposed by the parent blade |
| `exposeToChildren` | `(methods: Record<string, Function>) => void` | Expose methods that child blades can call |
| `provideBladeData` | `(data: MaybeRef<Record<string, unknown>>) => void` | Provide reactive data to child components (deprecated -- use `defineBladeContext`) |

#### Guards and Errors (blade context required)

| Method | Type | Description |
|--------|------|-------------|
| `onBeforeClose` | `(guard: () => Promise<boolean>) => void` | Register a guard that can prevent blade closure |
| `setError` | `(error: unknown) => void` | Display an error banner on the blade |
| `clearError` | `() => void` | Clear the blade error banner |

## Common Patterns

### Parent blade exposing a reload method

```typescript
<script setup lang="ts">
const { exposeToChildren } = useBlade();

async function reload() {
  await loadData();
}

exposeToChildren({ reload });
</script>
```

### Child blade calling parent on save

```typescript
<script setup lang="ts">
const { callParent, closeSelf } = useBlade();

async function onSave() {
  await saveData();
  await callParent("reload");
  await closeSelf();
}
</script>
```

### Unsaved changes guard

```typescript
<script setup lang="ts">
const { onBeforeClose } = useBlade();

onBeforeClose(async () => {
  if (hasUnsavedChanges.value) {
    return await confirmDialog("Discard changes?");
  }
  return true;
});
</script>
```

### Opening from a dashboard widget (no blade context)

```typescript
<script setup lang="ts">
const { openBlade } = useBlade();

function onWidgetClick(orderId: string) {
  openBlade({ name: "OrderDetails", param: orderId });
}
</script>
```

## Related

- [useBladeRegistry](../useBladeRegistry/) -- look up registered blade components
- [VcBlade](../../../ui/components/organisms/vc-blade/) -- blade UI shell component
