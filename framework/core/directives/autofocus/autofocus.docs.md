# v-autofocus Directive

Focuses an element when it is mounted, conditionally based on the binding value.

## Overview

When building blade-based interfaces, users often expect the primary input field to receive focus automatically as soon as a blade or dialog opens. Without auto-focus, users must manually click the first field every time, which slows down data entry workflows.

The `v-autofocus` directive solves this by calling `el.focus()` on the element's `mounted` lifecycle hook whenever the bound value is truthy. It is a one-shot directive -- it only evaluates the condition at mount time and does not re-focus on subsequent updates or reactive changes.

The directive is registered globally by the framework, so no manual import is needed in templates.

## API

| Binding | Type | Description |
|---------|------|-------------|
| `v-autofocus="condition"` | `boolean` | Focus the element on mount if `condition` is truthy |

The directive only acts on the `mounted` hook. It does not re-focus on updates.

## Source

```typescript
// framework/core/directives/autofocus/index.ts
import { Directive, DirectiveBinding } from "vue";

export const autofocus = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value) {
      el.focus();
    }
  },
} as Directive;
```

## Usage Examples

### Always focus on mount

```vue
<template>
  <!-- The search field gets focus as soon as the blade opens -->
  <input v-autofocus="true" placeholder="Search orders..." />
</template>
```

### Conditionally focus based on blade mode

```vue
<template>
  <!-- Only auto-focus when the blade is in edit mode -->
  <VcInput
    v-autofocus="isEditMode"
    v-model="product.name"
    label="Product Name"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ param?: string }>();
const isEditMode = computed(() => !!props.param);
</script>
```

### Focus inside a dialog

```vue
<template>
  <VcPopup v-model:show="showDialog" title="Rename Item">
    <VcInput
      v-autofocus="showDialog"
      v-model="newName"
      label="New name"
    />
  </VcPopup>
</template>
```

### Using with VcInput vs native input

The directive works on any HTML element that supports `.focus()`. For `VcInput` and other framework components, the directive is applied to the component's root element. If the root element is not focusable (e.g., a `<div>` wrapper), use the component's `autofocus` prop instead:

```vue
<!-- Preferred for framework components: use the autofocus prop -->
<VcInput :autofocus="true" v-model="value" label="Name" />

<!-- Works on native elements directly -->
<input v-autofocus="true" />
<textarea v-autofocus="true" />
```

## Tip: Re-focusing on reactive changes

Since `v-autofocus` only fires on mount, it will not re-focus if you toggle the condition later. If you need re-focus behavior (e.g., after a save operation returns to edit mode), use a template ref with `watch`:

```typescript
import { ref, watch, nextTick } from "vue";

const inputRef = ref<HTMLInputElement>();
const isEditMode = ref(false);

watch(isEditMode, async (editing) => {
  if (editing) {
    await nextTick();
    inputRef.value?.focus();
  }
});
```

## Common Mistake

Do not bind `v-autofocus` to a reactive value expecting it to re-focus on changes. The directive only evaluates once at mount time. If you write `v-autofocus="isEditing"` and `isEditing` starts as `false` then becomes `true`, the element will not receive focus because the mounted hook already ran.

## Related

- `framework/ui/types/form-field.ts` -- `ITextFieldProps.autofocus` prop on form components
- `framework/core/directives/loading/` -- `v-loading` directive
