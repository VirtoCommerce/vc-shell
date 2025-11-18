# Validation Patterns

Adds vee-validate form validation with error display.

## Description
Provides:
- Field validation rules
- Error state tracking
- Validation before save
- Error messages display

## Usage
Combine with form-basic pattern. Adds validation layer to form fields.

## Code

```typescript
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

// Validation schema
const validationSchema = yup.object({
  name: yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  url: yup.string().url("Invalid URL format"),
});

// Form setup
const { errors, validate, resetForm } = useForm({
  validationSchema,
  initialValues: entity.value,
});

// Field bindings
const { value: name, errorMessage: nameError } = useField<string>("name");
const { value: email, errorMessage: emailError } = useField<string>("email");
const { value: price, errorMessage: priceError } = useField<number>("price");
const { value: url, errorMessage: urlError } = useField<string>("url");

// Validate before save
async function validateAndSave() {
  const { valid } = await validate();

  if (!valid) {
    console.warn("Validation failed:", errors.value);
    return;
  }

  await onSave();
}
```

```vue
<VcInput
  v-model="name"
  :label="$t('NAME')"
  :placeholder="$t('NAME_PLACEHOLDER')"
  required
  :error="!!nameError"
  :error-message="nameError"
  @update:model-value="onModified"
/>

<VcInput
  v-model="email"
  :label="$t('EMAIL')"
  :placeholder="$t('EMAIL_PLACEHOLDER')"
  type="email"
  required
  :error="!!emailError"
  :error-message="emailError"
  @update:model-value="onModified"
/>

<VcInput
  v-model="price"
  :label="$t('PRICE')"
  :placeholder="$t('PRICE_PLACEHOLDER')"
  type="number"
  required
  :error="!!priceError"
  :error-message="priceError"
  @update:model-value="onModified"
/>

<VcInput
  v-model="url"
  :label="$t('URL')"
  :placeholder="$t('URL_PLACEHOLDER')"
  :error="!!urlError"
  :error-message="urlError"
  @update:model-value="onModified"
/>
```

```typescript
// Update toolbar to use validateAndSave
bladeToolbar.value[0].clickHandler = validateAndSave;
```

```typescript
// Custom async validation example
const { value: username, errorMessage: usernameError } = useField<string>(
  "username",
  async (value) => {
    if (!value) return "Username is required";

    // Check availability via API
    const isAvailable = await checkUsernameAvailability(value);
    return isAvailable ? true : "Username is already taken";
  }
);
```
