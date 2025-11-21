---
id: composition-details-validation-patterns
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, details, validation]
title: "Validation Patterns"
description: "Validation Patterns composition for details blades using vee-validate Field component"
---

# Validation Patterns

Adds vee-validate form validation with Field component and string-based rules (NO Yup!).

## Description
Provides:
- Field validation with rules prop (e.g., "required", "min:3", "email")
- Error state tracking via useForm meta
- Validation before save
- Error messages display
- Custom async validation with setFieldError

## Usage
Wrap inputs that require validation in Field component with `rules` prop.
Inputs without validation rules can be used directly without Field wrapper.

## Code

### Setup Script

```typescript
import { useForm, Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { usePopup } from "@vc-shell/framework";

const { t } = useI18n({ useScope: "global" });
const { showError } = usePopup();

// Form setup with vee-validate (NO Yup schema needed!)
const { setFieldError, meta, errorBag } = useForm({
  validateOnMount: false,
});

// Check if form is valid and modified before saving
const isDisabled = computed(() => {
  return !meta.value.dirty || !meta.value.valid;
});

// Validate before save
async function validateAndSave() {
  if (!meta.value.valid) {
    showError(t("COMMON.VALIDATION_ERRORS"));
    return;
  }

  await onSave();
}
```

### Template - Field Component with Rules

```vue
<!-- REQUIRED field with min length -->
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  rules="required|min:3"
  :label="$t('MODULE.PAGES.DETAILS.FIELDS.NAME.TITLE')"
  :model-value="entity.name"
  name="name"
>
  <VcInput
    v-model="entity.name"
    :label="$t('MODULE.PAGES.DETAILS.FIELDS.NAME.TITLE')"
    required
    :placeholder="$t('MODULE.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>

<!-- REQUIRED field only -->
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  rules="required"
  :label="$t('MODULE.PAGES.DETAILS.FIELDS.EMAIL.TITLE')"
  :model-value="entity.email"
  name="email"
>
  <VcInput
    v-model="entity.email"
    :label="$t('MODULE.PAGES.DETAILS.FIELDS.EMAIL.TITLE')"
    type="email"
    required
    :placeholder="$t('MODULE.PAGES.DETAILS.FIELDS.EMAIL.PLACEHOLDER')"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>

<!-- Field with VcSelect -->
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  rules="required"
  :label="$t('MODULE.PAGES.DETAILS.FIELDS.TYPE.TITLE')"
  :model-value="entity.type"
  name="type"
>
  <VcSelect
    v-model="entity.type"
    :label="$t('MODULE.PAGES.DETAILS.FIELDS.TYPE.TITLE')"
    required
    :placeholder="$t('MODULE.PAGES.DETAILS.FIELDS.TYPE.PLACEHOLDER')"
    :error="!!errors.length"
    :error-message="errorMessage"
    :options="typeOptions"
    option-value="value"
    option-label="label"
    @update:model-value="handleChange"
  />
</Field>

<!-- NO validation - use input directly without Field wrapper -->
<VcTextarea
  v-model="entity.description"
  :label="$t('MODULE.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
  :placeholder="$t('MODULE.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
  :rows="4"
/>
```

### Toolbar Setup

```typescript
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        // Save logic
        await onSave();
      } else {
        showError(t("MODULE.PAGES.ALERTS.NOT_VALID"));
      }
    },
    disabled: computed(() => !(meta.value.valid && isModified.value)),
  },
]);
```

### Custom Async Validation

```typescript
import { useDebounceFn } from "@vueuse/core";

const isCodeValidating = ref(false);

const validateCode = (value: string, fieldName: string) => {
  isCodeValidating.value = true;

  const debouncedValidation = useDebounceFn(async () => {
    // Call backend API to validate
    const errors = await apiClient.validateEntity({ code: value });

    if (errors && errors.length > 0) {
      setFieldError(
        fieldName,
        errors
          .map((error) => t(`MODULE.PAGES.DETAILS.ERRORS.${error.errorCode}`))
          .join("\n"),
      );
    }

    isCodeValidating.value = false;
  }, 1000); // Debounce 1 second

  debouncedValidation();
};
```

```vue
<!-- Field with custom async validation -->
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  :label="$t('MODULE.PAGES.DETAILS.FIELDS.CODE.TITLE')"
  :model-value="entity.code"
  rules="required|min:3"
  name="code"
>
  <VcInput
    v-model="entity.code"
    :label="$t('MODULE.PAGES.DETAILS.FIELDS.CODE.TITLE')"
    :placeholder="$t('MODULE.PAGES.DETAILS.FIELDS.CODE.PLACEHOLDER')"
    required
    :loading="isCodeValidating"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="(e: string) => {
      handleChange(e);
      validateCode(e, 'code');
    }"
  />
</Field>
```

## Available Validation Rules

Built-in vee-validate rules (string-based):
- `required` - Field is required
- `min:3` - Minimum length (for strings)
- `max:50` - Maximum length
- `email` - Valid email format
- `url` - Valid URL format
- `numeric` - Must be numeric
- `alpha` - Only letters
- `alpha_num` - Letters and numbers only

Combine multiple rules with pipe `|`:
```
rules="required|min:3|max:50"
```

## Important Notes

⚠️ **DO NOT use Yup** - Use string-based rules in Field component
⚠️ **Only wrap validated inputs** - Inputs without validation don't need Field wrapper
✅ **Use handleChange** - Call it in @update:model-value for proper tracking
✅ **Use meta.value.valid** - Check form validity before save
✅ **Use meta.value.dirty** - Check if form has been modified
