# VcApp

The root application shell that bootstraps the VirtoCommerce admin UI. It provides the desktop sidebar / mobile top bar layout, blade navigation workspace, popup container, module loading, and service registration.

## When to Use

- Every VirtoCommerce admin application must have exactly one `VcApp` at the root.
- It should wrap the entire authenticated application experience.
- When NOT to use: for authentication pages use `VcAuthLayout` instead.

## Basic Usage

```vue
<template>
  <VcApp
    :is-ready="isReady"
    :logo="logoUrl"
    :title="appTitle"
    :name="user.name"
    :role="user.role"
  />
</template>

<script setup lang="ts">
import { VcApp } from "@vc-shell/framework";

const isReady = ref(true);
const logoUrl = "/logo.svg";
const appTitle = "Vendor Portal";
const user = reactive({ name: "John", role: "Admin" });
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isReady` | `boolean` | *required* | When false, shows a full-screen loading spinner. |
| `logo` | `string` | -- | Logo image URL for the sidebar/top bar. |
| `title` | `string` | -- | Application title shown in the sidebar. |
| `version` | `string` | -- | App version string (informational). |
| `avatar` | `string` | -- | User avatar image URL. |
| `name` | `string` | -- | Current user display name. |
| `role` | `string` | -- | Current user role label. |
| `disableMenu` | `boolean` | `false` | Hide navigation menu items. |
| `disableAppSwitcher` | `boolean` | `false` | Hide application switcher UI. |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `layout` | `{ isMobile, sidebar, appsList, switchApp, openRoot, handleMenuItemClick }` | Override the entire layout (sidebar + navigation). |
| `menu` | `{ expanded, onItemClick }` | Custom navigation menu. |
| `sidebar-header` | `{ logo, expanded, isMobile }` | Custom sidebar header. |
| `sidebar-footer` | `{ avatar, name, role }` | Custom sidebar footer (user info). |
| `workspace` | `{ isAuthenticated }` | Override the blade navigation workspace. |
| `app-switcher` | `{ appsList, switchApp }` | Custom application switcher. |

## Architecture

VcApp orchestrates several internal systems:

1. **Layout** -- switches between `DesktopLayout` (sidebar) and `MobileLayout` (top bar) based on viewport.
2. **Blade Navigation** -- renders `VcBladeNavigation` for the stacked panel workspace.
3. **Module Loading** -- consumes `DynamicModulesKey` for runtime module registration; shows error notifications on failure.
4. **Services** -- bootstraps shell services (Menu, Toolbar, Settings, Dashboard, etc.) via `useShellBootstrap`.

## Accessibility

- Responsive layout adapts to mobile/desktop viewports automatically.
- Sidebar navigation is keyboard-accessible.
- Loading state uses a full-screen spinner with no interactive elements.

## Related Components

- **VcBlade** -- the panel component rendered inside the workspace.
- **VcBladeNavigation** -- manages blade stack and horizontal scrolling.
- **VcAuthLayout** -- layout for pre-authentication pages (login, register).
