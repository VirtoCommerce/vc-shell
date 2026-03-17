# VcTextarea

A multi-line text input field for entering and editing large blocks of text. Supports labels, hints, validation, and character limits.

## When to Use

- Multi-line free-form text: descriptions, comments, notes, addresses
- Content that typically exceeds a single line
- When NOT to use: single-line values (use [VcInput](../vc-input/)), rich formatted text (use [VcEditor](../vc-editor/))

## Basic Usage

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

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `undefined` | Bound value via `v-model` |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | -- | Placeholder text inside the textarea |
| `hint` | `string` | -- | Helper text below the field |
| `maxlength` | `string` | `"1024"` | Maximum character count |
| `required` | `boolean` | `false` | Shows required indicator on the label |
| `error` / `errorMessage` | `boolean` / `string` | -- | Triggers error styling and validation message |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `multilanguage` / `currentLanguage` | `boolean` / `string` | -- | Multilanguage label indicator |

## Common Patterns

### With Validation

```vue
<VcTextarea
  v-model="notes"
  label="Notes"
  required
  :error="!notes"
  error-message="Notes are required"
  placeholder="Add your notes here..."
/>
```

### With Character Limit

```vue
<VcTextarea
  v-model="bio"
  label="Short bio"
  maxlength="200"
  hint="Maximum 200 characters"
/>
```

## Slots

| Slot | Description |
|------|-------------|
| `error` | Custom error message markup |
| `hint` | Custom hint text markup |

## Accessibility

- Label is linked to the textarea via `aria-labelledby`
- Hint and error text are linked via `aria-describedby`
- Error state sets `aria-invalid="true"` on the native textarea
- Required fields expose `aria-required`
- Keyboard: fully tabbable, standard textarea behavior (Enter creates new lines)

## CSS Variables

- `--textarea-height` -- minimum height (default 120px)
- `--textarea-border-color`, `--textarea-border-color-focus`, `--textarea-border-color-error`
- `--textarea-text-color`, `--textarea-placeholder-color`
- `--textarea-focus-ring-color`, `--textarea-error-ring-color`

## Related Components

- [VcInput](../vc-input/) -- single-line text input
- [VcEditor](../vc-editor/) -- rich text / Markdown editor
