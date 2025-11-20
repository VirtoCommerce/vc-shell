# VcTable Generic SFC Requirements

## ⚠️ CRITICAL: VcTable is a Generic Single File Component

VcTable is a **generic SFC** that requires explicit type annotation using a special Vue comment. Without this annotation, TypeScript will not be able to infer the correct types for items and columns.

## Required Syntax

**YOU MUST add this comment on the first line of your template:**

```vue
<!-- @vue-generic {ItemType} -->
<template>
  <VcTable
    :items="items"
    :columns="columns"
  />
</template>
```

Where `{ItemType}` is replaced with your actual item interface/type name.

## Complete Examples

### Example 1: Simple List with Type

```vue
<!-- @vue-generic {IOffer} -->
<template>
  <VcBlade
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    :toolbar-items="bladeToolbar"
    v-loading="loading"
  >
    <VcTable
      :items="offers"
      :columns="columns"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
    />
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VcBlade, VcTable, IBladeToolbar } from '@vc-shell/framework';
import { useOffers } from '../composables';

interface IOffer {
  id: string;
  name: string;
  sku: string;
  price: number;
  createdDate: string;
}

const { offers, loading, totalCount, pages, currentPage } = useOffers();

const columns = computed(() => [
  { id: 'name', title: 'Name', width: 'auto', sortable: true },
  { id: 'sku', title: 'SKU', width: '150px', sortable: true },
  { id: 'price', title: 'Price', width: '120px', type: 'money' },
]);
</script>
```

### Example 2: With Custom Interface

```vue
<!-- @vue-generic {IProduct} -->
<template>
  <VcTable
    :items="products"
    :columns="columns"
    :selected-item-id="selectedItemId"
    @item-click="onItemClick"
  >
    <template #item_status="{ item }">
      <VcStatus :variant="item.status">
        {{ item.statusLabel }}
      </VcStatus>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { VcTable, VcStatus } from '@vc-shell/framework';

interface IProduct {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'disabled';
  statusLabel: string;
  createdDate: string;
}

const products = ref<IProduct[]>([]);
const selectedItemId = ref<string>();

const columns = computed(() => [
  { id: 'name', title: 'Product Name', sortable: true },
  { id: 'status', title: 'Status', width: '150px' },
  { id: 'createdDate', title: 'Created', type: 'date-ago' },
]);
</script>
```

### Example 3: With Inline Type

If you don't have a separate interface, you can use an inline type:

```vue
<!-- @vue-generic {{ id: string; name: string; email: string }} -->
<template>
  <VcTable
    :items="users"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcTable } from '@vc-shell/framework';

const users = ref([
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
]);
</script>
```

## Why is this Required?

VcTable uses Vue 3's generic component feature to provide type-safe props:

1. **Type inference for items**: TypeScript knows the exact type of each item in the array
2. **Type-safe column definitions**: Ensures column `id` matches item properties
3. **Type-safe slots**: `#item_{field}` slots receive correctly typed `item` parameter
4. **Autocomplete**: IDEs can provide autocomplete for item properties

## Common Mistakes

### ❌ WRONG: Missing Generic Comment

```vue
<template>
  <!-- Missing the @vue-generic comment! -->
  <VcTable
    :items="offers"
    :columns="columns"
  />
</template>
```

**Result**: TypeScript errors, no type inference, broken autocomplete

### ❌ WRONG: Comment in Wrong Location

```vue
<template>
  <VcBlade>
    <!-- @vue-generic {IOffer} -->  <!-- TOO LATE! -->
    <VcTable :items="offers" />
  </VcBlade>
</template>
```

**Result**: Comment must be on the FIRST line

### ❌ WRONG: Wrong Syntax

```vue
<!-- vue-generic {IOffer} -->  <!-- Missing @ symbol -->
<template>
  <VcTable :items="offers" />
</template>
```

**Result**: Won't work, must use `@vue-generic`

### ✅ CORRECT: First Line, Correct Syntax

```vue
<!-- @vue-generic {IOffer} -->
<template>
  <VcBlade>
    <VcTable :items="offers" :columns="columns" />
  </VcBlade>
</template>
```

## Template Variations

The generic comment must ALWAYS be the first line, but your template can vary:

### With VcBlade Wrapper

```vue
<!-- @vue-generic {IEntity} -->
<template>
  <VcBlade>
    <VcTable :items="entities" />
  </VcBlade>
</template>
```

### Standalone Table

```vue
<!-- @vue-generic {IItem} -->
<template>
  <VcTable :items="items" :columns="columns" />
</template>
```

### With Conditional Rendering

```vue
<!-- @vue-generic {IOrder} -->
<template>
  <div>
    <VcTable
      v-if="orders.length"
      :items="orders"
      :columns="columns"
    />
    <div v-else>No orders</div>
  </div>
</template>
```

## Type Definition Best Practices

### ✅ Use Interface (Recommended)

```typescript
interface IOffer {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: 'active' | 'pending' | 'disabled';
  createdDate: string;
}
```

Then use: `<!-- @vue-generic {IOffer} -->`

### ✅ Import from API Types

```typescript
import type { IOffer } from '@/api/offers';
```

Then use: `<!-- @vue-generic {IOffer} -->`

### ⚠️ Inline Types (Use Sparingly)

```vue
<!-- @vue-generic {{ id: string; name: string }} -->
```

Only use inline types for very simple cases or prototyping.

## Verification

After adding the generic comment, you should see:

1. ✅ No TypeScript errors in the file
2. ✅ Autocomplete works for column `id` values
3. ✅ Slot props are correctly typed
4. ✅ `vue-tsc` compilation succeeds

## Related Documentation

- [VcTable Component](../VcTable-demo.md)
- [VcTable Columns](./prop-columns.md)
- [VcTable Custom Slots](./slot-item_{fieldName}.md)
- [Vue 3 Generic Components](https://vuejs.org/api/sfc-spec.html#generic)

## Summary

**Remember:**
1. ✅ ALWAYS add `<!-- @vue-generic {Type} -->` as the FIRST line
2. ✅ Replace `{Type}` with your actual item interface name
3. ✅ Define the interface in `<script setup>` or import it
4. ✅ Run `vue-tsc` to verify types are correct
5. ❌ NEVER forget this comment - it's mandatory for VcTable!
