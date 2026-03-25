# VcPagination

Page navigation control with first/previous/next/last buttons and a sliding window of page numbers. Automatically adapts the number of visible page buttons for mobile viewports.

## When to Use

- Navigating paginated data sets in tables, lists, or grids
- Any UI where content is split across discrete pages and the user must move between them
- Pairing with server-side pagination that uses `skip`/`take` parameters

**Alternatives:**

- For infinite scroll or "load more" patterns, handle loading programmatically without pagination controls
- For stepping through a wizard, use a stepper component instead

## Quick Start

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

## Sliding Page Window

VcPagination displays a sliding window of page number buttons centered on the current page. The window size adapts automatically:

- **Desktop:** 5 visible page buttons (default)
- **Mobile:** 3 visible page buttons (default)

The component detects the viewport via the injected `IsMobileKey`. You can override the window size with the `maxPages` prop regardless of viewport.

```vue
<!-- Always show exactly 3 page buttons -->
<VcPagination :pages="100" :current-page="50" :max-pages="3" />

<!-- Always show 7 page buttons for a spacious layout -->
<VcPagination :pages="100" :current-page="50" :max-pages="7" />
```

When the current page is near the beginning or end of the range, the window shifts to avoid going out of bounds while maintaining the configured button count.

## First/Last Page Buttons

By default, first-page and last-page buttons (double chevrons) are shown. Hide them for a more compact control:

```vue
<VcPagination :pages="10" :current-page="5" :show-first-last="false" />
<!-- Only shows: < [4] [5] [6] > -->
```

## Pairing with VcDataTable

The most common use case is paginating a data table:

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
const totalItems = ref(0);
const currentPage = ref(1);
const pagedItems = ref([]);

async function loadPage(page: number) {
  currentPage.value = page;
  const result = await fetchItems({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  pagedItems.value = result.items;
  totalItems.value = result.totalCount;
}

// Load the first page on mount
loadPage(1);
</script>
```

## Controlled Component Pattern

VcPagination maintains an internal `localCurrentPage` ref that syncs with the `currentPage` prop. This means you can control it from the parent while still getting smooth UI updates:

```vue
<script setup lang="ts">
const currentPage = ref(1);

// You can programmatically change the page from outside
function goToFirstPage() {
  currentPage.value = 1;
}

function goToLastPage() {
  currentPage.value = totalPages;
}
</script>
```

## Recipe: Pagination with Page Size Selector

Combine VcPagination with a page-size dropdown for a complete pagination toolbar:

```vue
<template>
  <div class="tw-flex tw-items-center tw-justify-between tw-mt-4">
    <div class="tw-flex tw-items-center tw-gap-2">
      <span class="tw-text-sm">Rows per page:</span>
      <VcSelect
        v-model="pageSize"
        :options="[10, 20, 50, 100]"
        @update:model-value="onPageSizeChange"
      />
    </div>
    <VcPagination
      :pages="totalPages"
      :current-page="currentPage"
      @item-click="loadPage"
    />
    <span class="tw-text-sm tw-text-gray-500">
      {{ (currentPage - 1) * pageSize + 1 }}
      - {{ Math.min(currentPage * pageSize, totalItems) }}
      of {{ totalItems }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const pageSize = ref(20);
const totalItems = ref(350);
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

function onPageSizeChange() {
  currentPage.value = 1; // Reset to first page when page size changes
  loadPage(1);
}

async function loadPage(page: number) {
  currentPage.value = page;
  // Fetch data with skip/take...
}
</script>
```

## Recipe: URL-Synced Pagination

Keep the current page in the URL query string for shareable links:

```vue
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

const currentPage = computed(() => Number(route.query.page) || 1);

function onPageChange(page: number) {
  router.push({ query: { ...route.query, page: String(page) } });
  fetchItems(page);
}
</script>

<template>
  <VcPagination
    :pages="totalPages"
    :current-page="currentPage"
    @item-click="onPageChange"
  />
</template>
```

## Common Mistakes

**Passing `0` as the total pages count**

```
// Wrong -- results in no buttons rendered
<VcPagination :pages="0" :current-page="1" />
```

```
// Correct -- always ensure at least 1 page
<VcPagination :pages="Math.max(1, totalPages)" :current-page="1" />
```

**Forgetting to update currentPage in the handler**

```
// Wrong -- UI does not move to the clicked page
function onPageChange(page: number) {
  fetchItems(page); // forgot to update currentPage
}
```

```
// Correct -- update the ref so the component highlights the new page
function onPageChange(page: number) {
  currentPage.value = page;
  fetchItems(page);
}
```

**Setting currentPage higher than total pages**

```
// Wrong -- can happen after filtering reduces the dataset
currentPage.value = 5; // but totalPages is now 3
```

```
// Correct -- clamp after data changes
currentPage.value = Math.min(currentPage.value, totalPages.value);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pages` | `number` | `1` | Total number of pages |
| `currentPage` | `number` | `1` | Currently active page (1-based) |
| `maxPages` | `number` | -- | Override visible page button count. Default: 3 on mobile, 5 on desktop |
| `showFirstLast` | `boolean` | `true` | Show first/last page navigation buttons |
| `variant` | `"default" \| "minimal"` | `"default"` | Visual style variant |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `itemClick` | `number` | Emitted when any page button is clicked. Payload is the 1-based page number |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--pagination-item-width` | `29px` | Width of each page button |
| `--pagination-item-height` | `29px` | Height of each page button |
| `--pagination-item-color` | `var(--neutrals-500)` | Default text color |
| `--pagination-item-color-hover` | `var(--primary-500)` | Hover text color |
| `--pagination-item-color-current` | `var(--additional-50)` | Current page text color |
| `--pagination-item-background-color` | `var(--additional-50)` | Default background |
| `--pagination-item-background-color-hover` | `var(--primary-100)` | Hover background |
| `--pagination-item-background-color-current` | `var(--primary-500)` | Current page background |
| `--pagination-item-color-disabled` | `var(--neutrals-400)` | Disabled button text color |
| `--pagination-item-background-color-disabled` | `var(--neutrals-100)` | Disabled button background |
| `--pagination-item-border-color` | `var(--secondary-100)` | Default border color |
| `--pagination-focus-ring-color` | `var(--primary-100)` | Focus ring color for keyboard navigation |

## Accessibility

- Wrapped in a `<nav>` element with `aria-label="Pagination"`.
- Each page button has `aria-label="Page N"` for screen reader clarity.
- The current page button carries `aria-current="page"`.
- First/previous buttons are disabled (native `disabled` attribute) on page 1.
- Next/last buttons are disabled on the last page.
- All buttons show a `focus-visible` ring when navigated via keyboard.
- Navigation icons are marked `aria-hidden="true"` since the button already has an `aria-label`.

## Related Components

- [VcDataTable](../../organisms/vc-table) -- Data table that commonly pairs with pagination for large datasets
- [VcSelect](../vc-select/) -- Can be used alongside pagination for a "rows per page" selector
