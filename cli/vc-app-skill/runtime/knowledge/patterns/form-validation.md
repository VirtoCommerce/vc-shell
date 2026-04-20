# Form Validation Pattern

Generic worked example for form validation in details blades.

## Overview

Form validation in vc-shell uses vee-validate v4 with a declarative `<Field>` wrapper around each input. The framework auto-registers all standard rules plus custom vc-shell rules at startup -- no per-component imports needed. `useForm()` provides reactive form-level validity metadata for controlling toolbar buttons and save guards.

---

## Core Wiring Pattern: Field + VcInput

Every validated field follows the same three-part contract:

1. `<Field>` tracks the value and applies rules
2. The inner component uses `v-model` for two-way binding
3. `handleChange` keeps vee-validate in sync on every update

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="item.name" name="name" rules="required">
  <VcInput
    v-model="item.name"
    label="Name"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

**Critical:** Without `@update:model-value="handleChange"`, vee-validate never learns the value changed and validation will not trigger. Without `:model-value` on `<Field>`, the rule has nothing to validate against.

---

## Wiring Other Input Components

The same pattern applies to every vc-shell input. Only the inner component changes.

### VcSelect

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="item.categoryId" name="categoryId" rules="required">
  <VcSelect
    v-model="item.categoryId"
    label="Category"
    :options="categories"
    option-value="id"
    option-label="name"
    required
    :clearable="false"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### VcEditor (Rich Text)

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="item.description" name="description" rules="required">
  <VcEditor
    v-model="item.description"
    label="Description"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### VcTextarea

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="item.notes" name="notes" rules="required|min:10">
  <VcTextarea
    v-model="item.notes"
    label="Notes"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Fields That Do Not Need Validation

Simple toggles and checkboxes typically skip the `<Field>` wrapper:

```vue
<VcSwitch v-model="item.isActive" label="Active" />
<VcCheckbox v-model="item.acceptTerms" label="I accept the terms" />
```

---

## Available Validation Rules

Rules are composed with `|` (pipe) in the `rules` string.

### Standard Rules (from @vee-validate/rules)

| Rule          | Example                | Description                          |
| ------------- | ---------------------- | ------------------------------------ |
| `required`    | `"required"`           | Must have a value                    |
| `email`       | `"required\|email"`    | Valid email format                   |
| `min:N`       | `"required\|min:3"`    | Minimum string length                |
| `max:N`       | `"max:255"`            | Maximum string length                |
| `min_value:N` | `"min_value:0"`        | Minimum numeric value                |
| `between:N,M` | `"between:1,100"`      | Numeric range                        |
| `numeric`     | `"numeric"`            | Digits only                          |
| `alpha_dash`  | `"alpha_dash"`         | Letters, digits, dashes, underscores |
| `regex:P`     | `"regex:^[A-Z]+"`      | Custom regex match                   |
| `confirmed:F` | `"confirmed:password"` | Must match another field             |
| `url`         | `"url"`                | Valid URL format                     |

### Custom vc-shell Rules

| Rule            | Params            | Description                                      |
| --------------- | ----------------- | ------------------------------------------------ |
| `bigint`        | --                | Value is a safe integer (`Number.isSafeInteger`) |
| `mindimensions` | `[width, height]` | Image meets minimum pixel dimensions             |
| `fileWeight`    | `[sizeInKB]`      | File size under limit (KB)                       |
| `before`        | `[targetDate]`    | Date is before target                            |
| `after`         | `[targetDate]`    | Date is after target                             |

---

## Form-Level Validation with useForm

`useForm()` provides reactive metadata about all `<Field>` components in the current component tree.

```ts
import { useForm, Field } from "vee-validate";

const { meta, setFieldError } = useForm({
  validateOnMount: false, // Always false -- avoids errors on blade open
});

// meta.value.valid  -- true when ALL fields pass
// meta.value.dirty  -- true when ANY field has changed
```

### Disabling the Save Button

Wire `meta.value.valid` into the toolbar's `disabled` computed:

```ts
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    disabled: computed(() => !meta.value.valid || !modified.value),
    async clickHandler() {
      if (meta.value.valid) {
        await saveItem();
        callParent("reload");
        closeSelf();
      }
    },
  },
]);
```

**Tip:** Use `modified.value` from your details composable instead of `meta.value.dirty`. The `dirty` flag only tracks vee-validate Field changes and misses switches, checkboxes, and other non-validated inputs.

---

## Dynamic and Conditional Rules

When rules depend on reactive state, use a computed or `:rules` binding:

```vue
<!-- Conditionally required -->
<Field :rules="item.trackInventory ? 'required|bigint|min_value:0' : 'bigint|min_value:0'" :model-value="item.quantity" name="quantity" v-slot="{ errorMessage, handleChange, errors }">
  <VcInput
    v-model="item.quantity"
    type="number"
    label="Quantity"
    :required="item.trackInventory"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

---

## Cross-Field Validation

Use the `after` / `before` custom rules with reactive parameters, or the `confirmed` standard rule.

### Date Range (start must be before end)

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { Field, useForm } from "vee-validate";

const { meta } = useForm({ validateOnMount: false });

const startDate = ref("");
const endDate = ref("");
const endDateRules = computed(() => `required|after:${startDate.value}`);
</script>

<template>
  <VcForm>
    <Field
      v-slot="{ errorMessage, handleChange, errors }"
      :model-value="startDate"
      name="startDate"
      rules="required"
    >
      <VcInput
        v-model="startDate"
        type="date"
        label="Start Date"
        required
        :error="!!errors.length"
        :error-message="errorMessage"
        @update:model-value="handleChange"
      />
    </Field>

    <Field
      v-slot="{ errorMessage, handleChange, errors }"
      :model-value="endDate"
      name="endDate"
      :rules="endDateRules"
    >
      <VcInput
        v-model="endDate"
        type="date"
        label="End Date"
        required
        :error="!!errors.length"
        :error-message="errorMessage"
        @update:model-value="handleChange"
      />
    </Field>
  </VcForm>
</template>
```

### Password Confirmation

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="password" name="password" rules="required|min:8">
  <VcInput
    v-model="password"
    type="password"
    label="Password"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>

<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="confirmPassword" name="confirmPassword" rules="required|confirmed:password">
  <VcInput
    v-model="confirmPassword"
    type="password"
    label="Confirm Password"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

---

## Server-Side Validation Errors

Use `setFieldError()` to display API-returned errors on specific fields:

```ts
const { setFieldError } = useForm({ validateOnMount: false });

async function save() {
  try {
    await api.updateItem(item.value);
  } catch (e: unknown) {
    if (e instanceof ApiValidationError) {
      for (const [field, messages] of Object.entries(e.errors)) {
        setFieldError(field, messages.join("\n"));
      }
    }
  }
}
```

---

## Validation Schema (Alternative to Inline Rules)

For forms with many fields, define all rules in one object:

```ts
const { handleSubmit } = useForm({
  validateOnMount: false,
  validationSchema: {
    name: "required|min:3",
    email: "required|email",
    sku: "required|alpha_dash|min:3|max:64",
    price: "required|numeric|bigint",
    startDate: "required",
  },
});
```

When using a schema, `<Field>` components still need `name` but can omit `rules` -- the schema supplies them.

---

## Common Mistakes

1. **Missing `handleChange`** -- vee-validate stays stale; validation never fires on input.
2. **Missing `:model-value` on Field** -- rule has no value to validate; always shows as valid.
3. **`validateOnMount: true`** -- shows errors on every field the moment the blade opens. Always use `false`.
4. **Using `meta.value.dirty` for save button** -- misses non-validated fields (switches, checkboxes). Use a dedicated `modified` ref from your composable.
5. **Static rule string for cross-field** -- `rules="after:${startDate.value}"` captures the value once at template compile. Use `:rules="endDateRules"` with a computed.

---

## Key Rules

1. Always set `validateOnMount: false` in `useForm()`.
2. Every validated field must wire all three: `:model-value`, `v-model`, and `@update:model-value="handleChange"`.
3. Use pipe-delimited rule strings (`"required|email|min:3"`) for inline rules.
4. Use `:rules` binding with computed for dynamic/cross-field rules.
5. Disable save via `computed(() => !meta.value.valid || !modified.value)` on the toolbar item.
6. Fields without validation rules (switches, checkboxes) do not need a `<Field>` wrapper.
