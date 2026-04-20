# ResetPasswordPage

Password reset page reached via an email link containing a token. Validates the token on mount, then shows password and confirm-password fields. On success, the user is automatically signed in and redirected to the main application. This page is the second step of the password recovery flow, following the `ForgotPasswordPage` which dispatches the reset email.

## When to Use

- As the target route for password-reset email links
- Requires `userId`, `userName`, and `token` from the URL query parameters
- The standard vc-shell routing maps `/reset-password` to this page

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

With custom branding:

```vue
<template>
  <ResetPassword
    :userId="route.query.userId"
    :userName="route.query.userName"
    :token="route.query.token"
    logo="/assets/my-company-logo.svg"
    background="/assets/custom-background.jpg"
  />
</template>
```

## Key Props

| Prop         | Type     | Default                  | Description                                 |
| ------------ | -------- | ------------------------ | ------------------------------------------- |
| `userId`     | `string` | **required**             | User ID from the reset link                 |
| `userName`   | `string` | **required**             | Username/email for auto-sign-in after reset |
| `token`      | `string` | **required**             | Reset token from the email link             |
| `logo`       | `string` | `/assets/logo-white.svg` | Logo image URL                              |
| `background` | `string` | `/assets/background.jpg` | Background image URL                        |

## Recipe: Router Configuration

Set up the route to extract query parameters from the password reset email link:

```ts
import ResetPassword from "@vc-shell/framework/shared/pages/ResetPasswordPage";

const routes = [
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { public: true },
    props: (route) => ({
      userId: route.query.userId as string,
      userName: route.query.userName as string,
      token: route.query.token as string,
    }),
  },
];
```

The reset email link typically looks like:

```
https://your-app.com/reset-password?userId=abc123&userName=jane@example.com&token=xyz789...
```

## Recipe: Complete Password Recovery Flow

The full flow involves three pages working together:

1. **LoginPage**: User clicks "Forgot password?" link
2. **ForgotPasswordPage**: User enters email, receives reset link
3. **ResetPasswordPage**: User clicks email link, sets new password, auto-signs in

```
Login -> "Forgot password?" -> ForgotPasswordPage
                                    |
                              (email sent)
                                    |
                              ResetPasswordPage -> auto sign-in -> App
```

## Features

- **Token validation on mount**: The reset token is validated against the platform API. If the token is invalid or expired, the form is disabled and an error message is shown.
- **Real-time password policy validation**: Uses `useUserManagement().validatePassword` to check the new password against the platform's policy (minimum length, character classes, etc.).
- **Confirm-password mismatch detection**: Validates that the new password and confirm password fields match.
- **Automatic sign-in and redirect**: After successful reset, the user is signed in with their new password and redirected to `/`.

## Details

- **Auth layout**: Renders inside `VcAuthLayout`, providing the centered card design consistent with other auth pages.
- **Public route**: This page must be accessible without authentication. Ensure the route has `meta: { public: true }`.
- **Token lifecycle**: Reset tokens are single-use and time-limited (typically 24 hours, configurable on the platform). Once used or expired, the user must request a new reset from the ForgotPasswordPage.
- **Auto sign-in**: After the password is reset, the page calls `signIn(userName, newPassword)` automatically. This avoids forcing the user to re-enter credentials they just set.

## Tips

- All three props (`userId`, `userName`, `token`) are required. If any is missing, the page will not function correctly. Consider route guards to redirect to the login page when parameters are missing.
- The page shares significant logic with `InvitePage` (both validate a token on mount and collect a new password). The difference is that ResetPasswordPage resets an existing user's password, while InvitePage sets an initial password for a new user.
- If the token has expired, the user must start the flow over from the ForgotPasswordPage. The error message on this page should guide them accordingly.
- Customize `logo` and `background` props to match your application's branding.

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ForgotPasswordPage** - The page that initiates the reset flow
- **InvitePage** - Similar flow (token + password) for user invitations
- **LoginPage** - The starting point and the destination for "back to login" links
