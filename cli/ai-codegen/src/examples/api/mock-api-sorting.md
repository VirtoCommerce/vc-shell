---
id: api-mock-api-sorting
type: API
complexity: SIMPLE
category: api
tags: [api]
title: "Mock Api Sorting"
description: "Mock Api Sorting API example"
---

# Mock API Sorting Pattern

This example shows the **correct** way to handle sorting in **mock API** implementations with proper TypeScript null safety.

**IMPORTANT**: This pattern is ONLY for mock API files. Real implementations use backend sorting via `useTableSort` composable and API calls.

## Overview

Mock APIs often implement client-side sorting for development/testing. When accessing dynamic fields, TypeScript requires proper undefined handling.

## ❌ WRONG: Direct access causes TypeScript errors

```typescript
// api/index.ts (MOCK API)
async searchOffersGET(query: IOffersSearchQuery): Promise<IOffersSearchResult> {
  let filtered = mockOffers.slice();

  // Apply sorting
  if (query.sort) {
    const [field, direction] = query.sort.split(":");
    filtered.sort((a, b) => {
      const aValue = a[field as keyof IOffer];  // ❌ Possibly undefined
      const bValue = b[field as keyof IOffer];  // ❌ Possibly undefined

      // ❌ ERROR TS18048: 'aValue' is possibly 'undefined'
      // ❌ ERROR TS18048: 'bValue' is possibly 'undefined'
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

      return direction === "DESC" ? -comparison : comparison;
    });
  }

  return { totalCount: filtered.length, results: filtered };
}
```

## ✅ CORRECT: Null coalescing operator

```typescript
// api/index.ts (MOCK API)
async searchOffersGET(query: IOffersSearchQuery): Promise<IOffersSearchResult> {
  let filtered = mockOffers.slice();

  // Apply sorting
  if (query.sort) {
    const [field, direction] = query.sort.split(":");
    filtered.sort((a, b) => {
      // ✅ Use ?? to provide default value for undefined
      const aValue = a[field as keyof IOffer] ?? "";
      const bValue = b[field as keyof IOffer] ?? "";

      // ✅ No TypeScript errors
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

      return direction === "DESC" ? -comparison : comparison;
    });
  }

  const totalCount = filtered.length;
  const skip = query.skip || 0;
  const take = query.take || 20;
  const results = filtered.slice(skip, skip + take);

  return { totalCount, results };
}
```

## Complete Mock API Example

```typescript
// src/modules/offers/api/index.ts
import { IOffer, IOffersSearchQuery, IOffersSearchResult } from "./types";

// Mock data
const mockOffers: IOffer[] = [
  { id: "1", name: "Offer A", price: 100, status: "active", createdDate: "2024-01-01" },
  { id: "2", name: "Offer B", price: undefined, status: "draft", createdDate: "2024-01-02" },
  { id: "3", name: "Offer C", price: 50, status: "active", createdDate: "2024-01-03" },
];

// Mock API client
export const ApiClient = {
  // Search offers with filtering and sorting
  async searchOffersGET(query: IOffersSearchQuery): Promise<IOffersSearchResult> {
    await delay(500);  // Simulate network delay

    let filtered = mockOffers.slice();

    // Apply search filter
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.name.toLowerCase().includes(keyword)
      );
    }

    // Apply status filter
    if (query.status) {
      filtered = filtered.filter(offer => offer.status === query.status);
    }

    // ✅ Apply sorting with null-safe comparison
    if (query.sort) {
      const [field, direction] = query.sort.split(":");
      filtered.sort((a, b) => {
        // ✅ Null coalescing prevents undefined errors
        const aValue = a[field as keyof IOffer] ?? "";
        const bValue = b[field as keyof IOffer] ?? "";

        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

        return direction === "DESC" ? -comparison : comparison;
      });
    }

    // Pagination
    const totalCount = filtered.length;
    const skip = query.skip || 0;
    const take = query.take || 20;
    const results = filtered.slice(skip, skip + take);

    return { totalCount, results };
  },

  // Get offer by ID
  async getOfferByIdGET(id: string): Promise<IOffer | null> {
    await delay(300);
    return mockOffers.find(offer => offer.id === id) || null;
  },

  // Create offer
  async createOfferPOST(offer: Partial<IOffer>): Promise<IOffer> {
    await delay(500);
    const newOffer: IOffer = {
      id: Date.now().toString(),
      name: offer.name || "Untitled",
      price: offer.price,
      status: offer.status || "draft",
      createdDate: new Date().toISOString(),
    };
    mockOffers.push(newOffer);
    return newOffer;
  },

  // Update offer
  async updateOfferPUT(id: string, offer: Partial<IOffer>): Promise<IOffer> {
    await delay(500);
    const index = mockOffers.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Offer not found");

    mockOffers[index] = { ...mockOffers[index], ...offer };
    return mockOffers[index];
  },

  // Delete offer
  async deleteOfferDELETE(id: string): Promise<void> {
    await delay(300);
    const index = mockOffers.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOffers.splice(index, 1);
    }
  },
};

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Real Implementation (Backend Sorting)

In production code, sorting happens on the backend:

```typescript
// composable/useOffersList.ts
import { useApiClient } from '@vc-shell/framework';
import { useTableSort } from '@vc-shell/framework';
import { ApiClient } from '../api';

export function useOffersList() {
  const { getApiClient } = useApiClient(ApiClient);
  const offers = ref<IOffer[]>([]);
  const loading = ref(false);

  // ✅ Use useTableSort for client-side sort state
  const { sortExpression, handleSortChange } = useTableSort({
    initialProperty: 'createdDate',
    initialDirection: 'DESC',
  });

  async function loadOffers() {
    loading.value = true;
    try {
      const client = await getApiClient();

      // ✅ Pass sort expression to backend
      const result = await client.searchOffersGET({
        skip: 0,
        take: 20,
        sort: sortExpression.value,  // e.g., "name:ASC"
      });

      offers.value = result.results;
    } catch (error) {
      notification.error(t('OFFERS.LOAD_ERROR'));
    } finally {
      loading.value = false;
    }
  }

  // ✅ Watch sort changes and reload
  watch(sortExpression, () => {
    loadOffers();
  });

  return {
    offers,
    loading,
    loadOffers,
    sortExpression,
    handleSortChange,  // Pass to VcTable @header-click
  };
}
```

**Blade:**
```vue
<template>
  <VcBlade :loading="loading">
    <!-- @vue-generic {IOffer} -->
    <VcTable
      :items="offers"
      :columns="columns"
      :sort="sortExpression"
      @header-click="handleSortChange"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { useOffersList } from '../composables/useOffersList';

const {
  offers,
  loading,
  sortExpression,
  handleSortChange,  // ✅ Handles header clicks
} = useOffersList();
</script>
```

## Summary

| Context | Sorting Location | Code Pattern |
|---------|-----------------|--------------|
| **Mock API** (development) | Client-side | `aValue ?? ""` in sort function |
| **Production** | Backend (server) | `useTableSort` + API call |

### Key Points

1. ✅ Mock API: Use `a[field] ?? ""` to handle undefined values in sorting
2. ✅ Production: Use `useTableSort` composable + backend API sorting
3. ❌ **NEVER** implement client-side sorting in production blades
4. ❌ **NEVER** access `a[field]` directly in comparisons without null coalescing
5. ✅ Always watch `sortExpression` and reload data on changes

## Decision Tree

```
Need sorting?
│
├─ Mock API file (api/index.ts)?
│  └─ ✅ Use: const value = a[field as keyof T] ?? "";
│
└─ Real blade/composable?
   └─ ✅ Use: useTableSort() + watch(sortExpression) + API call
```

## Related

- [useTableSort Documentation](https://docs.vc-shell.dev/composables/useTableSort)
- [VcTable Component](https://docs.vc-shell.dev/components/VcTable)
- For production: ALWAYS use backend sorting via API calls
