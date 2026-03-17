# VcInputDropdown

A composite component that combines a text input field with a dropdown option selector in a single control. The user can type a value in the input while also selecting a category, unit, or format from the dropdown.

## When to Use

- Input value + unit selection (e.g., "100 cm", "50 kg")
- Amount + currency pairing (for raw implementation; prefer [VcInputCurrency](../vc-input-currency/) for formatted currency)
- Value + format selection (e.g., date with format choice)
- When NOT to use: only need a dropdown (use [VcSelect](../vc-select/)), only need an input (use [VcInput](../vc-input/))

## Basic Usage

```vue
<template>
  <VcInputDropdown
    v-model="measurement"
    v-model:option="unit"
    label="Length"
    placeholder="Enter value"
    input-type="number"
    :options="['mm', 'cm', 'm', 'km']"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInputDropdown } from "@vc-shell/framework";

const measurement = ref<number | null>(100);
const unit = ref("cm");
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| Date \| null` | -- | Input field value via `v-model` |
| `option` | `unknown` | -- | Selected dropdown option via `v-model:option` |
| `options` | `unknown[]` | `[]` | Available options for the dropdown |
| `optionValue` / `optionLabel` | `string \| Function` | `"id"` / `"title"` | Option property mapping |
| `inputType` | `"text" \| "number" \| "email" \| ...` | `"text"` | Type of the input field |
| `searchable` | `boolean` | `false` | Enables search in the dropdown |
| `clearable` | `boolean` | `false` | Shows a clear button on the input |
| `prefix` / `suffix` | `string` | -- | Static text inside the input |

## Common Patterns

### With Object Options

```vue
<VcInputDropdown
  v-model="value"
  v-model:option="selectedUnit"
  label="Dimensions"
  :options="units"
  option-value="id"
  option-label="label"
  input-type="number"
  searchable
/>
```

### Custom Dropdown Button

```vue
<VcInputDropdown v-model="value" v-model:option="option" :options="options">
  <template #button="{ toggleHandler }">
    <button @click.stop.prevent="toggleHandler">
      {{ option }} <VcIcon icon="lucide-chevron-down" size="s" />
    </button>
  </template>
</VcInputDropdown>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `button` | `{ toggleHandler }` | Replace the dropdown toggle button |
| `control` | `{ placeholder, focused, modelValue, emitValue }` | Replace the input element |
| `option` | `{ index, opt, selected, toggleOption }` | Custom option rendering |
| `prepend` / `append` | -- | Content outside the field |
| `prepend-inner` / `append-inner` | -- | Content inside the field |

## Accessibility

- Dropdown toggle has `aria-label="Select option"`, `aria-expanded`, `aria-haspopup="listbox"`
- Inherits all input accessibility from VcInput (label linking, `aria-describedby`, etc.)
- Keyboard: Tab moves between input and dropdown, Enter/Space opens dropdown

## Related Components

- [VcInputCurrency](../vc-input-currency/) -- currency-specific variant with formatting
- [VcInput](../vc-input/) -- standalone text input
- [VcSelect](../vc-select/) -- standalone dropdown selection
