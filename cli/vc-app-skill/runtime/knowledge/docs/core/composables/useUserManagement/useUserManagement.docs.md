# useUserManagement

Shared composable exposing the full user management API: sign-in, sign-out, password reset, token validation, and login type discovery. This composable extends the same internal logic as `useUser` but surfaces the administrative and authentication-flow methods that `useUser` intentionally hides. The separation ensures that regular blades only have access to read-only user state, while auth pages and admin screens get the full API.

Uses `createSharedComposable` from VueUse, so all callers share the same state instance. Internally, it calls `_createInternalUserLogic()` -- the same factory used by `useUser` -- so both composables operate on the same underlying user ref and auth data.

## When to Use

- In sign-in pages or authentication flows to call `signIn()`
- In password-reset or forgot-password screens to call `requestPasswordReset()` and `resetPasswordByToken()`
- To validate password-reset tokens before showing the reset form
- To discover available login types (password, external SSO providers)
- To change the current user's password from a settings blade
- When NOT to use: for simple read-only user access in regular blades, use `useUser()` instead -- it has a smaller API surface and communicates intent better

## Quick Start

```vue
<script setup lang="ts">
import { useUserManagement } from "@vc-shell/framework";
import { ref } from "vue";

const { signIn, loading, isAuthenticated } = useUserManagement();
const username = ref("");
const password = ref("");
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  const result = await signIn(username.value, password.value);
  if (!result.succeeded) {
    errorMessage.value = result.error ?? "Login failed";
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <VcInput
      v-model="username"
      label="Username"
    />
    <VcInput
      v-model="password"
      label="Password"
      type="password"
    />
    <p
      v-if="errorMessage"
      class="tw-text-red-500"
    >
      {{ errorMessage }}
    </p>
    <VcButton
      type="submit"
      :loading="loading"
      >Sign In</VcButton
    >
  </form>
</template>
```

## API

### Parameters

None.

### Returns

| Property               | Type                                                                                 | Description                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user`                 | `ComputedRef<UserDetail \| undefined>`                                               | Current user details.                                                                                                                                                                                                                      |
| `loading`              | `ComputedRef<boolean>`                                                               | Whether any operation is in progress.                                                                                                                                                                                                      |
| `isAdministrator`      | `ComputedRef<boolean \| undefined>`                                                  | Admin status of the current user.                                                                                                                                                                                                          |
| `isAuthenticated`      | `ComputedRef<boolean>`                                                               | Whether user session is active.                                                                                                                                                                                                            |
| `signIn`               | `(username: string, password: string) => Promise<SignInResult>`                      | Authenticates with username/password. Performs cookie-based login, obtains an OAuth token with offline_access scope, and loads user details. Returns `{ succeeded: true }` on success or `{ succeeded: false, error: string }` on failure. |
| `signOut`              | `() => Promise<void>`                                                                | Clears session, auth data, and localStorage. Handles both standard and external SSO sign-out.                                                                                                                                              |
| `loadUser`             | `() => Promise<UserDetail>`                                                          | Loads/reloads user info from the server. Deduplicates concurrent calls.                                                                                                                                                                    |
| `validateToken`        | `(userId: string, token: string) => Promise<boolean>`                                | Validates a password-reset token. Returns `true` if valid.                                                                                                                                                                                 |
| `validatePassword`     | `(password: string) => Promise<IdentityResult>`                                      | Validates a password against the platform's password policy (length, complexity, etc.).                                                                                                                                                    |
| `resetPasswordByToken` | `(userId: string, password: string, token: string) => Promise<SecurityResult>`       | Resets a user's password using a reset token. Returns `{ succeeded: true }` on success.                                                                                                                                                    |
| `requestPasswordReset` | `(loginOrEmail: string) => Promise<RequestPasswordResult>`                           | Sends a password-reset email to the user. Returns `{ succeeded: true }` on success.                                                                                                                                                        |
| `changeUserPassword`   | `(oldPassword: string, newPassword: string) => Promise<SecurityResult \| undefined>` | Changes the current user's password. Requires the old password for verification.                                                                                                                                                           |
| `getLoginType`         | `() => Promise<LoginType[]>`                                                         | Returns available login types (password-based, external SSO providers, etc.). Used to render the appropriate sign-in UI.                                                                                                                   |

## How It Works

The composable creates (or reuses) the internal user logic via `_createInternalUserLogic()`. The `signIn` flow has three phases:

1. **Cookie login**: Calls `securityClient.login()` to establish a server-side session cookie.
2. **OAuth token**: Fetches an OAuth token via `POST /connect/token` with `grant_type: password` and `scope: offline_access`. The refresh token enables automatic token renewal.
3. **User load**: Calls `securityClient.getCurrentUser()` to populate the `user` ref.

Token data is stored in localStorage under `vc_auth_data` and survives page reloads.

## Recipe: Complete Password Reset Flow

```vue
<script setup lang="ts">
import { useUserManagement } from "@vc-shell/framework";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const { validateToken, validatePassword, resetPasswordByToken, loading } = useUserManagement();
const route = useRoute();
const router = useRouter();

const userId = route.query.userId as string;
const token = route.query.token as string;
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const tokenValid = ref(false);

// Validate the token on mount
onMounted(async () => {
  tokenValid.value = await validateToken(userId, token);
  if (!tokenValid.value) {
    error.value = "This reset link has expired or is invalid.";
  }
});

async function handleReset() {
  error.value = "";

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  // Validate against password policy
  const validation = await validatePassword(newPassword.value);
  if (!validation.succeeded) {
    error.value = validation.errors?.join(", ") ?? "Password does not meet requirements.";
    return;
  }

  const result = await resetPasswordByToken(userId, newPassword.value, token);
  if (result.succeeded) {
    router.push({ name: "SignIn", query: { message: "Password reset successfully" } });
  } else {
    error.value = result.errors?.join(", ") ?? "Reset failed.";
  }
}
</script>
```

## Recipe: Login Type Discovery for SSO

```vue
<script setup lang="ts">
import { useUserManagement } from "@vc-shell/framework";
import { ref, onMounted } from "vue";

const { getLoginType, signIn } = useUserManagement();
const loginTypes = ref<LoginType[]>([]);
const showPasswordForm = ref(false);

onMounted(async () => {
  loginTypes.value = await getLoginType();
  // Show password form only if password auth is available
  showPasswordForm.value = loginTypes.value.some((t) => t.loginProvider === "password");
});
</script>

<template>
  <div>
    <form
      v-if="showPasswordForm"
      @submit.prevent="handlePasswordLogin"
    >
      <!-- standard username/password form -->
    </form>

    <div
      v-for="provider in loginTypes.filter((t) => t.loginProvider !== 'password')"
      :key="provider.loginProvider"
    >
      <VcButton @click="redirectToSSO(provider)"> Sign in with {{ provider.loginProvider }} </VcButton>
    </div>
  </div>
</template>
```

## Tips

- **`signIn` returns structured results, not exceptions.** A failed login returns `{ succeeded: false, error: "..." }` rather than throwing. Always check `result.succeeded` instead of wrapping in try/catch.
- **Shared state with `useUser`.** Both `useUser()` and `useUserManagement()` read from the same underlying `user` ref. A successful `signIn()` via `useUserManagement` immediately updates `isAuthenticated` in all `useUser()` consumers.
- **`validatePassword` checks policy, not identity.** It validates password complexity requirements (length, special characters, etc.) without knowing which user the password is for. Use it for real-time feedback in password fields.
- **`changeUserPassword` requires the old password.** This is a security requirement -- the platform verifies the old password before accepting the change. There is no way to skip this from the client side.

## Related

- [useUser](../useUser/useUser.docs.md) -- read-only user session access for regular components
- [usePermissions](../usePermissions/) -- permission checks based on user roles
- `SecurityClient` from `@core/api/platform` -- the underlying API client for all auth operations
