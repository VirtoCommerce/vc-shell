# Capability: Advanced Filters

## Type
FEATURE

## Description
Custom filter panel with staged/applied pattern

## When to Use
- Status filter
- Date range filter
- Multi-criteria filtering

## Required Props/Slots/Events
**Props:**
- `active-filter-count`
**Slots:**
- `filters`

## Related Capabilities
- Check other capabilities in this component for complementary features

## Complexity
ADVANCED

## Complete Working Example
```vue
<template>
  <VcTable
    :columns="columns"
    :items="items"
    :loading="isLoading"
    :active-filter-count="activeFilterCount"
    state-key="users-table-with-filters"
  >
    <template #filters="{ closePanel }">
      <div class="tw-p-4">
        <h3 class="tw-font-semibold tw-mb-4">Filter by Role</h3>
        <div class="tw-flex tw-flex-col tw-gap-2">
          <VcCheckbox v-for="role in allRoles" :key="role" v-model="stagedFilters.roles" :value="role">
            {{ role }}
          </VcCheckbox>
        </div>

        <div class="tw-flex tw-gap-2 tw-mt-6">
          <VcButton @click="applyFilters(closePanel)">Apply</VcButton>
          <VcButton variant="secondary" @click="resetFilters(closePanel)">
            Reset
          </VcButton>
        </div>
      </div>
    </template>
  </VcTable>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { VcTable, VcCheckbox, VcButton, type ITableColumns } from "@vc-shell/framework";

// --- Mock API ---
// This would typically be a call to an API client (e.g., using useApiClient).
// For demonstration, we simulate it with a local function.
const FAKE_DB = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Editor" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Viewer" },
  { id: "4", name: "Alice Williams", email: "alice@example.com", role: "Editor" },
  { id: "5", name: "Charlie Brown", email: "charlie@example.com", role: "Admin" },
];

async function fetchUsers(query: { roles?: string[] }) {
  console.log("Fetching users with query:", query);
  if (!query.roles || query.roles.length === 0) {
    return { results: FAKE_DB, totalCount: FAKE_DB.length };
  }
  const filtered = FAKE_DB.filter((user) => query.roles?.includes(user.role));
  return { results: filtered, totalCount: filtered.length };
}
// --- End Mock API ---

const columns = ref<ITableColumns[]>([
  { id: "name", title: "Name", sortable: true },
  { id: "email", title: "Email", sortable: true },
  { id: "role", title: "Role", sortable: true },
]);

const items = ref<any[]>([]);
const isLoading = ref(true);
const allRoles = ["Admin", "Editor", "Viewer"];

// Staged filters are bound to the UI controls in the filter panel.
const stagedFilters = ref({
  roles: [] as string[],
});

// The query object contains the currently applied filters for the API request.
const query = ref({
  roles: [] as string[],
});

const activeFilterCount = computed(() => {
  return query.value.roles.length > 0 ? 1 : 0;
});

async function loadItems() {
  isLoading.value = true;
  try {
    const response = await fetchUsers(query.value);
    items.value = response.results;
    // In a real app, you would also update pagination state here.
  } catch (e) {
    console.error("Failed to load items", e);
    items.value = []; // Clear items on error
  } finally {
    isLoading.value = false;
  }
}

function applyFilters(closePanel: () => void) {
  // 1. Copy staged filters to the main query object.
  query.value.roles = [...stagedFilters.value.roles];
  // 2. Trigger a data reload with the new query.
  loadItems();
  // 3. Close the filter panel.
  closePanel();
}

function resetFilters(closePanel: () => void) {
  // 1. Clear both staged and active query filters.
  stagedFilters.value.roles = [];
  query.value.roles = [];
  // 2. Trigger a data reload.
  loadItems();
  // 3. Close the filter panel.
  closePanel();
}

// Load initial data when the component mounts.
onMounted(() => {
  loadItems();
});
</script>
```

## Best Practices
- Use this capability when you need Status filter
- Ensure proper error handling
- Follow VC-Shell naming conventions
