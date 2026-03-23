# InvitePage

Invitation acceptance page where an invited user sets their password. Validates the invitation token on mount, displays the pre-filled email, and provides password/confirm fields. On successful acceptance, the user is automatically signed in and redirected to the main application. This page is the final step in the user invitation flow initiated from the VirtoCommerce Platform admin.

## When to Use

- As the target route for user invitation email links
- Requires `userId`, `userName`, and `token` from the URL query parameters
- The standard vc-shell routing maps `/invite` to this page

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

With custom branding:

```vue
<template>
  <Invite
    :userId="route.query.userId"
    :userName="route.query.userName"
    :token="route.query.token"
    logo="/assets/my-company-logo.svg"
    background="/assets/custom-background.jpg"
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

## Recipe: Router Configuration

Set up the route to extract query parameters from the invitation email link:

```ts
import Invite from "@vc-shell/framework/shared/pages/InvitePage";

const routes = [
  {
    path: "/invite",
    name: "Invite",
    component: Invite,
    meta: { public: true },
    props: (route) => ({
      userId: route.query.userId as string,
      userName: route.query.userName as string,
      token: route.query.token as string,
    }),
  },
];
```

The invitation email link typically looks like:
```
https://your-app.com/invite?userId=abc123&userName=jane@example.com&token=xyz789...
```

## Recipe: Custom Invitation Flow

If your platform uses a different invitation API, you can create a wrapper that overrides the default behavior:

```vue
<script setup lang="ts">
import Invite from "@vc-shell/framework/shared/pages/InvitePage";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <Invite
    :userId="route.query.userId"
    :userName="route.query.userName"
    :token="route.query.token"
    logo="/assets/custom-logo.svg"
  />
</template>
```

## Features

- **Token validation on mount**: The invitation token is validated against the platform API when the page loads. If the token is invalid or expired, the form is disabled and an error message is shown.
- **Pre-filled email**: The invited user's email address is displayed in a disabled input field, confirming who the invitation is for.
- **Real-time password policy validation**: Uses `useUserManagement().validatePassword` to check the password against the platform's policy as the user types.
- **Confirm password matching**: Validates that the password and confirm password fields match before submission.
- **Automatic sign-in**: After the invitation is accepted and the password is set, the user is automatically signed in and redirected to `/`.

## Details

- **Auth layout**: Renders inside `VcAuthLayout`, providing the centered card design consistent with other auth pages.
- **Public route**: This page must be accessible without authentication. Ensure the route has `meta: { public: true }`.
- **Token lifecycle**: Invitation tokens are single-use and time-limited. Once used or expired, the page shows an error instructing the user to request a new invitation.
- **Error states**: The page handles several error conditions: invalid token, expired token, user already activated, and server errors. Each shows an appropriate message.

## Tips

- All three props (`userId`, `userName`, `token`) are required. If any is missing from the URL, the page will not function correctly. Consider adding route guards to validate query parameters.
- The page shares most of its form logic with `ResetPasswordPage` (token validation + password fields). The key difference is that InvitePage creates the user's initial password, while ResetPasswordPage changes an existing one.
- If the invitation token has expired, the user needs to be re-invited from the platform admin. There is no self-service token refresh.

## Related Components

- **VcAuthLayout** - The underlying centered card layout
- **ResetPasswordPage** - Similar flow (token + password) for password resets
- **LoginPage** - User is redirected here if they navigate to `/invite` without valid parameters
