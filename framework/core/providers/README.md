# Authentication Providers

This directory contains authentication provider implementations for the vc-shell framework.

## Overview

The vc-shell framework uses a pluggable authentication system that allows you to implement custom authentication logic while maintaining compatibility with all framework pages (Login, ResetPassword, ChangePassword, Invite).

## Available Providers

### PlatformAuthProvider (Default)

The default authentication provider that uses VirtoCommerce Platform API for authentication.

```typescript
import { PlatformAuthProvider } from "@vc-shell/framework";

const authProvider = new PlatformAuthProvider();
```

This provider is used automatically if no custom provider is specified.

## Creating a Custom Provider

To create a custom authentication provider, implement the `IAuthProvider` interface:

```typescript
import { IAuthProvider, UserDetail, SignInResult } from "@vc-shell/framework";
import { computed, ref } from "vue";

export class CustomAuthProvider implements IAuthProvider {
  private _user = ref<UserDetail | undefined>();
  private _loading = ref(false);

  get user() {
    return computed(() => this._user.value);
  }

  get loading() {
    return computed(() => this._loading.value);
  }

  get isAuthenticated() {
    return computed(() => this._user.value?.userName != null);
  }

  get isAdministrator() {
    return computed(() => this._user.value?.isAdministrator);
  }

  async loadUser(): Promise<UserDetail> {
    // Your custom logic to load user
    // Example: from localStorage, file, custom API, etc.
  }

  async signIn(username: string, password: string): Promise<SignInResult> {
    // Your custom sign-in logic
  }

  async signOut(): Promise<void> {
    // Your custom sign-out logic
  }

  // Implement other required methods...
}
```

See `example-custom-auth-provider.ts` for a complete implementation example.

## Required Methods

All authentication providers must implement the following methods:

### Core Methods
- `loadUser()` - Load current authenticated user
- `signIn(username, password)` - Authenticate user with credentials
- `signOut()` - Sign out current user

### Password Management Methods
- `validateToken(userId, token)` - Validate password reset token
- `validatePassword(password)` - Validate password strength
- `resetPasswordByToken(userId, password, token)` - Reset password using token
- `requestPasswordReset(loginOrEmail)` - Request password reset email
- `changeUserPassword(oldPassword, newPassword)` - Change current user password

### Additional Methods
- `getLoginType()` - Get available login types (e.g., local, external)

### Properties
- `user` - Current user details (ComputedRef)
- `loading` - Loading state (ComputedRef)
- `isAuthenticated` - Authentication status (ComputedRef)
- `isAdministrator` - Administrator status (ComputedRef)

## Using a Custom Provider

To use a custom authentication provider in your application:

```typescript
import VirtoShellFramework from "@vc-shell/framework";
import { CustomAuthProvider } from "./auth/custom-provider";

const app = createApp(App);
const customAuthProvider = new CustomAuthProvider();

app.use(VirtoShellFramework, {
  router,
  authProvider: customAuthProvider, // Pass your custom provider
  i18n: {
    locale: "en",
    fallbackLocale: "en",
  },
});
```

## Type Safety

All providers use the same types from the platform API:
- `UserDetail` - User information
- `SignInResult` - Sign-in result
- `SecurityResult` - Security operation result
- `IdentityResult` - Identity validation result
- `LoginType` - Login type enumeration

This ensures compatibility across all authentication pages and interceptors.

## Integration with Framework

The authentication provider integrates with:

1. **Login Pages** - All auth pages (Login, ResetPassword, ChangePassword, Invite) automatically use the provided auth provider
2. **HTTP Interceptors** - Automatically handles 401 errors and redirects to login
3. **Route Guards** - Checks authentication status before route navigation
4. **Composables** - Available via `useUser()` and `useUserManagement()` composables

## Example Use Cases

### File-based Authentication
```typescript
class FileAuthProvider implements IAuthProvider {
  async signIn(username: string, password: string) {
    const credentials = await fetch("/auth-data.json");
    const users = await credentials.json();
    // Validate against file data
  }
}
```

### Custom API Authentication
```typescript
class CustomApiAuthProvider implements IAuthProvider {
  async signIn(username: string, password: string) {
    const response = await fetch("https://my-custom-api.com/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    // Handle custom API response
  }
}
```

### OAuth/OIDC Provider
```typescript
class OAuthAuthProvider implements IAuthProvider {
  async signIn(username: string, password: string) {
    // Redirect to OAuth provider
    window.location.href = "https://oauth-provider.com/authorize";
  }
}
```

## Backward Compatibility

If no custom provider is specified, the framework automatically uses `PlatformAuthProvider`, ensuring full backward compatibility with existing applications.


