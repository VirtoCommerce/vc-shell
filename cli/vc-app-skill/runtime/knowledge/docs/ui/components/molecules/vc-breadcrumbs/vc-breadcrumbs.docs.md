# VcBreadcrumbs

Navigation breadcrumb trail that displays the user's location within a hierarchy and adaptively collapses middle items into a dropdown when horizontal space is limited.

## When to Use

- Showing the user's current position in a blade navigation hierarchy
- Providing quick navigation back to parent views or previously visited pages
- Displaying a multi-level path in a constrained header area

**Alternatives:**

- For tab-style navigation between sibling views, use a tab bar or menu instead
- For a simple "back" action without a full trail, use a single back button

## Quick Start

```vue
<template>
  <VcBreadcrumbs :items="breadcrumbItems" />
</template>

<script setup lang="ts">
import { VcBreadcrumbs } from "@vc-shell/framework";

const breadcrumbItems = [
  { id: "home", title: "Home", icon: "lucide-house" },
  { id: "products", title: "Products" },
  { id: "detail", title: "Wireless Headphones" },
];
</script>
```

## Breadcrumb Item Interface

Every item in the `items` array must conform to the `Breadcrumbs` interface:

```ts
interface Breadcrumbs {
  id: string;
  title: MaybeRef<string | undefined>;
  icon?: string;
  clickHandler?: (id: string) => void | boolean | Promise<void | boolean>;
}
```

- `id` -- Unique identifier for deduplication and click callbacks.
- `title` -- Display text. Accepts a plain string or a Vue `Ref<string>` for reactive labels.
- `icon` -- Optional Lucide icon name shown before the title (e.g., `"lucide-house"`).
- `clickHandler` -- Called when the user clicks the item. Return `true` (or void) to trim the trail to this point; return `false` to keep the trail unchanged.

## Adaptive Overflow

VcBreadcrumbs monitors the container width with `useAdaptiveItems` and automatically collapses middle items into a dropdown when they do not fit. The first and last items stay visible; overflow items appear behind a "more" button (vertical ellipsis).

The collapse algorithm uses a reverse strategy -- it hides items starting from the left (after the first) so the current page (last item) always remains visible.

```vue
<!-- In a narrow container, middle items collapse automatically -->
<div style="max-width: 400px;">
  <VcBreadcrumbs :items="deepHierarchy" separated />
</div>
```

## Separated Style

Enable slash separators between items with the `separated` prop:

```vue
<VcBreadcrumbs :items="items" separated />
<!-- Renders: Home / Products / Electronics -->
```

When `separated` is `false` (default), items are spaced with a gap but have no visible separator character.

## Collapsed Mode

Force all items into the dropdown by setting `collapsed` to `true`. This is useful when the breadcrumb area must be minimized but remain accessible:

```vue
<VcBreadcrumbs :items="items" collapsed />
<!-- Only the dropdown trigger is visible; click to see all items -->
```

## Light Variant

Use the `"light"` variant for a subtler visual weight, for example inside a secondary toolbar:

```vue
<VcBreadcrumbs :items="items" variant="light" />
```

## Click Handlers for Navigation

Attach a `clickHandler` to each item to navigate when the user clicks:

```vue
<script setup lang="ts">
const items = [
  {
    id: "home",
    title: "Home",
    icon: "lucide-house",
    clickHandler: () => router.push("/"),
  },
  {
    id: "products",
    title: "Products",
    clickHandler: () => router.push("/products"),
  },
  {
    id: "detail",
    title: "Wireless Headphones",
    // No clickHandler on the current page
  },
];
</script>
```

## Using the useBreadcrumbs Composable

For applications built on the VC-Shell framework, manage breadcrumb state reactively with `useBreadcrumbs()`:

```vue
<template>
  <VcBreadcrumbs :items="breadcrumbs" separated />
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();

// Add a breadcrumb as the user navigates deeper
push({
  id: "products",
  title: "Products",
  clickHandler: (id) => {
    router.push("/products");
    return true; // Returning true trims the trail to this item
  },
});

// Programmatically remove specific breadcrumbs
remove(["products", "categories"]);
</script>
```

**Composable API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `breadcrumbs` | `ComputedRef<Breadcrumbs[]>` | Reactive array of current items |
| `push` | `(item: Breadcrumbs) => void` | Add an item (deduplicates by `id`) |
| `remove` | `(ids: string[]) => void` | Remove items by their IDs |

> **Note:** When `push` is called with an `id` that already exists, the existing entry is updated in place rather than duplicated.

## Custom Trigger Button

Replace the default overflow button with any element using the `trigger` slot:

```vue
<VcBreadcrumbs :items="items">
  <template #trigger="{ click, isActive }">
    <VcButton text @click="click">
      {{ isActive ? 'Close' : 'More pages' }}
    </VcButton>
  </template>
</VcBreadcrumbs>
```

## Recipe: Blade Navigation Breadcrumbs

In a typical VC-Shell blade hierarchy, push a breadcrumb each time a child blade opens and rely on the click handler to navigate back:

```vue
<script setup lang="ts">
import { useBreadcrumbs, useBladeContext } from "@vc-shell/framework";

const { breadcrumbs, push } = useBreadcrumbs();
const { openBlade, closeSelf } = useBladeContext();

function openProductDetail(product: Product) {
  push({
    id: "product-detail",
    title: product.name,
    clickHandler: () => {
      closeSelf();
      return true;
    },
  });
  openBlade({ component: ProductDetailBlade, props: { product } });
}
</script>
```

## Common Mistakes

**Forgetting a unique `id` on each item**

```
// Wrong -- duplicate IDs cause the composable to overwrite entries
push({ id: "page", title: "Products" });
push({ id: "page", title: "Electronics" }); // Overwrites "Products"
```

```
// Correct -- use unique IDs
push({ id: "products", title: "Products" });
push({ id: "electronics", title: "Electronics" });
```

**Returning `false` from clickHandler and expecting the trail to shorten**

```
// Wrong -- returning false keeps the trail unchanged
clickHandler: () => { navigate(); return false; }
```

```
// Correct -- return true (or void) to trim the trail
clickHandler: () => { navigate(); return true; }
```

**Using a reactive title without MaybeRef**

```
// Wrong -- loses reactivity
{ id: "x", title: someRef.value }
```

```
// Correct -- pass the ref directly
{ id: "x", title: someRef }
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Breadcrumbs[]` | `[]` | Array of breadcrumb items to display |
| `variant` | `"default" \| "light"` | `"default"` | Visual style variant |
| `separated` | `boolean` | `false` | Show `/` separators between items |
| `collapsed` | `boolean` | `false` | Force all items into the dropdown |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `trigger` | `{ click: () => void, isActive: boolean }` | Custom dropdown trigger button replacing the default ellipsis icon |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--separator-color` | `var(--neutrals-400)` | Color of the `/` separator character |
| `--breadcrumbs-item-border-color` | `var(--secondary-300)` | Border color of breadcrumb items |
| `--breadcrumbs-expand-button-color` | `var(--neutrals-500)` | Color of the overflow "more" button |
| `--breadcrumbs-expand-button-color-hover` | `var(--neutrals-600)` | Hover color of the overflow button |

## Accessibility

- The component renders inside a `<nav>` element with `aria-label="Breadcrumb"`.
- Items are structured as an `<ol>` list for semantic ordering.
- The last visible item carries `aria-current="page"` to indicate the current location.
- Separator characters are marked `aria-hidden="true"` so screen readers skip them.
- When items overflow, the dropdown is accessible via the trigger button with standard keyboard interaction (Enter/Space to open).

## Related Components

- [VcDropdown](../vc-dropdown/) -- Used internally to render the overflow menu
- [VcBreadcrumbsItem](./_internal/vc-breadcrumbs-item/) -- Internal sub-component for individual breadcrumb rendering
- [VcButton](../../atoms/vc-button/) -- Can be used inside the `trigger` slot for a styled overflow button
