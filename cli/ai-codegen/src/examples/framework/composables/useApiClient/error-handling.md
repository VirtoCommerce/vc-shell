---
id: useApiClient-error-handling
type: FRAMEWORK_API
category: composable
tags: [composable, api-client, error-handling]
title: "useApiClient - Error Handling"
description: "Error handling patterns for useApiClient composable"
---

# useApiClient - Error Handling

Proper error handling is critical when working with API calls. This guide shows common error handling patterns.

## Basic Error Handling

```typescript
import { ref } from "vue";
import { useApiClient, useAsync, usePopup } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

export function useOfferDetails() {
  const { getApiClient } = useApiClient(OffersClient);
  const { showError } = usePopup();

  const offer = ref();

  const { action: loadOffer, loading: loadingOffer } = useAsync<string>(async (id) => {
    try {
    const client = await getApiClient();
    const result = await client.getOfferById(id);
    offer.value = result;
    } catch (error) {
       // Show user-friendly error message
      showError("Failed to load offer. Please try again.");
      console.error("Load offer error:", error);
    }
  });

  return {
    offer,
    loading: loadingOffer,
    loadOffer,
  };
}
```

## Bulk Operation Error Handling

```typescript
import { notification } from "@vc-shell/framework";

async function bulkDelete(ids: string[]) {
  loading.value = true;
  const failed: string[] = [];

  try {
    const client = await getApiClient();

    // Option 1: API supports bulk delete
    try {
      await client.bulkDelete(new BulkDeleteCommand({ ids }));
      notification.success(`Successfully deleted ${ids.length} offers`);
      return { success: true, failed: [] };
    } catch (error) {
      // Option 2: Fallback to individual deletes
      console.warn("Bulk delete failed, trying individual deletes:", error);
    }

    // Delete one by one
    for (const id of ids) {
      try {
        await client.deleteOffer(new DeleteOfferCommand({ id }));
      } catch (error) {
        console.error(`Failed to delete offer ${id}:`, error);
        failed.push(id);
      }
    }

    if (failed.length === 0) {
      notification.success(`Successfully deleted ${ids.length} offers`);
    } else if (failed.length < ids.length) {
      showError(
        `Deleted ${ids.length - failed.length} offers. ${failed.length} failed.`
      );
    } else {
      showError("Failed to delete offers");
    }

    return { success: failed.length === 0, failed };
  } finally {
    loading.value = false;
  }
}
```



```typescript
// Using global error handler
import { useApiErrorHandler } from "../composables/useApiErrorHandler";

export function useOfferDetails() {
  const { getApiClient } = useApiClient(OffersClient);

  async function loadOffer(id: string) {
    loading.value = true;
    try {
      const client = await getApiClient();
      offer.value = await client.getOffer(new GetOfferQuery({ id }));
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return { loadOffer };
}
```

## Important Notes

### ✅ DO

- Always wrap API calls in try-catch
- Always use try-finally for loading states
- Show user-friendly error messages
- Log errors to console for debugging
- Handle different status codes appropriately
- Implement retry logic for transient errors
- Return boolean or status from functions to indicate success

### ❌ DON'T

- Don't ignore errors silently
- Don't show technical error messages to users
- Don't forget to reset loading state in finally block
- Don't retry on client errors (4xx) - only server errors (5xx)
- Don't expose sensitive error details to users


## See Also

- [basic-usage.md](./basic-usage.md) - Basic useApiClient usage
- [error-handling.md](../../patterns/error-handling.md) - General error handling patterns

**Reference:** [Official VC-Shell Documentation - useApiClient](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useApiClient/)
