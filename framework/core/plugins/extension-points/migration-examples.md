# 🔄 Migration to New Extension System

Detailed examples for migrating existing extensions to the new system.

## 🎯 Migration Structure

```
Old system (extensions-helper.ts):
- Complex typing (inbound/outbound)
- Namespace-based system
- Injection through provide/inject
- A lot of boilerplate code

New system (extension-points):
- Simple composables
- Slots and data
- Vue 3 reactivity
- Minimal code
```

## 📋 Complete Registration Module Migration

### Step 1: Update Login.vue

#### Before:
```vue
<!-- framework/shared/pages/LoginPage/components/login/Login.vue -->
<template>
  <VcLoginForm>
    <!-- ... existing content ... -->

    <!-- Complex extension system -->
    <template
      v-for="extension in afterLoginFormExtensions"
      :key="extension.id"
    >
      <div class="vc-login-page__extension">
        <component :is="extension.component" />
      </div>
    </template>
  </VcLoginForm>
</template>

<script setup lang="ts">
import { extensionsHelperSymbol } from "../extensions-helper";

const extensionsHelper = inject(extensionsHelperSymbol);

const afterLoginFormExtensions = computed(
  (): ExtensionPoint[] =>
    (extensionsHelper?.getOutboundExtensions("login-after-form") as ExtensionPoint[]) || []
);
</script>
```

#### After:
```vue
<!-- framework/shared/pages/LoginPage/components/login/Login.vue -->
<template>
  <VcLoginForm>
    <!-- ... same existing content ... -->

    <!-- Simple extension slot -->
    <div class="vc-login-page__extensions">
      <ExtensionSlot name="login-after-form" />
    </div>
  </VcLoginForm>
</template>

<script setup lang="ts">
// Remove old imports:
// import { extensionsHelperSymbol } from "../extensions-helper";

// Add new import:
import { ExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';

// Remove:
// const extensionsHelper = inject(extensionsHelperSymbol);
// const afterLoginFormExtensions = computed(...);

// Rest of the code remains unchanged
</script>
```

### Step 2: Simplify Registration Module

#### Before:
```typescript
// vc-module-marketplace-registration-1/src/.../registration/index.ts
import * as locales from "./locales";
import { i18n } from "@vc-shell/framework";
import { Router } from "vue-router";
import { App } from "vue";
import { routes } from "./router";
import { useRegistrationForm } from "./composables/useRegistrationForm";
import { RegistrationButton } from "./components";

export default {
  install(app: App, options?: { router: Router }) {
    let routerInstance: Router;

    if (options && options.router) {
      const { router } = options;
      routerInstance = router;
    }

    routes.forEach((route) => {
      routerInstance.addRoute(route);
    });

    if (locales) {
      Object.entries(locales).forEach(([key, message]) => {
        i18n.global.mergeLocaleMessage(key, message);
      });
    }
  },
  extensions: {
    inbound: {
      "registration-form": useRegistrationForm(),
    },
    outbound: {
      "login-after-form": [{ id: "RegistrationButton", component: RegistrationButton }],
    },
  },
};
```

#### After:
```typescript
// vc-module-marketplace-registration-1/src/.../registration/index.ts
import * as locales from "./locales";
import { i18n } from "@vc-shell/framework";
import { Router } from "vue-router";
import { App } from "vue";
import { routes } from "./router";
import { useExtensionSlot, useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';
import RegistrationButton from "./components/RegistrationButton.vue";

export default {
  install(app: App, options?: { router: Router }) {
    // Router setup (unchanged)
    if (options?.router) {
      routes.forEach((route) => {
        options.router.addRoute(route);
      });
    }

    // Localization (unchanged)
    if (locales) {
      Object.entries(locales).forEach(([key, message]) => {
        i18n.global.mergeLocaleMessage(key, message);
      });
    }

    // 🎯 NEW: Simple component registration
    const { addComponent } = useExtensionSlot('login-after-form');

    addComponent({
      id: 'registration-button',
      component: RegistrationButton,
      props: {
        text: 'Register',
        variant: 'outline',
      },
      priority: 10,
    });

    // 🎯 NEW: Provide form data
    const { updateData } = useExtensionData('registration-form');

    updateData({
      fields: [
        {
          name: 'firstName',
          type: 'text',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.FIRST_NAME',
          placeholder: 'VCMP_VENDOR_REGISTRATION.PLACEHOLDERS.FIRST_NAME',
          required: true,
          rules: 'required',
          priority: 10,
        },
        {
          name: 'lastName',
          type: 'text',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.LAST_NAME',
          placeholder: 'VCMP_VENDOR_REGISTRATION.PLACEHOLDERS.LAST_NAME',
          required: true,
          rules: 'required',
          priority: 20,
        },
        {
          name: 'organizationName',
          type: 'text',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.ORGANIZATION',
          placeholder: 'VCMP_VENDOR_REGISTRATION.PLACEHOLDERS.ORGANIZATION',
          required: true,
          rules: 'required',
          priority: 30,
        },
        {
          name: 'contactEmail',
          type: 'email',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.EMAIL',
          placeholder: 'VCMP_VENDOR_REGISTRATION.PLACEHOLDERS.EMAIL',
          hint: 'VCMP_VENDOR_REGISTRATION.HINTS.EMAIL',
          required: true,
          rules: 'emailWithServerValidation',
          priority: 40,
        },
        {
          name: 'contactPhone',
          type: 'tel',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.PHONE',
          placeholder: 'VCMP_VENDOR_REGISTRATION.PLACEHOLDERS.PHONE',
          rules: 'phone',
          priority: 50,
        },
      ],
    });
  },
};
```

### Step 3: Simplify useRegistrationForm Composable

#### Before:
```typescript
// composables/useRegistrationForm/index.ts
import { ref, computed } from "vue";

export interface IFormField {
  name: string;
  type: string;
  component: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rules?: string;
  props?: Record<string, unknown>;
  priority?: number;
}

export interface IRegistrationFormConfig {
  fields: IFormField[];
}

const defaultFields: IFormField[] = [
  // ... lots of field code
];

const formConfig = ref<IRegistrationFormConfig>({
  fields: [...defaultFields],
});

const formData = ref<Record<string, unknown>>({});

defaultFields.forEach((field) => {
  formData.value[field.name] = "";
});

export function useRegistrationForm() {
  const extendForm = (newFields: IFormField[]) => {
    formConfig.value.fields = [...formConfig.value.fields, ...newFields].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0),
    );

    newFields.forEach((field) => {
      if (!(field.name in formData.value)) {
        formData.value[field.name] = "";
      }
    });
  };

  // ... lots of other logic

  return {
    formConfig: computed(() => formConfig.value),
    formData: computed(() => formData.value),
    extendForm,
    removeField,
    updateField,
    updateFormData,
    getFormData,
    setFormData,
    clearFormData,
  };
}
```

#### After:
```typescript
// composables/useRegistrationForm/index.ts
import { ref, computed } from "vue";
import { useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';

export interface IFormField {
  name: string;
  type: string;
  component: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rules?: string;
  props?: Record<string, unknown>;
  priority?: number;
}

export function useRegistrationForm() {
  // 🎯 NEW: Use extension system
  const { data, updateData, getValue, setValue } = useExtensionData('registration-form');

  // Local form data
  const formData = ref<Record<string, unknown>>({});

  // Fields from extension system
  const formConfig = computed(() => ({
    fields: (data.value.fields || []).sort((a: IFormField, b: IFormField) =>
      (a.priority || 0) - (b.priority || 0)
    ),
  }));

  const extendForm = (newFields: IFormField[]) => {
    const currentFields = data.value.fields || [];
    updateData({
      fields: [...currentFields, ...newFields],
    });
  };

  const removeField = (fieldName: string) => {
    const currentFields = data.value.fields || [];
    updateData({
      fields: currentFields.filter((field: IFormField) => field.name !== fieldName),
    });
  };

  const updateField = (fieldName: string, updates: Partial<IFormField>) => {
    const currentFields = data.value.fields || [];
    const updatedFields = currentFields.map((field: IFormField) =>
      field.name === fieldName ? { ...field, ...updates } : field
    );
    updateData({ fields: updatedFields });
  };

  const updateFormData = (fieldName: string, value: unknown) => {
    formData.value[fieldName] = value;
  };

  const getFormData = () => {
    return formData.value;
  };

  const setFormData = (newData: Record<string, unknown>) => {
    formData.value = { ...formData.value, ...newData };
  };

  const clearFormData = () => {
    formData.value = {};
  };

  return {
    formConfig,
    formData: computed(() => formData.value),
    extendForm,
    removeField,
    updateField,
    updateFormData,
    getFormData,
    setFormData,
    clearFormData,
  };
}
```

### Step 4: Registration Button Component (unchanged)

```vue
<!-- components/RegistrationButton.vue -->
<template>
  <VcButton @click="onRegisterClick">
    {{ text || 'Register' }}
  </VcButton>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

interface Props {
  text?: string;
  variant?: string;
}

const props = defineProps<Props>();
const router = useRouter();

const onRegisterClick = () => {
  router.push("/registration");
};
</script>
```

## 📖 Complete Application Usage Example

### 1. Registration Customization from Main Application

```typescript
// main.ts or any module file
import { useExtensionSlot, useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';
import CustomRegistrationButton from './components/CustomRegistrationButton.vue';

// After app initialization:

// 1. Replace registration button with custom one
const { addComponent } = useExtensionSlot('login-after-form');

addComponent({
  id: 'registration-button', // same ID - will replace existing
  component: CustomRegistrationButton,
  props: {
    text: 'Create Seller Account',
    variant: 'primary',
    showIcon: true,
  },
  priority: 10,
});

// 2. Add custom fields to registration form
const { data: formData, updateData } = useExtensionData('registration-form');

// Get current fields
const currentFields = formData.value.fields || [];

// Add new field
updateData({
  fields: [
    ...currentFields,
    {
      name: 'companyTaxId',
      type: 'text',
      component: 'VcInput',
      label: 'Company Tax ID',
      placeholder: 'Enter Tax ID',
      required: true,
      rules: 'required|taxId',
      priority: 25, // between lastName (20) and organizationName (30)
    },
    {
      name: 'businessType',
      type: 'select',
      component: 'VcSelect',
      label: 'Business Type',
      placeholder: 'Select type',
      required: true,
      props: {
        options: [
          { value: 'individual', label: 'Individual Entrepreneur' },
          { value: 'llc', label: 'Limited Liability Company' },
          { value: 'corporation', label: 'Corporation' },
        ],
      },
      priority: 35,
    },
  ],
});

// 3. Modify existing field
const updatedFields = formData.value.fields?.map((field: any) => {
  if (field.name === 'organizationName') {
    return {
      ...field,
      label: 'Company Name',
      placeholder: 'LLC "Company Name"',
      required: false,
    };
  }
  return field;
});

updateData({ fields: updatedFields });
```

### 2. Custom Registration Button Component

```vue
<!-- components/CustomRegistrationButton.vue -->
<template>
  <div class="custom-registration">
    <div class="registration-promo">
      <VcIcon
        v-if="showIcon"
        icon="material-storefront"
        class="tw-mb-2"
        size="xl"
      />
      <h3>Become a Partner!</h3>
      <p class="tw-text-sm tw-text-gray-600">
        Join our platform and start selling today
      </p>
    </div>

    <VcButton
      :variant="variant"
      class="tw-w-full"
      @click="openRegistration"
    >
      <VcIcon
        v-if="showIcon"
        icon="material-person_add"
        class="tw-mr-2"
      />
      {{ text }}
    </VcButton>

    <div class="tw-mt-2 tw-text-xs tw-text-center tw-text-gray-500">
      Registration takes no more than 5 minutes
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Props {
  text?: string;
  variant?: string;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Register',
  variant: 'primary',
  showIcon: true,
});

const router = useRouter();

const openRegistration = () => {
  // Can add analytics
  console.log('User clicked registration button');

  router.push('/registration');
};
</script>

<style scoped>
.custom-registration {
  @apply tw-text-center tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-mt-4;
}

.registration-promo {
  @apply tw-mb-4;
}
</style>
```

## 📋 Migration Checklist

### ✅ Preparation
- [ ] Study current extension system
- [ ] Identify all extension points
- [ ] Create migration plan

### ✅ Login.vue Update
- [ ] Replace complex extension logic with `<ExtensionSlot>`
- [ ] Remove old system imports
- [ ] Add `ExtensionSlot` import
- [ ] Test display

### ✅ Registration Module
- [ ] Simplify module `index.ts`
- [ ] Replace `extensions` object with composable calls
- [ ] Update `useRegistrationForm` composable
- [ ] Test component registration

### ✅ Testing
- [ ] Check registration button display
- [ ] Check registration form functionality
- [ ] Check app-level customization
- [ ] Check component replacement

### ✅ Documentation
- [ ] Update module documentation
- [ ] Add usage examples
- [ ] Document API changes

## 🚀 Migration Results

### Before (lines of code):
- `extensions-helper.ts`: ~210 lines
- Logic in `Login.vue`: ~15 lines
- `useRegistrationForm`: ~142 lines
- **Total**: ~367 lines of complex code

### After (lines of code):
- `simple-extensions.ts`: ~85 lines
- Logic in `Login.vue`: ~3 lines
- `useRegistrationForm`: ~60 lines
- **Total**: ~148 lines of simple code

### Benefits:
- ✅ **60% code reduction**
- ✅ **API simplification from 8 to 3 functions**
- ✅ **Full TypeScript support**
- ✅ **Better performance**
- ✅ **Easier to maintain and extend**

Migration complete! 🎉