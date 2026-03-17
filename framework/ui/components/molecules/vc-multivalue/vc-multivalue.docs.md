# VcMultivalue

A multi-value input component for collecting multiple entries as chips/tags. Supports free-form typing (text, number, date, color) and dictionary mode with a dropdown of predefined options.

## When to Use

- Collecting multiple tags, keywords, or values (e.g., product tags, email addresses)
- Selecting multiple items from a predefined list (dictionary mode)
- Entering multiple dates, numbers, or color codes
- When NOT to use: selecting from a list without manual entry (use [VcSelect](../vc-select/) with `multiple`), single value entry (use [VcInput](../vc-input/))

## Basic Usage

### Free-form Text Entry

```vue
<template>
  <VcMultivalue v-model="tags" label="Tags" placeholder="Type and press Enter" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const tags = ref<Array<{ id?: string }>>([]);
</script>
```

### Dictionary Mode (Dropdown Selection)

```vue
<template>
  <VcMultivalue
    v-model="selected"
    label="Categories"
    :options="categories"
    option-value="id"
    option-label="title"
    multivalue
    placeholder="Select categories..."
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcMultivalue } from "@vc-shell/framework";

const selected = ref([]);
const categories = [
  { id: "1", title: "Electronics" },
  { id: "2", title: "Clothing" },
  { id: "3", title: "Books" },
];
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[]` | `[]` | Array of selected values via `v-model` |
| `type` | `"text" \| "number" \| "integer" \| "date" \| "datetime-local" \| "color"` | `"text"` | Input type for manual entry |
| `options` | `T[]` | `[]` | Predefined options for dictionary mode |
| `optionValue` / `optionLabel` | `string` | `"id"` / `"title"` | Option property mapping |
| `multivalue` | `boolean` | `false` | Enables dictionary mode with dropdown |
| `clearable` | `boolean` | `false` | Shows a clear-all button |
| `loading` | `boolean` | `false` | Shows a loading spinner |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and message |
| `placeholder` | `string` | -- | Input placeholder text |

## Common Patterns

### Numeric Values

```vue
<VcMultivalue
  v-model="prices"
  type="number"
  label="Price points"
  placeholder="Enter a number and press Enter"
/>
```

### With Custom Option Template

```vue
<VcMultivalue v-model="selected" :options="items" multivalue>
  <template #option="{ item }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <img :src="item.icon" class="tw-w-5 tw-h-5" />
      <span>{{ item.title }}</span>
    </div>
  </template>
</VcMultivalue>
```

### With Custom Selected Item

```vue
<VcMultivalue v-model="selected" :options="items" multivalue>
  <template #selected-item="{ value, remove }">
    <span class="tw-bg-blue-100 tw-px-2 tw-rounded">
      {{ value }}
      <button @click="remove">x</button>
    </span>
  </template>
</VcMultivalue>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `option` | `{ item, index }` | Custom rendering for dropdown options |
| `selected-item` | `{ value, item, index, remove }` | Custom rendering for selected value chips |
| `prepend` / `append` | -- | Content outside the field border |
| `error` / `hint` | -- | Custom error/hint markup |

## Accessibility

- Label linked via `aria-labelledby`
- Hint/error linked via `aria-describedby`
- Dropdown has `role="listbox"` with generated `id`
- Chip remove buttons are individually focusable
- Keyboard: Enter/comma submits new values, Backspace removes last chip, arrow keys navigate dropdown

## CSS Variables

Uses `--multivalue-*` variables that fall back to `--select-*` tokens for consistency:

- `--multivalue-height`, `--multivalue-border-color`, `--multivalue-border-radius`
- `--multivalue-chip-background-color`, `--multivalue-chip-border-color`
- `--multivalue-border-color-focus`, `--multivalue-focus-ring-color`
- `--multivalue-border-color-error`, `--multivalue-error-ring-color`

## Related Components

- [VcSelect](../vc-select/) -- dropdown for single/multi selection without manual entry
- [VcInput](../vc-input/) -- single-value text input
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping controls
