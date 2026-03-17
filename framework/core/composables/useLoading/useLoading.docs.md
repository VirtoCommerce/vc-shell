# useLoading

Aggregates multiple reactive boolean loading refs into a single computed that is `true` when any source is loading. A minimal utility for combining loading states from multiple async operations.

## When to Use

- When a component depends on several async data sources and needs a single loading indicator
- To merge loading states from multiple composables into one reactive flag
- When NOT to use: for a single loading ref, just use it directly

## Basic Usage

```typescript
import { useLoading } from '@vc-shell/framework';

const combinedLoading = useLoading(loadingA, loadingB, loadingC);
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `...args` | `Readonly<Ref<boolean>>[]` | Yes | One or more reactive boolean refs to aggregate |

### Returns

| Type | Description |
|------|-------------|
| `ComputedRef<boolean>` | `true` if any of the input refs is `true`, `false` otherwise |

## Common Patterns

### Combining loading states in a blade

```vue
<template>
  <VcBlade :loading="isLoading">
    <!-- blade content -->
  </VcBlade>
</template>

<script setup lang="ts">
import { useLoading } from '@vc-shell/framework';
import { useProducts } from '../composables/useProducts';
import { useCategories } from '../composables/useCategories';

const { loading: productsLoading } = useProducts();
const { loading: categoriesLoading } = useCategories();

const isLoading = useLoading(productsLoading, categoriesLoading);
</script>
```

### With useAsync results

```typescript
import { useLoading } from '@vc-shell/framework';
import { useAsync } from '@vc-shell/framework';

const { loading: saveLoading, action: save } = useAsync(saveItem);
const { loading: deleteLoading, action: remove } = useAsync(deleteItem);

const isBusy = useLoading(saveLoading, deleteLoading);
```

## Related

- [useAsync](../useAsync/) -- async action wrapper that produces a `loading` ref
