# LoginPage

Full-page login screen with username/password form, SSO external provider support, and forgot-password navigation. Wraps `VcAuthLayout` and uses `useUserManagement` for authentication.

## When to Use

- As the primary sign-in entry point for the application
- When you need SSO provider buttons alongside standard credentials
- Use `ssoOnly` mode to hide the credentials form and require external provider login

## Basic Usage

```vue
<template>
  <Login
    title="Welcome back"
    subtitle="Sign in to your account"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | - | Override logo image URL |
| `background` | `string` | - | Custom background image URL |
| `title` | `string` | i18n `LOGIN.TITLE` | Page heading text |
| `subtitle` | `string` | i18n `LOGIN.SUBTITLE` | Page subheading text |
| `ssoOnly` | `boolean` | `false` | Hide credentials form, show only SSO providers |

## Features

- Auto-detects SSO providers via `useExternalProvider().getProviders()`
- Redirects to `ChangePassword` route when the user's password is expired
- Supports `auth:after-form` extension point for plugin content below the form
- Displays inline error messages for invalid credentials or server errors

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ExternalProviders** - SSO provider button list
- **ForgotPassword** - Linked from the "Forgot password?" button
