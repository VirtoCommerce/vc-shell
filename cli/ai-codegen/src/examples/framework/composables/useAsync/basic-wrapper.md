---
id: useAsync-basic-wrapper
type: FRAMEWORK_API
category: composable
tags: [composable, async, loading]
title: "useAsync - Basic Async Wrapper"
description: "Wrapping async operations with automatic loading state"
---

# useAsync - Basic Async Wrapper

The `useAsync` composable wraps async operations with automatic loading state management.

## Overview

- Automatic loading state tracking
- Prevents race conditions
- Simplifies async code
- Guard optional parameters: destructured args may be undefined, so check (e.g., `if (!params?.id) return;`).

## Basic Usage

```typescript
import { useAsync } from "@vc-shell/framework";

const { action, loading } = useAsync(async () => {
  // Your async operation
  const result = await fetchData();
  return result;
});

// Trigger the async operation
await action();

// Check state
console.log(loading.value); // false after completion
```

## Complete Example - Load Data

```vue
<template>
  <VcBlade title="Offers" v-loading="loading">
    <div v-if="error" class="tw-p-4">
      <VcBanner variant="error">{{ error.message }}</VcBanner>
    </div>

    <div v-else class="tw-p-4">
      <!-- @vue-generic {IOffer} -->
      <VcTable :items="offers" :columns="columns" />
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAsync, useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { getApiClient } = useApiClient(OffersClient);
const offers = ref([]);

// Wrap API call with useAsync
const { action: loadOffers, loading } = useAsync(async () => {
  const client = await getApiClient();
  const result = await client.searchOffers(new SearchOffersQuery({
    take: 20,
    skip: 0,
  }));
  offers.value = result.results;
});

// Load on mount
onMounted(() => {
  loadOffers();
});
</script>
```

## Form Submission with useAsync

```vue
<template>
  <VcForm @submit="onSubmit">
    <VcInput v-model="form.name" label="Name" />
    <VcInput v-model="form.email" label="Email" />

    <VcButton
      type="submit"
      :loading="loading"
      :disabled="loading"
    >
      {{ loading ? "Saving..." : "Save" }}
    </VcButton>

    <div v-if="error" class="tw-mt-2">
      <VcBanner variant="error">{{ error.message }}</VcBanner>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useApiClient, useAsync, usePopup } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { getApiClient } = useApiClient(OffersClient);
const { showInfo } = usePopup();

const form = ref({
  name: "",
  email: "",
});

// Wrap save operation
const { action: saveForm, loading } = useAsync(async () => {
  const client = await getApiClient();
  await client.createOffer(new CreateOfferCommand(form.value));

  showInfo("Offer created successfully");
  form.value = { name: "", email: "" }; // Reset form
});

async function onSubmit() {
  await saveForm();
}
</script>
```

## With Parameters

```typescript
import { useAsync, useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { getApiClient } = useApiClient(OffersClient);

// Create async function with parameters
const { action: loadOffer, loading } = useAsync<string>(async (offerId) => {
  const client = await getApiClient();
  const result = await client.getOffer(new GetOfferQuery({ id: offerId }));
  return result;
});

// Call with parameters
const offer = await loadOffer("offer-123");
```

## Multiple Async Operations

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useAsync, useLoading } from "@vc-shell/framework";

// Separate async operations with independent loading states
const { action: loadOffers, loading: loadingOffers } = useAsync(async () => {
  const client = await getApiClient();
  const result = await client.searchOffers(new SearchOffersQuery({ take: 20 }));
  offers.value = result.results;
});

const { action: loadCategories, loading: loadingCategories } = useAsync(async () => {
  const client = await getApiClient();
  const result = await client.getCategories();
  categories.value = result;
});

// Combined loading state
const loading = useLoading(loadingOffers, loadingCategories);

// Load both
onMounted(async () => {
  await Promise.all([
    loadOffers(),
    loadCategories(),
  ]);
});
</script>
```

## Error Handling

```typescript
import { useAsync, usePopup } from "@vc-shell/framework";

const { showError } = usePopup();

const { action: deleteOffer, loading } = useAsync<string>(
  async (id) => {
    try {
      const client = await getApiClient();
      await client.deleteOffer(new DeleteOfferCommand({ id }));
    } catch (error) {
      console.error("Delete failed:", error);
      showError("Failed to delete offer. Please try again.");
      throw error;
    }
  }
);
```


## Combining with useLoading

```typescript
import { useAsync, useLoading } from "@vc-shell/framework";

const { action: loadOffers, loading: offersLoading } = useAsync(async () => {
  // Load offers
});

const { action: loadProducts, loading: productsLoading } = useAsync(async () => {
  // Load products
});

// Combine multiple loading states
const allLoading = useLoading(offersLoading, productsLoading);

// Use in template: v-loading="allLoading"
```

## Retry Logic

```typescript
import { useAsync } from "@vc-shell/framework";

const { action: loadData, loading, error } = useAsync(async () => {
  const client = await getApiClient();
  return await client.getData();
});

async function loadWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await loadData();

    if (!error.value) {
      return; // Success
    }

    if (attempt < maxRetries) {
      console.log(`Retry attempt ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // All retries failed
  showError("Failed to load data after multiple attempts");
}
```

## Debounced Search

```typescript
import { ref, watch } from "vue";
import { useAsync } from "@vc-shell/framework";
import { useDebounceFn } from "@vueuse/core";

const searchQuery = ref("");
const searchResults = ref([]);

const { exec: search, loading } = useAsync(async (query: string) => {
  if (!query) {
    searchResults.value = [];
    return;
  }

  const client = await getApiClient();
  const result = await client.search(new SearchQuery({ keyword: query }));
  searchResults.value = result.results;
});

// Debounce the search
const debouncedSearch = useDebounceFn((query: string) => {
  search(query);
}, 500);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});
```

## API Reference

```typescript
interface UseAsyncOptions {
  immediate?: boolean;           // Execute immediately
  onError?: (error: Error) => void; // Custom error handler
  onSuccess?: (data: any) => void;  // Success callback
}

interface UseAsyncReturn<T> {
  exec: (...args: any[]) => Promise<T>;  // Execute the async function
  loading: Ref<boolean>;                  // Loading state
  error: Ref<Error | null>;               // Error state
  data: Ref<T | undefined>;               // Result data
}
```

## Important Notes

### ✅ DO

- Use useAsync for all API calls
- Check `error.value` after exec()
- Combine multiple loading states with useLoading
- Use immediate: true for auto-load scenarios
- Handle errors appropriately

### ❌ DON'T

- Don't forget to check error state
- Don't nest useAsync calls (use Promise.all instead)
- Don't ignore loading state in UI

## Common Patterns

### Load on Mount

```typescript
const { exec: loadData, loading } = useAsync(async () => {
  // Load data
});

onMounted(() => {
  loadData();
});
```

### Refresh Data

```typescript
const { exec: refreshData, loading } = useAsync(async () => {
  const client = await getApiClient();
  const result = await client.getData();
  items.value = result;
});

function onRefresh() {
  refreshData();
}
```

### Save with Validation

```typescript
const { exec: save, loading, error } = useAsync(async () => {
  // Validate first
  if (!isValid.value) {
    throw new Error("Validation failed");
  }

  const client = await getApiClient();
  await client.save(new SaveCommand(data.value));
});
```

## See Also

- [useLoading basic usage](../useLoading/combine-states.md) - Combining loading states
- [useApiClient basic-usage.md](../useApiClient/basic-usage.md) - API client usage

**Reference:** [Official VC-Shell Documentation - useAsync](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useAsync/)
