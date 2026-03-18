# useLoading

Aggregates multiple reactive boolean loading refs into a single computed that is `true` when any source is loading. This is a minimal utility composable -- just one line of logic -- but it solves a very common problem in blade development: when a component depends on several async data sources, you need a single flag for the loading overlay. Instead of writing `computed(() => loadingA.value || loadingB.value || loadingC.value)` in every blade, `useLoading` provides a clean, readable shorthand that scales to any number of sources.

## When to Use

- When a component depends on several async data sources and needs a single loading indicator
- To merge loading states from multiple composables into one reactive flag for `VcBlade`'s `:loading` prop
- When NOT to use: for a single loading ref, just use it directly -- the composable adds no value with one argument

## Quick Start

```typescript
import { useLoading } from '@vc-shell/framework';

const combinedLoading = useLoading(loadingA, loadingB, loadingC);
// combinedLoading.value === true when ANY of the three is true
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `...args` | `Readonly<Ref<boolean>>[]` | Yes | One or more reactive boolean refs to aggregate. Accepts `Ref<boolean>`, `ComputedRef<boolean>`, or any `Readonly<Ref<boolean>>`. |

### Returns

| Type | Description |
|------|-------------|
| `ComputedRef<boolean>` | `true` if any of the input refs is `true`, `false` otherwise. Re-evaluates whenever any input changes. |

## How It Works

The implementation is a single `computed` that calls `Array.some()` on the input refs:

```typescript
computed(() => args.some((item) => item.value))
```

Because `computed` tracks all `.value` accesses, Vue knows to re-evaluate whenever any of the input refs changes. The `some()` short-circuits on the first `true`, so it is efficient even with many inputs.

## Recipe: Blade with Multiple Data Sources

```vue
<template>
  <VcBlade title="Order Details" :loading="isLoading">
    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
      <VcCard title="Order Info">
        <p>{{ order?.number }}</p>
      </VcCard>
      <VcCard title="Customer">
        <p>{{ customer?.name }}</p>
      </VcCard>
    </div>
    <VcDataTable :items="lineItems" :columns="columns" />
  </VcBlade>
</template>

<script setup lang="ts">
import { useLoading } from '@vc-shell/framework';
import { useOrder } from '../composables/useOrder';
import { useCustomer } from '../composables/useCustomer';
import { useLineItems } from '../composables/useLineItems';

const { order, loading: orderLoading } = useOrder(props.orderId);
const { customer, loading: customerLoading } = useCustomer(props.customerId);
const { lineItems, loading: lineItemsLoading } = useLineItems(props.orderId);

// Single loading flag for the blade overlay
const isLoading = useLoading(orderLoading, customerLoading, lineItemsLoading);
</script>
```

## Recipe: Combining with useAsync

```typescript
import { useLoading } from '@vc-shell/framework';
import { useAsync } from '@vc-shell/framework';

const { loading: saveLoading, action: save } = useAsync(saveItem);
const { loading: deleteLoading, action: remove } = useAsync(deleteItem);
const { loading: validateLoading, action: validate } = useAsync(validateItem);

// Disable all toolbar buttons while any operation is in progress
const isBusy = useLoading(saveLoading, deleteLoading, validateLoading);
```

## Recipe: Dynamic Loading Sources

If you have a variable number of loading sources (e.g., loaded from a plugin system), collect them into an array and spread:

```typescript
import { useLoading } from '@vc-shell/framework';
import { Ref } from 'vue';

const loadingRefs: Ref<boolean>[] = [];

// Modules register their loading states
function registerLoadingSource(ref: Ref<boolean>) {
  loadingRefs.push(ref);
}

// Note: useLoading captures the refs at call time.
// Call it after all sources are registered.
const isAnyLoading = useLoading(...loadingRefs);
```

## Tips

- **Order does not matter.** `useLoading(a, b, c)` and `useLoading(c, a, b)` produce identical behavior. The result is a logical OR.
- **Zero arguments return `false`.** Calling `useLoading()` with no arguments returns a computed that is always `false`. This is technically valid but pointless.
- **Works with any `Readonly<Ref<boolean>>`.** You can pass `ComputedRef<boolean>`, `Ref<boolean>`, `ShallowRef<boolean>`, or any other reactive boolean reference.
- **Each call creates a new computed.** Unlike singleton composables, `useLoading` returns a fresh `ComputedRef` each time. This is intentional -- different blades need independent loading aggregations.

## Related

- [useAsync](../useAsync/) -- async action wrapper that produces a `loading` ref, commonly combined with `useLoading`
