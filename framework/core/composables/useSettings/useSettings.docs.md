# useSettings

Loads and manages UI customization settings (logo, title, avatar) from the platform's Settings API. Supports overriding defaults with custom values.

## When to Use

- When displaying the application logo or title in the shell header
- When a module needs to apply custom branding (logo, title, user avatar)
- Do NOT use for general application configuration -- this is specifically for UI customization

## Basic Usage

```typescript
import { useSettings } from "@vc-shell/framework";

const { uiSettings, loading } = useSettings();
// uiSettings.value.logo, uiSettings.value.title, etc.
```

## API

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `uiSettings` | `Ref<IUISetting>` | Reactive object with current UI customization values |
| `loading` | `ComputedRef<boolean>` | Whether settings are being fetched from the API |
| `applySettings` | `(args: { logo?, title?, avatar?, role? }) => void` | Override settings with custom values (prevents API fetch) |

### IUISetting

| Property | Type | Description |
|----------|------|-------------|
| `contrast_logo` | `string?` | Logo variant for dark/contrast backgrounds |
| `logo` | `string?` | Primary application logo URL |
| `title` | `string?` | Application title |
| `avatar` | `string?` | Current user avatar URL |
| `role` | `string?` | Current user role display name |

## Common Patterns

### Displaying the app logo

```typescript
<script setup lang="ts">
import { useSettings } from "@vc-shell/framework";

const { uiSettings, loading } = useSettings();
</script>

<template>
  <img v-if="!loading && uiSettings.logo" :src="uiSettings.logo" alt="Logo" />
</template>
```

### Applying custom branding from a module

```typescript
<script setup lang="ts">
import { useSettings } from "@vc-shell/framework";

const { applySettings } = useSettings();

// Override default platform settings with module-specific branding
applySettings({
  logo: "/modules/vendor-portal/logo.svg",
  title: "Vendor Portal",
});
</script>
```

## Notes

- Settings are fetched automatically on mount if not already loaded and `applySettings` hasn't been called.
- Calling `applySettings()` prevents the API fetch, making it suitable for fully custom apps.
- The composable uses `useApiClient(SettingClient)` and `useAsync` internally.

## Related

- [useApiClient](../useApiClient/) -- used internally to fetch settings from the platform API
- [useAsync](../useAsync/) -- wraps the settings API call with loading state
