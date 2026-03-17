# ForgotPasswordPage

Password recovery page where the user enters their email to receive a reset link. Shows a masked-email confirmation on success. Supports a custom composable for the reset logic.

## When to Use

- As the forgot-password screen linked from the login page
- When you need a custom password-reset flow via the `composable` prop

## Basic Usage

```vue
<template>
  <ForgotPassword />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | - | Override logo image URL |
| `background` | `string` | - | Custom background image URL |
| `composable` | `() => { forgotPassword }` | - | Custom composable providing `forgotPassword(args)` |

## Features

- Two-state UI: request form and success confirmation
- Masks the submitted email (e.g., `j***n@example.com`) in the success message
- Falls back to `useUserManagement().requestPasswordReset` when no custom composable is provided
- "Back to login" navigation returns to the Login route

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **LoginPage** - Navigates back to login on success or cancel
