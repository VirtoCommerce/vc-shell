# useUserManagement

Shared composable exposing the full user management API: sign-in, sign-out, password reset, token validation, and login type discovery. Extends the same internal logic as `useUser` but surfaces administrative and authentication-flow methods.

Uses `createSharedComposable` from VueUse, so all callers share the same state instance.

## When to Use

- In sign-in pages or authentication flows to call `signIn()`
- In password-reset or forgot-password screens
- To validate password-reset tokens or check login types (e.g., external SSO)
- When NOT to use: for simple read-only user access in regular blades, use `useUser()` instead

## Basic Usage

```typescript
import { useUserManagement } from '@vc-shell/framework';

const { signIn, signOut, loading, isAuthenticated } = useUserManagement();

async function handleLogin(username: string, password: string) {
  const result = await signIn(username, password);
  if (!result.succeeded) {
    console.error('Login failed:', result.error);
  }
}
```

## API

### Parameters

None.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `user` | `ComputedRef<UserDetail \| undefined>` | Current user details |
| `loading` | `ComputedRef<boolean>` | Whether an operation is in progress |
| `isAdministrator` | `ComputedRef<boolean \| undefined>` | Admin status |
| `isAuthenticated` | `ComputedRef<boolean>` | Whether user session is active |
| `signIn` | `(username, password) => Promise<SignInResult>` | Authenticates with username/password, obtains OAuth token |
| `signOut` | `() => Promise<void>` | Clears session and auth data |
| `loadUser` | `() => Promise<UserDetail>` | Loads/reloads user info |
| `validateToken` | `(userId, token) => Promise<boolean>` | Validates a password-reset token |
| `validatePassword` | `(password) => Promise<IdentityResult>` | Validates password against policy |
| `resetPasswordByToken` | `(userId, password, token) => Promise<SecurityResult>` | Resets password using a token |
| `requestPasswordReset` | `(loginOrEmail) => Promise<RequestPasswordResult>` | Sends a password-reset email |
| `changeUserPassword` | `(oldPassword, newPassword) => Promise<SecurityResult \| undefined>` | Changes current user's password |
| `getLoginType` | `() => Promise<LoginType[]>` | Returns available login types (password, SSO, etc.) |

## Common Patterns

### Password reset flow

```vue
<script setup lang="ts">
import { useUserManagement } from '@vc-shell/framework';

const { validateToken, resetPasswordByToken, loading } = useUserManagement();

async function handleReset(userId: string, token: string, newPassword: string) {
  const valid = await validateToken(userId, token);
  if (!valid) return;

  const result = await resetPasswordByToken(userId, newPassword, token);
  if (result.succeeded) {
    // redirect to login
  }
}
</script>
```

## Related

- [useUser](../useUser/useUser.docs.md) -- read-only user session access for regular components
