---
title: useApiClient
category: composables
group: data
---

# useApiClient

Creates a typed API client instance for communicating with VirtoCommerce platform APIs. The composable accepts a generated client class constructor (extending `AuthApiBase`) and returns an async factory function that produces a client instance. The composable itself is intentionally thin — it constructs the client and returns it. Platform authentication flows through the session cookie that the browser replays on every same-origin API call; the framework's fetch wrapper enforces timeout, offline checks, and 401-redirect on top.

!!! tip "Always call getApiClient inside async functions"
`getApiClient` is async. Never call it at the top level of `<script setup>` — call it inside the async function you pass to `useAsync`. Holding one client instance for the lifetime of the component couples your code to a single object across action runs; prefer one `await getApiClient()` per action so the call shape stays uniform with `useAsync`.

## When to Use

- Instantiate a generated VirtoCommerce API client that extends `AuthApiBase`
- Pair with `useAsync` for loading/error state on every API call in a blade or composable
- When NOT to use: for third-party or non-platform APIs that do not extend `AuthApiBase` -- use `fetch` or Axios directly

## Quick Start

The canonical place to call `useApiClient` is at the top of a domain composable file. The factory is created once per module-scope; every action that needs the client awaits `getApiClient()` from the same closure.

```typescript title="modules/orders/composables/useOrder/index.ts"
// pseudo-code: replace OrderClient with your generated API client
import { useApiClient, useAsync } from "@vc-shell/framework";
import { OrderClient, type Order } from "@api/orders";
import { ref } from "vue";

export function useOrder() {
  const { getApiClient } = useApiClient(OrderClient);
  const item = ref<Order>();

  const { action: loadItem, loading } = useAsync<{ id: string }>(async ({ id }) => {
    const client = await getApiClient();
    item.value = await client.getOrderById(id);
  });

  return { item, loading, loadItem };
}
```

If you call `useApiClient` inside a blade's `<script setup>` directly, the same shape works. The composable pattern above is preferred because it keeps API access encapsulated behind a domain interface that the blade consumes.

```vue title="modules/orders/pages/order-details.vue"
<script setup lang="ts">
import { useOrder } from "../composables/useOrder";

const { item, loading, loadItem } = useOrder();
onMounted(() => loadItem({ id: param.value }));
</script>
```

## The useApiClient + useAsync Pattern

The standard pattern for API calls in blades combines `useApiClient` with `useAsync`. This gives you automatic loading state, error handling, and a clean async action:

```typescript
// pseudo-code: replace ProductClient with your generated API client
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
// pseudo-code: replace these clients with your generated API clients
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
// pseudo-code: replace OrderClient with your generated API client
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

A complete CRUD composable for a domain entity. The toolbar is declared as a plain `IBladeToolbar[]` array and bound via `<VcBlade :toolbar-items>`; reactive `disabled` follows the `loading` refs directly, without a `watch`/`updateToolbarItem` pair:

```vue
<!-- pseudo-code: replace ProductClient with your generated API client -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useApiClient, useAsync, VcBlade, type IBladeToolbar } from "@vc-shell/framework";
import { ProductClient, type Product } from "@api/catalog";

const props = defineProps<{ param: string }>();

const { getApiClient } = useApiClient(ProductClient);
const product = ref<Product>();

const { loading, action: load } = useAsync(async () => {
  const client = await getApiClient();
  product.value = await client.getProductById(props.param);
});

const { loading: saving, action: save } = useAsync(async () => {
  const client = await getApiClient();
  product.value = await client.updateProduct(product.value);
});

const { loading: deleting, action: remove } = useAsync(async () => {
  const client = await getApiClient();
  await client.deleteProducts([props.param]);
});

const busy = computed(() => saving.value || deleting.value || loading.value);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "fas fa-save",
    clickHandler: () => save(),
    disabled: busy,
  },
  {
    id: "refresh",
    title: "Refresh",
    icon: "fas fa-sync",
    clickHandler: () => load(),
    disabled: busy,
  },
]);

onMounted(() => load());
</script>

<template>
  <VcBlade
    :loading="loading"
    :toolbar-items="bladeToolbar"
  />
</template>
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

All generated API client classes extend `AuthApiBase`, which conforms to this interface:

| Property / Method | Type                                              | Description                   |
| ----------------- | ------------------------------------------------- | ----------------------------- |
| `authToken`       | `string`                                          | Current authentication token  |
| `setAuthToken`    | `(token: string) => void`                         | Sets the authentication token |
| `getBaseUrl`      | `(defaultUrl: string, baseUrl: string) => string` | Resolves the API base URL     |

The interface is the public contract used by `useApiClient`'s type parameter. In the everyday flow, application code does not call `setAuthToken` — `useApiClient` constructs the client with no arguments, the `authToken` field stays empty, and authentication flows through the session cookie attached by the browser to each same-origin `/api/*` request. `setAuthToken` is the explicit-token path consumed by code that needs to attach a token directly (for example, when calling the API from a context where the cookie is unavailable).

### Generated Client Classes

API clients are generated from Swagger/OpenAPI specs using the `@vc-shell/api-client-generator` CLI tool. Each generated class:

- Extends the `IAuthApiBase` contract
- Provides typed methods matching the platform API endpoints
- Accepts a `baseUrl` and optional `http` client in the constructor
- Automatically serializes/deserializes request and response bodies

## Related

- [`useAsync`](../useAsync/) -- wraps async API calls with loading/error state management
- CLI API Client Generator (`@vc-shell/api-client-generator`) -- generates typed client classes from Swagger specs
- Blade toolbar — declare as `ref<IBladeToolbar[]>([...])` and bind via `<VcBlade :toolbar-items>`; see [`useToolbar`](../useToolbar/) for the advanced dynamic-registration API
- [`useNotifications`](../useNotifications/) -- display success/error messages after API operations
