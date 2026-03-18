# SignIn (External Providers)

Components and composable for SSO / external authentication provider integration. Renders provider buttons on the login page and handles the external sign-in redirect flow. This module supports any OAuth2/OpenID Connect provider configured on the VirtoCommerce Platform (Google, Azure AD, ADFS, Okta, etc.) and provides a clean abstraction over the redirect-based authentication flow.

The system works in two parts: `useExternalProvider` fetches available providers from the platform API and manages the redirect flow, while the `ExternalProviders` component renders the provider buttons with appropriate icons and labels.

## When to Use

- To display SSO provider buttons (Google, Azure AD, etc.) on the login page
- To programmatically trigger external sign-in or sign-out redirects
- To check which authentication providers are available for the current platform instance
- Used internally by the `LoginPage` component

## Basic Usage

```vue
<template>
  <ExternalProviders :providers="providers" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ExternalProviders } from "@vc-shell/framework";
import { useExternalProvider } from "@vc-shell/framework";

const { getProviders } = useExternalProvider();
const providers = ref([]);

onMounted(async () => {
  providers.value = await getProviders();
});
</script>
```

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `ExternalProviders` | `providers: ExternalSignInProviderInfo[]` | Renders a vertical list of SSO provider buttons |

## API (`useExternalProvider`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProviders` | `() => Promise<ExternalSignInProviderInfo[]>` | Fetch available SSO providers from the platform API |
| `signIn` | `(authenticationType: string) => Promise<void>` | Redirect to external provider login |
| `signOut` | `(authenticationType: string) => Promise<void>` | Redirect to external provider logout |
| `storage` | `Ref<{ providerType?: string }>` | Persisted localStorage ref tracking the active provider |

## Recipe: Custom Login Page with SSO and Credentials

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ExternalProviders, useExternalProvider } from "@vc-shell/framework";

const { getProviders } = useExternalProvider();
const providers = ref<ExternalSignInProviderInfo[]>([]);
const hasProviders = computed(() => providers.value.length > 0);

onMounted(async () => {
  providers.value = await getProviders();
});
</script>

<template>
  <VcAuthLayout>
    <!-- Standard credentials form -->
    <form @submit.prevent="handleLogin">
      <VcInput v-model="username" label="Email" />
      <VcInput v-model="password" label="Password" type="password" />
      <VcButton type="submit">Sign In</VcButton>
    </form>

    <!-- Divider between credentials and SSO -->
    <div v-if="hasProviders" class="tw-my-4 tw-text-center tw-text-gray-400">
      or continue with
    </div>

    <!-- SSO provider buttons -->
    <ExternalProviders v-if="hasProviders" :providers="providers" />
  </VcAuthLayout>
</template>
```

## Recipe: SSO-Only Login (No Credentials Form)

When the platform is configured for SSO-only authentication, use the `LoginPage` component with the `ssoOnly` prop:

```vue
<template>
  <Login sso-only title="Sign in with your corporate account" />
</template>
```

This hides the username/password form and shows only the external provider buttons.

## Details

- **Provider discovery**: `getProviders()` calls the platform API endpoint to fetch all configured external authentication providers. The response includes the provider's display name, authentication type identifier, and optional icon URL.
- **Redirect flow**: `signIn(authenticationType)` redirects the browser to the platform's external authentication endpoint, which then redirects to the provider's login page. After successful authentication, the provider redirects back to the application.
- **Provider persistence**: The `storage` ref persists the active provider type in localStorage. This is used during sign-out to know which provider's logout endpoint to call.
- **Automatic detection**: The `LoginPage` component automatically calls `getProviders()` on mount and conditionally renders the `ExternalProviders` component only if providers are available.

## Tips

- If no external providers are configured on the platform, `getProviders()` returns an empty array and the `ExternalProviders` component renders nothing.
- The `storage.providerType` value is set automatically during sign-in and used by the `LogoutButton` to trigger the correct provider sign-out.
- For development, you can test SSO flows by configuring a local identity provider (like Keycloak) in the platform's authentication settings.

## Related Components

- **LoginPage** - The primary consumer that renders `ExternalProviders`
- **VcAuthLayout** - The layout wrapper used by login and other auth pages
- **LogoutButton** - Uses `useExternalProvider().signOut()` for SSO logout
