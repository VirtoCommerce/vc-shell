---
id: useUser-basic-usage
type: FRAMEWORK_API
category: composable
tags: [composable, authentication, user]
title: "useUser - Basic Usage"
description: "Accessing user information and authentication state"
---

# useUser - Basic Usage

The `useUser` composable provides access to the current user's information and authentication state.

## Overview

- Access current user data (name, email, permissions)
- Check authentication status
- Load/reload user information
- Sign out functionality

## Basic Usage

```typescript
import { useUser } from "@vc-shell/framework";

const { user, isAuthenticated, loading } = useUser();

// Access user properties
console.log(user.value?.userName);
console.log(user.value?.email);
console.log(isAuthenticated.value); // true/false
```

## Complete Example - User Profile Display

```vue
<template>
  <VcBlade title="User Profile">
    <VcContainer v-loading="loading">
      <div v-if="isAuthenticated" class="tw-p-4">
        <VcCard header="User Information">
          <div class="tw-p-4 tw-space-y-4">
            <VcField label="Username" :model-value="user?.userName" />
            <VcField label="Email" :model-value="user?.email" />
            <VcField label="User ID" :model-value="user?.id" />

            <div class="tw-mt-4">
              <VcButton @click="onSignOut">Sign Out</VcButton>
            </div>
          </div>
        </VcCard>
      </div>

      <div v-else class="tw-p-4">
        <VcBanner>You are not authenticated</VcBanner>
      </div>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { useUser } from "@vc-shell/framework";
import { useRouter } from "vue-router";

const { user, isAuthenticated, loading, signOut } = useUser();
const router = useRouter();

async function onSignOut() {
  await signOut();
  router.push("/login");
}
</script>
```

## Checking Authentication

```typescript
import { useUser } from "@vc-shell/framework";
import { useRouter } from "vue-router";
import { watch } from "vue";

const { isAuthenticated, loading } = useUser();
const router = useRouter();

// Redirect to login if not authenticated
watch([isAuthenticated, loading], ([authenticated, isLoading]) => {
  if (!isLoading && !authenticated) {
    router.push("/login");
  }
}, { immediate: true });
```

## Accessing User Permissions

```typescript
import { useUser } from "@vc-shell/framework";

const { user } = useUser();

// Check if user has specific permission
const hasPermission = computed(() => {
  return user.value?.permissions?.includes("offers:manage") ?? false;
});

// Get all user permissions
const userPermissions = computed(() => user.value?.permissions ?? []);
```

## Reload User Data

```typescript
import { useUser } from "@vc-shell/framework";

const { user, loading, loadUser } = useUser();

// Reload user data (e.g., after profile update)
async function refreshUserData() {
  await loadUser();
  console.log("User data refreshed:", user.value);
}
```

## Conditional UI Based on Authentication

```vue
<template>
  <VcBlade :title="bladeTitle">
    <!-- Show different content for authenticated users -->
    <div v-if="isAuthenticated">
      <VcButton @click="openSettings">Settings</VcButton>
      <span>Welcome, {{ user?.userName }}!</span>
    </div>

    <!-- Show login prompt for unauthenticated users -->
    <div v-else>
      <VcButton @click="goToLogin">Sign In</VcButton>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUser } from "@vc-shell/framework";
import { useRouter } from "vue-router";

const { user, isAuthenticated } = useUser();
const router = useRouter();

const bladeTitle = computed(() =>
  isAuthenticated.value ? `Welcome, ${user.value?.userName}` : "Please Sign In"
);

function goToLogin() {
  router.push("/login");
}

function openSettings() {
  // Open settings blade
}
</script>
```

## Sign Out

```typescript
import { useUser } from "@vc-shell/framework";
import { usePopup } from "@vc-shell/framework";
import { useRouter } from "vue-router";

const { signOut } = useUser();
const { showConfirmation } = usePopup();
const router = useRouter();

async function handleSignOut() {
  const confirmed = await showConfirmation("Are you sure you want to sign out?");

  if (confirmed) {
    await signOut();
    router.push("/login");
  }
}
```

## User Type

```typescript
interface User {
  id: string;
  userName: string;
  email?: string;
  phoneNumber?: string;
  permissions?: string[];
  // ... other user properties
}
```

## API Reference

```typescript
interface UseUser {
  user: Ref<User | undefined>;         // Current user data
  isAuthenticated: Ref<boolean>;       // Authentication status
  loading: Ref<boolean>;                // Loading state
  loadUser: () => Promise<void>;        // Reload user data
  signOut: () => Promise<void>;         // Sign out function
}
```

## Important Notes

### ✅ DO

- Check `isAuthenticated` before accessing user data
- Wait for `loading` to be false before checking auth state
- Use `user.value?.property` (optional chaining) to avoid errors
- Call `loadUser()` after profile updates
- Handle sign out with confirmation dialog

### ❌ DON'T

- Don't access `user.value.userName` without checking if user exists
- Don't forget to redirect after sign out
- Don't rely on user data before checking `isAuthenticated`

## Common Patterns

### Protected Component

```typescript
import { useUser } from "@vc-shell/framework";
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const { isAuthenticated, loading } = useUser();
const router = useRouter();

onMounted(() => {
  if (!loading.value && !isAuthenticated.value) {
    router.push("/login");
  }
});
```

### User Display Name

```typescript
const displayName = computed(() => {
  return user.value?.userName || user.value?.email || "Guest";
});
```

### Has Any Permission

```typescript
function hasAnyPermission(permissions: string[]): boolean {
  const userPermissions = user.value?.permissions ?? [];
  return permissions.some(p => userPermissions.includes(p));
}
```

## See Also

- [usePermissions basic-check.md](../usePermissions/basic-check.md) - Permission checking
- [usePermissions template-usage.md](../usePermissions/template-usage.md) - Template usage

**Reference:** [Official VC-Shell Documentation - useUser](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useUser/)
