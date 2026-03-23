# useBreadcrumbs

Manages a reactive breadcrumb trail for blade navigation. Supports push, remove, and automatic trail trimming on click.

## Overview

In the vc-shell blade navigation paradigm, users often drill down through multiple levels: a list blade opens a detail blade, which opens a related entity blade, and so on. The breadcrumb trail provides a visual path showing where the user is in this hierarchy and allows jumping back to any previous level.

The `useBreadcrumbs()` composable manages this trail as a reactive array. Each blade pushes its breadcrumb on mount and optionally removes it on unmount. When a user clicks a breadcrumb, the trail is automatically trimmed to that point -- all items after the clicked breadcrumb are removed.

The composable uses `shallowRef` internally for performance, creating new array references only when the trail changes. Breadcrumbs with the same `id` are deduplicated: pushing a breadcrumb with an existing ID updates it in place rather than creating a duplicate.

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
import { computed } from "vue";

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

### Multi-level breadcrumb trail

```typescript
<script setup lang="ts">
import { useBreadcrumbs, useBladeContext } from "@vc-shell/framework";

const { push } = useBreadcrumbs();
const { openBlade } = useBladeContext();

// Level 1: Catalog
push({
  id: "catalog",
  title: "Catalog",
  icon: "lucide-package",
  clickHandler: () => openBlade({ name: "CatalogList" }),
});

// Level 2: Category
push({
  id: `category-${categoryId.value}`,
  title: computed(() => category.value?.name ?? "Category"),
  clickHandler: () => openBlade({ name: "CategoryDetails", param: categoryId.value }),
});

// Level 3: Product (current blade -- no clickHandler needed)
push({
  id: `product-${productId.value}`,
  title: computed(() => product.value?.name ?? "Product"),
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

### Preventing automatic trail trimming

If your breadcrumb click handler performs custom navigation logic (e.g., confirming unsaved changes before navigating), return `false` to prevent the composable from automatically trimming the trail:

```typescript
push({
  id: "order-edit",
  title: "Edit Order",
  clickHandler: async (id) => {
    if (hasUnsavedChanges.value) {
      const confirmed = await confirmDialog("Discard unsaved changes?");
      if (!confirmed) {
        return false; // Prevent trail trimming, stay on current blade
      }
    }
    openBlade({ name: "OrderDetails", param: orderId.value });
    // Return void (or true) to allow trimming
  },
});
```

## Notes

- When a breadcrumb's `clickHandler` succeeds (returns `void` or `true`), the trail is automatically trimmed to that breadcrumb -- all items after it are removed.
- If `clickHandler` returns `false`, trimming is skipped, allowing custom navigation logic.
- Pushing a breadcrumb with an existing `id` updates it in place rather than adding a duplicate.
- If the `clickHandler` throws an error, it is caught and logged via the framework logger. The trail is not modified.
- The `title` property accepts `MaybeRef<string>`, meaning you can pass either a plain string or a `computed`/`ref` for dynamic titles that update reactively.

## Tip: Use Blade Param in Breadcrumb ID

Include the blade's param (e.g., entity ID) in the breadcrumb `id` to ensure uniqueness when the same blade type can appear at different positions in the trail:

```typescript
// Good: unique per entity
push({ id: `order-${orderId.value}`, title: "Order #123" });

// Bad: same ID for all order blades -- will overwrite each other
push({ id: "order-details", title: "Order #123" });
```

## Common Mistake

Do not forget to clean up breadcrumbs when a blade is closed. Without cleanup, stale breadcrumbs accumulate in the trail and point to blades that no longer exist:

```typescript
// Always pair push with remove on unmount
const crumbId = `product-${productId.value}`;
push({ id: crumbId, title: "Product" });
onBeforeUnmount(() => remove([crumbId]));
```

## Related

- [useBlade](../useBlade/) -- blade navigation composable
- [VcBlade](../../../ui/components/organisms/vc-blade/) -- blade component that displays breadcrumbs
- `framework/ui/types/form-field.ts` -- `Breadcrumbs` interface definition
