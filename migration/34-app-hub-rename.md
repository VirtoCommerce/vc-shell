# 34. App Switcher → App Hub Rename

**Severity:** Breaking
**Automated:** Yes (`npx @vc-shell/migrate`)

## What Changed

The "App Switcher" concept has been renamed to "App Hub" throughout the framework to reflect its expanded role — the panel now combines application switching **and** app bar widgets (notifications, background tasks, etc.) into a unified hub.

### Renamed Identifiers

| Before | After |
|--------|-------|
| `disableAppSwitcher` prop | `disableAppHub` prop |
| `#app-switcher` slot | `#app-hub` slot |
| `useAppSwitcher()` composable | `useAppHub()` composable |
| `IUseAppSwitcher` interface | `IUseAppHub` interface |
| `SHELL.APP_SWITCHER.*` locale keys | `SHELL.APP_HUB.*` locale keys |

### Affected Components

- `VcApp` — prop and slot renamed
- `VcAppDesktopLayout` — prop and slot renamed
- `VcAppMobileLayout` — prop and slot renamed

## Migration Steps

### 1. Update Props

```vue
<!-- Before -->
<VcApp :disable-app-switcher="true" />

<!-- After -->
<VcApp :disable-app-hub="true" />
```

### 2. Update Slots

```vue
<!-- Before -->
<VcApp>
  <template #app-switcher="{ appsList, switchApp }">
    <MyCustomSwitcher :apps="appsList" @switch="switchApp" />
  </template>
</VcApp>

<!-- After -->
<VcApp>
  <template #app-hub="{ appsList, switchApp }">
    <MyCustomSwitcher :apps="appsList" @switch="switchApp" />
  </template>
</VcApp>
```

### 3. Update Composable Imports

```typescript
// Before
import { useAppSwitcher } from "@vc-shell/framework";
const { appsList, switchApp, getApps } = useAppSwitcher();

// After
import { useAppHub } from "@vc-shell/framework";
const { appsList, switchApp, getApps } = useAppHub();
```

### 4. Update Locale Overrides

If you override the `SHELL.APP_SWITCHER` locale namespace in your app, rename it to `SHELL.APP_HUB`:

```json
// Before
{ "SHELL": { "APP_SWITCHER": { "TITLE": "My Apps" } } }

// After
{ "SHELL": { "APP_HUB": { "TITLE": "My Apps" } } }
```

## Automated Migration

The `app-hub-rename` codemod handles all of the above automatically:

```bash
npx @vc-shell/migrate
```

It will:
- Rename `disableAppSwitcher` → `disableAppHub` in templates
- Rename `#app-switcher` → `#app-hub` in templates
- Rename `useAppSwitcher` → `useAppHub` in script imports and usage
- Rename `IUseAppSwitcher` → `IUseAppHub` type references
