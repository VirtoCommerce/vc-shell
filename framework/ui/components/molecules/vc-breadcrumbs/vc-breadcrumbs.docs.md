# VcBreadcrumbs

Navigation breadcrumb trail that adaptively collapses items into a dropdown when horizontal space is limited.

## When to Use

- Showing the user's location in a blade navigation hierarchy
- Providing quick navigation back to parent views
- When NOT to use: for tab-style navigation, use tabs or a menu instead

## Basic Usage

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

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Breadcrumbs[]` | `[]` | Array of breadcrumb items |
| `variant` | `"default" \| "light"` | `"default"` | Visual style variant |
| `separated` | `boolean` | `false` | Show `/` separators between items |
| `collapsed` | `boolean` | `false` | Force all items into the dropdown |

## Breadcrumbs Item Interface

```ts
interface Breadcrumbs {
  id: string;
  title: MaybeRef<string | undefined>;
  icon?: string;
  clickHandler?: (id: string) => void | boolean | Promise<void | boolean>;
}
```

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `{ click, isActive }` | Custom dropdown trigger button |

## Common Patterns

### With Click Handlers

```vue
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
  },
];
```

### With useBreadcrumbs Composable

```vue
<template>
  <VcBreadcrumbs :items="breadcrumbs" separated />
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@vc-shell/framework";

const { breadcrumbs, push, remove } = useBreadcrumbs();

// Add breadcrumbs as the user navigates
push({
  id: "products",
  title: "Products",
  clickHandler: (id) => {
    router.push("/products");
    return true; // Returning true trims breadcrumbs to this point
  },
});
</script>
```

### Separated Style

```vue
<VcBreadcrumbs :items="items" separated />
<!-- Renders: Home / Products / Electronics -->
```

### Custom Trigger Button

```vue
<VcBreadcrumbs :items="items">
  <template #trigger="{ click, isActive }">
    <VcButton text @click="click">
      {{ isActive ? 'Close' : 'More' }}
    </VcButton>
  </template>
</VcBreadcrumbs>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--separator-color` | `var(--neutrals-400)` | Separator `/` color |
| `--breadcrumbs-item-border-color` | `var(--secondary-300)` | Item border color |
| `--breadcrumbs-expand-button-color` | `var(--neutrals-500)` | More button color |
| `--breadcrumbs-expand-button-color-hover` | `var(--neutrals-600)` | More button hover color |

## Accessibility

- Wrapped in a `<nav>` with `aria-label="Breadcrumb"`
- Items are inside an `<ol>` list for semantic structure
- The last item has `aria-current="page"`
- Adaptive overflow collapses middle items into a dropdown, keeping first and last visible

## Related Components

- [VcDropdown](../vc-dropdown/) — used internally for the overflow dropdown
- [VcBreadcrumbsItem](./_internal/vc-breadcrumbs-item/) — individual breadcrumb item (internal)
