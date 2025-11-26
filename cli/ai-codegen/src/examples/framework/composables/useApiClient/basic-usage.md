---
id: useApiClient-basic-usage
type: FRAMEWORK_API
category: composable
tags: [composable, api-client, authentication]
title: "useApiClient - Basic Usage"
description: "Basic usage of useApiClient composable for authenticated API calls"
---

# useApiClient - Basic Usage

The `useApiClient` composable provides a standardized way to access API clients with automatic authentication token management.

## Overview

- Creates authenticated API client instances
- Handles authentication token injection
- Manages base URL configuration
- Works with any class extending `AuthApiBase`

## Basic Pattern

```typescript
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

// Get the API client factory
const { getApiClient } = useApiClient(OffersClient);

// Use in async function
async function loadOffer(id: string) {
  // Get authenticated client instance
  const client = await getApiClient();

  // Make API call with command object
  const result = await client.getOffer(new GetOfferQuery({ id }));

  return result;
}
```

## Complete Composable Example

```typescript
// composables/useOfferDetails.ts
import { ref } from "vue";
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";
import type { Offer } from "../types";

export function useOfferDetails() {
  const { getApiClient } = useApiClient(OffersClient);

  const offer = ref<Offer>();

  const { action: loadOffer, loading: offerLoading} = useAsync<string>(async (id) => {
    const client = await getApiClient();
    const result = await client.getOffer(new GetOfferQuery({ id }));
    offer.value = result;
  });

  const { action: saveOffer, loading: saveOfferLoading} = useAsync<Offer>(async (data) => {
    const client = await getApiClient();
    if (data.id) {
      await client.updateOffer(new UpdateOfferCommand(data));
    } else {
      const created = await client.createOffer(new CreateOfferCommand(data));
      offer.value = created;
    }
  });

  const { action: deleteOffer, loading: deleteOfferLoading} = useAsync<string>(async (id) => {
    const client = await getApiClient();
    await client.deleteOffer(new DeleteOfferCommand({ id }));
  });

  return {
    offer,
    offerLoading,
    saveOfferLoading,
    deleteOfferLoading,
    loadOffer,
    saveOffer,
    deleteOffer,
  };
}
```

## Using in Blade Component

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useOfferDetails } from "../composables/useOfferDetails";

interface Props {
  param?: string; // Offer ID
}

const props = defineProps<Props>();
const { offer, offerLoading, saveOfferLoading, deleteOfferLoading, loadOffer, saveOffer } = useOfferDetails();

onMounted(async () => {
  if (props.param) {
    await loadOffer(props.param);
  }
});

async function onSave() {
  await saveOffer(offer.value);
  emit("close:blade");
}
</script>
```

## Command Objects Pattern

Always use command/query objects when calling API methods:

```typescript
// ✅ CORRECT: Using command objects
const client = await getApiClient();

// Query with parameters
const result = await client.searchOffers(new SearchOffersQuery({
  keyword: "test",
  skip: 0,
  take: 20,
  sort: "createdDate:desc",
}));

// Command for create/update
await client.updateOffer(new UpdateOfferCommand({
  id: offer.id,
  name: offer.name,
  price: offer.price,
}));

// Command for delete
await client.deleteOffer(new DeleteOfferCommand({ id: offer.id }));

// Bulk delete
await client.bulkDelete(new BulkDeleteCommand({
  ids: selectedIds.value
}));
```

```typescript
// ❌ WRONG: Plain objects without command wrapper
const result = await client.searchOffers({
  keyword: "test", // Missing command wrapper
});
```

## Important Notes

### ✅ DO

- Always use `await getApiClient()` to get client instance
- Use command/query objects for all API calls
- Handle loading states
- Wrap API calls in try-finally for loading state cleanup

### ❌ DON'T

- Don't instantiate client directly: `new OffersClient()` ❌
- Don't pass plain objects: use command objects
- Don't forget to handle errors (see error-handling.md)

## API Client Interface

Your API client must extend `AuthApiBase` to work with `useApiClient`:

```typescript
import { AuthApiBase } from "@vc-shell/framework";

export class OffersClient extends AuthApiBase {
  constructor(
    private baseUrl?: string,
    private http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }
  ) {
    super();
  }

  // Your API methods...
  async getOffer(query: GetOfferQuery): Promise<Offer> {
    // Implementation
  }
}
```

## See Also

- [error-handling.md](./error-handling.md) - Error handling with useApiClient
- [multiple-clients.md](./multiple-clients.md) - Using multiple API clients
- [02-api-client.yaml](../../../rules/critical/02-api-client.yaml) - API client rules

**Reference:** [Official VC-Shell Documentation - useApiClient](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useApiClient/)
