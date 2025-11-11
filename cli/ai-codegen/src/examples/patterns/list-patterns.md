# List Blade Template Selection Guide

This guide helps you choose the right list blade template for your requirements.

## Available Templates

### 1. list-simple.vue (150 lines) - Basic CRUD List

**Use when:**
- Simple entity list with basic columns (< 5 columns)
- Standard toolbar (refresh, add)
- No complex filters or search
- Basic sorting and pagination

**Features:**
- ✅ VcBlade + VcTable
- ✅ Basic toolbar (refresh, add actions)
- ✅ Column sorting
- ✅ Pagination
- ✅ Empty state
- ✅ Item click navigation to details
- ✅ Simple composable integration

**Based on:** `team-list.vue` from vendor-portal

**Example Use Cases:**
- Team members list
- Simple product catalog
- Basic customer list
- Category list

**Complexity:** Basic  
**Estimated adaptation time:** 10-15 minutes

---

### 2. list-filters.vue (290 lines) - List with Custom Filters

**Use when:**
- Need custom filter controls (radio buttons, date ranges)
- Multiple filter criteria (status, date range, etc.)
- Filter state management (staged vs applied)
- Search with debounce

**Features:**
- ✅ All features from list-simple
- ✅ Custom `<template #filters>` slot
- ✅ VcRadioButton for status filtering
- ✅ VcInput date range filters
- ✅ Apply/Reset filter buttons
- ✅ Active filter count badge
- ✅ Filter state tracking (staged vs applied)
- ✅ Custom table column templates

**Based on:** `orders-list.vue` from vendor-portal

**Example Use Cases:**
- Orders list with status/date filters
- Reports with date range selection
- Content list with category/status filters
- Transactions with date/status filtering

**Requires:**
- StatusBadge component (if using status column)
- Filter composable logic in useEntityList

**Complexity:** Medium  
**Estimated adaptation time:** 20-30 minutes

---

### 3. list-multiselect.vue (330 lines) - List with Bulk Operations

**Use when:**
- Need bulk delete or bulk actions
- Multiselect rows with select all
- Item-level action menu (dropdown)
- Notification handling for CRUD events

**Features:**
- ✅ All features from list-simple
- ✅ Multiselect with `select-all` support
- ✅ Bulk action toolbar button (disabled when no selection)
- ✅ Item action builder with dropdown menu
- ✅ Selection tracking (`selectedEntityIds`, `allSelected`)
- ✅ Notification system integration
- ✅ Confirmation dialogs for bulk delete
- ✅ Smart pagination after delete

**Based on:** `offers-list.vue` from vendor-portal

**Example Use Cases:**
- Offers management with bulk delete
- Products with bulk enable/disable
- User management with bulk actions
- Content moderation with bulk approve/reject

**Requires:**
- Bulk delete confirmation
- Notification handling
- Selection state management

**Complexity:** Advanced  
**Estimated adaptation time:** 30-40 minutes

---

## Decision Tree

```
Do you need bulk actions (delete multiple items)?
├─ YES → list-multiselect.vue
└─ NO
    ├─ Do you need custom filters (date range, status, etc.)?
    │   ├─ YES → list-filters.vue
    │   └─ NO → list-simple.vue
```

## Common Adaptations

### For All Templates

1. **Entity Renaming:**
   - Replace `Entity` with your entity name (e.g., `Product`, `Order`, `Vendor`)
   - Replace `entity` with lowercase version
   - Replace `ENTITIES` with uppercase in i18n keys

2. **Columns Configuration:**
```typescript
const columns = computed((): ITableColumns[] => [
  {
    id: "name",
    title: t("YOUR_MODULE.PAGES.LIST.TABLE.HEADER.NAME"),
    sortable: true,
    alwaysVisible: true,
  },
  // Add your columns here
]);
```

3. **Toolbar Actions:**
   - Keep refresh (almost always needed)
   - Keep add (if creating new entities)
   - Add custom actions as needed

4. **Empty/NotFound States:**
```typescript
const empty = {
  icon: "material-your-icon",
  text: computed(() => t("YOUR_MODULE.PAGES.LIST.EMPTY.NO_ITEMS")),
  action: computed(() => t("YOUR_MODULE.PAGES.LIST.EMPTY.ADD")),
  clickHandler: addEntity,
};
```

### For list-filters Template

**Customize filters slot:**

```vue
<template #filters>
  <div class="tw-p-4">
    <VcRow class="tw-gap-16">
      <!-- Add your custom filters here -->
      <div class="tw-flex tw-flex-col">
        <h3 class="tw-text-sm tw-font-medium tw-mb-3">
          {{ $t("YOUR_MODULE.PAGES.LIST.TABLE.FILTER.YOUR_FILTER.TITLE") }}
        </h3>
        <!-- Radio buttons, inputs, selects, etc. -->
      </div>
    </VcRow>

    <!-- Apply/Reset buttons - keep as-is -->
    <div class="tw-flex tw-gap-2 tw-mt-4">
      <VcButton variant="primary" :disabled="!hasFilterChanges" @click="applyFilters">
        {{ $t("COMMON.APPLY") }}
      </VcButton>
      <VcButton variant="secondary" :disabled="!hasFiltersApplied" @click="resetFilters">
        {{ $t("COMMON.RESET") }}
      </VcButton>
    </div>
  </div>
</template>
```

### For list-multiselect Template

**Customize action builder:**

```typescript
const actionBuilder = (): IActionBuilderResult[] => {
  return [
    {
      icon: "material-delete",
      title: "Delete",
      type: "danger",
      async clickHandler(item: YourEntity) {
        // Add item to selection
        if (item.id && !selectedEntityIds.value.includes(item.id)) {
          selectedEntityIds.value.push(item.id);
        }
        await removeEntities();
        selectedEntityIds.value = [];
      },
    },
    // Add more item actions here
  ];
};
```

## Custom Slot Components

When your template needs custom column rendering, create components in your module's `/components` directory.

**Real examples from vendor-portal:**

**Status Display:**
```vue
<!-- Create OrderStatus.vue in /components -->
<template>
  <VcStatus v-bind="statusStyle(status)" :dot="$isMobile.value">
    {{ status }}
  </VcStatus>
</template>

<script setup>
const statusStyle = (status: string | undefined) => {
  // Map status to VcStatus variant
  switch (status) {
    case "Active": return { variant: "success", outline: false };
    case "Pending": return { variant: "warning", outline: true };
    // ... add your statuses
    default: return { variant: "info", outline: true };
  }
};
</script>

<!-- Use in blade -->
<template #item_status="{ item }">
  <OrderStatus :status="item.status" />
</template>
```

**Image Display:**
```vue
<!-- Use VcImage for single images -->
<template #item_image="{ item }">
  <VcImage :src="item.imageUrl" size="s" bordered aspect="1x1" />
</template>

<!-- For complex image grids, create custom component like OrderLineItemsImgTemplateNew.vue -->
```

**See `vcshell://component-templates` for status-badge.vue example.**

## Quality Checklist

After adapting template:

- [ ] Entity names renamed throughout
- [ ] Column definitions match your data model
- [ ] i18n keys updated
- [ ] Types imported correctly
- [ ] Composable name updated (useEntityList)
- [ ] Empty/notfound states customized
- [ ] Toolbar actions appropriate for your entity
- [ ] Mobile column positions set (if using mobile)
- [ ] Sort expression matches available columns
- [ ] Custom components created and imported (if using slots)

## Tips

1. **Don't rewrite the template** - adapt it. Templates are production-tested.
2. **Keep the event handler structure** - they handle edge cases correctly.
3. **Preserve watchers** - they manage reactive state dependencies.
4. **Use mobile positions** - they make tables responsive automatically.
5. **Test empty/search states** - they're often forgotten but important for UX.

## Next Steps

After creating blade:
1. Create corresponding composable (useEntityList)
2. Create i18n translations
3. Register module in main.ts (AI does this automatically)
4. Test all CRUD operations
5. Verify filters/multiselect work correctly

