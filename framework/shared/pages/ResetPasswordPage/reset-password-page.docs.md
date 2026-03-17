# ResetPasswordPage

Password reset page reached via an email link containing a token. Validates the token on mount, then shows password and confirm-password fields. Auto-signs in on success.

## When to Use

- As the target route for password-reset email links
- Requires `userId`, `userName`, and `token` from the URL query parameters

## Basic Usage

```vue
<template>
  <ResetPassword
    :userId="route.query.userId"
    :userName="route.query.userName"
    :token="route.query.token"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string` | **required** | User ID from the reset link |
| `userName` | `string` | **required** | Username/email for auto-sign-in after reset |
| `token` | `string` | **required** | Reset token from the email link |
| `logo` | `string` | `/assets/logo-white.svg` | Logo image URL |
| `background` | `string` | `/assets/background.jpg` | Background image URL |

## Features

- Token validation on mount; disables form and shows error if invalid
- Real-time password policy validation via `useUserManagement().validatePassword`
- Confirm-password mismatch detection
- Automatic sign-in and redirect to `/` after successful reset

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ForgotPasswordPage** - The page that initiates the reset flow
