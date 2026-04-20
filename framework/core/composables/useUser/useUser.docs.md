# useUser

Shared composable providing read-only access to the current user's session state. Returns reactive user details, authentication status, and core session operations (load, sign out, get access token). This is the primary composable for user-related reads in regular blades and components. It deliberately exposes a narrow API surface -- no sign-in, password reset, or admin operations -- to encourage separation of concerns between user consumption and user management.

Uses `createSharedComposable` from VueUse, so all callers across the entire application share the same state instance. This means calling `useUser()` in 20 different components does not create 20 separate API requests -- they all read from the same reactive refs.

## When to Use

- To read current user info (name, permissions, admin status) in any component
- To check authentication state for route guards or conditional rendering
- To sign out the current user
- To obtain an OAuth access token for manual API calls
- When NOT to use: for sign-in, password reset, token validation, or other management operations, use `useUserManagement()` instead

## Quick Start

```vue
<script setup lang="ts">
import { useUser } from "@vc-shell/framework";

const { user, isAuthenticated, isAdministrator, loading } = useUser();
</script>

<template>
  <div
    v-if="loading"
    class="tw-animate-pulse"
  >
    Loading user...
  </div>

  <div v-else-if="isAuthenticated">
    <p>Welcome, {{ user?.userName }}</p>
    <span
      v-if="isAdministrator"
      class="tw-badge tw-badge-primary"
      >Admin</span
    >
  </div>

  <div v-else>
    <p>Please sign in to continue.</p>
  </div>
</template>
```

## API

### Parameters

None.

### Returns

| Property          | Type                                   | Description                                                                                                                                                                                      |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `user`            | `ComputedRef<UserDetail \| undefined>` | Current user details (userName, email, id, etc.), or `undefined` if not authenticated.                                                                                                           |
| `loading`         | `ComputedRef<boolean>`                 | Whether a user operation (loadUser, signOut) is in progress.                                                                                                                                     |
| `isAuthenticated` | `ComputedRef<boolean>`                 | Whether a user session is active. Derived from `user.userName != null`.                                                                                                                          |
| `isAdministrator` | `ComputedRef<boolean \| undefined>`    | Whether the current user has admin privileges. `undefined` if user is not loaded.                                                                                                                |
| `loadUser`        | `() => Promise<UserDetail>`            | Loads/reloads user info from the server. Deduplicates concurrent calls -- if two components call `loadUser()` at the same time, only one API request is made.                                    |
| `signOut`         | `() => Promise<void>`                  | Signs out the current user, clears auth data from localStorage, and resets the user state. Handles both standard and external (SSO) sign-out flows.                                              |
| `getAccessToken`  | `() => Promise<string \| null>`        | Returns the current OAuth access token. Automatically refreshes using the refresh token if the access token has expired or will expire within 60 seconds. Returns `null` if no auth data exists. |

## How It Works

The composable delegates to `_createInternalUserLogic()`, which manages:

1. **Auth data persistence**: OAuth tokens (access token, refresh token, expiration) are stored in localStorage under `vc_auth_data`. On `loadUser()`, the stored auth data is read and the token is refreshed if needed.

2. **Request deduplication**: `loadUser()` uses a shared promise (`loadUserPromise`). If called while a request is already in flight, it returns the existing promise rather than making a duplicate API call.

3. **Token refresh**: `getAccessToken()` checks the expiration time with a 60-second buffer. If the token is expired or about to expire and a refresh token is available, it makes a `POST /connect/token` request with `grant_type: refresh_token`.

4. **Shared state**: `createSharedComposable` from VueUse ensures all calls to `useUser()` return the same reactive refs. The underlying `user` ref is module-level, so it persists across component lifecycles.

## Recipe: Route Guard Based on Authentication

```typescript
import { useUser } from "@vc-shell/framework";

const router = createRouter({
  /* ... */
});

router.beforeEach(async (to) => {
  const { isAuthenticated, loadUser } = useUser();

  // Ensure user is loaded before checking auth
  if (!isAuthenticated.value) {
    try {
      await loadUser();
    } catch {
      // loadUser failed -- user is not authenticated
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: "SignIn" };
  }
});
```

## Recipe: Displaying User Info in a Header

```vue
<template>
  <div class="tw-flex tw-items-center tw-gap-2">
    <VcAvatar
      :name="user?.userName"
      size="sm"
    />
    <div>
      <p class="tw-text-sm tw-font-medium">{{ user?.userName }}</p>
      <p class="tw-text-xs tw-text-gray-500">{{ user?.email }}</p>
    </div>
    <VcButton
      size="sm"
      variant="ghost"
      @click="handleSignOut"
      >Sign Out</VcButton
    >
  </div>
</template>

<script setup lang="ts">
import { useUser } from "@vc-shell/framework";
import { useRouter } from "vue-router";

const { user, signOut } = useUser();
const router = useRouter();

async function handleSignOut() {
  await signOut();
  router.push({ name: "SignIn" });
}
</script>
```

## Recipe: Adding Access Token to Custom API Calls

```typescript
import { useUser } from "@vc-shell/framework";

const { getAccessToken } = useUser();

async function fetchCustomEndpoint(url: string) {
  const token = await getAccessToken();

  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return response.json();
}
```

## Tips

- **`loadUser` deduplicates concurrent calls.** If your app loads multiple blades simultaneously and each calls `loadUser()`, only one API request is made. All calls resolve with the same result.
- **Token refresh is transparent.** `getAccessToken()` handles expiration checking and refresh internally. You never need to manually check token expiration or call a refresh endpoint.
- **`isAuthenticated` checks `userName`, not the token.** A user is considered authenticated if `user.value?.userName` is not null. This means the user could have an expired token but still appear "authenticated" until the next API call fails.
- **`signOut` clears localStorage.** After sign-out, the `vc_auth_data` key is removed from localStorage. Any cached tokens are gone permanently.
- **Shared state means shared loading.** If one component triggers `loadUser()`, `loading.value` becomes `true` in all components that use `useUser()`. Design your UI to handle this.

## Related

- [useUserManagement](../useUserManagement/useUserManagement.docs.md) -- extended API with sign-in, password reset, token validation (for auth pages)
- [usePermissions](../usePermissions/) -- permission checks based on user roles
- `UserDetail` from `@core/api/platform` -- the user detail type returned by the API
