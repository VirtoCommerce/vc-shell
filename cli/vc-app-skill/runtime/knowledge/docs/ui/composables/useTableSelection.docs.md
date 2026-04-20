# useTableSelection

Manages table row selection state including multi-select, select-all, and programmatic selection. This composable provides a complete external selection API for VcDataTable, enabling bulk operations like delete, export, or status changes on selected rows.

Selection state is tracked by item objects and their extracted IDs, making it easy to pass selected IDs to API calls while also having access to the full item data for display purposes.

## When to Use

- Handle selection logic for VcTable/VcDataTable outside the table component
- Need selected IDs for bulk operations (delete, export, status change)
- Implement toolbar buttons that act on selected rows
- When NOT to use: if VcTable's built-in selection events are sufficient without external state management

## Basic Usage

```typescript
import { useTableSelection } from "@vc-shell/framework";

interface Product {
  id: string;
  name: string;
}

const { selectedItems, selectedIds, hasSelection, handleSelectionChange, handleSelectAll, resetSelection } = useTableSelection<Product>();

// Wire to VcTable events
// <VcTable @selection-changed="handleSelectionChange" @select:all="handleSelectAll" />

// Bulk delete
async function deleteSelected() {
  await api.bulkDelete(selectedIds.value);
  resetSelection();
}
```

## API

### Parameters (Options)

| Option    | Type                             | Default | Description                           |
| --------- | -------------------------------- | ------- | ------------------------------------- |
| `idField` | `keyof T \| (item: T) => string` | `"id"`  | Field or function to extract item IDs |

### Returns

| Property                | Type                          | Description                                   |
| ----------------------- | ----------------------------- | --------------------------------------------- |
| `selectedItems`         | `Ref<T[]>`                    | Currently selected item objects               |
| `selectedIds`           | `ComputedRef<string[]>`       | IDs extracted from selected items             |
| `allSelected`           | `Ref<boolean>`                | Whether "select all" (across pages) is active |
| `selectionCount`        | `ComputedRef<number>`         | Number of selected items                      |
| `hasSelection`          | `ComputedRef<boolean>`        | Whether any items are selected                |
| `handleSelectionChange` | `(items: T[]) => void`        | Handler for `@selection-changed`              |
| `handleSelectAll`       | `(selected: boolean) => void` | Handler for `@select:all`                     |
| `resetSelection`        | `() => void`                  | Clear all selection state                     |
| `isSelected`            | `(item: T) => boolean`        | Check if a specific item is selected          |
| `selectItems`           | `(items: T[]) => void`        | Programmatically select items                 |
| `deselectByIds`         | `(ids: string[]) => void`     | Remove items from selection by ID             |

## Recipe: Bulk Action Toolbar

A common list blade pattern is showing a toolbar with bulk actions when items are selected:

```vue
<script setup lang="ts">
import { useTableSelection } from "@vc-shell/framework";
import { notification } from "@vc-shell/framework";

interface Order {
  id: string;
  number: string;
  status: string;
}

const { selectedItems, selectedIds, hasSelection, selectionCount, handleSelectionChange, resetSelection } = useTableSelection<Order>();

async function bulkChangeStatus(newStatus: string) {
  await api.bulkUpdateStatus(selectedIds.value, newStatus);
  notification(`${selectionCount.value} orders updated to ${newStatus}.`);
  resetSelection();
  await reload();
}

async function bulkExport() {
  const blob = await api.exportOrders(selectedIds.value);
  downloadFile(blob, "orders.csv");
}
</script>

<template>
  <div
    v-if="hasSelection"
    class="tw-flex tw-gap-2 tw-p-2 tw-bg-blue-50"
  >
    <span>{{ selectionCount }} selected</span>
    <button @click="bulkChangeStatus('Approved')">Approve</button>
    <button @click="bulkExport">Export CSV</button>
    <button @click="resetSelection">Clear</button>
  </div>

  <VcTable
    :items="orders"
    multiselect
    @selection-changed="handleSelectionChange"
  >
    <VcColumn
      id="number"
      header="Order #"
    />
    <VcColumn
      id="status"
      header="Status"
    />
  </VcTable>
</template>
```

## Recipe: Custom ID Field

When items use a non-standard identifier field, pass a custom `idField` option:

```typescript
interface LegacyItem {
  code: string;
  name: string;
}

// Using a field name
const selection = useTableSelection<LegacyItem>({ idField: "code" });

// Using a function for composite keys
interface CompositeItem {
  orgId: string;
  itemId: string;
}

const selection2 = useTableSelection<CompositeItem>({
  idField: (item) => `${item.orgId}:${item.itemId}`,
});
```

## Details

- **ID extraction**: Uses the `idField` option (default `"id"`) to extract string IDs from items. If the field value is not a string, the item is skipped in `selectedIds`. Use a function extractor for non-string or composite keys.
- **Select-all flag**: `allSelected` is a separate boolean that indicates cross-page selection. When `handleSelectAll(false)` is called, it also clears `selectedItems`. The flag is automatically cleared when `handleSelectionChange` receives an empty array.
- **ID lookup performance**: Internally uses a `Set` for `isSelected` checks, providing O(1) lookup per item even with large selections.

## Tips

- Always call `resetSelection()` after a successful bulk operation to clear stale selections.
- The `allSelected` flag is a hint for server-side "select all across pages" behavior. You still need to handle the actual API call differently when `allSelected` is true (e.g., pass a filter instead of IDs).
- Combine with `useTableSort` and reset selection when sort changes, since the visible rows will change.

## Related

- `VcDataTable` -- emits `selection-changed` and `select:all` events
- `useTableSort` -- often used alongside selection for list blade patterns
