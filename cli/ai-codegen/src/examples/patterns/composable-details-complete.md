---
id: composable-details-complete
type: PATTERN
complexity: MODERATE
category: composable
tags: ["composable", "details", "useAsync", "useModificationTracker", "crud"]
title: "Details Composable Pattern"
description: "Complete pattern for details composable with useAsync, useModificationTracker"
bladeContext: ["details"]
---

# Details Composable Pattern

This document describes the authoritative pattern for details composables in VC-Shell.

## Authoritative Reference

**The single source of truth is:** `reference/composable-details.ts`

See [reference/composable-details.ts](../reference/composable-details.ts) for the complete, production-ready implementation.

## Purpose

Encapsulate all data fetching, saving, and state management logic for a details blade. The composable provides reactive state for a single item and methods for CRUD operations.

## Key Features
- useAsync hook for all async operations (with proper generic types!)
- useModificationTracker for dirty state tracking
- useLoading for combined loading state
- API integration via useApiClient
- Create and update support

## ⚠️ CRITICAL: useAsync Generic Type Pattern

**ALWAYS use generic type, NEVER inline type annotation:**

```typescript
// ❌ WRONG - TypeScript thinks id is ALWAYS defined:
const { action: loadItem } = useAsync(async (id: string) => {
  const data = await client.getById(id);  // CRASH! id can be undefined!
});

// ✅ CORRECT - generic type + guard:
const { action: loadItem } = useAsync<string>(async (id) => {
  if (!id) return;  // Guard required! id is typed as string | undefined
  const data = await client.getById(id);
});
```

## Complete Example

### useProductDetails.ts

```typescript
import { computed, ref, ComputedRef, Ref, reactive } from "vue";
import { useAsync, useApiClient, useModificationTracker, useLoading } from "@vc-shell/framework";
import { ProductClient } from "../api_client/products.api";
import { IProduct } from "../api_client/products.api";

export interface IUseProductDetails {
  item: Ref<IProduct>;
  loading: ComputedRef<boolean>;
  loadProduct: (id: string) => Promise<void>;
  saveProduct: (data?: IProduct) => Promise<IProduct | undefined>;
  deleteProduct: (id: string) => Promise<void>;

  // From useModificationTracker
  isModified: Readonly<Ref<boolean>>;
  resetModificationState: () => void;
}

export function useProductDetails(): IUseProductDetails {
  const { getApiClient } = useApiClient(ProductClient);

  const item = ref<IProduct>(reactive({} as IProduct));

  // useModificationTracker returns: { currentValue, isModified, resetModificationState }
  const { currentValue, isModified, resetModificationState } = useModificationTracker(item);

  // ✅ CORRECT: useAsync<string> - id is typed as string | undefined
  const { action: loadProduct, loading: loadingProduct } = useAsync<string>(async (id) => {
    if (!id) return;  // Guard required - id can be undefined!

    const apiClient = await getApiClient();
    const data = await apiClient.getProductById(id);

    currentValue.value = reactive(data);
    resetModificationState();
  });

  // ✅ CORRECT: Two generic params <InputType, OutputType>
  const { action: saveProduct, loading: savingProduct } = useAsync<IProduct | undefined, IProduct | undefined>(
    async (data) => {
      if (!data) return;  // Guard required!

      const apiClient = await getApiClient();
      let result: IProduct;

      if (data.id) {
        result = await apiClient.updateProduct(data);
      } else {
        result = await apiClient.createProduct(data);
      }

      if (result) {
        currentValue.value = reactive(result);
        resetModificationState();
      }

      return result;
    }
  );

  // ✅ CORRECT: useAsync<string> with guard for id
  const { action: deleteProduct, loading: deletingProduct } = useAsync<string>(async (id) => {
    if (!id) return;  // Guard required!
    const apiClient = await getApiClient();
    await apiClient.deleteProduct(id);
  });

  return {
    item: currentValue,  // IMPORTANT: return currentValue, NOT item!
    loading: useLoading(loadingProduct, savingProduct, deletingProduct),
    loadProduct,
    saveProduct,
    deleteProduct,
    isModified,
    resetModificationState,
  };
}
```

## Return Values

### State
- `item: Ref<T>` - The item being edited (from useModificationTracker.currentValue)
- `loading: ComputedRef<boolean>` - Combined loading state (from useLoading)
- `isModified: Readonly<Ref<boolean>>` - Dirty state (from useModificationTracker)

### Methods
- `loadEntity(id: string)` - Load an item by ID
- `saveEntity(data?)` - Save the item (create or update)
- `deleteEntity(id: string)` - Delete an item by ID
- `resetModificationState()` - Reset dirty flag (from useModificationTracker)

## Usage in Blade

```vue
<script setup lang="ts">
import { useProductDetails } from "../composables";

const {
  item,
  loading,
  isModified,
  loadProduct,
  saveProduct,
  deleteProduct,
  resetModificationState,
} = useProductDetails();

onMounted(async () => {
  if (props.param) {
    await loadProduct(props.param);
  }
});

// Save passes current item to composable
async function handleSave() {
  await saveProduct(item.value);
  // resetModificationState is called inside composable after success
}
</script>
```

## Patterns to Follow

1. **useAsync Generic Type**: ALWAYS `useAsync<Type>(async (p) => {})`, NEVER `useAsync(async (p: Type) => {})`
2. **Guard for undefined**: ALWAYS check `if (!id) return;` or `if (!data) return;`
3. **useModificationTracker**: Use for dirty state - returns `{ currentValue, isModified, resetModificationState }`
4. **useLoading**: Combine multiple loading states into one ComputedRef
5. **useApiClient**: Use `useApiClient(Client)` for API access
6. **Return currentValue**: Return `currentValue` from useModificationTracker, NOT the original `item`
7. **Naming**: `use{EntityName}Details` composable, `load{EntityName}` action
8. **Export interface**: `IUse{EntityName}Details` for return type

