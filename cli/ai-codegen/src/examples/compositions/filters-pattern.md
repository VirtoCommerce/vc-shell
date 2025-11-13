# Table Filters Pattern

This pattern demonstrates how to implement filters in VcTable using the staged/applied filters architecture.

## Key Concepts

1. **Staged Filters** - User's current filter selections (not yet applied)
2. **Applied Filters** - Filters that are actually used for data fetching
3. **Two-Step Process** - User stages changes, then clicks "Apply" to fetch data
4. **Better UX** - Users can modify multiple filters before triggering API calls

## How It Works

### VcTable Integration

The filter button appears in the table header when you provide a `#filters` slot:

```vue
<VcTable
  :items="items"
  :columns="columns"
  :active-filter-count="activeFilterCount"
  @search:change="onSearchChange"
>
  <template #filters>
    <!-- Filter UI goes here -->
  </template>
</VcTable>
```

**Important Props:**
- `:active-filter-count` - Displays number of active filters as a badge on the filter button
- `#filters` slot - Makes the filter button visible in the table header

## Complete Example

### Composable with Filter State Management

```typescript
// useOrdersList.ts
import { ref, computed } from "vue";

interface FilterState {
  status: string[];
  startDate?: string;
  endDate?: string;
  // Add more filter fields as needed
}

export function useOrdersList() {
  // Staged filters (user's current selections)
  const stagedFilters = ref<FilterState>({
    status: [],
    startDate: undefined,
    endDate: undefined,
  });

  // Applied filters (actually used for data fetching)
  const appliedFilters = ref<FilterState>({
    status: [],
    startDate: undefined,
    endDate: undefined,
  });

  // Check if user has made changes to filters
  const hasFilterChanges = computed(() => {
    return JSON.stringify(stagedFilters.value) !== JSON.stringify(appliedFilters.value);
  });

  // Check if any filters are currently applied
  const hasFiltersApplied = computed(() => {
    return (
      appliedFilters.value.status.length > 0 ||
      !!appliedFilters.value.startDate ||
      !!appliedFilters.value.endDate
    );
  });

  // Count active filters for badge
  const activeFilterCount = computed(() => {
    let count = 0;
    if (appliedFilters.value.status.length > 0) count++;
    if (appliedFilters.value.startDate) count++;
    if (appliedFilters.value.endDate) count++;
    return count;
  });

  // Update staged filters (does not trigger data fetch)
  function toggleFilter(filterType: string, value: string | undefined, replace = false) {
    if (replace) {
      // Replace entire value (for non-array filters like dates)
      stagedFilters.value[filterType] = value;
    } else {
      // Toggle value in array (for multi-select filters)
      const currentValues = stagedFilters.value[filterType] || [];
      if (currentValues.includes(value)) {
        stagedFilters.value[filterType] = currentValues.filter((v: string) => v !== value);
      } else {
        stagedFilters.value[filterType] = [...currentValues, value];
      }
    }
  }

  // Apply staged filters and fetch data
  async function applyFilters() {
    // Copy staged to applied
    appliedFilters.value = JSON.parse(JSON.stringify(stagedFilters.value));
    
    // Fetch data with new filters
    await loadOrders({
      ...appliedFilters.value,
      skip: 0,
    });
  }

  // Reset all filters
  async function resetFilters() {
    const emptyFilters = {
      status: [],
      startDate: undefined,
      endDate: undefined,
    };
    
    stagedFilters.value = emptyFilters;
    appliedFilters.value = emptyFilters;
    
    await loadOrders({ skip: 0 });
  }

  return {
    stagedFilters,
    appliedFilters,
    hasFilterChanges,
    hasFiltersApplied,
    activeFilterCount,
    toggleFilter,
    applyFilters,
    resetFilters,
  };
}
```

### Blade with Filters UI

```vue
<template>
  <VcBlade :title="$t('ORDERS.PAGES.LIST.TITLE')">
    <VcTable
      :items="items"
      :columns="columns"
      :active-filter-count="activeFilterCount"
      @search:change="onSearchChange"
    >
      <template #filters>
        <div class="tw-p-4">
          <VcRow class="tw-gap-16">
            <!-- Status Filter (Radio buttons) -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("ORDERS.FILTER.STATUS") }}
              </h3>
              <div class="tw-space-y-2">
                <VcRadioButton
                  v-for="status in statuses"
                  :key="status.value"
                  :model-value="stagedFilters.status[0] || ''"
                  :value="status.value"
                  :label="status.displayValue"
                  @update:model-value="toggleStatusFilter"
                />
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="tw-flex tw-flex-col">
              <h3 class="tw-text-sm tw-font-medium tw-mb-3">
                {{ $t("ORDERS.FILTER.DATE_RANGE") }}
              </h3>
              <div class="tw-space-y-3">
                <VcInput
                  v-model="stagedFilters.startDate"
                  type="date"
                  :label="$t('ORDERS.FILTER.START_DATE')"
                  @update:model-value="(v) => toggleFilter('startDate', v, true)"
                />
                <VcInput
                  v-model="stagedFilters.endDate"
                  type="date"
                  :label="$t('ORDERS.FILTER.END_DATE')"
                  @update:model-value="(v) => toggleFilter('endDate', v, true)"
                />
              </div>
            </div>
          </VcRow>

          <!-- Filter Actions -->
          <div class="tw-flex tw-gap-2 tw-mt-4">
            <VcButton
              variant="primary"
              :disabled="!hasFilterChanges"
              @click="applyFilters"
            >
              {{ $t("ORDERS.FILTER.APPLY") }}
            </VcButton>
            <VcButton
              variant="secondary"
              :disabled="!hasFiltersApplied"
              @click="resetFilters"
            >
              {{ $t("ORDERS.FILTER.RESET") }}
            </VcButton>
          </div>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script setup lang="ts">
import { default as useOrdersList } from "../composables/useOrdersList";

const {
  items,
  columns,
  stagedFilters,
  appliedFilters,
  hasFilterChanges,
  hasFiltersApplied,
  activeFilterCount,
  toggleFilter,
  applyFilters,
  resetFilters,
} = useOrdersList();

// Helper for status filter (radio button)
function toggleStatusFilter(value: string) {
  toggleFilter("status", value, true);
}
</script>
```

## Filter Types

### Radio Button Filter (Single Selection)

```vue
<VcRadioButton
  v-for="option in options"
  :key="option.value"
  :model-value="stagedFilters.fieldName[0] || ''"
  :value="option.value"
  :label="option.label"
  @update:model-value="(v) => toggleFilter('fieldName', v, true)"
/>
```

### Checkbox Filter (Multiple Selection)

```vue
<VcCheckbox
  v-for="option in options"
  :key="option.value"
  :model-value="stagedFilters.fieldName.includes(option.value)"
  :label="option.label"
  @update:model-value="(checked) => {
    if (checked) {
      stagedFilters.fieldName.push(option.value);
    } else {
      stagedFilters.fieldName = stagedFilters.fieldName.filter(v => v !== option.value);
    }
  }"
/>
```

### Date Range Filter

```vue
<VcInput
  v-model="stagedFilters.startDate"
  type="date"
  label="Start Date"
  @update:model-value="(v) => toggleFilter('startDate', v, true)"
/>
<VcInput
  v-model="stagedFilters.endDate"
  type="date"
  label="End Date"
  @update:model-value="(v) => toggleFilter('endDate', v, true)"
/>
```

### Select Filter

```vue
<VcSelect
  v-model="stagedFilters.category"
  :options="categories"
  option-value="id"
  option-label="name"
  label="Category"
  @update:model-value="(v) => toggleFilter('category', v, true)"
/>
```

## Best Practices

1. **Use staged/applied pattern** - Don't fetch data on every filter change
2. **Disable Apply button** - When no changes have been made (`!hasFilterChanges`)
3. **Disable Reset button** - When no filters are applied (`!hasFiltersApplied`)
4. **Show filter count** - Use `:active-filter-count` to display number of active filters
5. **Group related filters** - Use `VcRow` and flex columns for visual organization
6. **Add clear labels** - Use `<h3>` headers for each filter section
7. **Reset to page 0** - When applying filters, always reset pagination (`skip: 0`)
8. **Deep clone objects** - Use `JSON.parse(JSON.stringify())` to avoid reference issues

## Required i18n Keys

```json
{
  "ORDERS": {
    "FILTER": {
      "STATUS": "Status",
      "DATE_RANGE": "Date Range",
      "START_DATE": "Start Date",
      "END_DATE": "End Date",
      "APPLY": "Apply Filters",
      "RESET": "Reset Filters"
    }
  }
}
```

## Common Patterns

### Combining Filters with Search

```typescript
async function loadOrders(options = {}) {
  const params = {
    ...appliedFilters.value,
    keyword: searchKeyword.value,
    skip: 0,
    take: 20,
    ...options,
  };
  
  // Fetch data with combined filters and search
  const response = await api.getOrders(params);
  items.value = response.results;
}
```

### Persisting Filters to URL

```typescript
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Load filters from URL on mount
onMounted(() => {
  if (route.query.status) {
    stagedFilters.value.status = [route.query.status as string];
    appliedFilters.value.status = [route.query.status as string];
  }
});

// Update URL when filters change
watch(appliedFilters, (newFilters) => {
  router.replace({
    query: {
      ...route.query,
      ...newFilters,
    },
  });
}, { deep: true });
```

## Real-World Example

See `orders-list.vue` and `useOrdersListNew.ts` in the vendor-portal application for a complete, production-ready implementation.

