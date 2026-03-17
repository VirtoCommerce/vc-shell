# Validation Plugin

Form validation integration using vee-validate. Registers all standard validation rules plus custom vc-shell rules for image dimensions, file weight, date comparisons, and BigInt safety.

## Overview

This plugin auto-registers every rule from `@vee-validate/rules` (required, email, min, max, etc.) via `defineRule()`, then adds custom rules specific to vc-shell use cases. Rules are available globally in any `<Field>` or `useField()` validation schema. The framework imports this module during setup -- no manual installation is needed.

## Installation / Registration

```typescript
// Automatic -- imported by the framework at startup.
// Rules become available to all vee-validate forms immediately.
```

## API

### Standard Rules (from @vee-validate/rules)

All rules from `@vee-validate/rules` are registered: `required`, `email`, `min`, `max`, `between`, `numeric`, `alpha`, `regex`, `confirmed`, `url`, `length`, etc.

### Custom Rules

| Rule | Params | Description |
|------|--------|-------------|
| `mindimensions` | `[width, height]` | Validates image files meet minimum pixel dimensions |
| `fileWeight` | `[sizeInKB]` | Validates file size does not exceed the limit (in kilobytes) |
| `before` | `[targetDate]` | Validates date is before the target date |
| `after` | `[targetDate]` | Validates date is after the target date |
| `bigint` | -- | Validates the value is a safe integer (`Number.isSafeInteger`) |

## Usage

### In VcField Components

```vue
<template>
  <VcField name="email" rules="required|email" v-slot="{ field, errors }">
    <VcInput v-bind="field" :error-message="errors[0]" />
  </VcField>
</template>
```

### Custom Rule: Image Dimensions

```vue
<VcField name="logo" rules="mindimensions:200,200" v-slot="{ field, errors }">
  <VcFileUpload v-bind="field" :error-message="errors[0]" />
</VcField>
```

### Custom Rule: File Weight

```vue
<VcField name="attachment" rules="fileWeight:500" v-slot="{ field, errors }">
  <!-- Max 500 KB -->
  <VcFileUpload v-bind="field" :error-message="errors[0]" />
</VcField>
```

### Custom Rule: Date Comparison

```vue
<VcField name="endDate" :rules="`after:${startDate}`" v-slot="{ field, errors }">
  <VcInput type="date" v-bind="field" :error-message="errors[0]" />
</VcField>
```

### Validation Schema (Object Syntax)

```typescript
import { useForm } from "vee-validate";

const { handleSubmit } = useForm({
  validationSchema: {
    name: "required|min:3",
    email: "required|email",
    price: "required|numeric|bigint",
  },
});
```

## Related

- [vee-validate docs](https://vee-validate.logaretm.com/v4/) -- upstream validation library
- `framework/core/plugins/i18n/` -- error messages use `i18n.global.t()` for localization
- Locale keys: `messages.min_dimensions.error`, `messages.file_weight`, `messages.before`, `messages.after`, `messages.bigint`
