# VcTextarea

A multi-line text input field for entering and editing large blocks of text. Provides label, placeholder, hint text, validation error display, character limits, and multilanguage support out of the box.

## When to Use

- Multi-line free-form text: descriptions, comments, notes, addresses, bios
- Content that typically exceeds a single line
- Form fields where the user needs to see multiple lines at once

**When NOT to use:**

- Single-line values such as names or emails -- use [VcInput](../vc-input/)
- Rich formatted text with bold, lists, or links -- use [VcEditor](../vc-editor/)

## Quick Start

```vue
<template>
  <VcTextarea v-model="description" label="Description" placeholder="Enter description..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcTextarea } from "@vc-shell/framework";

const description = ref("");
</script>
```

## Features

### Character Limit

Set `maxlength` to restrict the number of characters. The browser enforces the limit natively on the `<textarea>` element.

```vue
<VcTextarea
  v-model="bio"
  label="Short bio"
  maxlength="200"
  hint="Maximum 200 characters"
/>
```

> **Tip:** Combine `maxlength` with a `hint` slot to show a live character counter if your form requires one.

### Hint and Tooltip

Use `hint` for helper text below the field, and `tooltip` for an info icon on the label.

```vue
<VcTextarea
  v-model="notes"
  label="Internal notes"
  hint="These notes are visible only to administrators"
  tooltip="Will not appear on the public storefront"
/>
```

When an error message is present, the hint is automatically hidden and replaced by the error message. The transition between them is animated.

### Multilanguage Indicator

When editing translatable content, enable the language badge on the label:

```vue
<VcTextarea
  v-model="localizedDescription"
  label="Description"
  multilanguage
  current-language="en-US"
  placeholder="Enter description in English..."
/>
```

### Validation with vee-validate Field

The recommended way to integrate form validation is through vee-validate's `Field` component. This connects the textarea to the form's validation schema and provides real-time error feedback.

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.description"
    name="description"
    rules="required|min:10"
  >
    <VcTextarea
      v-model="form.description"
      label="Product description"
      required
      placeholder="Describe the product..."
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcTextarea } from "@vc-shell/framework";

const form = reactive({
  description: "",
});
</script>
```

### States

```vue
<!-- Required field -->
<VcTextarea v-model="value" label="Address" required />

<!-- Disabled field -->
<VcTextarea v-model="value" label="Read-only notes" disabled />

<!-- Error state -->
<VcTextarea
  v-model="value"
  label="Comments"
  :error="true"
  error-message="Comments must not be empty"
/>
```

## Recipes

### Product Description in a Blade Form

A typical product-editing blade with a description textarea and character limit:

```vue
<template>
  <VcBlade title="Edit Product">
    <VcContainer>
      <VcRow>
        <VcCol size="8">
          <VcInput v-model="product.name" label="Product name" required />
        </VcCol>
      </VcRow>
      <VcRow>
        <VcCol size="12">
          <Field
            v-slot="{ errorMessage, handleChange, errors }"
            :model-value="product.description"
            name="description"
            rules="required|max:2000"
          >
            <VcTextarea
              v-model="product.description"
              label="Description"
              required
              maxlength="2000"
              placeholder="Describe the product for customers..."
              hint="HTML is not supported. Maximum 2000 characters."
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            />
          </Field>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>
```

### Custom Error Slot

Override the default error rendering with the `error` slot:

```vue
<VcTextarea
  v-model="value"
  label="JSON payload"
  :error="!!jsonError"
  :error-message="jsonError"
>
  <template #error>
    <div class="tw-flex tw-items-center tw-gap-1 tw-text-[color:var(--danger-500)] tw-text-xs tw-mt-1">
      <VcIcon icon="lucide-alert-triangle" size="xs" />
      <span>{{ jsonError }}</span>
    </div>
  </template>
</VcTextarea>
```

## Common Mistakes

### 1. Forgetting to wire handleChange with vee-validate

```vue
<!-- ❌ Validation never triggers — Field does not know about changes -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.notes" name="notes" rules="required">
  <VcTextarea
    v-model="form.notes"
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>

<!-- ✅ Always emit handleChange so Field tracks the value -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.notes" name="notes" rules="required">
  <VcTextarea
    v-model="form.notes"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 2. Setting error-message without error flag

```vue
<!-- ❌ Error message appears but no visual error styling -->
<VcTextarea v-model="value" error-message="Something went wrong" />

<!-- ✅ Either set both, or just set errorMessage (which auto-triggers invalid state internally) -->
<VcTextarea v-model="value" :error="true" error-message="Something went wrong" />
```

> **Important:** The component computes `invalid` from `props.error || props.errorMessage`. Providing `errorMessage` alone is sufficient to trigger the error ring, but explicitly passing `:error="true"` makes intent clearer.

### 3. Using v-model on the wrong type

```vue
<!-- ❌ Passing a number — textarea always emits string -->
<VcTextarea v-model="count" />

<!-- ✅ Use a string ref -->
const description = ref<string>("");
<VcTextarea v-model="description" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `undefined` | Bound value via `v-model` |
| `label` | `string` | -- | Label text displayed above the textarea |
| `placeholder` | `string` | -- | Placeholder text inside the empty textarea |
| `hint` | `string` | -- | Helper text displayed below the field |
| `tooltip` | `string` | -- | Tooltip on the label info icon |
| `maxlength` | `string` | `"1024"` | Maximum character count (native HTML attribute) |
| `required` | `boolean` | `false` | Shows a required indicator on the label |
| `error` | `boolean` | `false` | Enables error styling (red border + ring) |
| `errorMessage` | `string` | -- | Error message text below the field |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `name` | `string` | `"Field"` | HTML name attribute |
| `multilanguage` | `boolean` | `false` | Shows language badge on the label |
| `currentLanguage` | `string` | -- | Language code displayed in the badge |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| undefined` | Emitted on every input keystroke |

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error message markup. Replaces the default `VcHint` error. |
| `hint` | Custom hint text markup. Replaces the default `VcHint`. |

## Exposed Methods

| Method | Description |
|--------|-------------|
| `focus()` | Programmatically focuses the native `<textarea>` element |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--textarea-height` | `120px` | Minimum height of the textarea |
| `--textarea-border-color` | `var(--neutrals-300)` | Default border color |
| `--textarea-border-color-focus` | `var(--primary-500)` | Border color on focus |
| `--textarea-border-color-error` | `var(--danger-500)` | Border color in error state |
| `--textarea-border-radius` | `6px` | Corner radius |
| `--textarea-background-color` | `transparent` | Background color |
| `--textarea-text-color` | `var(--neutrals-800)` | Text color |
| `--textarea-text-color-error` | `var(--danger-500)` | Text color in error state |
| `--textarea-placeholder-color` | `var(--neutrals-400)` | Placeholder text color |
| `--textarea-focus-ring-color` | `var(--primary-100)` | Focus ring color |
| `--textarea-error-ring-color` | `var(--danger-100)` | Error ring color |
| `--textarea-disabled-text-color` | `var(--neutrals-500)` | Text color when disabled |

## Accessibility

- The `<label>` is linked to the `<textarea>` via `aria-labelledby`
- Hint and error text are connected via `aria-describedby`
- Error state sets `aria-invalid="true"` on the native textarea
- Required fields expose `aria-required="true"`
- Keyboard: fully tabbable, standard textarea behavior (Enter creates new lines, Tab moves focus)
- The field wrapper also responds to `textarea[aria-invalid="true"]` via a CSS `:has()` selector for future-proof form system integration

## Related Components

- [VcInput](../vc-input/) -- single-line text input
- [VcEditor](../vc-editor/) -- rich text / Markdown editor
- [VcInputGroup](../vc-input-group/) -- semantic wrapper for grouping form controls

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint — a label block (when the `label` prop is set) and an input-shaped block. No additional props or configuration needed.

This behavior is powered by `BladeLoadingKey` via Vue's provide/inject. The component injects the loading state from the nearest `VcBlade` ancestor.

