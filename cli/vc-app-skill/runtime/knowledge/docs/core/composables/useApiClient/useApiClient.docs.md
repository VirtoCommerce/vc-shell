# useApiClient

Creates a typed API client instance for communicating with VirtoCommerce platform APIs. The composable accepts a generated client class constructor and returns an async factory function that produces a configured, authenticated client. Base URL resolution and authentication token injection are handled automatically.

## When to Use

- Instantiate a generated VirtoCommerce API client with automatic authentication and base-URL resolution
- Pair with `useAsync` for loading/error state on every API call in a blade or composable
- When NOT to use: for third-party or non-platform APIs that do not extend `AuthApiBase` -- use `fetch` or Axios directly

## Quick Start

```typescript
<script setup lang="ts">
import { useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);

async function loadOrder(orderId: string) {
  const client = await getApiClient();
  const order = await client.getOrderById(orderId);
  return order;
}
</script>
```

## The useApiClient + useAsync Pattern

The standard pattern for API calls in blades combines `useApiClient` with `useAsync`. This gives you automatic loading state, error handling, and a clean async action:

```typescript
<script setup lang="ts">
import { useApiClient, useAsync } from "@vc-shell/framework";
import { ProductClient, Product } from "@api/catalog";

const { getApiClient } = useApiClient(ProductClient);

const product = ref<Product>();

const { loading, error, action: loadProduct } = useAsync(async (id: string) => {
  const client = await getApiClient();
  product.value = await client.getProductById(id);
});

const { loading: saving, action: saveProduct } = useAsync(async () => {
  const client = await getApiClient();
  await client.updateProduct(product.value);
});

// Load on mount
onMounted(() => loadProduct(props.param));
</script>

<template>
  <VcBlade :loading="loading">
    <!-- blade content -->
    <template #toolbar>
      <VcButton :loading="saving" @click="saveProduct">Save</VcButton>
    </template>
  </VcBlade>
</template>
```

The `loading` ref is `true` while the request is in-flight. The `error` ref captures any thrown error. The `action` function is the wrapped async function you call to trigger the request.

## Multiple API Clients in One Blade

When a blade needs data from multiple platform modules, create multiple client instances using destructuring aliases:

```typescript
<script setup lang="ts">
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";
import { CustomerClient } from "@api/customers";
import { InventoryClient } from "@api/inventory";

const { getApiClient: getOrderClient } = useApiClient(OrderClient);
const { getApiClient: getCustomerClient } = useApiClient(CustomerClient);
const { getApiClient: getInventoryClient } = useApiClient(InventoryClient);

const { action: loadOrderDetails } = useAsync(async (orderId: string) => {
  const orderClient = await getOrderClient();
  const customerClient = await getCustomerClient();

  const order = await orderClient.getOrderById(orderId);
  const customer = await customerClient.getCustomerById(order.customerId);

  return { order, customer };
});
</script>
```

## Search and Pagination

API clients generated from VirtoCommerce platform endpoints follow a consistent search pattern with `SearchCriteria` objects:

```typescript
<script setup lang="ts">
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OrderClient, OrderSearchCriteria, OrderSearchResult } from "@api/orders";

const { getApiClient } = useApiClient(OrderClient);
const searchResult = ref<OrderSearchResult>();

const { loading, action: searchOrders } = useAsync(async (keyword?: string) => {
  const client = await getApiClient();
  searchResult.value = await client.searchOrders({
    keyword,
    skip: 0,
    take: 20,
    sort: "createdDate:DESC",
  } as OrderSearchCriteria);
});

// Trigger search
searchOrders();
</script>
```

## CRUD Operations Pattern

A complete CRUD composable for a domain entity:

```typescript
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useApiClient, useAsync, useToolbar } from "@vc-shell/framework";
import { ProductClient, Product } from "@api/catalog";

const props = defineProps<{ param: string }>();

const { getApiClient } = useApiClient(ProductClient);
const { registerToolbarItem, updateToolbarItem } = useToolbar();
const product = ref<Product>();

// Load
const { loading, action: load } = useAsync(async () => {
  const client = await getApiClient();
  product.value = await client.getProductById(props.param);
});

// Save
const { loading: saving, action: save } = useAsync(async () => {
  const client = await getApiClient();
  product.value = await client.updateProduct(product.value);
});

// Delete
const { loading: deleting, action: remove } = useAsync(async () => {
  const client = await getApiClient();
  await client.deleteProducts([props.param]);
});

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  priority: 100,
});

registerToolbarItem({
  id: "refresh",
  title: "Refresh",
  icon: "fas fa-sync",
  clickHandler: () => load(),
  priority: 50,
});

watch([saving, deleting, loading], ([s, d, l]) => {
  updateToolbarItem("save", { disabled: s || d || l });
});

onMounted(() => load());
</script>
```

## Recipes

### Parallel API Requests

When you need data from multiple endpoints simultaneously, use `Promise.all`:

```typescript
const { action: loadDashboardData } = useAsync(async () => {
  const orderClient = await getOrderClient();
  const customerClient = await getCustomerClient();

  const [orders, customers] = await Promise.all([orderClient.searchOrders({ take: 5, sort: "createdDate:DESC" }), customerClient.searchCustomers({ take: 5, sort: "createdDate:DESC" })]);

  recentOrders.value = orders.results ?? [];
  recentCustomers.value = customers.results ?? [];
});
```

### Error Handling with User Feedback

```typescript
import { useApiClient, useAsync, useNotifications } from "@vc-shell/framework";

const { getApiClient } = useApiClient(OrderClient);
const notification = useNotifications();

const { action: save } = useAsync(async () => {
  try {
    const client = await getApiClient();
    await client.updateOrder(order.value);
    notification.success("Order saved successfully");
  } catch (e) {
    notification.error("Failed to save order");
    throw e; // re-throw so useAsync captures it in the error ref
  }
});
```

## Common Mistakes

### Calling getApiClient at the top level

```typescript
// Wrong -- getApiClient is async, cannot be awaited at module scope
const client = await getApiClient(); // breaks setup flow

async function loadData() {
  const result = await client.search(); // stale client reference
}

// Correct -- call getApiClient inside each async function
async function loadData() {
  const client = await getApiClient();
  const result = await client.search();
}
```

### Forgetting to alias when using multiple clients

```typescript
// Wrong -- second destructuring shadows the first
const { getApiClient } = useApiClient(OrderClient);
const { getApiClient } = useApiClient(CustomerClient); // shadows!

// Correct -- use destructuring aliases
const { getApiClient: getOrderClient } = useApiClient(OrderClient);
const { getApiClient: getCustomerClient } = useApiClient(CustomerClient);
```

### Using useApiClient for non-platform APIs

```typescript
// Wrong -- useApiClient expects the IAuthApiBase contract
import { ExternalWeatherService } from "./weather";
const { getApiClient } = useApiClient(ExternalWeatherService); // type error

// Correct -- use fetch or axios directly for third-party APIs
const response = await fetch("https://api.weather.com/forecast");
```

## API Reference

### Parameters

| Parameter | Type                                                                                                             | Required | Description                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `c`       | `new (baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) => ApiClient` | Yes      | API client constructor class. Must implement `IAuthApiBase`. |

### Returns: `UseApiClientReturn<ApiClient>`

| Property       | Type                       | Description                                                            |
| -------------- | -------------------------- | ---------------------------------------------------------------------- |
| `getApiClient` | `() => Promise<ApiClient>` | Async factory that returns a configured, authenticated client instance |

### IAuthApiBase Interface

All generated API client classes implement this interface:

| Property / Method | Type                                              | Description                   |
| ----------------- | ------------------------------------------------- | ----------------------------- |
| `authToken`       | `string`                                          | Current authentication token  |
| `setAuthToken`    | `(token: string) => void`                         | Sets the authentication token |
| `getBaseUrl`      | `(defaultUrl: string, baseUrl: string) => string` | Resolves the API base URL     |

### Generated Client Classes

API clients are generated from Swagger/OpenAPI specs using the `@vc-shell/api-client-generator` CLI tool. Each generated class:

- Extends the `IAuthApiBase` contract
- Provides typed methods matching the platform API endpoints
- Accepts a `baseUrl` and optional `http` client in the constructor
- Automatically serializes/deserializes request and response bodies

## Related

- [useAsync](../useAsync/) -- wraps async API calls with loading/error state management
- [CLI API Client Generator](../../../../cli/) -- generates typed client classes from Swagger specs
- [useToolbar](../useToolbar/) -- disable toolbar buttons during API calls using the loading ref
- [useNotifications](../useNotifications/) -- display success/error messages after API operations
