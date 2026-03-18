# ForgotPasswordPage

Password recovery page where the user enters their email to receive a reset link. Shows a masked-email confirmation on success. This page is part of the standard authentication flow in vc-shell and handles the first step of password recovery: collecting the user's email address and dispatching a reset email through the platform API.

The page has two visual states: the request form (email input + submit button) and the success confirmation (masked email display + back-to-login link).

## When to Use

- As the forgot-password screen linked from the login page
- When you need a custom password-reset flow via the `composable` prop
- The standard vc-shell routing maps `/forgot-password` to this page

## Basic Usage

```vue
<template>
  <ForgotPassword />
</template>
```

With custom branding:

```vue
<template>
  <ForgotPassword
    logo="/assets/my-company-logo.svg"
    background="/assets/custom-background.jpg"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | - | Override logo image URL |
| `background` | `string` | - | Custom background image URL |
| `composable` | `() => { forgotPassword }` | - | Custom composable providing `forgotPassword(args)` |

## Recipe: Custom Reset Flow with a Different API

If your application uses a custom identity service instead of the standard VirtoCommerce Platform API, pass a custom composable:

```ts
// useCustomPasswordReset.ts
export function useCustomPasswordReset() {
  async function forgotPassword({ loginOrEmail }: { loginOrEmail: string }) {
    const response = await customApi.requestPasswordReset(loginOrEmail);
    if (!response.succeeded) {
      throw new Error(response.errors.join(", "));
    }
  }

  return { forgotPassword };
}
```

```vue
<template>
  <ForgotPassword :composable="useCustomPasswordReset" />
</template>
```

## Recipe: Router Configuration

Register the page in your application router:

```ts
import ForgotPassword from "@vc-shell/framework/shared/pages/ForgotPasswordPage";

const routes = [
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { public: true },
  },
];
```

## Features

- **Two-state UI**: Request form and success confirmation with smooth transition
- **Email masking**: Masks the submitted email in the success message (e.g., `j***n@example.com`) to confirm the address without fully exposing it
- **Fallback logic**: Falls back to `useUserManagement().requestPasswordReset` when no custom composable is provided
- **"Back to login" navigation**: Returns to the Login route on both the success screen and via a cancel link
- **Error handling**: Displays inline error messages if the reset request fails (e.g., user not found, rate limiting)

## Details

- **Auth layout**: Renders inside `VcAuthLayout`, which provides the centered card design with logo and background image.
- **Public route**: This page must be accessible without authentication. Ensure the route has `meta: { public: true }` or equivalent guard exclusion.
- **Email validation**: The form validates the email format on the client side before submitting to the API.

## Tips

- The masked email pattern (e.g., `j***n@example.com`) is generated client-side from the email the user entered. It is a UX convenience, not a security feature.
- If the API returns a success response even for non-existent emails (to prevent user enumeration), the success confirmation is shown regardless. This is standard security practice.
- Customize the page branding (logo, background) to match your application's visual identity.

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **LoginPage** - Navigates back to login on success or cancel
- **ResetPasswordPage** - The page the user lands on after clicking the email link
