---
id: useTableSort-with-pagination
type: FRAMEWORK_API
category: composable
tags: [composable, table, sorting, pagination]
complexity: MODERATE
title: "useTableSort - Sorting with Pagination"
description: "Combining sorting with paginated data loading"
---

# useTableSort - Sorting with Pagination

Always pass current sort expression when loading paginated data.

## Complete Example (from vendor-portal team-list.vue)

```vue
<script setup lang="ts">
import { useTableSort } from '@vc-shell/framework';

const { sortExpression, handleSortChange } = useTableSort({
  initialProperty: 'createdDate',
  initialDirection: 'DESC',
});

const { items, searchQuery, getTeamMembers } = useTeamMembers();

// Reload data when sort changes
watch(sortExpression, async (value) => {
  await getTeamMembers({ ...searchQuery.value, sort: value });
});

// Pagination handler - preserve sort
async function onPaginationClick(page: number) {
  await getTeamMembers({
    ...searchQuery.value,
    skip: (page - 1) * 20,
    sort: sortExpression.value,  // ✅ Include sort
  });
}

// Header click handler
function onHeaderClick(column: ITableColumns) {
  if (column.sortable) {
    handleSortChange(column.id);
  }
}
</script>
```

## Key Pattern

✅ **ALWAYS** include `sort: sortExpression.value` in API calls:
- Initial load
- Pagination
- Search
- Filters

This ensures consistent sorting across all operations.
