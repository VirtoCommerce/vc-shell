# LoginPage

Full-page login screen with username/password form, SSO external provider support, and forgot-password navigation. Wraps `VcAuthLayout` and uses `useUserManagement` for authentication. This is the primary entry point for user authentication in vc-shell applications, supporting both standard credential-based login and SSO/external provider authentication.

## When to Use

- As the primary sign-in entry point for the application
- When you need SSO provider buttons alongside standard credentials
- Use `ssoOnly` mode to hide the credentials form and require external provider login
- The standard vc-shell routing maps `/login` to this page

## Basic Usage

```vue
<template>
  <Login
    title="Welcome back"
    subtitle="Sign in to your account"
  />
</template>
```

SSO-only mode:

```vue
<template>
  <Login
    sso-only
    title="Sign in with your corporate account"
    subtitle="Use your company credentials to continue"
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

## Recipe: Router Configuration

```ts
import Login from "@vc-shell/framework/shared/pages/LoginPage";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { public: true },
    props: {
      title: "Vendor Portal",
      subtitle: "Sign in to manage your store",
      logo: "/assets/vendor-logo.svg",
    },
  },
];
```

## Recipe: Custom Branded Login with SSO

```vue
<script setup lang="ts">
import Login from "@vc-shell/framework/shared/pages/LoginPage";
</script>

<template>
  <Login
    title="Acme Commerce"
    subtitle="Vendor management platform"
    logo="/assets/acme-logo.svg"
    background="/assets/acme-background.jpg"
  />
</template>
```

When SSO providers are configured on the platform, the login page automatically displays provider buttons below the credentials form. No additional configuration is needed in the component.

## Recipe: Extension Point for Custom Content

The login page supports the `auth:after-form` extension point, allowing modules to inject content below the login form:

```ts
// In your module setup
import { useExtensions } from "@vc-shell/framework";

const extensions = useExtensions();

extensions.register("auth:after-form", {
  component: markRaw(CustomAuthFooter),
  props: { message: "By signing in, you agree to our Terms of Service." },
});
```

## Features

- **Auto-detects SSO providers**: Calls `useExternalProvider().getProviders()` on mount and renders provider buttons only when providers are available
- **Expired password redirect**: Redirects to the `ChangePassword` route when `user.passwordExpired` is `true` after successful credential authentication
- **Extension point support**: The `auth:after-form` extension point allows plugins to inject content below the form (terms of service, help links, etc.)
- **Inline error messages**: Displays error messages for invalid credentials, locked accounts, and server errors directly in the form
- **Forgot password link**: Navigates to the `ForgotPassword` route

## Details

- **Auth layout**: Renders inside `VcAuthLayout`, which provides the centered card design with the logo at the top and the background image filling the page.
- **Public route**: This page must be accessible without authentication. The route should have `meta: { public: true }` or be excluded from authentication guards.
- **SSO auto-detection**: The page fetches available providers asynchronously. If the API call fails or returns an empty list, only the credentials form is shown.
- **Password expiry flow**: After successful login, if the API response indicates `passwordExpired`, the page redirects to `/change-password?forced=true` instead of the main application.
- **Remember me**: The page does not include a "remember me" checkbox. Session persistence is managed by the platform's token expiration settings.

## Tips

- The `ssoOnly` prop completely hides the username/password form. Use this when your organization requires all users to authenticate through a corporate identity provider.
- Props like `title` and `subtitle` support i18n keys. Pass a translation key (e.g., `"MY_MODULE.LOGIN_TITLE"`) and the component will resolve it through vue-i18n.
- If both credentials and SSO are available, the SSO buttons appear below the credentials form, separated by an "or" divider.
- The login page is typically the first thing new users see. Customize the `logo` and `background` to make a strong brand impression.

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ExternalProviders** - SSO provider button list
- **ForgotPasswordPage** - Linked from the "Forgot password?" button
- **ChangePasswordPage** - Redirect target for expired passwords
