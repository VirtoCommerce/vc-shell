# VcPagination

Page navigation control with first/previous/next/last buttons and a sliding window of page numbers. Adapts to mobile viewports automatically.

## When to Use

- Navigating paginated data lists or tables
- Any UI where content is split across multiple pages
- When NOT to use: for infinite scroll, handle loading programmatically instead

## Basic Usage

```vue
<template>
  <VcPagination
    :pages="totalPages"
    :current-page="currentPage"
    @item-click="onPageChange"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcPagination } from "@vc-shell/framework";

const totalPages = 15;
const currentPage = ref(1);

function onPageChange(page: number) {
  currentPage.value = page;
}
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `number` | `1` | Total number of pages |
| `currentPage` | `number` | `1` | Currently active page |
| `maxPages` | `number` | — | Override visible page button count (default: 3 on mobile, 5 on desktop) |
| `showFirstLast` | `boolean` | `true` | Show first/last page navigation buttons |
| `variant` | `"default" \| "minimal"` | `"default"` | Visual style variant |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `itemClick` | `number` | Emitted when a page is selected |

## Common Patterns

### With Data Table

```vue
<template>
  <VcDataTable :items="pagedItems" :columns="columns" />
  <VcPagination
    :pages="Math.ceil(totalItems / pageSize)"
    :current-page="currentPage"
    @item-click="loadPage"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const pageSize = 20;
const currentPage = ref(1);

async function loadPage(page: number) {
  currentPage.value = page;
  await fetchItems({ skip: (page - 1) * pageSize, take: pageSize });
}
</script>
```

### Custom Max Pages

```vue
<!-- Show only 3 page buttons regardless of viewport -->
<VcPagination :pages="100" :current-page="50" :max-pages="3" />
```

### Without First/Last Buttons

```vue
<VcPagination :pages="10" :current-page="5" :show-first-last="false" />
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--pagination-item-width` | `29px` | Button width |
| `--pagination-item-height` | `29px` | Button height |
| `--pagination-item-color` | `var(--neutrals-500)` | Default text color |
| `--pagination-item-color-hover` | `var(--primary-500)` | Hover text color |
| `--pagination-item-color-current` | `var(--additional-50)` | Current page text color |
| `--pagination-item-background-color-current` | `var(--primary-500)` | Current page background |
| `--pagination-item-color-disabled` | `var(--neutrals-400)` | Disabled button color |
| `--pagination-focus-ring-color` | `var(--primary-100)` | Focus ring color |

## Accessibility

- Wrapped in a `<nav>` element with `aria-label="Pagination"`
- Each page button has `aria-label="Page N"`
- Current page has `aria-current="page"`
- First/previous buttons are disabled (with `disabled` attribute) on page 1
- Next/last buttons are disabled on the last page
- Focus-visible ring on keyboard navigation

## Related Components

- [VcDataTable](../../organisms/vc-table/) — data table that often pairs with pagination
