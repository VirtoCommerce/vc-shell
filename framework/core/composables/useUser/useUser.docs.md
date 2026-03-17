# useUser

Shared composable providing read-only access to the current user's session state. Returns reactive user details, authentication status, and core session operations (load, sign out, get access token).

Uses `createSharedComposable` from VueUse, so all callers share the same state instance.

## When to Use

- To read current user info (name, permissions, admin status) in any component
- To check authentication state for route guards or conditional rendering
- To sign out the current user
- When NOT to use: for sign-in, password reset, or other management operations, use `useUserManagement()` instead

## Basic Usage

```typescript
import { useUser } from '@vc-shell/framework';

const { user, isAuthenticated, isAdministrator, loading, loadUser, signOut } = useUser();
```

## API

### Parameters

None.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `user` | `ComputedRef<UserDetail \| undefined>` | Current user details, or `undefined` if not authenticated |
| `loading` | `ComputedRef<boolean>` | Whether a user operation is in progress |
| `isAuthenticated` | `ComputedRef<boolean>` | Whether a user session is active |
| `isAdministrator` | `ComputedRef<boolean \| undefined>` | Whether the current user has admin privileges |
| `loadUser` | `() => Promise<UserDetail>` | Loads/reloads user info from the server (deduplicates concurrent calls) |
| `signOut` | `() => Promise<void>` | Signs out and clears local auth data |
| `getAccessToken` | `() => Promise<string \| null>` | Returns the current OAuth access token, refreshing if expired |

## Common Patterns

### Protecting a blade based on authentication

```vue
<script setup lang="ts">
import { useUser } from '@vc-shell/framework';
import { watch } from 'vue';

const { isAuthenticated, user } = useUser();

watch(isAuthenticated, (authed) => {
  if (!authed) {
    // redirect to login
  }
});
</script>
```

### Displaying user info in a header

```vue
<template>
  <span v-if="user">{{ user.userName }}</span>
</template>

<script setup lang="ts">
import { useUser } from '@vc-shell/framework';

const { user } = useUser();
</script>
```

## Related

- [useUserManagement](../useUserManagement/useUserManagement.docs.md) -- extended API with sign-in, password reset, token validation
- [usePermissions](../usePermissions/) -- permission checks based on user roles
