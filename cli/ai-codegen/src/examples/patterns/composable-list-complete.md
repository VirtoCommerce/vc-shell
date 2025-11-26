---
id: composable-list-complete
type: PATTERN
complexity: MODERATE
category: composable
tags: ["composable", "list", "useAsync", "pagination", "search"]
title: "List Composable Pattern"
description: "Complete pattern for list composable with useAsync, pagination, filters"
bladeContext: ["list"]
---

# List Composable Pattern

This document describes the authoritative pattern for list composables in VC-Shell.

## Authoritative Reference

**The single source of truth is:** `reference/composable-list.ts`

See [reference/composable-list.ts](../reference/composable-list.ts) for the complete, production-ready implementation.

## Purpose

Encapsulate all data fetching and state management logic for a list blade. The composable provides reactive state and methods that the blade component can use.

## Key Features
- useAsync hook for all async operations (with proper generic types!)
- Reactive state for items, loading, pagination
- API integration via useApiClient
- Search and sort functionality
- Pagination support
- Filter staged/applied architecture
- Auto-computed derived values

## ⚠️ CRITICAL: useAsync Generic Type Pattern

**ALWAYS use generic type, NEVER inline type annotation:**

```typescript
// ❌ WRONG - TypeScript thinks params is ALWAYS defined:
const { action: loadItems } = useAsync(async (params: ISearchQuery) => {
  // CRASH! params can be undefined at runtime!
});

// ✅ CORRECT - generic type + guard:
const { action: loadItems } = useAsync<ISearchQuery>(async (params) => {
  // params is typed as ISearchQuery | undefined - correct!
  const query = { ...defaultQuery, ...(params ?? {}) };
  // ...
});
```

## Complete Example

### useProductList.ts

```typescript
import { computed, ref, ComputedRef, Ref } from "vue";
import { useAsync, useApiClient } from "@vc-shell/framework";
import { ProductClient } from "../api_client/products.api";
import { IProduct, IProductSearchQuery, ProductSearchResult } from "../api_client/products.api";

export interface IUseProductList {
  items: ComputedRef<IProduct[]>;
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;  // ← ComputedRef, NOT Ref!
  searchQuery: Ref<IProductSearchQuery>;
  loadProducts: (query?: IProductSearchQuery) => Promise<void>;
  loading: ComputedRef<boolean>;
}

export function useProductList(options?: { pageSize?: number; sort?: string }): IUseProductList {
  const { getApiClient } = useApiClient(ProductClient);

  const pageSize = options?.pageSize ?? 20;
  const searchQuery = ref<IProductSearchQuery>({
    take: pageSize,
    sort: options?.sort,
  });
  const searchResult = ref<ProductSearchResult>();

  // ✅ CORRECT: useAsync with generic type
  // params is typed as IProductSearchQuery | undefined
  const { action: loadProducts, loading: loadingProducts } = useAsync<IProductSearchQuery>(async (params) => {
    // Use nullish coalescing for optional params (NOT || which fails on 0 or "")
    searchQuery.value = { ...searchQuery.value, ...(params ?? {}) };

    const apiClient = await getApiClient();
    searchResult.value = await apiClient.searchProducts(searchQuery.value);
  });

  // Computed properties - derived from searchResult
  const items = computed(() => searchResult.value?.results ?? []);
  const totalCount = computed(() => searchResult.value?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / pageSize));
  // currentPage MUST be ComputedRef<number> - NOT Ref<number>!
  const currentPage = computed(() => Math.floor((searchQuery.value.skip ?? 0) / pageSize) + 1);
  const loading = computed(() => loadingProducts.value);

  return {
    items,
    totalCount,
    pages,
    currentPage,
    searchQuery,
    loadProducts,
    loading,
  };
}
```

## Return Values

### State (ComputedRef for derived, Ref for mutable)
- `items: ComputedRef<T[]>` - Array of items (derived from searchResult)
- `loading: ComputedRef<boolean>` - Loading state (derived from useAsync)
- `totalCount: ComputedRef<number>` - Total count (derived from searchResult)
- `pages: ComputedRef<number>` - Total pages (computed from totalCount/pageSize)
- `currentPage: ComputedRef<number>` - Current page (computed from skip/pageSize)
- `searchQuery: Ref<ISearchQuery>` - Mutable search query state

### Methods
- `loadItems(query?)` - Load items with optional query params
- Query params are OPTIONAL - useAsync can call without params!

## Usage in Blade

```vue
<script setup lang="ts">
import { useProductList } from "../composables";

const {
  items,
  loading,
  totalCount,
  pages,
  currentPage,
  searchQuery,
  loadProducts,
} = useProductList();

onMounted(async () => {
  await loadProducts();  // No params - loads with defaults
});

// Pagination handler
async function onPaginationChange(page: number) {
  await loadProducts({ skip: (page - 1) * 20 });
}
</script>
```

## Patterns to Follow

1. **useAsync Generic Type**: ALWAYS `useAsync<Type>(async (p) => {})`, NEVER `useAsync(async (p: Type) => {})`
2. **Guard for undefined**: Use `params ?? {}` or explicit guard for required params
3. **ComputedRef for derived**: items, loading, totalCount, pages, currentPage - all derived
4. **Ref for mutable state**: searchQuery - can be modified
5. **useApiClient**: Use `useApiClient(Client)` for API access
6. **Naming**: `use{EntityName}List` composable, `load{EntityName}s` action
7. **Export interface**: `IUse{EntityName}List` for return type

