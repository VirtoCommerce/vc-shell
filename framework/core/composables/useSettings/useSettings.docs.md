# useSettings

Loads and manages UI customization settings (logo, title, avatar) from the platform's Settings API. Supports overriding defaults with custom values.

## Overview

The vc-shell application header displays a logo, application title, and optionally a user avatar and role. These values can come from two sources:

1. **Platform Settings API** -- the default. The composable fetches UI customization settings stored on the VirtoCommerce platform via `SettingClient.getUICustomizationSetting()`.
2. **Manual override** -- via `applySettings()`. When a module provides its own branding (logo, title), it calls `applySettings()` to set values directly, bypassing the API call entirely.

The composable uses `useApiClient(SettingClient)` and `useAsync` internally, providing automatic loading state tracking. Settings are fetched lazily on component mount, but only if no custom settings have been applied.

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

```vue
<script setup lang="ts">
import { useSettings } from "@vc-shell/framework";

const { uiSettings, loading } = useSettings();
</script>

<template>
  <div v-loading="loading" class="tw-min-h-[40px]">
    <img
      v-if="uiSettings.logo"
      :src="uiSettings.logo"
      :alt="uiSettings.title ?? 'Application Logo'"
      class="tw-h-10"
    />
    <span v-if="uiSettings.title" class="tw-ml-2 tw-text-lg tw-font-semibold">
      {{ uiSettings.title }}
    </span>
  </div>
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

### Showing user avatar and role

```vue
<script setup lang="ts">
import { useSettings } from "@vc-shell/framework";
import { useUserManagement } from "@vc-shell/framework";

const { uiSettings } = useSettings();
const { user } = useUserManagement();

// Apply user-specific settings after login
watch(user, (currentUser) => {
  if (currentUser) {
    applySettings({
      avatar: currentUser.photoUrl,
      role: currentUser.roles?.[0]?.name,
    });
  }
});
</script>

<template>
  <div class="tw-flex tw-items-center tw-gap-2">
    <img
      v-if="uiSettings.avatar"
      :src="uiSettings.avatar"
      alt="User avatar"
      class="tw-w-8 tw-h-8 tw-rounded-full"
    />
    <span v-if="uiSettings.role" class="tw-text-sm tw-text-gray-500">
      {{ uiSettings.role }}
    </span>
  </div>
</template>
```

### Using contrast logo for dark backgrounds

```vue
<template>
  <!-- Use contrast_logo on dark sidebar, regular logo elsewhere -->
  <img
    :src="isDarkSidebar ? uiSettings.contrast_logo : uiSettings.logo"
    alt="Logo"
  />
</template>
```

## Notes

- Settings are fetched automatically on mount if not already loaded and `applySettings` hasn't been called.
- Calling `applySettings()` sets an internal `customSettingsApplied` flag that prevents the API fetch, making it suitable for fully custom apps that do not use platform settings.
- The composable uses `useApiClient(SettingClient)` and `useAsync` internally.
- If the API returns `null` or the settings have already been loaded, the fetch is a no-op.
- The `uiSettings` ref defaults to an empty object `{}` when no settings are loaded yet.

## Tip: Call applySettings Early

If your application always uses custom branding and never needs the platform's default settings, call `applySettings()` as early as possible (e.g., in the app's root component setup). This prevents an unnecessary API call on mount:

```typescript
// In App.vue or root module setup
const { applySettings } = useSettings();
applySettings({
  logo: "/my-app-logo.svg",
  title: "My Custom App",
});
// No API call will be made
```

## Common Mistake

Each call to `applySettings()` replaces the entire settings object (spread merge). If you call it twice with partial values, earlier values not included in the second call will be lost:

```typescript
applySettings({ logo: "/logo.svg", title: "My App" });
applySettings({ avatar: "/avatar.jpg" }); // logo and title are now undefined!

// Fix: spread existing settings
applySettings({ ...uiSettings.value, avatar: "/avatar.jpg" });
```

## Related

- [useApiClient](../useApiClient/) -- used internally to fetch settings from the platform API
- [useAsync](../useAsync/) -- wraps the settings API call with loading state
- `framework/core/api/platform.ts` -- `SettingClient` class
