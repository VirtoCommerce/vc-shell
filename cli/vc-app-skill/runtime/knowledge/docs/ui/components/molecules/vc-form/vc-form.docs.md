# VcForm

A lightweight `<form>` wrapper that provides consistent styling, prevents default browser submission, and serves as the standard container for validated form fields in blade detail views.

## When to Use

| Scenario                               | Component                  |
| -------------------------------------- | -------------------------- |
| Blade detail view with editable fields | **VcForm**                 |
| Popup with a short input form          | **VcForm**                 |
| Read-only display of data              | Plain `<div>` or `VcField` |

> **Important:** VcForm renders a native `<form>` element with `novalidate`. All validation is handled by **vee-validate** `Field` components, not by the browser.

---

## Quick Start

```vue
<template>
  <VcForm @submit="handleSubmit">
    <div class="tw-space-y-4">
      <VcInput
        v-model="name"
        label="Name"
        required
      />
      <VcInput
        v-model="email"
        label="Email"
        required
      />
      <VcButton type="submit">Save</VcButton>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcForm, VcInput, VcButton } from "@vc-shell/framework";

const name = ref("");
const email = ref("");

function handleSubmit() {
  console.log("Submitted:", { name: name.value, email: email.value });
}
</script>
```

---

## Features

### Basic Form Layout (VcForm + VcRow + VcCol)

Use `VcRow` and `VcCol` inside VcForm to create multi-column layouts that match the standard blade form appearance.

```vue
<VcForm>
  <VcRow>
    <VcCol>
      <VcInput v-model="firstName" label="First Name" />
    </VcCol>
    <VcCol>
      <VcInput v-model="lastName" label="Last Name" />
    </VcCol>
  </VcRow>
  <VcRow>
    <VcCol>
      <VcInput v-model="email" label="Email" />
    </VcCol>
  </VcRow>
</VcForm>
```

`VcRow` renders a horizontal flex row. `VcCol` accepts a `:size` prop (1 = full width, 2 = half width) to control column spans.

### Validation with vee-validate `Field` (The Critical Pattern)

VcForm itself does **not** manage validation. Validation is provided by wrapping each input with the `Field` component from `vee-validate`. This is the standard pattern used across the entire codebase:

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.fieldName" name="fieldName" rules="required">
  <VcInput
    v-model="form.fieldName"
    label="Field Label"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

**How it works step by step:**

1. `Field` receives the current value via `:model-value` and tracks it under `name`
2. The `rules` prop defines validation rules (e.g. `"required"`, `"required|email"`, `"required|min:3"`)
3. The scoped slot exposes `errors`, `errorMessage`, and `handleChange`
4. The inner input uses `v-model` for two-way binding and calls `handleChange` on every update so vee-validate stays in sync
5. `:error="!!errors.length"` toggles the input's error visual state
6. `:error-message="errorMessage"` displays the validation message below the input

> **Important:** You must call `handleChange` via `@update:model-value`. Without it, vee-validate does not know the value changed and validation will not trigger.

This same pattern works with all VcShell inputs:

```vue
<!-- VcSelect -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.category" name="category" rules="required">
  <VcSelect
    v-model="form.category"
    label="Category"
    required
    :options="categories"
    option-value="id"
    option-label="name"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>

<!-- VcTextarea -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.description" name="description" rules="required|min:10">
  <VcTextarea
    v-model="form.description"
    label="Description"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Form States with `useForm()`

The `useForm()` composable from vee-validate provides reactive metadata about the form's validity, dirty state, and submission status. In VcShell blades, it is typically used to control toolbar button states.

```vue
<script setup lang="ts">
import { useForm, Field } from "vee-validate";

const { meta, setFieldError, errorBag } = useForm({
  validateOnMount: false,
});

// meta.value.valid  -- true when ALL fields pass validation
// meta.value.dirty  -- true when ANY field has been modified
</script>
```

Common usage in blade toolbar:

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
      } else {
        showError("Please fix validation errors before saving.");
      }
    },
  },
]);
```

---

## Recipes

### Complete CRUD Blade Form

This is the standard pattern for a detail blade with validated fields, toolbar save/delete, and unsaved-changes confirmation.

```vue
<template>
  <VcBlade
    :loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    :modified="modified"
    @close="$emit('close:blade')"
  >
    <VcContainer>
      <VcForm class="tw-space-y-4">
        <VcRow>
          <VcCol>
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :model-value="item.name"
              name="name"
              rules="required"
            >
              <VcInput
                v-model="item.name"
                label="Name"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>

        <VcRow>
          <VcCol>
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :model-value="item.email"
              name="email"
              rules="required|email"
            >
              <VcInput
                v-model="item.email"
                label="Email"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
          <VcCol>
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :model-value="item.role"
              name="role"
              rules="required"
            >
              <VcSelect
                v-model="item.role"
                label="Role"
                required
                :options="roles"
                option-value="id"
                option-label="name"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>

        <VcRow>
          <VcCol>
            <VcSwitch
              v-model="item.isActive"
              label="Active"
            />
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { Field, useForm } from "vee-validate";
import { useBlade, usePopup, VcBlade, VcContainer, VcForm, VcInput, VcSelect, VcSwitch } from "@vc-shell/framework";
import type { IBladeToolbar } from "@vc-shell/framework";

const { onBeforeClose } = useBlade();
const { showConfirmation, showError } = usePopup();
const { meta } = useForm({ validateOnMount: false });

const item = ref({ name: "", email: "", role: "", isActive: true });
const loading = ref(false);
const modified = ref(false);

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    disabled: computed(() => !meta.value.valid || !modified.value),
    async clickHandler() {
      if (meta.value.valid) {
        await saveItem();
      } else {
        showError("Please fix the validation errors.");
      }
    },
  },
]);

onBeforeClose(async () => {
  if (modified.value) {
    return !(await showConfirmation("Discard unsaved changes?"));
  }
  return false;
});
</script>
```

### Form with Mixed Field Types

Demonstrates inputs, selects, checkboxes, and switches together in a single form.

```vue
<VcForm class="tw-space-y-4">
  <!-- Text input -->
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.title"
    name="title"
    rules="required|min:3"
  >
    <VcInput
      v-model="form.title"
      label="Title"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>

  <!-- Number input -->
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.quantity"
    name="quantity"
    rules="required|min_value:0"
  >
    <VcInput
      v-model="form.quantity"
      type="number"
      label="Quantity"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>

  <!-- Select dropdown -->
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.category"
    name="category"
    rules="required"
  >
    <VcSelect
      v-model="form.category"
      label="Category"
      required
      :options="categoryOptions"
      option-value="id"
      option-label="name"
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>

  <!-- Switch (no validation needed) -->
  <VcSwitch v-model="form.trackInventory" label="Track Inventory" />

  <!-- Checkbox (no validation needed) -->
  <VcCheckbox v-model="form.acceptTerms" label="I accept the terms" />
</VcForm>
```

> **Tip:** Only wrap fields in `Field` when they need validation rules. Simple toggles like `VcSwitch` and `VcCheckbox` can be used directly with `v-model`.

### Server-Side Validation Errors

Use `setFieldError()` from `useForm()` to display errors returned by the API:

```ts
import { useForm, Field } from "vee-validate";

const { setFieldError } = useForm({ validateOnMount: false });

async function save() {
  try {
    await api.updateItem(item.value);
  } catch (e: unknown) {
    // Assume the API returns { errors: { fieldName: ["message"] } }
    if (e instanceof ApiValidationError) {
      for (const [field, messages] of Object.entries(e.errors)) {
        setFieldError(field, messages.join("\n"));
      }
    }
  }
}
```

Real-world example from the Offers module -- validating SKU uniqueness with a debounced API call:

```ts
const validateSku = (value: string) => {
  const debouncedValidation = useDebounceFn(async () => {
    const errors = await validateOffer({ ...offer.value, sku: value });
    const skuErrors = errors?.filter((e) => e.propertyName?.toLowerCase() === "sku");
    setFieldError("sku", skuErrors.map((e) => t(`ERRORS.${e.errorCode}`, { value: e.attemptedValue })).join("\n"));
  }, 1000);

  debouncedValidation();
};
```

---

## Common Mistakes

### Not wiring `handleChange` to the input

```vue
<!-- BAD: vee-validate never learns about value changes -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.name" name="name" rules="required">
  <VcInput
    v-model="form.name"
    label="Name"
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>

<!-- GOOD: handleChange keeps vee-validate in sync -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.name" name="name" rules="required">
  <VcInput
    v-model="form.name"
    label="Name"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Forgetting `:model-value` on `Field`

```vue
<!-- BAD: Field does not track the current value -->
<Field v-slot="{ errorMessage, handleChange, errors }" name="name" rules="required">
  <VcInput v-model="form.name" label="Name" />
</Field>

<!-- GOOD: Field receives the value and can validate it -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.name" name="name" rules="required">
  <VcInput
    v-model="form.name"
    label="Name"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Using `validateOnMount: true` unintentionally

```ts
// BAD: shows errors on all fields immediately when the blade opens
const { meta } = useForm({ validateOnMount: true });

// GOOD: validate only after user interaction
const { meta } = useForm({ validateOnMount: false });
```

### Checking `meta.dirty` instead of a dedicated `modified` ref

```ts
// BAD: meta.dirty only tracks vee-validate Field changes,
// misses switches, checkboxes, and other non-validated fields
disabled: computed(() => !meta.value.dirty),

// GOOD: use a dedicated modification tracker from your composable
disabled: computed(() => !modified.value),
```

---

## Props

| Prop             | Type     | Default     | Description                               |
| ---------------- | -------- | ----------- | ----------------------------------------- |
| `ariaLabel`      | `string` | `undefined` | Accessible label for the `<form>` element |
| `ariaLabelledby` | `string` | `undefined` | ID of an element that labels the form     |

## Events

| Event    | Payload | Description                                                                 |
| -------- | ------- | --------------------------------------------------------------------------- |
| `submit` | --      | Emitted on form submission. Native `submit` is already `preventDefault`-ed. |

## Slots

| Slot      | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `default` | Form content -- inputs, buttons, fieldsets, VcRow/VcCol layouts |

## CSS Custom Properties

| Variable     | Default | Description                                             |
| ------------ | ------- | ------------------------------------------------------- |
| `--form-gap` | `1rem`  | Default gap between form children (when using flex gap) |

## Accessibility

- Renders a native `<form>` element with `novalidate` (browser validation is disabled in favor of vee-validate)
- Supports `aria-label` and `aria-labelledby` for screen readers
- The `submit` event is automatically `preventDefault`-ed to avoid page reloads

## Related Components

- **[VcInput](../vc-input/)** -- text input field
- **[VcSelect](../vc-select/)** -- dropdown select field
- **[VcTextarea](../vc-textarea/)** -- multiline text input
- **[VcSwitch](../vc-switch/)** -- toggle switch
- **[VcCheckbox](../vc-checkbox/)** -- checkbox input
- **[VcRow](../../atoms/vc-row/)** -- horizontal flex row for form layout
- **[VcCol](../../atoms/vc-col/)** -- column within a VcRow
- **[VcCard](../vc-card/)** -- collapsible card for grouping form sections
- **[VcBlade](../../organisms/vc-blade/)** -- blade container that hosts the form
- **[VcPopup](../../organisms/vc-popup/)** -- modal dialog, often used for inline forms
