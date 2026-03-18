# useAsync

Wraps an asynchronous function with reactive `loading` state, reactive `error` state, and automatic error notifications. This is the standard way to handle API calls, saves, deletes, and other async operations throughout VC-Shell applications.

When the returned `action` is called, `useAsync` automatically:
1. Sets `loading` to `true` and clears any previous `error`
2. Executes your async function
3. On failure: parses the error into a `DisplayableError`, stores it in `error`, logs it, optionally shows a toast notification, and re-throws
4. Sets `loading` to `false` (success or failure)

## Quick Start

```typescript
import { useAsync, useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);

const { loading, error, action: loadOrder } = useAsync<string>(async (id) => {
  const client = await getApiClient();
  return await client.getOrderById(id);
});

// In a blade's onMounted:
await loadOrder("order-123");
// loading.value was true during the call, now false
// error.value is null on success, or a DisplayableError on failure
```

## API Reference

### Import

```typescript
import { useAsync } from "@vc-shell/framework";
```

### Parameters

| Parameter     | Type                            | Required | Description                                      |
|---------------|---------------------------------|----------|--------------------------------------------------|
| `innerAction` | `AsyncAction<Payload, Result>`  | Yes      | The async function to wrap                       |
| `options`     | `UseAsyncOptions`               | No       | Configuration for notifications                  |

#### Type Aliases

```typescript
type AsyncAction<Payload = void, Result = void> = (
  payload?: Payload,
  ...rest: any[]
) => Promise<Result>;
```

#### UseAsyncOptions

| Option          | Type      | Default | Description                                          |
|-----------------|-----------|---------|------------------------------------------------------|
| `notify`        | `boolean` | `true`  | Show an error toast notification on failure           |
| `notifyTimeout` | `number`  | `8000`  | Duration in milliseconds before the toast auto-dismisses |

### Returns: `UseAsyncReturn<Payload, Result>`

| Property  | Type                                        | Description                                                       |
|-----------|---------------------------------------------|-------------------------------------------------------------------|
| `loading` | `DeepReadonly<Ref<boolean>>`                | Reactive loading state -- `true` while the action is executing    |
| `error`   | `DeepReadonly<Ref<DisplayableError \| null>>` | Reactive error -- set on failure, cleared on next invocation      |
| `action`  | `AsyncAction<Payload, Result>`              | Wrapped function with the same signature as `innerAction`         |

### Type Parameters

| Name      | Default | Description                                            |
|-----------|---------|--------------------------------------------------------|
| `Payload` | `void`  | Type of the first argument passed to `action`          |
| `Result`  | `void`  | Return type of the async operation                     |

---

## Features

### Basic Async Operation

```typescript
const { loading, action: fetchItems } = useAsync(async () => {
  const client = await getApiClient();
  items.value = await client.searchItems(query.value);
});

// Use in template:
// <VcDataTable :loading="loading" :items="items" />
```

### With Typed Payload

Pass a payload type to strongly type the first argument:

```typescript
const { action: loadProduct } = useAsync<string>(async (id) => {
  // id is typed as string | undefined
  const client = await getApiClient();
  if (id) {
    product.value = await client.getProductById(id);
  }
});

await loadProduct("prod-42");
```

### With Typed Payload and Result

When the inner function returns a value, it becomes the resolved value of `action`:

```typescript
const { action: validateSeller } = useAsync<Seller, ValidationFailure[]>(
  async (seller) => {
    const client = await getApiClient();
    return await client.validateSeller(seller);
  },
);

const failures = await validateSeller(sellerData);
// failures is typed as ValidationFailure[]
```

### Reactive Error State

The `error` ref contains a parsed `DisplayableError` after a failure. It is automatically cleared on the next invocation.

```vue
<template>
  <VcAlert v-if="error" variant="error">
    {{ error.message }}
  </VcAlert>
  <VcButton :loading="loading" @click="save">Save</VcButton>
</template>

<script setup lang="ts">
const { loading, error, action: save } = useAsync(async () => {
  await saveOrder(order.value);
});
</script>
```

### Error Notifications

By default, `useAsync` shows a toast notification on failure. The notification is **deferred** via `setTimeout(0)` so that the `ErrorInterceptor` can cancel it when a blade error banner is already displayed -- this prevents duplicate toast + banner for the same error.

```typescript
// Default: shows toast on error
const { action: save } = useAsync(async () => { /* ... */ });

// Explicit: custom timeout
const { action: save } = useAsync(async () => { /* ... */ }, {
  notify: true,
  notifyTimeout: 5000,
});

// Silent: no toast notification
const { action: silentRefresh } = useAsync(async () => { /* ... */ }, {
  notify: false,
});
```

### Combining with useApiClient

The standard pattern for API operations in VC-Shell:

```typescript
import { useAsync, useApiClient } from "@vc-shell/framework";
import { VcmpSellerCatalogClient } from "@api/client";

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

const { action: search, loading } = useAsync<SearchQuery>(async (query) => {
  const client = await getApiClient();
  const result = await client.searchProducts(query);
  items.value = result.results ?? [];
  totalCount.value = result.totalCount ?? 0;
});
```

### Combining with useLoading

When a blade has multiple async operations, combine their loading states into one:

```typescript
const { action: load, loading: loadLoading } = useAsync<string>(async (id) => { /* ... */ });
const { action: save, loading: saveLoading } = useAsync<Product>(async (p) => { /* ... */ });
const { action: remove, loading: deleteLoading } = useAsync<string>(async (id) => { /* ... */ });

// Single reactive boolean: true if ANY operation is running
const loading = useLoading(loadLoading, saveLoading, deleteLoading);
```

---

## Recipes

### Recipe 1: CRUD Operations in a Composable

The standard VC-Shell pattern: encapsulate all CRUD operations for an entity in a composable, using `useAsync` for each operation and `useLoading` for the combined state.

```typescript
// composables/useFulfillmentCenter/index.ts
import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import { VcmpSellerCatalogClient, type FulfillmentCenter } from "@api/client";

export function useFulfillmentCenter() {
  const { getApiClient } = useApiClient(VcmpSellerCatalogClient);
  const details = ref<FulfillmentCenter>();

  const { action: load, loading: loadLoading } = useAsync<string>(async (id) => {
    const client = await getApiClient();
    details.value = await client.getFulfillmentCenterById(id!);
  });

  const { action: save, loading: saveLoading } = useAsync<FulfillmentCenter>(
    async (data) => {
      const client = await getApiClient();
      await client.updateFulfillmentCenter({ fulfillmentCenter: data });
    },
  );

  const { action: remove, loading: deleteLoading } = useAsync<string>(
    async (id) => {
      const client = await getApiClient();
      await client.deleteFulfillmentCenter([id!]);
    },
  );

  return {
    details,
    load,
    save,
    remove,
    loading: useLoading(loadLoading, saveLoading, deleteLoading),
  };
}
```

Usage in a blade:

```vue
<script setup lang="ts">
const { details, load, save, remove, loading } = useFulfillmentCenter();

onMounted(() => {
  if (props.param) {
    load(props.param);
  }
});
</script>
```

### Recipe 2: Separate Loading States for Parallel Operations

```typescript
const { action: loadOrder, loading: mainLoading } = useAsync<string>(async (id) => {
  order.value = await orderClient.getById(id!);
});

const { action: loadShipments, loading: shipmentsLoading } = useAsync<string>(async (orderId) => {
  shipments.value = await shipmentClient.getByOrderId(orderId!);
});

// In template: <VcBlade :loading="mainLoading">, <VcDataTable :loading="shipmentsLoading">
onMounted(() => Promise.all([loadOrder(props.param!), loadShipments(props.param!)]));
```

### Recipe 3: Error Handling with Try/Catch

Since `useAsync` re-throws, you can catch for flow control while getting reactive `error` and toasts for free:

```typescript
const { action: save, error } = useAsync<Order>(async (order) => {
  const client = await getApiClient();
  return await client.updateOrder(order);
});

async function onSaveClick() {
  try {
    await save(order.value);
    await callParent("reload");
    await closeSelf();
  } catch {
    // error.value is set, toast shown -- just stay on blade for retry
  }
}
```

---

## Common Mistakes

### Wrapping synchronous code in useAsync

```typescript
// BAD -- useAsync is for async operations, not sync
const { action } = useAsync(async () => {
  items.value = items.value.filter((x) => x.active);
});
```

```typescript
// GOOD -- just use a regular function
function filterActive() {
  items.value = items.value.filter((x) => x.active);
}
```

### Forgetting that action re-throws

```typescript
// BAD -- unhandled promise rejection
async function onSave() {
  await save(data.value);
  await closeSelf(); // never reached if save throws
}
```

```typescript
// GOOD -- wrap in try/catch when you have follow-up logic
async function onSave() {
  try {
    await save(data.value);
    await closeSelf();
  } catch {
    // error.value is already set, toast shown -- just stay on blade
  }
}
```

### Creating useAsync inside a function instead of at setup time

```typescript
// BAD -- creates a new loading ref each call, template never sees it
async function loadData() {
  const { action, loading } = useAsync(async () => { /* ... */ });
  await action();
}
```

```typescript
// GOOD -- create at setup time, call the action later
const { action: loadData, loading } = useAsync(async () => { /* ... */ });

onMounted(() => loadData());
```

### Using the same useAsync instance for unrelated operations

```typescript
// BAD -- loading/error state is shared, second call clears first error
const { action: doStuff, loading } = useAsync(async (type: string) => {
  if (type === "load") await loadData();
  if (type === "save") await saveData();
});
```

```typescript
// GOOD -- separate instances for separate operations
const { action: load, loading: loadLoading } = useAsync(async () => loadData());
const { action: save, loading: saveLoading } = useAsync(async () => saveData());
```

---

## Internals

- Errors are parsed via `parseError()` into `DisplayableError` objects that have a user-friendly `message` property.
- Toast notifications are deferred with `setTimeout(0)` and registered via `setPendingErrorNotification`. The `ErrorInterceptor` (blade-level `onErrorCaptured`) can call `cancelPendingErrorNotification` to suppress the toast when a blade error banner is shown instead.
- The notification module is lazy-imported to avoid circular dependencies with `@core/composables`.

---

## Related

| Resource | Description |
|----------|-------------|
| [`useApiClient`](../useApiClient/) | Provides typed API client instances to pass into `useAsync` |
| [`useLoading`](../useLoading/) | Combines multiple `loading` refs into a single boolean |
| [`useModificationTracker`](../useModificationTracker/) | Tracks dirty state for forms -- often used alongside `useAsync` for save operations |
| [`notification`](../../../shared/components/notifications/) | The toast notification system used by `useAsync` for error display |
