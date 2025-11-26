---
id: vctable-feature-filters
component: VcTable
type: FEATURE
complexity: MODERATE
category: component
tags: [filters, staged-filters, applied-filters]
title: "VcTable - Advanced Filters"
description: "Custom filter panel with staged/applied pattern for VcTable"
---

# Capability: Advanced Filters

## Type
FEATURE

## Description
Custom filter panel with staged/applied filter state management pattern. Allows users to modify filter criteria without immediately applying them, providing better UX with explicit Apply/Reset actions.

## When to Use
- Status filters (radio buttons, select, checkboxes)
- Date range filters
- Multi-criteria filtering
- Any scenario where users need to stage multiple filter changes before applying

## Required Props/Slots/Events
**Props:**
- `active-filter-count` - Number of active filters (drives filter badge display)

**Slots:**
- `filters` - Custom filter panel content

## Related Capabilities
- `prop-activeFilterCount.md` - Filter count prop
- `slot-filters.md` - Filter slot reference

## Complexity
MODERATE

## Pattern Overview

The staged/applied filter pattern separates:
1. **Staged filters** - User's current selections in the filter panel (not yet applied)
2. **Applied filters** - Filters actually used in data loading
3. **Filter state helpers** - `hasFilterChanges`, `hasFiltersApplied`, `activeFilterCount`

This pattern is typically implemented in a composable (e.g., `useEntityList`).

## Complete Working Example

### Template Structure

```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :total-label="$t('ENTITIES.PAGES.LIST.TABLE.TOTALS')"
    :items="items"
    :columns="columns"
    :total-count="totalCount"
    :pages="pages"
    :current-page="currentPage"
    :loading="loading"
    :active-filter-count="activeFilterCount"
    state-key="entities-table"
  >
    <template #filters>
      <div class="tw-p-4">
        <VcRow class="tw-gap-16">
          <!-- Status Filter Example -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">
              {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.STATUS.TITLE") }}
            </h3>
            <div class="tw-space-y-2">
              <VcRadioButton
                v-for="status in statuses"
                :key="status.value"
                :model-value="stagedFilters.status[0] || ''"
                :value="status.value"
                :label="status.displayValue"
                @update:model-value="(value) => toggleFilter('status', value, true)"
              >
              </VcRadioButton>
            </div>
          </div>

          <!-- Date Range Filter Example -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">
              {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.TITLE") }}
            </h3>
            <div class="tw-space-y-3">
              <VcInput
                v-model="stagedFilters.startDate"
                type="date"
                :label="$t('ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.START_DATE')"
                @update:model-value="(value: string) => toggleFilter('startDate', String(value || ''), true)"
              />
              <VcInput
                v-model="stagedFilters.endDate"
                type="date"
                :label="$t('ENTITIES.PAGES.LIST.TABLE.FILTER.DATE.END_DATE')"
                @update:model-value="(value: string) => toggleFilter('endDate', String(value || ''), true)"
              />
            </div>
          </div>
        </VcRow>

        <!-- Filter Controls (Apply/Reset buttons) -->
        <div class="tw-flex tw-gap-2 tw-mt-4">
          <VcButton
            variant="primary"
            :disabled="!hasFilterChanges"
            @click="applyFilters"
          >
            {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.APPLY") }}
          </VcButton>

          <VcButton
            variant="secondary"
            :disabled="!hasFiltersApplied"
            @click="resetFilters"
          >
            {{ $t("ENTITIES.PAGES.LIST.TABLE.FILTER.RESET") }}
          </VcButton>
        </div>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcTable, VcRadioButton, VcInput, VcButton, VcRow, type ITableColumns } from "@vc-shell/framework";
import { useEntityList } from "../composables";

// Composable with filter state management
const {
  items,
  totalCount,
  pages,
  currentPage,
  loading,
  statuses,
  stagedFilters,
  appliedFilters,
  hasFilterChanges,
  hasFiltersApplied,
  activeFilterCount,
  toggleFilter,
  applyFilters,
  resetFilters,
  loadEntities,
} = useEntityList({ pageSize: 20 });

const columns = computed((): ITableColumns[] => [
  {
    id: "name",
    title: "Name",
    sortable: true,
    alwaysVisible: true,
  },
  {
    id: "status",
    title: "Status",
    sortable: true,
  },
  {
    id: "createdDate",
    title: "Created",
    sortable: true,
    type: "date-ago",
  },
]);
</script>
```

### Composable Pattern

The filter logic should be implemented in a composable:

```typescript
// composables/useEntityList.ts
import { ref, computed, ComputedRef, Ref } from "vue";
import { useAsync, useApiClient } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface FilterState {
  status: string[];
  startDate?: string;
  endDate?: string;
  [key: string]: string[] | string | undefined;
}

export interface IUseEntityList {
  items: ComputedRef<IEntity[]>;
  totalCount: ComputedRef<number>;
  pages: ComputedRef<number>;
  currentPage: ComputedRef<number>;
  searchQuery: Ref<IEntitySearchQuery>;
  loadEntities: (query?: IEntitySearchQuery) => Promise<void>;
  loading: ComputedRef<boolean>;
  statuses: ComputedRef<Array<{ value: string | undefined; displayValue: string | undefined }>>;

  // Filters - staged/applied architecture
  stagedFilters: Ref<FilterState>;
  appliedFilters: Ref<FilterState>;
  hasFilterChanges: ComputedRef<boolean>;
  hasFiltersApplied: ComputedRef<boolean>;
  activeFilterCount: ComputedRef<number>;
  toggleFilter: (filterType: keyof FilterState, value: string, checked: boolean) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  resetSearch: () => Promise<void>;
}

export function useEntityList(options?: { pageSize?: number }): IUseEntityList {
  const { getApiClient } = useApiClient(EntityClient);
  const { t } = useI18n({ useScope: "global" });

  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<IEntitySearchQuery>({
    take: pageSize,
  });
  const searchResult = ref<EntitySearchResult>();

  const { action: loadEntities, loading: loadingEntities } = useAsync<IEntitySearchQuery>(async (_query) => {
    searchQuery.value = { ...searchQuery.value, ...(_query || {}) };

    const apiClient = await getApiClient();
    searchResult.value = await apiClient.searchEntities(searchQuery.value);
  });

  // Filter state with staged/applied architecture
  const stagedFilters = ref<FilterState>({ status: [] });
  const appliedFilters = ref<FilterState>({ status: [] });

  const hasFilterChanges = computed((): boolean => {
    // Deep comparison of filter arrays and values
    const stagedStatus = [...stagedFilters.value.status].sort();
    const appliedStatus = [...appliedFilters.value.status].sort();

    return (
      JSON.stringify(stagedStatus) !== JSON.stringify(appliedStatus) ||
      stagedFilters.value.startDate !== appliedFilters.value.startDate ||
      stagedFilters.value.endDate !== appliedFilters.value.endDate
    );
  });

  const hasFiltersApplied = computed((): boolean => {
    return (
      appliedFilters.value.status.length > 0 ||
      !!appliedFilters.value.startDate ||
      !!appliedFilters.value.endDate
    );
  });

  const activeFilterCount = computed((): number => {
    let count = 0;
    if (appliedFilters.value.status.length > 0) count++;
    if (appliedFilters.value.startDate) count++;
    if (appliedFilters.value.endDate) count++;
    return count;
  });

  const toggleFilter = (filterType: keyof FilterState, value: string, checked: boolean) => {
    if (filterType === 'status') {
      const currentFilters = [...stagedFilters.value.status];

      if (checked) {
        // For status, use radio behavior - replace all with single value
        stagedFilters.value = {
          ...stagedFilters.value,
          status: [value],
        };
      } else {
        stagedFilters.value = {
          ...stagedFilters.value,
          status: currentFilters.filter((item) => item !== value),
        };
      }
    } else if (filterType === 'startDate' || filterType === 'endDate') {
      stagedFilters.value = {
        ...stagedFilters.value,
        [filterType]: value || undefined,
      };
    }
  };

  const applyFilters = async () => {
    // Deep copy staged to applied
    appliedFilters.value = {
      status: [...stagedFilters.value.status],
      startDate: stagedFilters.value.startDate,
      endDate: stagedFilters.value.endDate,
    };

    // Convert to API query format with proper Date types
    const queryWithFilters = {
      ...searchQuery.value,
      status: appliedFilters.value.status.length > 0 ? appliedFilters.value.status[0] : undefined,
      startDate: appliedFilters.value.startDate ? new Date(appliedFilters.value.startDate) : undefined,
      endDate: appliedFilters.value.endDate ? new Date(appliedFilters.value.endDate) : undefined,
      skip: 0, // Reset pagination
    };

    await loadEntities(queryWithFilters);
  };

  const resetFilters = async () => {
    stagedFilters.value = { status: [] };
    appliedFilters.value = { status: [] };

    const queryWithoutFilters = {
      ...searchQuery.value,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      skip: 0,
    };

    await loadEntities(queryWithoutFilters);
  };

  const resetSearch = async () => {
    stagedFilters.value = { status: [] };
    appliedFilters.value = { status: [] };

    const resetQuery = {
      take: pageSize,
      skip: 0,
      keyword: "",
    };

    await loadEntities(resetQuery);
  };

  // Computed properties
  const items = computed(() => searchResult.value?.results || []);
  const totalCount = computed(() => searchResult.value?.totalCount || 0);
  const pages = computed(() => Math.ceil(totalCount.value / pageSize));
  const currentPage = computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1);
  const loading = computed(() => loadingEntities.value);

  // Status options
  const statuses = computed(() => {
    const statusEntries = Object.entries(EntityStatus);
    return statusEntries.map(([value, displayValue]) => ({
      value,
      displayValue: t(`ENTITIES.PAGES.LIST.TABLE.FILTER.STATUS.${displayValue}`),
    }));
  });

  return {
    items,
    totalCount,
    pages,
    currentPage,
    searchQuery,
    loadEntities,
    loading,
    statuses,

    // Filters
    stagedFilters,
    appliedFilters,
    hasFilterChanges,
    hasFiltersApplied,
    activeFilterCount,
    toggleFilter,
    applyFilters,
    resetFilters,
    resetSearch,
  };
}
```

## Best Practices

1. **Staged/Applied Separation**
   - Always use staged filters for UI state
   - Only apply filters to API calls after user clicks "Apply"
   - This prevents unwanted API calls on every filter change

2. **Filter State Helpers**
   - `hasFilterChanges` - Disable Apply button when no changes
   - `hasFiltersApplied` - Disable Reset button when no filters active
   - `activeFilterCount` - Show badge with number of active filters

3. **Filter Structure**
   - Use `VcRow` with `tw-gap-16` for horizontal filter layout
   - Wrap each filter group in `tw-flex tw-flex-col`
   - Use semantic headings (`h3` with `tw-text-sm tw-font-medium tw-mb-3`) for filter group titles
   - Use `tw-space-y-2` or `tw-space-y-3` for spacing within filter groups
   - Place Apply/Reset buttons at bottom with `tw-mt-4`

4. **Reset to First Page**
   - Always reset `skip: 0` when applying/resetting filters
   - Users expect to see first page of filtered results

5. **Loading States**
   - Show loading indicator while applying filters via `:loading="loading"` on VcTable
   - Disable Apply/Reset buttons during loading if needed

6. **Deep Copy for Arrays**
   - Always use spread operator for array filters: `status: [...stagedFilters.value.status]`
   - Prevents reference issues between staged and applied filters

## Full Template Reference

See [templates/list-filters.vue](../../templates/list-filters.vue) for a complete working example with all features integrated.
