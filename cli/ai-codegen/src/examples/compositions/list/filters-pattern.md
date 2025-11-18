# Filters Pattern

Adds filter panel with staged/applied filter state management.

## Description
Provides:
- Filter slot in VcBlade with VcContainer
- Staged filters (edited but not applied)
- Applied filters (active in data loading)
- Apply/Clear handlers

## Usage
Combine with list-basic pattern. Adds filter state management and UI.

## Code

```typescript
import { ref } from "vue";

// Filter state
const stagedFilters = ref<Record<string, unknown>>({});
const appliedFilters = ref<Record<string, unknown>>({});

// Filter handlers
function onApplyFilters() {
  appliedFilters.value = { ...stagedFilters.value };
  currentPage.value = 1; // Reset to first page
  load();
}

function onClearFilters() {
  stagedFilters.value = {};
  appliedFilters.value = {};
  currentPage.value = 1;
  load();
}
```

```vue
<template #filter>
  <VcContainer>
    <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-p-4">
      <VcInput
        v-model="stagedFilters.keyword"
        :label="$t('FILTERS.KEYWORD')"
        :placeholder="$t('FILTERS.KEYWORD_PLACEHOLDER')"
        clearable
      />

      <VcSelect
        v-model="stagedFilters.status"
        :label="$t('FILTERS.STATUS')"
        :placeholder="$t('FILTERS.STATUS_PLACEHOLDER')"
        :options="statusOptions"
        clearable
      />
    </div>

    <div class="tw-flex tw-justify-end tw-gap-2 tw-p-4 tw-border-t tw-border-solid tw-border-[#e3e7ec]">
      <VcButton @click="onClearFilters" variant="outline">
        {{ $t("FILTERS.CLEAR") }}
      </VcButton>
      <VcButton @click="onApplyFilters">
        {{ $t("FILTERS.APPLY") }}
      </VcButton>
    </div>
  </VcContainer>
</template>
```

```typescript
import { VcContainer, VcInput, VcSelect, VcButton } from "@vc-shell/framework";

// Add to toolbar
bladeToolbar.value.push({
  id: "filter",
  title: "Filter",
  icon: "fas fa-filter",
  isAccent: true,
});

// Status options example
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];
```
