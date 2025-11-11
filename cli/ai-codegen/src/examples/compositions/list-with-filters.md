# List with Custom Filters

**Pattern:** VcBlade + VcTable + filters slot

**Use:** Lists needing custom filter controls

**Based on:** orders-list.vue

## Composition

```vue
<VcBlade>
  <VcTable :active-filter-count="activeFilterCount">
    <template #filters>
      <div class="tw-p-4">
        <VcRow class="tw-gap-16">
          <!-- Status filter -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">Status</h3>
            <VcRadioButton
              v-for="status in statuses"
              :key="status.value"
              :model-value="selectedStatus"
              :value="status.value"
              :label="status.label"
              @update:model-value="toggleFilter"
            />
          </div>

          <!-- Date range filter -->
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">Date Range</h3>
            <VcInput v-model="startDate" type="date" label="From" />
            <VcInput v-model="endDate" type="date" label="To" />
          </div>
        </VcRow>

        <!-- Apply/Reset buttons -->
        <div class="tw-flex tw-gap-2 tw-mt-4">
          <VcButton variant="primary" :disabled="!hasChanges" @click="applyFilters">
            Apply
          </VcButton>
          <VcButton variant="secondary" :disabled="!hasFilters" @click="resetFilters">
            Reset
          </VcButton>
        </div>
      </div>
    </template>
  </VcTable>
</VcBlade>
```

## Filter State Management

```typescript
const stagedFilters = ref({ status: [], startDate: "", endDate: "" });
const appliedFilters = ref({});

const hasChanges = computed(() => /* compare staged vs applied */);
const activeFilterCount = computed(() => /* count applied filters */);

function toggleFilter(key: string, value: any) {
  stagedFilters.value[key] = value;
}

function applyFilters() {
  appliedFilters.value = { ...stagedFilters.value };
  loadItems({ ...appliedFilters.value });
}

function resetFilters() {
  stagedFilters.value = {};
  appliedFilters.value = {};
  loadItems({});
}
```

**Components Used:**
- VcBlade, VcTable, VcRow
- VcRadioButton, VcInput, VcButton

**Lines:** ~90

