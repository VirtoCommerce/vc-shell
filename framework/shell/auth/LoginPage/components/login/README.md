# Login Component Extension Guide

The Login component can be extended through the dynamic modules system. This guide explains how to add custom functionality to the login page.

## Extension Points

Currently, the Login component supports the following extension points:

- `login-after-form` - Allows adding content after the login form

## How to Add Extensions

### 1. Create Your Extension Component

First, create your custom component:
```vue
<!-- MyLoginExtension.vue -->
<template>
<div class="my-login-extension">
<!-- Your custom content -->
</div>
</template>
<script lang="ts" setup>
// Your component logic
</script>
```

### 2. Register Extension in Your Module

In your module's entry point, register the extension:

```typescript
import MyLoginExtension from './components/MyLoginExtension.vue';
export default {
  install(app) {
  // Module installation logic
  },
extensions: {
    'login-after-form': [{id: 'MyLoginExtension', component: MyLoginExtensionComponent}]
  }
}
```

## Extension Points Details

### login-after-form

This extension point appears after the login form and before any error messages. Extensions will be rendered with:
- A horizontal separator line above
- Centered alignment
- Proper spacing from the login form

