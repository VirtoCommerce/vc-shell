---
id: composition-list-reorderable-table
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, list, list]
title: "Reorderable Table"
description: "Reorderable Table composition for list blades"
---

# Reorderable Table Pattern

Adds drag-and-drop row reordering with save/cancel.

## Description
Provides:
- Reorder mode toggle
- Drag-drop handlers
- Order persistence
- Save/cancel actions

## Usage
Combine with list-basic pattern. Enables manual row ordering.

## Code

```typescript
import { ref, computed } from "vue";

// Reorder state
const isReorderMode = ref(false);
const originalOrder = ref<any[]>([]);
const hasUnsavedChanges = computed(() => isReorderMode.value && originalOrder.value.length > 0);

// Toggle reorder mode
function toggleReorderMode() {
  if (!isReorderMode.value) {
    // Enter reorder mode
    originalOrder.value = JSON.parse(JSON.stringify(items.value));
    isReorderMode.value = true;
  } else {
    // Exit without saving
    items.value = originalOrder.value;
    originalOrder.value = [];
    isReorderMode.value = false;
  }
}

// Handle row reorder
function onRowReorder(event: { oldIndex: number; newIndex: number }) {
  const { oldIndex, newIndex } = event;
  const itemsCopy = [...items.value];
  const [movedItem] = itemsCopy.splice(oldIndex, 1);
  itemsCopy.splice(newIndex, 0, movedItem);

  // Update order property
  itemsCopy.forEach((item, index) => {
    item.order = index + 1;
  });

  items.value = itemsCopy;
}

// Save new order
async function saveOrder() {
  loading.value = true;
  try {
    await updateItemsOrder(items.value.map(item => ({ id: item.id, order: item.order })));
    originalOrder.value = [];
    isReorderMode.value = false;
    await load();
  } catch (error) {
    console.error("Failed to save order:", error);
  } finally {
    loading.value = false;
  }
}

// Cancel reorder
function cancelReorder() {
  items.value = originalOrder.value;
  originalOrder.value = [];
  isReorderMode.value = false;
}
```

```vue
<!-- @vue-generic {IItem} -->
<VcTable
  :columns="columns"
  :items="items"
  :loading="loading"
  :reorderable="isReorderMode"
  @reorder="onRowReorder"
>
</VcTable>
```

```typescript
// Add to toolbar
const reorderToolbarItems = computed<IBladeToolbar[]>(() => {
  if (!isReorderMode.value) {
    return [
      {
        id: "reorder",
        title: "Reorder",
        icon: "material-swap_vert",
        clickHandler: toggleReorderMode,
      },
    ];
  } else {
    return [
      {
        id: "cancel-reorder",
        title: "Cancel",
        icon: "material-close",
        clickHandler: cancelReorder,
      },
      {
        id: "save-order",
        title: "Save Order",
        icon: "material-save",
        clickHandler: saveOrder,
        isAccent: true,
      },
    ];
  }
});

bladeToolbar.value.push(...reorderToolbarItems.value);
```
