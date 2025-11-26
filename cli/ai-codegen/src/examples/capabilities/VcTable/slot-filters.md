---
id: vctable-slot-filters
component: VcTable
type: SLOT
complexity: SIMPLE
category: component
tags: [slot, filters]
title: "VcTable #filters slot"
description: "Custom filter panel slot for VcTable"
---

# Capability: filters

## Type
SLOT

## Description
Custom filter panel slot that allows you to add filter UI controls. The slot content appears in a collapsible filter panel.

## When to Use
- Adding status filters
- Adding date range filters
- Any custom filter criteria
- Multi-criteria filtering scenarios

## Required Props/Slots/Events
**Props:**
- `active-filter-count` - Display number of active filters (optional but recommended)

**Slots:**
- `filters` - The custom filter panel content

## Related Capabilities
- `feature-filters.md` - Complete filter implementation with staged/applied pattern
- `prop-activeFilterCount.md` - Active filter count prop

## Complexity
SIMPLE

## Minimal Working Example

```vue
<template>
  <!-- @vue-generic {IItem} -->
  <VcTable
    :items="items"
    :columns="columns"
    :active-filter-count="activeFilterCount"
  >
    <template #filters>
      <div class="tw-p-4">
        <VcRow class="tw-gap-16">
          <div class="tw-flex tw-flex-col">
            <h3 class="tw-text-sm tw-font-medium tw-mb-3">
              Status
            </h3>
            <div class="tw-space-y-2">
              <VcRadioButton
                v-for="status in statuses"
                :key="status.value"
                v-model="selectedStatus"
                :value="status.value"
                :label="status.label"
              />
            </div>
          </div>
        </VcRow>

        <div class="tw-flex tw-gap-2 tw-mt-4">
          <VcButton variant="primary" @click="applyFilters">
            Apply
          </VcButton>
          <VcButton variant="secondary" @click="resetFilters">
            Reset
          </VcButton>
        </div>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTable, VcRow, VcRadioButton, VcButton } from "@vc-shell/framework";

const selectedStatus = ref("");
const activeFilterCount = ref(0);

const statuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function applyFilters() {
  activeFilterCount.value = selectedStatus.value ? 1 : 0;
  // Apply filter logic here
}

function resetFilters() {
  selectedStatus.value = "";
  activeFilterCount.value = 0;
  // Reset filter logic here
}
</script>
```

## Standard Structure

The recommended structure for the filters slot:

```vue
<template #filters>
  <div class="tw-p-4">
    <VcRow class="tw-gap-16">
      <!-- Filter groups go here -->
      <div class="tw-flex tw-flex-col">
        <h3 class="tw-text-sm tw-font-medium tw-mb-3">
          {{ Filter Title }}
        </h3>
        <div class="tw-space-y-2">
          <!-- Filter controls -->
        </div>
      </div>
    </VcRow>

    <!-- Apply/Reset buttons -->
    <div class="tw-flex tw-gap-2 tw-mt-4">
      <VcButton variant="primary" @click="applyFilters">Apply</VcButton>
      <VcButton variant="secondary" @click="resetFilters">Reset</VcButton>
    </div>
  </div>
</template>
```

## Best Practices
- Use `VcRow` with `tw-gap-16` for horizontal filter layout
- Wrap each filter group in `tw-flex tw-flex-col`
- Use consistent heading style: `tw-text-sm tw-font-medium tw-mb-3`
- Use `tw-space-y-2` or `tw-space-y-3` for spacing within filter controls
- Always include Apply and Reset buttons at the bottom

## Full Implementation

For a complete filter implementation with staged/applied pattern, state management, and composable integration, see [feature-filters.md](./feature-filters.md).
