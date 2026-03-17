# useTableSort

Manages table sort state with three-state cycling (ASC, DESC, none) and a formatted sort expression.

## When to Use

- Control table sorting externally (e.g., pass `sortExpression` to an API query)
- Need to persist or share sort state across components
- When NOT to use: if VcTable's internal sort handling is sufficient

## Basic Usage

```typescript
import { useTableSort } from '@vc-shell/framework';

const { sortExpression, handleSortChange, resetSort } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

// Wire to VcTable
// <VcTable :sort-expression="sortExpression" @header-click="handleSortChange" />

// Use in API calls
watch(sortExpression, (sort) => {
  loadItems({ sort }); // e.g., "createdDate:DESC"
});
```

## API

### Parameters (Options)

| Option | Type | Default | Description |
|---|---|---|---|
| `initialProperty` | `string` | `null` | Column property to sort by initially |
| `initialDirection` | `"ASC" \| "DESC"` | `null` | Initial sort direction |

### Returns

| Property | Type | Description |
|---|---|---|
| `currentSort` | `WritableComputedRef<TableSortState>` | Current `{ property, direction }` state |
| `sortExpression` | `Ref<string \| undefined>` | Formatted string (e.g., `"name:ASC"`) or `undefined` when no sort |
| `handleSortChange` | `(sortParam: string) => void` | Handle column header click; accepts `"field"` or `"field:DIR"` |
| `resetSort` | `() => void` | Reset to initial sort options (or clear if none) |

## Sort Cycling

When clicking the same column without an explicit direction:
1. First click: `ASC`
2. Second click: `DESC`
3. Third click: sort cleared (`undefined`)

When clicking a new column, defaults to `ASC`.

## Related

- `VcDataTable` -- emits header-click events consumed by `handleSortChange`
- `VcTableAdapter` -- adapts legacy sort prop format
