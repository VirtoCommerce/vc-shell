# 16. VcLoginForm → VcAuthLayout

## What Changed

`VcLoginForm` has been removed. Use `VcAuthLayout` instead — a layout component with slots for form content.

## Migration

**Before:**
```vue
<template>
  <VcLoginForm
    :logo="logo"
    :background="bgImage"
    :title="Login"
  />
</template>
```

**After:**
```vue
<template>
  <VcAuthLayout
    :logo="logo"
    :background="bgImage"
    title="Login"
    subtitle="Sign in to your account"
  >
    <!-- Form content via default slot -->
    <VcInput v-model="email" label="Email" />
    <VcInput v-model="password" label="Password" type="password" />
    <VcButton @click="login">Sign In</VcButton>

    <template #footer>
      <a href="/terms">Terms of Service</a>
    </template>
  </VcAuthLayout>
</template>

<script setup lang="ts">
import { VcAuthLayout } from "@vc-shell/framework";
</script>
```

### VcAuthLayout Props

| Prop | Type | Description |
|------|------|-------------|
| `logo` | `string` | Path to logo image |
| `background` | `string` | Background image URL |
| `title` | `string` | Card heading |
| `subtitle` | `string` | Card subheading |
| `bgColor` | `string` | Background color override |
| `logoAlt` | `string` | Alt text for logo (default: "Logo") |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Form content (fields, buttons, SSO, errors) |
| `footer` | Below card (terms, privacy links) |

## How to Find
```bash
grep -rn "VcLoginForm\|vc-login-form" src/ --include="*.vue" --include="*.ts"
```
