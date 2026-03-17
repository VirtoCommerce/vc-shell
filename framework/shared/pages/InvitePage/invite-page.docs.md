# InvitePage

Invitation acceptance page where an invited user sets their password. Validates the invitation token on mount, displays the pre-filled email, and provides password/confirm fields. Auto-signs in on success.

## When to Use

- As the target route for user invitation email links
- Requires `userId`, `userName`, and `token` from the URL query parameters

## Basic Usage

```vue
<template>
  <Invite
    :userId="route.query.userId"
    :userName="route.query.userName"
    :token="route.query.token"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string` | **required** | Invited user's ID from the link |
| `userName` | `string` | **required** | Invited user's email (shown as disabled field) |
| `token` | `string` | **required** | Invitation token from the email link |
| `logo` | `string` | `/assets/logo-white.svg` | Logo image URL |
| `background` | `string` | `/assets/background.jpg` | Background image URL |

## Features

- Token validation on mount; disables form and shows error if invalid
- Pre-filled, disabled email field showing the invited user's address
- Real-time password policy validation via `useUserManagement().validatePassword`
- Automatic sign-in and redirect to `/` after accepting the invitation

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ResetPasswordPage** - Similar flow (token + password) for password resets
