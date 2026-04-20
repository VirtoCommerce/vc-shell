# Validation Plugin

Form validation integration using vee-validate. Registers all standard validation rules plus custom vc-shell rules for image dimensions, file weight, date comparisons, and BigInt safety.

## Overview

Form validation is a critical part of any admin interface. The vc-shell framework uses `vee-validate` v4 as its validation engine, which provides a declarative, composable approach to form validation that integrates naturally with Vue 3's Composition API.

This plugin auto-registers every rule from `@vee-validate/rules` (required, email, min, max, etc.) via `defineRule()`, then adds custom rules specific to vc-shell use cases. Once registered, rules are available globally in any `<Field>` component, `useField()` composable, or validation schema -- no per-component imports needed.

## When to Use

- Validate form fields in blades using `<Field>` components or `useField()` with declarative rules (`required`, `email`, `min`, etc.)
- Use custom vc-shell rules: image dimensions (`validateImageMinSize`), file weight, date comparisons, BigInt safety
- When NOT to use: for API-level validation -- that belongs server-side; for simple presence checks on non-form data -- use plain conditionals

The framework imports this module during setup. No manual installation is needed by module developers.

## Installation / Registration

```typescript
// Automatic -- imported by the framework at startup.
// Rules become available to all vee-validate forms immediately.

// Under the hood, the plugin does:
import { defineRule } from "vee-validate";
import * as allRules from "@vee-validate/rules";

// Register all standard rules
Object.entries(allRules).forEach(([name, rule]) => {
  defineRule(name, rule);
});

// Then register custom vc-shell rules
defineRule("mindimensions" /* ... */);
defineRule("fileWeight" /* ... */);
defineRule("before" /* ... */);
defineRule("after" /* ... */);
defineRule("bigint" /* ... */);
```

## API

### Standard Rules (from @vee-validate/rules)

All rules from `@vee-validate/rules` are registered: `required`, `email`, `min`, `max`, `between`, `numeric`, `alpha`, `alpha_num`, `alpha_dash`, `alpha_spaces`, `regex`, `confirmed`, `url`, `length`, `digits`, `integer`, `is`, `is_not`, `ext`, `mimes`, `image`, `size`, `dimensions`, `one_of`, `not_one_of`, etc.

### Custom Rules

| Rule            | Params            | Description                                                    |
| --------------- | ----------------- | -------------------------------------------------------------- |
| `mindimensions` | `[width, height]` | Validates image files meet minimum pixel dimensions            |
| `fileWeight`    | `[sizeInKB]`      | Validates file size does not exceed the limit (in kilobytes)   |
| `before`        | `[targetDate]`    | Validates date is before the target date                       |
| `after`         | `[targetDate]`    | Validates date is after the target date                        |
| `bigint`        | --                | Validates the value is a safe integer (`Number.isSafeInteger`) |

## Usage

### String Syntax (pipe-delimited)

The simplest approach for inline rule declarations:

```vue
<template>
  <VcField
    name="email"
    rules="required|email"
    v-slot="{ field, errors }"
  >
    <VcInput
      v-bind="field"
      :error-message="errors[0]"
      label="Email"
    />
  </VcField>

  <VcField
    name="username"
    rules="required|min:3|max:50"
    v-slot="{ field, errors }"
  >
    <VcInput
      v-bind="field"
      :error-message="errors[0]"
      label="Username"
    />
  </VcField>

  <VcField
    name="age"
    rules="required|numeric|between:18,120"
    v-slot="{ field, errors }"
  >
    <VcInput
      v-bind="field"
      :error-message="errors[0]"
      label="Age"
    />
  </VcField>
</template>
```

### Custom Rule: Image Dimensions

```vue
<VcField name="logo" rules="mindimensions:200,200" v-slot="{ field, errors }">
  <!-- Rejects images smaller than 200x200 pixels -->
  <VcFileUpload v-bind="field" :error-message="errors[0]" label="Logo (min 200x200)" />
</VcField>
```

### Custom Rule: File Weight

```vue
<VcField name="attachment" rules="fileWeight:500" v-slot="{ field, errors }">
  <!-- Max 500 KB -->
  <VcFileUpload v-bind="field" :error-message="errors[0]" label="Attachment (max 500KB)" />
</VcField>
```

### Custom Rule: Date Comparison

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
const startDate = ref("2024-01-01");
const endDateRules = computed(() => `required|after:${startDate.value}`);
</script>

<template>
  <VcField
    name="startDate"
    rules="required"
    v-slot="{ field, errors }"
  >
    <VcInput
      type="date"
      v-bind="field"
      v-model="startDate"
      :error-message="errors[0]"
      label="Start Date"
    />
  </VcField>

  <VcField
    name="endDate"
    :rules="endDateRules"
    v-slot="{ field, errors }"
  >
    <VcInput
      type="date"
      v-bind="field"
      :error-message="errors[0]"
      label="End Date"
    />
  </VcField>
</template>
```

### Validation Schema (Object Syntax)

For complex forms, define all rules in a single schema object:

```typescript
import { useForm } from "vee-validate";

const { handleSubmit, errors } = useForm({
  validationSchema: {
    name: "required|min:3",
    email: "required|email",
    price: "required|numeric|bigint",
    sku: "required|alpha_dash|min:3|max:64",
    startDate: "required",
    endDate: `required|after:${startDate.value}`,
    logo: "mindimensions:100,100|fileWeight:1024",
  },
});

const onSubmit = handleSubmit((values) => {
  // values is fully validated here
  await saveProduct(values);
});
```

### Custom Validation Messages via i18n

All custom rules use localized error messages via `i18n.global.t()`. To customize messages, add the corresponding keys to your module's locale file:

```typescript
// locales/en.ts
export default {
  messages: {
    min_dimensions: {
      error: "Image must be at least {width}x{height} pixels",
    },
    file_weight: "File must not exceed {size} KB",
    before: "Date must be before {target}",
    after: "Date must be after {target}",
    bigint: "Value exceeds safe integer range",
  },
};
```

## Tip: Reactive Rule Parameters

When rule parameters depend on reactive values (like a start date for an `after` rule), use a computed property for the rules string. This ensures the rule re-evaluates when the dependency changes:

```typescript
const startDate = ref("2024-01-01");
const endDateRules = computed(() => `required|after:${startDate.value}`);
```

## Common Mistake

Do not forget that `mindimensions` and `fileWeight` rules work with File objects, not strings. They are designed for file upload components. Using them on text inputs will produce unexpected results:

```vue
<!-- Correct: fileWeight on a file upload component -->
<VcField name="document" rules="fileWeight:2048" v-slot="{ field, errors }">
  <VcFileUpload v-bind="field" :error-message="errors[0]" />
</VcField>

<!-- Incorrect: fileWeight on a text input does nothing useful -->
<VcField name="document" rules="fileWeight:2048" v-slot="{ field, errors }">
  <VcInput v-bind="field" :error-message="errors[0]" />
</VcField>
```

## Related

- [vee-validate docs](https://vee-validate.logaretm.com/v4/) -- upstream validation library
- `framework/core/plugins/i18n/` -- error messages use `i18n.global.t()` for localization
- Locale keys: `messages.min_dimensions.error`, `messages.file_weight`, `messages.before`, `messages.after`, `messages.bigint`
- `framework/ui/components/molecules/vc-field/` -- VcField wrapper component for validation display
