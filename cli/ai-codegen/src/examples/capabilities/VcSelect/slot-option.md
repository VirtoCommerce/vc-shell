---
id: vcselect-slot-option
component: VcSelect
type: SLOT
complexity: MODERATE
category: ui
tags: [slot, option, custom-rendering]
critical: true
related_rules: ["11"]
title: "VcSelect #option slot"
description: "Custom option rendering with correct slot scope"
---

# Capability: option

## Type
SLOT

## Description
Custom option slot for rendering individual options in the dropdown

## When to Use
- Need custom styling for dropdown options
- Want to display icons, badges, or complex layouts in options
- Need to show additional information for each option

## Slot Scope Structure
**IMPORTANT**: The slot provides the following scope variables (note: use `opt`, NOT `option`):

- `opt: any` - The option object from the options array
- `index: number` - The index of the option
- `selected: boolean` - Whether this option is currently selected
- `toggleOption: (opt: any) => void` - Function to toggle option selection

## Required Props/Slots/Events
**Slots:**
- `option` - Custom option rendering slot

**Props required for this slot:**
- `options` - Array of options to display
- `optionLabel` - (optional) Property name to use as label
- `optionValue` - (optional) Property name to use as value

## Related Capabilities
- `slot:selected-item` - Customize selected value display
- `prop:optionLabel` - Configure label property
- `prop:optionValue` - Configure value property
- `prop:multiple` - Enable multi-select

## Complexity
SIMPLE

## Complete Working Examples

### Example 1: Custom Option with Icon
```vue
<template>
  <!-- @vue-generic {{ value: string; label: string; icon: string }} -->
  <VcSelect
    v-model="selectedStatus"
    :options="statusOptions"
    option-label="label"
    option-value="value"
  >
    <template #option="{ opt, selected }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon :icon="opt.icon" />
        <span>{{ opt.label }}</span>
        <VcIcon
          v-if="selected"
          icon="material-check"
          class="tw-ml-auto"
        />
      </div>
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcSelect, VcIcon } from "@vc-shell/framework";

const selectedStatus = ref('active');

const statusOptions = [
  { value: 'active', label: 'Active', icon: 'material-check_circle' },
  { value: 'pending', label: 'Pending', icon: 'material-pending' },
  { value: 'disabled', label: 'Disabled', icon: 'material-cancel' },
];
</script>
```

### Example 2: Option with Badge and Description
```vue
<template>
  <!-- @vue-generic {{ id: number; name: string; description: string; isNew: boolean }} -->
  <VcSelect
    v-model="selectedCategory"
    :options="categories"
  >
    <template #option="{ opt, index }">
      <div class="tw-py-2">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span class="tw-font-medium">{{ opt.name }}</span>
          <VcBadge v-if="opt.isNew">New</VcBadge>
        </div>
        <div class="tw-text-sm tw-text-gray-500">
          {{ opt.description }}
        </div>
      </div>
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcSelect, VcBadge } from "@vc-shell/framework";

const selectedCategory = ref(null);

const categories = [
  { id: 1, name: 'Electronics', description: '1,234 items', isNew: false },
  { id: 2, name: 'Clothing', description: '856 items', isNew: true },
  { id: 3, name: 'Books', description: '2,103 items', isNew: false },
];
</script>
```

### Example 3: Multi-select with Toggle
```vue
<template>
  <!-- @vue-generic {{ id: number; name: string; email: string; avatar: string }} -->
  <VcSelect
    v-model="selectedUsers"
    :options="users"
    option-label="name"
    option-value="id"
    multiple
  >
    <template #option="{ opt, selected, toggleOption }">
      <div
        class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer"
        @click="toggleOption(opt)"
      >
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcImage
            :src="opt.avatar"
            size="xs"
            rounded
          />
          <div>
            <div>{{ opt.name }}</div>
            <div class="tw-text-sm tw-text-gray-500">{{ opt.email }}</div>
          </div>
        </div>
        <VcCheckbox
          :model-value="selected"
          @click.stop
        />
      </div>
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VcSelect, VcImage, VcCheckbox } from "@vc-shell/framework";

const selectedUsers = ref([]);

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', avatar: '/avatars/1.jpg' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: '/avatars/2.jpg' },
];
</script>
```

## Best Practices
- ✅ Use `opt` to access the option object (NOT `option`)
- ✅ Use `selected` boolean to show selection state
- ✅ Use `toggleOption(opt)` for custom click handlers in multi-select
- ✅ Provide proper TypeScript types for option objects
- ✅ Keep option height consistent for better UX
- ❌ Don't use `option` - the slot scope variable is named `opt`
- ❌ Don't forget to handle `selected` state visually

## Common Mistakes
```vue
<!-- ❌ WRONG: Using 'option' instead of 'opt' -->
<template #option="{ option, selected }">
  {{ option.label }}  <!-- This will NOT work! -->
</template>

<!-- ✅ CORRECT: Using 'opt' -->
<template #option="{ opt, selected }">
  {{ opt.label }}  <!-- This works! -->
</template>
```
