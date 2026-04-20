# VcInputDropdown

A composite component that combines a text input field with a dropdown option selector in a single control. The user types a value in the input while also selecting a category, unit, or format from the attached dropdown.

## When to Use

- Input value paired with a unit selector (e.g., "100 cm", "50 kg")
- Amount with currency selection (for raw implementation; prefer [VcInputCurrency](../vc-input-currency/) for formatted currency display)
- Value with format choice (e.g., a date input with selectable date format)
- Any scenario requiring a free-form value plus a constrained option in one field

**Alternatives:**

- If you only need a dropdown without a text input, use [VcSelect](../vc-select/)
- If you only need a text input without a dropdown, use [VcInput](../vc-input/)
- For currency inputs with built-in locale formatting, use [VcInputCurrency](../vc-input-currency/)

## Quick Start

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

The component uses a dual `v-model` pattern: `v-model` controls the input value, and `v-model:option` controls the selected dropdown option.

## Object Options

When options are objects instead of primitives, use `optionValue` and `optionLabel` to tell the component which properties to use:

```vue
<template>
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
</template>

<script setup lang="ts">
import { ref } from "vue";

const value = ref(42);
const selectedUnit = ref({ id: "px", label: "Pixels" });

const units = [
  { id: "px", label: "Pixels" },
  { id: "em", label: "Em units" },
  { id: "rem", label: "Root Em" },
  { id: "%", label: "Percentage" },
];
</script>
```

You can also pass functions for `optionValue` and `optionLabel` for more complex extraction logic:

```vue
<VcInputDropdown :option-value="(opt) => opt.code" :option-label="(opt) => `${opt.symbol} ${opt.name}`" :options="currencies" />
```

## Searchable Dropdown

Enable filtering inside the dropdown with the `searchable` prop. This is useful when the options list is long:

```vue
<VcInputDropdown v-model="value" v-model:option="selected" :options="allCountryCodes" searchable label="Phone Number" input-type="tel" />
```

## Input Types

The `inputType` prop controls the HTML input type, enabling browser-native behaviors:

```vue
<!-- Numeric keyboard on mobile -->
<VcInputDropdown v-model="amount" input-type="number" ... />

<!-- Email keyboard on mobile -->
<VcInputDropdown v-model="email" input-type="email" ... />

<!-- Time picker -->
<VcInputDropdown v-model="time" input-type="time" ... />
```

Supported types: `"text"`, `"password"`, `"email"`, `"tel"`, `"number"`, `"integer"`, `"url"`, `"time"`, `"date"`, `"datetime-local"`.

## Component States

VcInputDropdown inherits all standard form field states:

```vue
<!-- Disabled -->
<VcInputDropdown v-model="val" v-model:option="opt" :options="opts" disabled />

<!-- Loading -->
<VcInputDropdown v-model="val" v-model:option="opt" :options="opts" loading />

<!-- Error with message -->
<VcInputDropdown v-model="val" v-model:option="opt" :options="opts" error error-message="This field is required" />

<!-- Required -->
<VcInputDropdown v-model="val" v-model:option="opt" :options="opts" required />
```

## Custom Dropdown Button

Replace the default dropdown toggle with a custom element using the `button` slot:

```vue
<VcInputDropdown v-model="value" v-model:option="currency" :options="currencies">
  <template #button="{ toggleHandler }">
    <button
      class="tw-flex tw-items-center tw-px-2 tw-text-primary-500 tw-font-medium"
      @click.stop.prevent="toggleHandler"
    >
      {{ currency.symbol }} {{ currency.code }}
      <VcIcon icon="lucide-chevron-down" size="s" class="tw-ml-1" />
    </button>
  </template>
</VcInputDropdown>
```

> **Important:** Always use `.stop.prevent` modifiers on click handlers inside the `button` slot to prevent the event from bubbling to the input.

## Recipe: Measurement Input in a Product Form

```vue
<template>
  <VcForm @submit="saveProduct">
    <VcInput
      v-model="product.name"
      label="Product Name"
      required
    />
    <VcInputDropdown
      v-model="product.weight"
      v-model:option="product.weightUnit"
      label="Weight"
      input-type="number"
      :options="['g', 'kg', 'oz', 'lb']"
      placeholder="Enter weight"
    />
    <VcInputDropdown
      v-model="product.length"
      v-model:option="product.lengthUnit"
      label="Length"
      input-type="number"
      :options="['mm', 'cm', 'm', 'in', 'ft']"
      placeholder="Enter length"
    />
    <VcButton type="submit">Save</VcButton>
  </VcForm>
</template>
```

## Common Mistakes

**Forgetting `v-model:option` -- the dropdown selection is not bound**

```
// Wrong -- dropdown shows options but selection is lost on re-render
<VcInputDropdown v-model="value" :options="units" />
```

```
// Correct -- bind both the input and the option
<VcInputDropdown v-model="value" v-model:option="unit" :options="units" />
```

**Using object options without specifying optionValue/optionLabel**

```
// Wrong -- dropdown shows "[object Object]" for each option
<VcInputDropdown
  :options="[{ id: 'cm', label: 'Centimeters' }]"
  v-model:option="unit"
/>
```

```
// Correct -- tell the component which properties to read
<VcInputDropdown
  :options="[{ id: 'cm', label: 'Centimeters' }]"
  option-value="id"
  option-label="label"
  v-model:option="unit"
/>
```

**Missing `.stop.prevent` on custom button slot click handler**

```
// Wrong -- click event bubbles to the input, causing focus issues
<template #button="{ toggleHandler }">
  <button @click="toggleHandler">Toggle</button>
</template>
```

```
// Correct -- stop propagation and prevent default
<template #button="{ toggleHandler }">
  <button @click.stop.prevent="toggleHandler">Toggle</button>
</template>
```

## Props

| Prop           | Type                                                                                                                 | Default   | Description                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| `modelValue`   | `string \| number \| Date \| null`                                                                                   | --        | Input field value via `v-model`                        |
| `option`       | `unknown`                                                                                                            | --        | Selected dropdown option via `v-model:option`          |
| `options`      | `unknown[]`                                                                                                          | `[]`      | Available options for the dropdown                     |
| `optionValue`  | `string \| ((opt: unknown) => unknown)`                                                                              | `"id"`    | Property name or function to extract the option value  |
| `optionLabel`  | `string \| ((opt: unknown) => string)`                                                                               | `"title"` | Property name or function to extract the display label |
| `inputType`    | `"text" \| "number" \| "email" \| "tel" \| "password" \| "url" \| "time" \| "date" \| "datetime-local" \| "integer"` | `"text"`  | HTML input type                                        |
| `searchable`   | `boolean`                                                                                                            | `false`   | Enable search filtering in the dropdown                |
| `debounce`     | `string \| number`                                                                                                   | `0`       | Debounce delay (ms) for search input                   |
| `clearable`    | `boolean`                                                                                                            | `false`   | Show a clear button on the input                       |
| `prefix`       | `string`                                                                                                             | --        | Static prefix text inside the input                    |
| `suffix`       | `string`                                                                                                             | --        | Static suffix text inside the input                    |
| `maxlength`    | `string \| number`                                                                                                   | `1024`    | Maximum character length for the input                 |
| `label`        | `string`                                                                                                             | --        | Field label text                                       |
| `placeholder`  | `string`                                                                                                             | --        | Input placeholder text                                 |
| `hint`         | `string`                                                                                                             | --        | Hint text below the field                              |
| `tooltip`      | `string`                                                                                                             | --        | Tooltip on the label                                   |
| `disabled`     | `boolean`                                                                                                            | `false`   | Disable all interactions                               |
| `required`     | `boolean`                                                                                                            | `false`   | Mark field as required (shows asterisk)                |
| `loading`      | `boolean`                                                                                                            | `false`   | Show loading spinner                                   |
| `autofocus`    | `boolean`                                                                                                            | `false`   | Auto-focus on mount                                    |
| `error`        | `boolean`                                                                                                            | `false`   | External error flag                                    |
| `errorMessage` | `string`                                                                                                             | --        | Error message (sets error state when truthy)           |
| `name`         | `string`                                                                                                             | --        | HTML name attribute for the input                      |

## Events

| Event               | Payload                            | Description                |
| ------------------- | ---------------------------------- | -------------------------- |
| `update:modelValue` | `string \| number \| Date \| null` | Input value changed        |
| `update:option`     | `unknown`                          | Dropdown selection changed |
| `change`            | `unknown`                          | Generic change event       |
| `blur`              | `Event`                            | Input lost focus           |

## Slots

| Slot            | Scope                                             | Description                                |
| --------------- | ------------------------------------------------- | ------------------------------------------ |
| `button`        | `{ toggleHandler: () => void }`                   | Replace the dropdown toggle button         |
| `control`       | `{ placeholder, focused, modelValue, emitValue }` | Replace the entire input element           |
| `option`        | `{ index, opt, selected, toggleOption }`          | Custom rendering for each dropdown option  |
| `prepend`       | --                                                | Content before the field (outside)         |
| `append`        | --                                                | Content after the field (outside)          |
| `prepend-inner` | --                                                | Content inside the field, before the input |
| `append-inner`  | --                                                | Content inside the field, after the input  |

## CSS Variables

| Variable                        | Default              | Description                                               |
| ------------------------------- | -------------------- | --------------------------------------------------------- |
| `--input-dropdown-toggle-color` | `var(--primary-500)` | Color of the dropdown toggle button text and chevron icon |

> **Note:** VcInputDropdown inherits all CSS variables from [VcInput](../vc-input/) for input styling and from [VcSelect](../vc-select/) for dropdown styling.

## Accessibility

- The dropdown toggle button has `aria-label="Select option"`, `aria-expanded`, and `aria-haspopup="listbox"`.
- Keyboard interaction: Tab moves focus between the input and dropdown button. Enter and Space on the toggle open/close the dropdown.
- All input accessibility features are inherited from VcInput, including label association and `aria-describedby` for error messages.
- When `disabled` is true, the entire component becomes non-interactive.

## Related Components

- [VcInputCurrency](../vc-input-currency/) -- Currency-specific variant with built-in locale formatting
- [VcInput](../vc-input/) -- Standalone text input (used internally)
- [VcSelect](../vc-select/) -- Standalone dropdown selection (used internally)

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint — a label block (when the `label` prop is set) and an input-shaped block. No additional props or configuration needed.

This behavior is powered by `BladeLoadingKey` via Vue's provide/inject. The component injects the loading state from the nearest `VcBlade` ancestor.
