# useTableSelection

Manages table row selection state including multi-select, select-all, and programmatic selection.

## When to Use

- Handle selection logic for VcTable/VcDataTable outside the table component
- Need selected IDs for bulk operations (delete, export, status change)
- When NOT to use: if VcTable's built-in selection events are sufficient without external state

## Basic Usage

```typescript
import { useTableSelection } from '@vc-shell/framework';

interface Product { id: string; name: string; }

const {
  selectedItems,
  selectedIds,
  hasSelection,
  handleSelectionChange,
  handleSelectAll,
  resetSelection,
} = useTableSelection<Product>();

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

| Option | Type | Default | Description |
|---|---|---|---|
| `idField` | `keyof T \| (item: T) => string` | `"id"` | Field or function to extract item IDs |

### Returns

| Property | Type | Description |
|---|---|---|
| `selectedItems` | `Ref<T[]>` | Currently selected item objects |
| `selectedIds` | `ComputedRef<string[]>` | IDs extracted from selected items |
| `allSelected` | `Ref<boolean>` | Whether "select all" (across pages) is active |
| `selectionCount` | `ComputedRef<number>` | Number of selected items |
| `hasSelection` | `ComputedRef<boolean>` | Whether any items are selected |
| `handleSelectionChange` | `(items: T[]) => void` | Handler for `@selection-changed` |
| `handleSelectAll` | `(selected: boolean) => void` | Handler for `@select:all` |
| `resetSelection` | `() => void` | Clear all selection state |
| `isSelected` | `(item: T) => boolean` | Check if a specific item is selected |
| `selectItems` | `(items: T[]) => void` | Programmatically select items |
| `deselectByIds` | `(ids: string[]) => void` | Remove items from selection by ID |

## Related

- `VcDataTable` -- emits `selection-changed` and `select:all` events
