# ChangePasswordPage

Change password page with current, new, and confirm password fields. Supports a `forced` mode for expired passwords that displays an info banner and was triggered by post-login redirect.

## When to Use

- When a signed-in user wants to change their password
- In `forced` mode after login when the user's password has expired

## Basic Usage

```vue
<template>
  <ChangePassword />
</template>

<!-- Forced mode (expired password) -->
<template>
  <ChangePassword forced />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forced` | `boolean` | `false` | Show expired-password info banner and adjusted title |
| `logo` | `string` | - | Override logo image URL |
| `background` | `string` | - | Custom background image URL |

## Features

- Real-time password policy validation via `useUserManagement().validatePassword`
- Detects when new password matches current password (shows "Equal-passwords" error)
- Confirm-password mismatch detection
- Cancel button signs out and redirects to `/login`
- On success, redirects to `/`

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **LoginPage** - Redirects here when `user.passwordExpired` is true
