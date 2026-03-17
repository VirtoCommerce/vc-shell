# useBreadcrumbs

Manages a reactive breadcrumb trail for blade navigation. Supports push, remove, and automatic trail trimming on click.

## When to Use

- When building multi-level blade navigation with a visible breadcrumb trail
- When blades need to register their position in the navigation hierarchy
- Do NOT use for URL-based routing breadcrumbs -- this is for blade stack navigation only

## Basic Usage

```typescript
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();

push({
  id: "orders",
  title: "Orders",
  clickHandler: (id) => navigateToOrders(),
});
```

## API

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `breadcrumbs` | `ComputedRef<Breadcrumbs[]>` | Reactive array of current breadcrumb items |
| `push` | `(breadcrumb: Breadcrumbs) => void` | Add a breadcrumb (deduplicates by `id`, updates in place if exists) |
| `remove` | `(ids: string[]) => void` | Remove breadcrumbs by their IDs |

### Breadcrumbs Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the breadcrumb |
| `title` | `MaybeRef<string \| undefined>` | Yes | Display text (can be reactive) |
| `icon` | `string?` | No | Icon identifier |
| `clickHandler` | `(id: string) => void \| boolean \| Promise<void \| boolean>` | No | Click callback; return `false` to prevent trail trimming |

## Common Patterns

### Registering breadcrumbs in a blade

```typescript
<script setup lang="ts">
import { useBreadcrumbs, useBlade } from "@vc-shell/framework";

const { push } = useBreadcrumbs();
const { openBlade, param } = useBlade();

push({
  id: `order-${param.value}`,
  title: computed(() => `Order #${orderNumber.value}`),
  clickHandler: () => {
    openBlade({ name: "OrderDetails", param: param.value });
  },
});
</script>
```

### Cleaning up on blade close

```typescript
<script setup lang="ts">
import { useBreadcrumbs } from "@vc-shell/framework";
import { onBeforeUnmount } from "vue";

const { push, remove } = useBreadcrumbs();
const crumbId = "my-blade";

push({ id: crumbId, title: "My Blade" });

onBeforeUnmount(() => {
  remove([crumbId]);
});
</script>
```

## Notes

- When a breadcrumb's `clickHandler` succeeds (returns `void` or `true`), the trail is automatically trimmed to that breadcrumb -- all items after it are removed.
- If `clickHandler` returns `false`, trimming is skipped, allowing custom navigation logic.
- Pushing a breadcrumb with an existing `id` updates it in place rather than adding a duplicate.

## Related

- [useBlade](../useBlade/) -- blade navigation composable
- [VcBlade](../../../ui/components/organisms/vc-blade/) -- blade component that displays breadcrumbs
