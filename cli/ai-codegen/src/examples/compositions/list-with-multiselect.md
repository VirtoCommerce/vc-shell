# List with Multiselect

**Pattern:** VcBlade + VcTable + multiselect + bulk actions

**Use:** Lists needing bulk operations

**Based on:** offers-list.vue, videos-list.vue

## Composition

```vue
<VcTable
  multiselect
  select-all
  enable-item-actions
  :item-action-builder="actionBuilder"
  @selection-changed="onSelectionChanged"
  @select:all="selectAll"
/>
```

## Multiselect Implementation

```typescript
// State
const selectedIds = ref<string[]>([]);
const allSelected = ref(false);

// Toolbar with bulk delete
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "deleteSelected",
    icon: "material-delete",
    async clickHandler() {
      await deleteSelected();
    },
    disabled: computed(() => !selectedIds.value.length),
  },
]);

// Selection handlers
function onSelectionChanged(items: any[]) {
  selectedIds.value = items.map(item => item.id);
}

function selectAll(all: boolean) {
  allSelected.value = all;
}

// Item actions (dropdown per row)
const actionBuilder = (): IActionBuilderResult[] => [{
  icon: "material-delete",
  title: "Delete",
  type: "danger",
  async clickHandler(item: any) {
    selectedIds.value = [item.id];
    await deleteSelected();
  },
}];

// Bulk delete
async function deleteSelected() {
  if (await showConfirmation(`Delete ${selectedIds.value.length} items?`)) {
    await deleteItems({ ids: selectedIds.value, allSelected: allSelected.value });
    selectedIds.value = [];
    await reload();
  }
}
```

**Components Used:**
- VcBlade, VcTable

**Props:**
- multiselect, select-all, enable-item-actions, item-action-builder

**Events:**
- @selection-changed, @select:all

**Lines:** ~100

