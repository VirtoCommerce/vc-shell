# useApiClient

Creates a typed API client instance for communicating with VirtoCommerce platform APIs. Handles base URL resolution and authentication token injection automatically.

## When to Use

- When calling platform REST APIs from blades or composables
- When you need a typed client generated from Swagger/OpenAPI specs
- Do NOT use for third-party APIs that don't follow the `IAuthApiBase` contract

## Basic Usage

```typescript
import { useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);

// Inside an async action
const client = await getApiClient();
const order = await client.getOrderById(orderId);
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `c` | `new (baseUrl?, http?) => ApiClient` | Yes | API client constructor class (must implement `IAuthApiBase`) |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `getApiClient` | `() => Promise<ApiClient>` | Async factory that returns a configured, authenticated client instance |

## Common Patterns

### Paired with useAsync

```typescript
<script setup lang="ts">
import { useApiClient, useAsync } from "@vc-shell/framework";
import { ProductClient, Product } from "@api/catalog";

const { getApiClient } = useApiClient(ProductClient);

const { loading, action: loadProduct } = useAsync(async (id: string) => {
  const client = await getApiClient();
  return await client.getProductById(id);
});
</script>
```

### Multiple API clients in one blade

```typescript
<script setup lang="ts">
import { useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";
import { CustomerClient } from "@api/customers";

const { getApiClient: getOrderClient } = useApiClient(OrderClient);
const { getApiClient: getCustomerClient } = useApiClient(CustomerClient);
</script>
```

## Related

- [useAsync](../useAsync/) -- wraps async API calls with loading/error state
- [CLI API Client Generator](../../../../cli/) -- generates typed client classes from Swagger specs
