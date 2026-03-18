# VcMultivalue

A multi-value input component for collecting multiple entries as chips/tags. Supports two distinct modes: **free-form entry** (text, number, date, color) where users type values and press Enter, and **dictionary mode** with a searchable dropdown of predefined options.

## When to Use

- Collecting multiple tags, keywords, or labels (e.g., product tags, email recipients)
- Selecting multiple items from a predefined list (dictionary mode)
- Entering multiple numeric values, dates, or color codes
- Building tokenized inputs where each value is displayed as a removable chip

When NOT to use:
- Selecting from a list without manual entry -- use [VcSelect](../vc-select/) with `multiple`
- Single value entry -- use [VcInput](../vc-input/)
- Rich text content -- use [VcEditor](../vc-editor/)

## Quick Start

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

## Features

### Free-form Text Entry

In the default mode (`multivalue` is `false`), users type a value into the input and press **Enter** or **comma** to add it as a chip. This mode works with different input types.

```vue
<VcMultivalue v-model="tags" label="Keywords" placeholder="Type and press Enter" />
```

### Dictionary Mode (Dropdown Selection)

When the `multivalue` prop is `true` and `options` are provided, the component displays a searchable dropdown. Users click the field to open the dropdown, search within options, and select items. Already-selected items are automatically excluded from the dropdown.

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
    @search="onSearch"
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
  { id: "4", title: "Home & Garden" },
];

function onSearch(query: string) {
  // Optionally fetch filtered options from API
  console.log("Search:", query);
}
</script>
```

### Typed Input Variants

The `type` prop controls the input behavior: `"text"`, `"number"`, `"integer"`, `"date"`, `"datetime-local"`, `"color"`.

```vue
<VcMultivalue v-model="prices" type="number" label="Price points" placeholder="Enter a number" />
<VcMultivalue v-model="dates" type="date" label="Important dates" />
<VcMultivalue v-model="colors" type="color" label="Brand colors" />
```

> **Note:** Date/datetime types constrain max width to 220px on desktop. This is removed on mobile.

### Validation with vee-validate Field

Integrate with vee-validate's `Field` component for form-level validation. The critical pattern passes `error`, `errorMessage`, and forwards the `handleChange` callback.

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.tags"
    name="tags"
    rules="required"
  >
    <VcMultivalue
      v-model="form.tags"
      label="Product Tags"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcMultivalue } from "@vc-shell/framework";

const form = reactive({
  tags: [],
});
</script>
```

### Loading and Clearable States

```vue
<!-- Show spinner while fetching options -->
<VcMultivalue
  v-model="selected"
  :options="options"
  multivalue
  :loading="isLoading"
  label="Async options"
/>

<!-- Allow clearing all selected values at once -->
<VcMultivalue
  v-model="selected"
  :options="options"
  multivalue
  clearable
  label="Clearable selection"
/>
```

### Custom Rendering with Slots

Use `#option` for dropdown items and `#selected-item` for chips:

```vue
<VcMultivalue v-model="selected" :options="items" multivalue>
  <template #option="{ item }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <img :src="item.icon" class="tw-w-5 tw-h-5 tw-rounded-full" />
      <span>{{ item.title }}</span>
    </div>
  </template>
  <template #selected-item="{ value, remove }">
    <span class="tw-bg-[color:var(--primary-100)] tw-px-2 tw-rounded-full tw-text-xs tw-flex tw-items-center tw-gap-1">
      {{ value }}
      <button @click="remove">&times;</button>
    </span>
  </template>
</VcMultivalue>
```

## Recipes

### Tag Editor with Server-side Search

```vue
<template>
  <VcMultivalue
    v-model="selectedTags"
    :options="searchResults"
    option-value="id"
    option-label="name"
    multivalue
    :loading="searching"
    clearable
    label="Tags"
    placeholder="Search tags..."
    @search="debouncedSearch"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { VcMultivalue } from "@vc-shell/framework";

const selectedTags = ref([]);
const searchResults = ref([]);
const searching = ref(false);

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query) return;
  searching.value = true;
  try {
    searchResults.value = await fetchTags(query);
  } finally {
    searching.value = false;
  }
}, 300);
</script>
```

### Color Palette Builder

```vue
<VcMultivalue v-model="palette" type="color" label="Brand palette" clearable />
```

The color type displays a colored square for each chip. Items may include a `colorCode` property.

## Common Mistakes

### 1. Forgetting `multivalue` prop for dictionary mode

```vue
<!-- WRONG: options are provided but dropdown won't appear -->
<VcMultivalue v-model="selected" :options="items" />

<!-- CORRECT: enable dictionary mode explicitly -->
<VcMultivalue v-model="selected" :options="items" multivalue />
```

### 2. Incorrect modelValue type

```vue
<!-- WRONG: modelValue must be an array, not a single object -->
<VcMultivalue v-model="singleItem" :options="items" multivalue />

<!-- CORRECT: always use an array -->
<VcMultivalue v-model="selectedArray" :options="items" multivalue />
```

```ts
// WRONG
const singleItem = ref({ id: "1", title: "Option 1" });

// CORRECT
const selectedArray = ref([{ id: "1", title: "Option 1" }]);
```

### 3. Missing handleChange in vee-validate integration

```vue
<!-- WRONG: validation state won't update -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.tags" name="tags" rules="required">
  <VcMultivalue v-model="form.tags" :error="!!errors.length" :error-message="errorMessage" />
</Field>

<!-- CORRECT: forward handleChange to keep vee-validate in sync -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.tags" name="tags" rules="required">
  <VcMultivalue
    v-model="form.tags"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[]` | `[]` | Array of selected values via `v-model` |
| `type` | `"text" \| "number" \| "integer" \| "date" \| "datetime-local" \| "color"` | `"text"` | Input type for manual entry |
| `options` | `T[]` | `[]` | Predefined options for dictionary mode |
| `optionValue` | `string` | `"id"` | Property name used as the option's unique key |
| `optionLabel` | `string` | `"title"` | Property name used as the option's display text |
| `multivalue` | `boolean` | `false` | Enables dictionary mode with dropdown |
| `clearable` | `boolean` | `false` | Shows a clear-all button when values are selected |
| `loading` | `boolean` | `false` | Shows a loading spinner in the field |
| `placeholder` | `string` | -- | Input placeholder text |
| `label` | `string` | -- | Label text above the field |
| `tooltip` | `string` | -- | Tooltip shown on label hover |
| `hint` | `string` | -- | Helper text displayed below the field |
| `disabled` | `boolean` | `false` | Disables the entire field |
| `required` | `boolean` | `false` | Shows a required asterisk on the label |
| `name` | `string` | `"Field"` | Form field name attribute |
| `error` | `boolean` | `false` | External error flag for styling |
| `errorMessage` | `string` | -- | Error message text (also sets error state when truthy) |
| `multilanguage` | `boolean` | `false` | Enables multilanguage indicator on the label |
| `currentLanguage` | `string` | -- | Current language code for multilanguage mode |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:model-value` | `T[]` | Emitted when the selected values change |
| `close` | -- | Emitted when the dropdown closes |
| `search` | `string` | Emitted when the user types in the dropdown search field |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `option` | `{ item: T, index: number }` | Custom rendering for dropdown options (dictionary mode) |
| `selected-item` | `{ value: string \| number, item: T, index: number, remove: () => void }` | Custom rendering for selected value chips |
| `prepend` | -- | Content rendered before the field area (inside the border) |
| `append` | -- | Content rendered after the field area (inside the border) |
| `error` | -- | Custom error message markup (replaces default VcHint) |
| `hint` | -- | Custom hint markup (replaces default VcHint) |

## CSS Variables

The component uses `--multivalue-*` variables that fall back to `--select-*` tokens for visual consistency with VcSelect.

| Variable | Default | Description |
|----------|---------|-------------|
| `--multivalue-height` | `36px` | Minimum height of the input field |
| `--multivalue-border-radius` | `var(--select-border-radius, 6px)` | Border radius |
| `--multivalue-border-color` | `var(--select-border-color, var(--neutrals-300))` | Default border color |
| `--multivalue-background-color` | `var(--select-background-color, transparent)` | Field background |
| `--multivalue-text-color` | `var(--select-text-color, var(--neutrals-800))` | Field text color |
| `--multivalue-chip-background-color` | `var(--select-multiple-options-background-color, var(--neutrals-100))` | Chip background |
| `--multivalue-chip-border-color` | `var(--select-multiple-options-border-color, var(--neutrals-200))` | Chip border |
| `--multivalue-border-color-focus` | `var(--select-border-color-focus, var(--primary-500))` | Border color on focus |
| `--multivalue-focus-ring-color` | `var(--select-focus-ring-color, var(--primary-100))` | Focus ring color |
| `--multivalue-border-color-error` | `var(--select-border-color-error, var(--danger-500))` | Border on error |
| `--multivalue-error-ring-color` | `var(--select-error-ring-color, var(--danger-100))` | Error ring color |
| `--multivalue-disabled-text-color` | `var(--neutrals-500)` | Disabled text color |
| `--multivalue-loading-color` | `var(--select-loading-color, var(--info-500))` | Loading spinner color |

## Accessibility

- Label linked to the field via `aria-labelledby`
- Hint and error messages linked via `aria-describedby`
- Dropdown list has `role="listbox"` with a generated `id`
- Chip remove buttons are individually focusable
- Keyboard navigation:
  - **Enter** / **comma** -- submits the current input as a new value
  - **Backspace** -- removes the last chip when the input is empty
  - **Arrow keys** -- navigate items in the dropdown (dictionary mode)
  - **Escape** -- closes the dropdown
- The `required` prop sets `aria-required` on the field
- Disabled state prevents all keyboard and pointer interaction

## Related Components

- [VcSelect](../vc-select/) -- dropdown for single/multi selection without manual entry
- [VcInput](../vc-input/) -- single-value text input
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping form controls
