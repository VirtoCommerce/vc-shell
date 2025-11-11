# Reorderable Table Rows

**Pattern:** VcTable with drag-and-drop reordering

**Based on:** videos-list.vue

```vue
<VcTable
  :items="sortedItems"
  reorderable-rows
  @row:reorder="handleReorder"
/>

<script setup>
const sortedItems = ref<Entity[]>([]);

function handleReorder(event: { dragIndex: number; dropIndex: number; value: Entity[] }) {
  if (event.dragIndex !== event.dropIndex) {
    // Update sortOrder for each item
    const sorted = event.value.map((item, index) => {
      item.sortOrder = index + 1;
      return item;
    });
    
    sortedItems.value = sorted;
    
    // Save to backend
    await saveSortOrder(sorted);
  }
}
</script>
```

**Props:**
- reorderable-rows

**Events:**
- @row:reorder

**Lines:** ~20

