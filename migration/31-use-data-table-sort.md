# 31. useDataTableSort Composable

## What Changed

A new `useDataTableSort` composable is available to replace the manual three-ref sort boilerplate that most list blade pages declare when using `VcDataTable`.

**Before** (manual boilerplate):

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const sortField = ref<string | undefined>("createdDate");
const sortOrder = ref<number>(-1); // -1 = DESC
const sortExpression = computed(() => {
  if (!sortField.value || sortOrder.value === 0) return undefined;
  return `${sortField.value}:${sortOrder.value === 1 ? "ASC" : "DESC"}`;
});
</script>

<template>
  <VcDataTable
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    :items="items"
  />
</template>
```

**After** (using `useDataTableSort`):

```vue
<script setup lang="ts">
import { useDataTableSort } from "@vc-shell/framework";

const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
</script>

<template>
  <VcDataTable
    v-model:sort-field="sortField"
    v-model:sort-order="sortOrder"
    :items="items"
  />
</template>
```

## Migration Steps

1. **Add import** — replace manual `ref`/`computed` imports with `useDataTableSort`:

   ```typescript
   // Remove:
   import { ref, computed } from "vue";
   // Add:
   import { useDataTableSort } from "@vc-shell/framework";
   ```

2. **Replace the three declarations** — remove `sortField`, `sortOrder`, and `sortExpression` refs/computed and replace with a single composable call:

   ```typescript
   // Remove:
   const sortField = ref<string | undefined>("createdDate");
   const sortOrder = ref<number>(-1);
   const sortExpression = computed(() => { /* ... */ });

   // Add:
   const { sortField, sortOrder, sortExpression } = useDataTableSort({
     initialField: "createdDate",
     initialDirection: "DESC",
   });
   ```

3. **Template unchanged** — `v-model:sort-field` and `v-model:sort-order` bindings remain identical.

4. **Watch unchanged** — any existing `watch(sortExpression, ...)` calls continue to work without modification.

## Behavioral Note

`sortExpression` returns `undefined` when `sortOrder` is `0` (no active sort). Older hand-written boilerplate sometimes mapped `sortOrder === 0` to `"DESC"` as a fallback. If your API call relies on that fallback, set `initialDirection: "DESC"` in the options instead of relying on the zero case.

## When NOT to Migrate

If you are using legacy `VcTable` or `VcTableAdapter` with the `@header-click` event, keep using [`useTableSort`](../framework/ui/composables/useTableSort.docs.md). The `useDataTableSort` composable is designed exclusively for `VcDataTable`'s `v-model:sort-field` / `v-model:sort-order` API.

## How to Find

```bash
# Find files with manual sortOrder ref that may benefit from useDataTableSort
grep -rn 'sortOrder.*ref.*<1\|sortOrder.*ref(1)\|sortOrder.*ref(-1)' src/ --include="*.vue"

# Find files already using v-model:sort-field (likely candidates)
grep -rn 'v-model:sort-field' src/ --include="*.vue"
```
