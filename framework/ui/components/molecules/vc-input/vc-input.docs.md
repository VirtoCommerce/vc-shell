# VcInput

A versatile text input field supporting multiple input types, prefix/suffix decorations, clearable state, password visibility toggle, and built-in validation display. For date and color types, it delegates to dedicated components automatically.

## When to Use

- Single-line text entry: names, emails, URLs, phone numbers, passwords
- Numeric entry (use `type="number"` or `type="integer"` for whole numbers only)
- When you need prefix/suffix text, inner icons, or appended buttons
- When NOT to use: multi-line text (use [VcTextarea](../vc-textarea/)), rich text (use [VcEditor](../vc-editor/)), selecting from a list (use [VcSelect](../vc-select/)), currency with formatting (use [VcInputCurrency](../vc-input-currency/))

## Basic Usage

```vue
<template>
  <VcInput v-model="name" label="Full name" placeholder="John Doe" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const name = ref("");
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| Date \| null` | `undefined` | Bound value via `v-model` |
| `type` | `"text" \| "password" \| "email" \| "number" \| "integer" \| "tel" \| "url" \| "date" \| "datetime-local" \| "color"` | `"text"` | Input type. `date`/`datetime-local` delegates to VcDatePicker; `color` delegates to VcColorInput |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | -- | Placeholder text inside the field |
| `clearable` | `boolean` | `false` | Shows a clear button when value is present |
| `error` / `errorMessage` | `boolean` / `string` | -- | Triggers error styling and displays validation message |
| `prefix` / `suffix` | `string` | -- | Static text before/after the input value |
| `debounce` | `string \| number` | -- | Delay in ms before emitting model updates |
| `size` | `"default" \| "small"` | `"default"` | Field height variant (36px / 32px) |

## Common Patterns

### With Validation

```vue
<VcInput
  v-model="email"
  type="email"
  label="Email"
  placeholder="user@example.com"
  required
  :error="!isValid"
  error-message="Please enter a valid email address"
/>
```

### Password with Toggle

```vue
<VcInput
  v-model="password"
  type="password"
  label="Password"
  placeholder="Enter your password"
  required
/>
```

The password type automatically renders a show/hide visibility toggle button.

### With Inner Icon

```vue
<VcInput v-model="query" placeholder="Search...">
  <template #prepend-inner>
    <VcIcon icon="lucide-search" />
  </template>
</VcInput>
```

### Number with Prefix

```vue
<VcInput
  v-model="price"
  type="number"
  label="Price"
  prefix="$"
  placeholder="0.00"
/>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `prepend` / `append` | `{ focus }` | Content outside the field border (left/right) |
| `prepend-inner` / `append-inner` | `{ focus }` | Content inside the field border |
| `control` | `{ editable, focused, modelValue, emitValue, placeholder }` | Replace the native `<input>` entirely |
| `error` | -- | Custom error message markup |
| `hint` | -- | Custom hint text markup |

## Accessibility

- Label is linked to the input via `aria-labelledby`
- Hint and error text are linked via `aria-describedby`
- Error state sets `aria-invalid="true"` on the native input
- Required fields expose `aria-required`
- Password toggle has descriptive `aria-label` ("Show password" / "Hide password")
- Clear button has `aria-label="Clear"`
- Keyboard: fully tabbable (`tabindex="0"`), standard input keyboard behavior

## CSS Variables

Key variables for theming (defined on `:root`):

- `--input-height` / `--input-height-small` -- field heights
- `--input-border-color`, `--input-border-color-focus`, `--input-border-color-error`
- `--input-background-color`, `--input-text-color`, `--input-placeholder-color`
- `--input-focus-ring-color`, `--input-error-ring-color`

## Related Components

- [VcTextarea](../vc-textarea/) -- multi-line text input
- [VcSelect](../vc-select/) -- dropdown selection
- [VcInputCurrency](../vc-input-currency/) -- formatted currency input with currency selector
- [VcInputDropdown](../vc-input-dropdown/) -- input with attached dropdown for unit/option selection
- [VcDatePicker](../vc-date-picker/) -- standalone date picker (also used internally when `type="date"`)
- [VcColorInput](../vc-color-input/) -- standalone color input (also used internally when `type="color"`)
