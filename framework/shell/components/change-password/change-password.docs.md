# Change Password Component

A modal dialog for changing the current user's password, with real-time validation and forced-change support.

## Overview

The `ChangePassword` component renders a `VcPopup` with three validated input fields: current password, new password, and confirm password. It integrates with the platform's `useUserManagement` composable for password change and validation APIs, and with `vee-validate` for form validation.

## Props

| Prop     | Type      | Default | Description                                                                                  |
| -------- | --------- | ------- | -------------------------------------------------------------------------------------------- |
| `forced` | `boolean` | `false` | When true, the user cannot dismiss the dialog -- cancelling signs out and redirects to login |
| `login`  | `string`  | --      | The current user's login name (for context)                                                  |

## Events

| Event   | Description                                                                                  |
| ------- | -------------------------------------------------------------------------------------------- |
| `close` | Emitted when the dialog should close (cancel in non-forced mode, or after successful change) |

## Behavior

### Normal mode (`forced: false`)

- User fills in current password, new password, and confirmation.
- Real-time validation runs on each keystroke (via `validatePassword` API call).
- Errors are shown inline (field-level) and below the footer (API errors like password policy violations).
- Cancel button emits `close`.
- Save button calls `changeUserPassword()`. On success, emits `close`.

### Forced mode (`forced: true`)

- An info banner explains that a password change is required.
- Cancel button signs the user out and redirects to `/login`.
- Save button changes the password and redirects to `/` on success.

### Validation

- Field-level: `required` and `min:6` rules via vee-validate's `Field` component.
- API-level: `validatePassword()` checks the platform's password policy on each input change.
- Custom checks: confirms that new password matches confirmation and that the new password differs from the current one.
- Errors are displayed as `IIdentityError` codes mapped to i18n keys: `COMPONENTS.CHANGE_PASSWORD.ERRORS.{code}`.

## Usage

```vue
<ChangePassword v-if="showChangePassword" :forced="mustChangePassword" :login="currentUser.userName" @close="showChangePassword = false" />
```

### Typical trigger locations

- **User menu**: "Change Password" option in the app bar dropdown.
- **Login flow**: When the API returns `mustChangePassword: true`, show with `forced: true`.

## Form Fields

| Field            | Validation                           | Description                                    |
| ---------------- | ------------------------------------ | ---------------------------------------------- |
| Current Password | `required`, `min:6`                  | Verifies the user knows their current password |
| New Password     | `required`, `min:6`, platform policy | The desired new password                       |
| Confirm Password | `required`, `min:6`, must match new  | Confirmation of the new password               |

## Error Codes

Common `IIdentityError.code` values (mapped to i18n keys):

- `PasswordTooShort` -- below minimum length
- `PasswordRequiresNonAlphanumeric` -- needs special characters
- `PasswordRequiresDigit` -- needs at least one digit
- `PasswordRequiresUpper` -- needs uppercase letter
- `Repeat-password` -- confirmation does not match (client-side)
- `Equal-passwords` -- new password is same as current (client-side)

## Tips

- The Save button is disabled until the form is dirty, valid, and has no API validation errors.
- Password validation calls the server on each keystroke -- this is intentional for real-time policy feedback.
- In forced mode, there is no way to dismiss the dialog without either changing the password or signing out.
- The component uses `useRouter()` for navigation after sign-out or successful change.

## Related

- `framework/core/composables/useUserManagement/` -- `changeUserPassword`, `validatePassword`, `signOut`
- `framework/core/api/platform/` -- `IIdentityError` type
