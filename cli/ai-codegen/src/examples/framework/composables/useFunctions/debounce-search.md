---
id: useFunctions-debounce-search
type: FRAMEWORK_API
category: composable
tags: [composable, debounce, search, performance, input]
complexity: SIMPLE
title: "useFunctions - Debounce Search"
description: "Implementing delayed search with debounce to reduce API calls"
---

# useFunctions - Debounce Search

The `debounce` function from `useFunctions` delays function execution until after a specified time has elapsed since the last call. This is perfect for search inputs where you want to wait for the user to stop typing before making an API request.

## Overview

**Key Benefits:**
- Reduces API calls by waiting for user to stop typing
- Improves performance and reduces server load
- Better user experience with fewer loading states
- Simple implementation with framework utilities

**Common Use Cases:**
- Search inputs with live filtering
- Auto-save functionality
- Window resize handlers
- Form validation with API checks

## Basic Usage

```typescript
import { useFunctions } from '@vc-shell/framework';

const { debounce } = useFunctions();

// Create debounced search function (1000ms delay)
const onSearch = debounce(async (keyword: string) => {
  await searchAPI({ keyword });
}, 1000);
```

## Complete Example - List Blade with Search

Based on real production code from vendor-portal offers-list.vue:

```vue
<template>
  <VcBlade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    :toolbar-items="bladeToolbar"
    width="70%"
  >
    <VcTable
      :items="items"
      :columns="columns"
      :search-value="searchValue"
      :loading="loading"
      @search:change="onSearchList"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFunctions } from '@vc-shell/framework';
import { useOffersList } from '../composables';

const { debounce } = useFunctions();

const {
  items,
  loading,
  searchQuery,
  loadOffers,
} = useOffersList();

const searchValue = ref<string>();

/**
 * Debounced search handler
 * Waits 1000ms after user stops typing before making API call
 */
const onSearchList = debounce(async (keyword: string) => {
  searchValue.value = keyword;
  await loadOffers({
    ...searchQuery.value,
    keyword,
    skip: 0, // Reset to first page on new search
  });
}, 1000);
</script>
```

## Integration with VcTable

The VcTable component emits `search:change` event when user types in search input:

```vue
<VcTable
  :search-value="searchValue"
  @search:change="onSearchList"
/>
```

**Event flow:**
1. User types in search input
2. VcTable emits `search:change` with current value
3. Debounced handler cancels previous pending calls
4. After 1000ms of no typing, API request is made
5. Results update in table

## API Parameters

```typescript
debounce(
  func: (...args: any[]) => void,  // Function to debounce
  delay: number                     // Delay in milliseconds
): (...args: unknown[]) => void
```

**Parameters:**
- `func` - Function to execute after delay
- `delay` - Time to wait in milliseconds (commonly 300-1000ms)

**Returns:** Debounced version of the function

## Common Patterns

### Pattern 1: Search with Reset

```typescript
const onSearch = debounce(async (keyword: string | undefined) => {
  searchKeyword.value = keyword;
  await loadData({
    ...query.value,
    keyword,
    skip: 0, // Always reset to first page
  });
}, 1000);
```

### Pattern 2: Search with Multiple Filters

```typescript
const onSearch = debounce(async (keyword: string) => {
  await loadData({
    ...existingFilters.value,
    keyword,
    // Preserve other filters like status, dateRange, etc.
  });
}, 1000);
```

### Pattern 3: Search with Loading State

```typescript
const isSearching = ref(false);

const onSearch = debounce(async (keyword: string) => {
  isSearching.value = true;
  try {
    await searchAPI({ keyword });
  } finally {
    isSearching.value = false;
  }
}, 1000);
```

## Delay Guidelines

| Use Case | Recommended Delay | Reason |
|----------|------------------|--------|
| Search input | 800-1000ms | User typically pauses between words |
| Auto-save | 2000-3000ms | Longer pause ensures intentional changes |
| Validation | 500-800ms | Quick feedback but not too aggressive |
| Window resize | 150-300ms | Balance between responsive and performant |

## Important Notes

**DO:**
- ✅ Use 1000ms (1 second) for search inputs as standard
- ✅ Reset pagination (skip: 0) when search changes
- ✅ Preserve other filters when searching
- ✅ Clear search value when component unmounts if needed

**DON'T:**
- ❌ Don't use delay < 300ms (too aggressive, many API calls)
- ❌ Don't forget to handle empty search (keyword: undefined)
- ❌ Don't debounce button clicks (use throttle instead)
- ❌ Don't create multiple debounce instances for same function

## Performance Impact

**Without debounce:**
- Typing "hello" = 5 API calls (h, he, hel, hell, hello)
- Typing + deleting = 10+ API calls

**With debounce (1000ms):**
- Typing "hello" + pause = 1 API call
- 5x fewer API requests
- Reduced server load
- Better user experience

## Related APIs

- `throttle` - Limit function calls per time period (for scroll, mousemove)
- `delay` - Simple delayed execution
- `once` - Execute function only once

## Production Examples

This pattern is used in vendor-portal:
- `/modules/offers/pages/offers-list.vue:180-186` - Offers search
- `/modules/orders/pages/orders-list.vue:329-336` - Orders search
- All list pages with search functionality

## TypeScript Types

```typescript
interface IUseFunctions {
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => (...args: Parameters<T>) => void;
}
```
