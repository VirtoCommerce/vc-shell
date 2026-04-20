# UI Types

TypeScript interfaces for UI component props shared across all form field components in the framework.

## Overview

Every form field component in the vc-shell framework -- whether it is a simple checkbox, a date picker, or a rich text editor -- needs a consistent set of base properties: labels, error states, disabled flags, and so on. These shared prop interfaces ensure that all form components behave uniformly and that consuming code can treat them polymorphically.

The types are organized in two layers:

- **`IFormFieldProps`** -- the minimal contract every form field implements (label, error, disabled, required)
- **`ITextFieldProps`** -- extends `IFormFieldProps` with text-input-specific features (placeholder, hint, clearable, loading, size)

When building custom form field components, extending these interfaces ensures compatibility with the framework's form layout system, validation display, and accessibility patterns.

**Files:** `index.ts`, `form-field.ts`

## Interfaces

### `IFormFieldProps`

Base props shared by all form field components (VcCheckbox, VcSwitch, VcRadioButton, VcInput, VcTextarea, VcSelect, VcDatePicker, VcEditor, VcFileUpload, VcColorInput, etc.).

| Prop           | Type       | Description                                            |
| -------------- | ---------- | ------------------------------------------------------ |
| `label`        | `string?`  | Field label text                                       |
| `tooltip`      | `string?`  | Tooltip shown on label hover                           |
| `disabled`     | `boolean?` | Whether the field is disabled                          |
| `required`     | `boolean?` | Whether the field is required                          |
| `name`         | `string?`  | Form field name attribute                              |
| `error`        | `boolean?` | External error flag                                    |
| `errorMessage` | `string?`  | Error message text (also sets error state when truthy) |

### `ITextFieldProps`

Extended props for text-input-like components (VcInput, VcTextarea, VcSelect, VcDatePicker, VcColorInput). Extends `IFormFieldProps`.

| Prop              | Type                    | Description                                  |
| ----------------- | ----------------------- | -------------------------------------------- |
| `placeholder`     | `string?`               | Placeholder text                             |
| `hint`            | `string?`               | Hint text shown below the field              |
| `clearable`       | `boolean?`              | Show clear button                            |
| `loading`         | `boolean?`              | Show loading indicator                       |
| `autofocus`       | `boolean?`              | Auto-focus on mount                          |
| `size`            | `"default" \| "small"?` | Field size variant                           |
| `multilanguage`   | `boolean?`              | Whether multilanguage mode is active         |
| `currentLanguage` | `string?`               | Current language code for multilanguage mode |

### `Breadcrumbs`

Breadcrumb navigation item used by blade headers.

| Prop           | Type                                                           | Description                    |
| -------------- | -------------------------------------------------------------- | ------------------------------ |
| `id`           | `string`                                                       | Unique breadcrumb identifier   |
| `title`        | `MaybeRef<string \| undefined>`                                | Display text (can be reactive) |
| `icon`         | `string?`                                                      | Icon identifier                |
| `clickHandler` | `(id: string) => void \| boolean \| Promise<void \| boolean>?` | Navigation handler             |

## Usage Examples

### Extending for a custom input component

```typescript
import type { ITextFieldProps } from "@vc-shell/framework";

// Extend for a custom input with prefix/suffix support
interface IMyFieldProps extends ITextFieldProps {
  prefix?: string;
  suffix?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
}
```

### Using in a component definition

```vue
<script setup lang="ts">
import type { IFormFieldProps } from "@vc-shell/framework";

interface IMyToggleProps extends IFormFieldProps {
  modelValue?: boolean;
  onLabel?: string;
  offLabel?: string;
}

const props = withDefaults(defineProps<IMyToggleProps>(), {
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <div
    class="my-toggle"
    :class="{ 'my-toggle--error': error || !!errorMessage }"
  >
    <VcLabel
      v-if="label"
      :tooltip="tooltip"
      :required="required"
    >
      {{ label }}
    </VcLabel>
    <button
      :disabled="disabled"
      :aria-checked="modelValue"
      role="switch"
      @click="emit('update:modelValue', !modelValue)"
    >
      {{ modelValue ? (onLabel ?? "On") : (offLabel ?? "Off") }}
    </button>
    <span
      v-if="errorMessage"
      class="my-toggle__error"
      >{{ errorMessage }}</span
    >
  </div>
</template>
```

### Typing a generic form field renderer

```typescript
import type { IFormFieldProps, ITextFieldProps } from "@vc-shell/framework";

// A utility type for dynamic form generation
interface FormFieldDefinition {
  component: string; // "VcInput" | "VcSelect" | "VcCheckbox" etc.
  props: IFormFieldProps | ITextFieldProps;
  modelKey: string;
}

function renderFormFields(fields: FormFieldDefinition[]) {
  // Dynamically render fields with consistent prop contracts
}
```

### Using Breadcrumbs type

```typescript
import type { Breadcrumbs } from "@vc-shell/framework";
import { computed } from "vue";

const crumb: Breadcrumbs = {
  id: "order-123",
  title: computed(() => `Order #${orderNumber.value}`),
  icon: "lucide-shopping-cart",
  clickHandler: async (id) => {
    await navigateToOrder(id);
    // Return false to prevent automatic trail trimming
    return false;
  },
};
```

## Tip: Error State Priority

Both `error` (boolean) and `errorMessage` (string) can set error state. When both are provided, the component shows the error message. When only `error` is `true` without a message, the field highlights in red but shows no text. Prefer using `errorMessage` alone -- the error styling is applied automatically when the message is truthy:

```vue
<!-- Preferred: errorMessage alone handles both styling and text -->
<VcInput :error-message="errors.name" label="Name" />

<!-- Also works but redundant: error flag is implied by errorMessage -->
<VcInput :error="!!errors.name" :error-message="errors.name" label="Name" />
```

## Related

- `framework/core/types/` -- Core types (validation rules, table columns, menus)
- `framework/ui/components/atoms/` -- Atom components implementing these props
- `framework/ui/components/molecules/` -- Molecule components extending these props
