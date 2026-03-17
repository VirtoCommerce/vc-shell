# v-autofocus Directive

Focuses an element when it is mounted, conditionally based on the binding value.

## Overview

A simple Vue directive that calls `el.focus()` on mount when the bound value is truthy. Useful for auto-focusing input fields when a blade or dialog opens.

## API

| Binding | Type | Description |
|---------|------|-------------|
| `v-autofocus="condition"` | `boolean` | Focus the element on mount if `condition` is truthy |

The directive only acts on the `mounted` hook. It does not re-focus on updates.

## Usage Examples

```vue
<template>
  <!-- Always focus on mount -->
  <input v-autofocus="true" />

  <!-- Conditionally focus -->
  <input v-autofocus="isEditMode" />
</template>
```

## Related

- `framework/ui/types/form-field.ts` -- `ITextFieldProps.autofocus` prop on form components
- `framework/core/directives/loading/` -- `v-loading` directive
