# VcSelect

A dropdown select component for choosing single or multiple options from a list. Supports synchronous arrays, async data sources with infinite scroll, searching, and extensive slot customization.

## When to Use

- Selecting one or multiple values from a predefined set of options
- Loading options asynchronously from an API (with pagination and search)
- When NOT to use: free-form text entry (use [VcInput](../vc-input/)), combined input + option selection (use [VcInputDropdown](../vc-input-dropdown/)), tagging/multi-value entry with manual input (use [VcMultivalue](../vc-multivalue/))

## Basic Usage

```vue
<template>
  <VcSelect
    v-model="selected"
    label="Country"
    placeholder="Select a country"
    :options="countries"
    option-value="id"
    option-label="name"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const selected = ref<string | undefined>();
const countries = [
  { id: "us", name: "United States" },
  { id: "de", name: "Germany" },
  { id: "jp", name: "Japan" },
];
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| T[] \| string \| string[] \| null` | `undefined` | Bound value via `v-model` |
| `options` | `T[] \| ((keyword?, skip?, ids?) => Promise<P>)` | `[]` | Static array or async loader function |
| `optionValue` | `string \| ((opt) => string)` | `"id"` | Property (or getter) used as option value |
| `optionLabel` | `string \| ((opt) => string)` | `"title"` | Property (or getter) used as option display text |
| `multiple` | `boolean` | `false` | Allow selecting multiple values |
| `searchable` | `boolean` | `false` | Show search input in the dropdown |
| `emitValue` | `boolean` | `true` | When true, emits the primitive value (from `optionValue`). When false, emits the full option object |
| `clearable` | `boolean` | `true` | Show clear button when a value is selected |

## Common Patterns

### Async Options with Search

```vue
<VcSelect
  v-model="productId"
  label="Product"
  placeholder="Search products..."
  :options="loadProducts"
  option-value="id"
  option-label="name"
  searchable
/>
```

Where `loadProducts` is `(keyword?: string, skip?: number, ids?: string[]) => Promise<{ results: Product[]; totalCount: number }>`.

### Multi-select

```vue
<VcSelect
  v-model="selectedTags"
  label="Tags"
  :options="availableTags"
  option-value="id"
  option-label="name"
  multiple
  placeholder="Select tags..."
/>
```

### Custom Option Template

```vue
<VcSelect v-model="userId" :options="users" option-value="id" option-label="name">
  <template #option="{ opt, selected, toggleOption }">
    <div class="tw-flex tw-items-center tw-gap-2" @click="toggleOption(opt)">
      <img :src="opt.avatar" class="tw-w-6 tw-h-6 tw-rounded-full" />
      <span>{{ opt.name }}</span>
    </div>
  </template>
</VcSelect>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `option` | `{ index, opt, selected, toggleOption }` | Custom rendering for each dropdown option |
| `selected-item` | `{ index, opt, selected, removeAtIndex }` | Custom rendering for selected value chips (multi-select) |
| `control` | `{ toggleHandler, isOpened }` | Replace the entire trigger element |
| `prepend` / `append` | -- | Content outside the field border |
| `prepend-inner` / `append-inner` | -- | Content inside the field border |
| `no-options` | -- | Shown when no options match the search |
| `error` / `hint` | -- | Custom error/hint markup |

## Accessibility

- Trigger has `role="combobox"` with `aria-expanded` and `aria-haspopup="listbox"`
- Dropdown list has `role="listbox"` with a generated `id`
- Label linked via `aria-labelledby`; hint/error via `aria-describedby`
- Full keyboard navigation: Arrow keys move focus, Enter selects, Escape closes
- Multi-select chip remove buttons are individually focusable

## CSS Variables

Key variables: `--select-height`, `--select-border-color`, `--select-border-color-focus`, `--select-border-color-error`, `--select-dropdown-bg`, `--select-option-background-color-hover`, `--select-option-background-color-selected`.

## Related Components

- [VcMultivalue](../vc-multivalue/) -- for tagging / free-form multi-value entry
- [VcInputDropdown](../vc-input-dropdown/) -- input field combined with a dropdown option selector
- [VcInput](../vc-input/) -- plain text input
