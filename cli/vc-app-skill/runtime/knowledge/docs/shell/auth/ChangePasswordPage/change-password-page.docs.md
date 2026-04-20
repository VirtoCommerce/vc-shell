# ChangePasswordPage

Change password page with current, new, and confirm password fields. Supports a `forced` mode for expired passwords that displays an info banner and is triggered by post-login redirect. This full-page variant is used when the user must change their password before accessing the application (e.g., expired password policy). For voluntary password changes from within the app, the `ChangePasswordButton` in the settings menu opens a popup instead.

## When to Use

- When a signed-in user wants to change their password (full-page flow)
- In `forced` mode after login when the user's password has expired
- The standard vc-shell routing maps `/change-password` to this page

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

With custom branding:

```vue
<template>
  <ChangePassword
    forced
    logo="/assets/my-company-logo.svg"
    background="/assets/custom-background.jpg"
  />
</template>
```

## Key Props

| Prop         | Type      | Default | Description                                          |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| `forced`     | `boolean` | `false` | Show expired-password info banner and adjusted title |
| `logo`       | `string`  | -       | Override logo image URL                              |
| `background` | `string`  | -       | Custom background image URL                          |

## Recipe: Router Configuration with Forced Mode

Set up the route so the login page can redirect here when the password is expired:

```ts
import ChangePassword from "@vc-shell/framework/shared/pages/ChangePasswordPage";

const routes = [
  {
    path: "/change-password",
    name: "ChangePassword",
    component: ChangePassword,
    props: (route) => ({
      forced: route.query.forced === "true",
    }),
  },
];
```

In the login flow, redirect when the user's password has expired:

```ts
async function handleLogin() {
  const result = await signIn(username.value, password.value);
  if (result.passwordExpired) {
    router.push({ name: "ChangePassword", query: { forced: "true" } });
  } else {
    router.push("/");
  }
}
```

## Features

- **Real-time password policy validation**: Uses `useUserManagement().validatePassword` to check the new password against the platform's policy as the user types (minimum length, required uppercase, lowercase, digits, special characters)
- **Equal password detection**: Shows a specific "Equal-passwords" error when the new password matches the current password, without making an API call
- **Confirm-password mismatch detection**: Validates that the new password and confirm password fields match
- **Forced mode banner**: When `forced` is `true`, displays an info banner explaining that the password has expired and must be changed
- **Cancel behavior**: Cancel button signs out the user and redirects to `/login`
- **Success redirect**: On successful password change, redirects to `/` (main application)

## Details

- **Auth layout**: Renders inside `VcAuthLayout`, providing the centered card design with logo and background.
- **Password policy**: The validation rules are fetched from the platform API and include configurable requirements (minimum length, character classes, etc.). The component displays these rules as a checklist.
- **Forced vs voluntary**: In forced mode (`forced=true`), the page title changes to reflect the expired password scenario, and an info banner explains why the change is required. The form fields and behavior are otherwise identical.
- **Sign-out on cancel**: If the user cancels during a forced password change, they are signed out. This prevents access to the application with an expired password.

## Tips

- The `forced` prop is typically set via a route query parameter, not hardcoded. The login page detects expired passwords and redirects with the appropriate flag.
- Password policy validation runs on keyup, providing immediate feedback. The submit button is disabled until all policy requirements are met and the passwords match.
- This page is distinct from the `ChangePasswordButton` popup. The page is for full-screen flow (forced changes), while the popup is for voluntary in-app password changes.

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **LoginPage** - Redirects here when `user.passwordExpired` is true
- **ChangePasswordButton** - Settings menu popup variant for voluntary password changes
