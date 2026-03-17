# SignIn (External Providers)

Components and composable for SSO / external authentication provider integration. Renders provider buttons on the login page and handles the external sign-in redirect flow.

## When to Use

- To display SSO provider buttons (Google, Azure AD, etc.) on the login page
- To programmatically trigger external sign-in or sign-out redirects
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

## Related Components

- **LoginPage** - The primary consumer that renders `ExternalProviders`
- **VcAuthLayout** - The layout wrapper used by login and other auth pages
