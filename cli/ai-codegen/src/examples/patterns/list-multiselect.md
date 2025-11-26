---
id: composition-list-multiselect
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, list, list]
title: "Multiselect"
description: "Multiselect composition for list blades"
---

# Multiselect Pattern

Adds row selection with bulk actions.

## Description
Provides:
- selectedItemIds tracking
- Selection change handler
- Bulk delete action
- Conditional toolbar button

## Usage
Combine with list-basic pattern. Enables multi-row selection and bulk operations.

## Code

```typescript
import { ref } from "vue";

// Selection state
const selectedItemIds = ref<string[]>([]);

// Selection handler
function onSelectionChange(selectedIds: string[]) {
  selectedItemIds.value = selectedIds;
}

// Bulk delete
async function deleteSelectedItems() {
  if (selectedItemIds.value.length === 0) return;

  const confirmed = await confirm(
    `Delete ${selectedItemIds.value.length} items?`,
    "This action cannot be undone."
  );

  if (confirmed) {
    loading.value = true;
    try {
      await deleteItems(selectedItemIds.value);
      selectedItemIds.value = [];
      await load();
    } catch (error) {
      console.error("Failed to delete items:", error);
    } finally {
      loading.value = false;
    }
  }
}
```

```vue
<!-- @vue-generic {IItem} -->
<VcTable
  :columns="columns"
  :items="items"
  :loading="loading"
  :selected-item-id="selectedItemIds"
  multiselect
  @selection-changed="onSelectionChange"
>
</VcTable>
```

```typescript
// Add to toolbar (conditional)
const deleteToolbarItem = computed<IBladeToolbar>(() => ({
  id: "delete-selected",
  title: `Delete (${selectedItemIds.value.length})`,
  icon: "material-delete",
  clickHandler: deleteSelectedItems,
  disabled: selectedItemIds.value.length === 0,
}));

bladeToolbar.value.push(deleteToolbarItem.value);
```
