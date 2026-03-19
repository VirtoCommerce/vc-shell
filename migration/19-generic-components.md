# 19. Generic Components (@vue-generic)

## What Changed

`VcTable` and other components now support Vue 3.3+ generics for full type safety in slots and events.

## Migration (Optional)

Add `<!-- @vue-generic {YourItemType} -->` above generic component usage:

```vue
<script setup lang="ts">
import { IProductAssociation } from "@vc-shell/api-client";
</script>

<template>
  <!-- @vue-generic {IProductAssociation} -->
  <VcTable
    :items="associations"
    @selection-changed="onSelectionChanged"
  >
    <template #item.quantity="{ item }">
      <!-- item is now typed as IProductAssociation -->
      <VcInput :model-value="item.quantity" />
    </template>
  </VcTable>
</template>
```

**Before (without generics):**
```vue
<VcTable :items="associations"
  @selection-changed="(items) => onSelectionChanged(items as IProductAssociation[])">
  <template #item.quantity="{ item }">
    <VcInput :model-value="(item as IProductAssociation).quantity" />
  </template>
</VcTable>
```

No casting needed with `@vue-generic`. IDE autocompletion works in slots and events.
