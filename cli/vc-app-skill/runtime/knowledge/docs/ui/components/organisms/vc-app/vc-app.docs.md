# VcApp

The root application shell that bootstraps the VirtoCommerce admin UI. It provides the desktop sidebar / mobile top bar layout, blade navigation workspace, popup container, module loading, and service registration. Every VirtoCommerce admin application must render exactly one `VcApp` at the root of its authenticated route tree.

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
import { ref, reactive } from "vue";
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

1. **Layout** -- switches between `DesktopLayout` (sidebar) and `MobileLayout` (top bar) based on viewport width. The breakpoint is managed by the framework's responsive detection system.
2. **Blade Navigation** -- renders `VcBladeNavigation` for the stacked panel workspace. Blades open to the right and scroll horizontally.
3. **Module Loading** -- consumes `DynamicModulesKey` for runtime module registration; shows error notifications on failure. Modules declare routes, menu items, and services.
4. **Services** -- bootstraps shell services (Menu, Toolbar, Settings, Dashboard, GlobalSearch, etc.) via `useShellBootstrap`. These services are available to all child components through provide/inject.

## Features

### Responsive Layout Switching

On desktop viewports, VcApp renders a collapsible sidebar on the left with navigation menu items, user info in the footer, and the blade workspace on the right. On mobile viewports, the sidebar is replaced by a top bar with a hamburger menu that opens a slide-over navigation panel.

### Dynamic Module Registration

Modules registered via `useDynamicModules()` are loaded at runtime. Each module can contribute menu items, blades, toolbar actions, settings pages, and dashboard widgets. VcApp handles module loading errors gracefully by displaying notification toasts.

### Application Switcher

When multiple applications are registered (e.g., Vendor Portal, Marketplace Admin), VcApp shows an app switcher in the sidebar header. Users can toggle between apps without a full page reload.

## Recipe: Minimal App Setup

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VcApp } from "@vc-shell/framework";

const isReady = ref(false);
const user = ref({ name: "", role: "" });

onMounted(async () => {
  const profile = await fetchUserProfile();
  user.value = profile;
  isReady.value = true;
});
</script>

<template>
  <VcApp
    :is-ready="isReady"
    logo="/img/logo.svg"
    title="My Admin"
    :name="user.name"
    :role="user.role"
  />
</template>
```

## Recipe: Custom Sidebar Footer

Replace the default user info section with a custom footer:

```vue
<template>
  <VcApp :is-ready="true" logo="/logo.svg" title="Admin">
    <template #sidebar-footer="{ avatar, name, role }">
      <div class="tw-flex tw-items-center tw-gap-3 tw-p-3">
        <img :src="avatar" class="tw-w-8 tw-h-8 tw-rounded-full" />
        <div>
          <div class="tw-text-sm tw-font-medium">{{ name }}</div>
          <div class="tw-text-xs tw-text-gray-500">{{ role }}</div>
        </div>
        <VcButton variant="ghost" size="icon" icon="lucide-log-out" @click="logout" />
      </div>
    </template>
  </VcApp>
</template>
```

## Common Mistakes

- **Nesting VcApp inside another VcApp** -- There must be exactly one VcApp per page. Multiple instances will cause service registration conflicts and duplicate sidebars.
- **Setting `isReady` to true before user data loads** -- If the app renders before authentication is confirmed, users may see a flash of the shell with empty user info. Keep `isReady` false until your auth check completes.
- **Using VcApp for auth pages** -- Auth pages (login, register, reset password) should use `VcAuthLayout`, not VcApp. Your router should switch between the two at the top level.

## Tips

- The `disableMenu` prop is useful for single-purpose apps that do not need sidebar navigation (e.g., a standalone settings page or an embedded widget).
- Use the `layout` slot only as a last resort for completely custom layouts. For most customizations, the more specific slots (`menu`, `sidebar-header`, `sidebar-footer`) are sufficient.
- The `version` prop is informational and can be displayed in the sidebar footer or a settings page. It does not affect any runtime behavior.
- VcApp provides shell services via Vue's provide/inject system. Child components access them through composables like `useMenuService()`, `useToolbarService()`, etc.

## Accessibility

- Responsive layout adapts to mobile/desktop viewports automatically.
- Sidebar navigation is keyboard-accessible with arrow key navigation.
- Loading state uses a full-screen spinner with no interactive elements.
- Mobile menu opens as a slide-over panel with focus trapping.

## Related Components

- **VcBlade** -- the panel component rendered inside the workspace.
- **VcBladeNavigation** -- manages blade stack and horizontal scrolling.
- **VcAuthLayout** -- layout for pre-authentication pages (login, register).
- **VcSidebar** -- the slide-over panel component (used internally for mobile nav).
