# 🔌 Extension Points System

A simple and powerful extension system for VirtoCommerce Shell, built on Vue 3 composables.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Migration from Current System](#-migration-from-current-system)
- [Usage Examples](#-usage-examples)
- [Best Practices](#-best-practices)

## 🚀 Quick Start

### 1. Adding a slot to your component

```vue
<template>
  <div>
    <!-- Your content -->
    <h1>Page Title</h1>

    <!-- Extension point -->
    <ExtensionSlot name="page-after-title" />

    <!-- Rest of content -->
  </div>
</template>

<script setup lang="ts">
import { ExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';
</script>
```

### 2. Registering a component in a slot

```typescript
// In any module
import { useExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';
import MyComponent from './MyComponent.vue';

const { addComponent } = useExtensionSlot('page-after-title');

addComponent({
  id: 'my-custom-component',
  component: MyComponent,
  props: { message: 'Hello from extension!' },
  priority: 10,
});
```

### 3. Data exchange between modules

```typescript
// Data provider module
import { useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';

const { updateData } = useExtensionData('user-profile');
updateData({ userId: '123', userName: 'John Doe' });

// Data consumer module
const { data } = useExtensionData('user-profile');
console.log(data.value.userName); // 'John Doe'
```

## 📚 API Documentation

### useExtensionSlot(slotName: string)

Composable for working with extension slots.

```typescript
const {
  components,        // computed<ExtensionComponent[]> - list of components
  addComponent,      // (component: ExtensionComponent) => void
  removeComponent,   // (componentId: string) => void
  hasComponents,     // computed<boolean> - whether slot has components
} = useExtensionSlot('slot-name');
```

#### ExtensionComponent interface:
```typescript
interface ExtensionComponent {
  id: string;                          // unique component ID
  component: Component;                // Vue component
  props?: Record<string, unknown>;     // props for component
  priority?: number;                   // priority (lower = higher)
}
```

### useExtensionData(namespace: string)

Composable for data exchange between modules.

```typescript
const {
  data,              // computed<Record<string, any>> - reactive data
  updateData,        // (newData: Record<string, any>) => void - merge data
  setData,           // (newData: Record<string, any>) => void - replace data
  getValue,          // (key: string, defaultValue?: any) => any
  setValue,          // (key: string, value: any) => void
} = useExtensionData('namespace');
```

### useExtensions()

Composable for global extension system management.

```typescript
const {
  getAllSlots,       // () => string[] - all slots
  getSlotComponents, // (slotName: string) => ExtensionComponent[]
  getAllData,        // () => Record<string, any> - all data
  getNamespaceData,  // (namespace: string) => Record<string, any>
  clearSlot,         // (slotName: string) => void
  clearData,         // (namespace: string) => void
} = useExtensions();
```

## 🔄 Migration from Current System

### Before (current system):

```typescript
// registration-module/index.ts - old system
export default {
  install(app: App) {
    // Complex setup...
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

```vue
<!-- Login.vue - old system -->
<template>
  <!-- Extensions after form -->
  <template
    v-for="extension in afterLoginFormExtensions"
    :key="extension.id"
  >
    <div class="vc-login-page__extension">
      <component :is="extension.component" />
    </div>
  </template>
</template>

<script setup>
import { inject } from "vue";
import { extensionsHelperSymbol } from "../extensions-helper";

const extensionsHelper = inject(extensionsHelperSymbol);
const afterLoginFormExtensions = computed(
  (): ExtensionPoint[] =>
    (extensionsHelper?.getOutboundExtensions("login-after-form") as ExtensionPoint[]) || []
);
</script>
```

### After (new system):

```typescript
// registration-module/index.ts - new system
import { useExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';
import RegistrationButton from './RegistrationButton.vue';

export default {
  install() {
    const { addComponent } = useExtensionSlot('login-after-form');

    addComponent({
      id: 'registration-button',
      component: RegistrationButton,
      priority: 10,
    });
  }
};
```

```vue
<!-- Login.vue - new system -->
<template>
  <!-- One simple component instead of complex logic -->
  <ExtensionSlot name="login-after-form" />
</template>

<script setup>
import { ExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';
</script>
```

## 📖 Detailed Registration Migration Example

### Step 1: Update Login.vue

```vue
<!-- framework/shared/pages/LoginPage/components/login/Login.vue -->
<template>
  <VcLoginForm>
    <template v-if="isLogin">
      <VcForm @submit.prevent="login">
        <!-- Existing form fields -->
        <Field v-slot="{ errorMessage, handleChange, errors }" ...>
          <VcInput ... />
        </Field>
        <!-- ... other fields ... -->
      </VcForm>

      <!-- External providers -->
      <div v-if="loginProviders && loginProviders.length" ...>
        <ExternalProviders :providers="loginProviders" />
      </div>

      <!-- 🎯 REPLACE complex system with simple slot -->
      <ExtensionSlot name="login-after-form" />
    </template>
  </VcLoginForm>
</template>

<script setup lang="ts">
// Remove:
// import { extensionsHelperSymbol } from "../extensions-helper";
// const extensionsHelper = inject(extensionsHelperSymbol);
// const afterLoginFormExtensions = computed(...);

// Add:
import { ExtensionSlot } from '@vc-shell/framework/core/plugins/extension-points';

// Rest of the code remains unchanged
const { signIn, loading, user } = useUserManagement();
// ...
</script>
```

### Step 2: Simplify Registration Module

```typescript
// vc-module-marketplace-registration/src/.../registration/index.ts

// Before: Complex extensions object
export default {
  extensions: {
    inbound: {
      "registration-form": useRegistrationForm(),
    },
    outbound: {
      "login-after-form": [{ id: "RegistrationButton", component: RegistrationButton }],
    },
  },
};

// After: Simple composable calls
import { useExtensionSlot, useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';
import RegistrationButton from './components/RegistrationButton.vue';

export default {
  install() {
    // 🎯 NEW: Simple component registration
    const { addComponent } = useExtensionSlot('login-after-form');

    addComponent({
      id: 'registration-button',
      component: RegistrationButton,
      props: {
        text: 'Register',
      },
      priority: 10,
    });

    // Provide registration form data
    const { updateData } = useExtensionData('registration-form');
    updateData({
      fields: [
        {
          name: 'firstName',
          type: 'text',
          component: 'VcInput',
          label: 'VCMP_VENDOR_REGISTRATION.LABELS.FIRST_NAME',
          required: true,
          priority: 10,
        },
        // ... other fields
      ],
    });
  },
};
```

## 💡 Usage Examples

### Application-level Customization

```typescript
// main.ts or any app module file
import { useExtensionSlot, useExtensionData } from '@vc-shell/framework/core/plugins/extension-points';
import CustomButton from './components/CustomButton.vue';

// Replace registration button with custom one
const { addComponent } = useExtensionSlot('login-after-form');
addComponent({
  id: 'registration-button', // same ID - will replace existing
  component: CustomButton,
  props: {
    text: 'Create Account',
    variant: 'primary',
    showIcon: true,
  },
  priority: 10,
});

// Add custom fields to registration form
const { data } = useExtensionData('registration-form');
const { extendForm } = useRegistrationForm();

extendForm([
  {
    name: 'companyTaxId',
    type: 'text',
    component: 'VcInput',
    label: 'Company Tax ID',
    required: true,
    priority: 25, // between lastName (20) and organizationName (30)
  }
]);
```

### Adding Slots to Blades

```vue
<!-- seller-details-edit.vue -->
<template>
  <VcBlade>
    <VcContainer>
      <!-- Main cards -->
      <VcRow>
        <VcCol><!-- Info card --></VcCol>
        <VcCol><!-- Address card --></VcCol>

        <!-- 🎯 Slot for additional cards -->
        <ExtensionSlot name="seller-details-additional-cards" />
      </VcRow>

      <!-- 🎯 Slot for additional sections -->
      <ExtensionSlot name="seller-details-sections" />
    </VcContainer>
  </VcBlade>
</template>
```

## ✅ Best Practices

### 1. Slot Naming
- Use kebab-case: `seller-details-cards`
- Include context: `login-after-form`, `profile-before-save`
- Be descriptive: `product-listing-filters`

### 2. Priorities
- Use multiples of 10: 10, 20, 30, ...
- Leave room for insertions: between 10 and 30 you can insert 20
- Document priorities in comments

### 3. Component IDs
- Use unique IDs: `module-name-component-purpose`
- Avoid generic names: `button`, `form`
- Use for replacement: same ID = component replacement

### 4. Data Namespaces
- Group by functionality: `user-profile`, `order-details`
- Avoid conflicts: use module prefixes
- Document data structure

### 5. Performance
- Components are lazy-loaded by default
- Don't overuse number of slots
- Use `v-if` with `hasComponents` for conditional rendering

```vue
<template>
  <div v-if="hasComponents" class="extensions-section">
    <ExtensionSlot name="optional-content" />
  </div>
</template>

<script setup>
const { hasComponents } = useExtensionSlot('optional-content');
</script>
```

## 🎯 Conclusion

The new extension system provides:

- ✅ **Simplicity** - 3 main functions instead of complex hierarchy
- ✅ **Flexibility** - easy component replacement and extension
- ✅ **Performance** - minimal overhead, Vue 3 optimizations
- ✅ **TypeScript** - full type safety
- ✅ **Backward compatibility** - doesn't break existing code

The system is ready to use and allows easy migration of existing extensions!