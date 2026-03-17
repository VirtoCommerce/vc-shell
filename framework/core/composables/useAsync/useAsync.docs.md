# useAsync

Wraps an async function with reactive `loading` and `error` state. Optionally shows error toast notifications on failure.

## When to Use

- When performing API calls, saves, or deletes that need loading indicators
- When you want automatic error handling with toast notifications
- When you need reactive error state for inline error display
- Do NOT use for synchronous operations or fire-and-forget tasks

## Basic Usage

```typescript
import { useAsync } from "@vc-shell/framework";

const { loading, error, action: fetchData } = useAsync(async (id: string) => {
  const client = await getApiClient();
  return await client.getById(id);
});

await fetchData("order-123");
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `innerAction` | `AsyncAction<Payload, Result>` | Yes | The async function to wrap |
| `options` | `UseAsyncOptions` | No | Configuration options |

#### UseAsyncOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `notify` | `boolean` | `true` | Show error toast notification on failure |
| `notifyTimeout` | `number` | `8000` | Notification display duration in ms |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `DeepReadonly<Ref<boolean>>` | Reactive loading state -- `true` while action is executing |
| `error` | `DeepReadonly<Ref<DisplayableError \| null>>` | Reactive error -- set on failure, cleared on next invocation |
| `action` | `AsyncAction<Payload, Result>` | Wrapped async function to call with the same signature |

## Common Patterns

### Load and save actions in a blade

```typescript
<script setup lang="ts">
import { useAsync, useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);

const { loading: loadLoading, action: loadOrder } = useAsync(async (id: string) => {
  const client = await getApiClient();
  return await client.getOrderById(id);
});

const { loading: saveLoading, action: saveOrder } = useAsync(async (order: Order) => {
  const client = await getApiClient();
  await client.updateOrder(order);
}, { notify: true, notifyTimeout: 5000 });
</script>
```

### Silent action without notifications

```typescript
const { action: silentRefresh } = useAsync(async () => {
  await refreshData();
}, { notify: false });
```

## Notes

- The wrapped `action` re-throws the original error after setting reactive state, so callers can also `try/catch` if needed.
- Error notifications are deferred via `setTimeout(0)` to allow `ErrorInterceptor` to cancel duplicates when blade banner display is active.

## Related

- [useApiClient](../useApiClient/) -- provides typed API clients to pass into useAsync
- [useLoading](../useLoading/) -- lower-level loading state primitive
