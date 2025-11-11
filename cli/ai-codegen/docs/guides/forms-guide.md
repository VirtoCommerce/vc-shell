# Forms Guide

## Overview

VC-Shell forms use **VcForm + vee-validate** for validation.

## Basic Form Structure

```vue
<VcBlade>
  <VcContainer>
    <VcForm>
      <!-- Fields here -->
    </VcForm>
  </VcContainer>
</VcBlade>
```

## Form Fields

### Text Input

```vue
<Field v-slot="{ field, errorMessage, errors }" name="name" rules="required">
  <VcInput
    v-bind="field"
    v-model="entity.name"
    :label="$t('FORM.NAME')"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Email Input

```vue
<Field v-slot="{ field, errorMessage, errors }" name="email" rules="required|email">
  <VcInput
    v-bind="field"
    v-model="entity.email"
    type="email"
    :label="$t('FORM.EMAIL')"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>
```

### Select

```vue
<Field v-slot="{ errorMessage, errors }" name="status" rules="required">
  <VcSelect
    v-model="entity.status"
    :label="$t('FORM.STATUS')"
    :options="statusOptions"
    option-value="value"
    option-label="label"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>
```

### Textarea

```vue
<VcTextarea
  v-model="entity.description"
  :label="$t('FORM.DESCRIPTION')"
  :rows="4"
/>
```

## Validation

### Setup

```typescript
import { useForm } from "vee-validate";

const { meta } = useForm({ validateOnMount: false });

// Check before save
if (meta.value.valid) {
  await saveEntity();
}
```

### Rules

```vue
rules="required"
rules="required|email"
rules="required|min:3|max:100"
rules="required|bigint|min_value:0"
```

### Async Validation

```typescript
import { useDebounceFn } from "@vueuse/core";

const isValidating = ref(false);

const validateField = (value: string, field: string) => {
  isValidating.value = true;
  
  const debouncedValidation = useDebounceFn(async () => {
    const errors = await validateEntity({ ...entity.value, [field]: value });
    setFieldError(field, errors.map(e => t(`ERRORS.${e.code}`)).join("\n"));
    isValidating.value = false;
  }, 1000);
  
  debouncedValidation();
};
```

```vue
<VcInput
  :loading="isValidating"
  @update:model-value="(val) => validateField(val, 'code')"
/>
```

## Form Sections

Use VcCard to organize fields:

```vue
<VcForm>
  <!-- Main fields -->
  <Field><VcInput /></Field>
  
  <!-- Section 1 -->
  <VcCard header="Contact Info">
    <div class="tw-p-4">
      <Field><VcInput /></Field>
      <Field><VcInput /></Field>
    </div>
  </VcCard>
  
  <!-- Section 2 -->
  <VcCard header="Address" is-collapsable>
    <div class="tw-p-4">
      <VcRow>
        <VcCol><Field><VcInput /></Field></VcCol>
        <VcCol><Field><VcInput /></Field></VcCol>
      </VcRow>
    </div>
  </VcCard>
</VcForm>
```

## Toolbar

```typescript
const toolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        await saveEntity();
      }
    },
    disabled: computed(() => !(meta.value.valid && modified.value)),
  },
]);
```

## Modification Tracking

```typescript
const { modified, resetModificationState } = useEntityDetails();

// After save
resetModificationState();

// Warn on close
onBeforeClose(async () => {
  if (modified.value) {
    return await showConfirmation("Unsaved changes. Close anyway?");
  }
});

// Warn on browser refresh
useBeforeUnload(computed(() => modified.value));
```

## See Also

- [form-basic.md](../../src/examples/compositions/form-basic.md)
- [form-with-sections.md](../../src/examples/compositions/form-with-sections.md)
- [VcForm docs](https://github.com/VirtoCommerce/vc-shell-docs/blob/main/docs/vc-shell/ui-components/vc-form.md)

