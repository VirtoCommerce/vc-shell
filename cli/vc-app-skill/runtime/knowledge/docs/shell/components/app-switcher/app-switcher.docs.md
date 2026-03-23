# App Switcher

A component and composable for switching between multiple VirtoCommerce applications (e.g., Vendor Portal, Admin Portal) within the same platform instance.

## Overview

The App Switcher fetches a list of available applications from the platform API and renders them in a dropdown. Clicking an app navigates the browser to that app's URL. Permission checks ensure users only see apps they have access to.

## Directory Structure

```
app-switcher/
  components/
    vc-app-switcher/
      vc-app-switcher.vue    # Dropdown UI component
  composables/
    useAppSwitcher/
      index.ts               # Data fetching and navigation logic
```

## Composable: useAppSwitcher

Provides the data layer for app switching.

```typescript
import { useAppSwitcher } from "@vc-shell/framework";

const { appsList, getApps, switchApp } = useAppSwitcher();

// Fetch available apps on mount
await getApps();

// Switch to an app (checks permissions, navigates via window.location)
switchApp(selectedApp);
```

### Return Value

| Property | Type | Description |
|---|---|---|
| `appsList` | `Ref<AppDescriptor[]>` | Reactive list of available applications (readonly computed) |
| `getApps` | `() => Promise<void>` | Fetches the app list from `AppsClient` |
| `switchApp` | `(app: AppDescriptor) => void` | Navigates to the app's URL if the user has permission |

### AppDescriptor

Each app in the list has:
- `id` -- unique identifier
- `title` -- display name
- `iconUrl` -- URL of the app icon
- `relativeUrl` -- the URL path to navigate to
- `permission` -- required permission string

## Component: VcAppSwitcher

Renders the app list inside a `VcDropdown`. Highlights the currently active app based on URL matching.

### Props

| Prop | Type | Description |
|---|---|---|
| `appsList` | `AppDescriptor[]` | List of apps to display |

### Events

| Event | Payload | Description |
|---|---|---|
| `onClick` | `AppDescriptor` | Emitted when an app is clicked |

## Usage

```vue
<script setup>
import { useAppSwitcher } from "@vc-shell/framework";
import { VcAppSwitcher } from "@vc-shell/framework";

const { appsList, getApps, switchApp } = useAppSwitcher();
onMounted(() => getApps());
</script>

<template>
  <VcAppSwitcher
    :apps-list="appsList"
    @on-click="switchApp"
  />
</template>
```

## Behavior

- `switchApp` checks `hasAccess(app.permission)` before navigating. If access is denied, a notification error is shown.
- Navigation uses `window.location.href` (full page reload) since apps are separate SPA deployments.
- The active app is determined by matching `window.location.pathname` against each app's `relativeUrl`.

## Tips

- The composable uses `usePermissions()` internally -- no need to check permissions manually.
- `getApps()` calls the platform API and may throw on network errors. Wrap in try/catch if needed.
- The component is typically rendered in the app bar header area.

## Related

- `framework/core/api/platform/` -- `AppsClient` API client
- `framework/core/composables/usePermissions/` -- permission checking
