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

| Prop                | Type      | Default            | Description                                                                                               |
| ------------------- | --------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `isReady`           | `boolean` | _required_         | When false, shows a full-screen loading spinner.                                                          |
| `logo`              | `string`  | --                 | Logo image URL for the sidebar/top bar.                                                                   |
| `title`             | `string`  | --                 | Application title shown in the sidebar.                                                                   |
| `version`           | `string`  | --                 | App version string (informational).                                                                       |
| `avatar`            | `string`  | --                 | User avatar image URL.                                                                                    |
| `name`              | `string`  | --                 | Current user display name.                                                                                |
| `role`              | `string`  | --                 | Current user role label.                                                                                  |
| `disableMenu`       | `boolean` | `false`            | Hide navigation menu items.                                                                               |
| `disableAppHub`     | `boolean` | `false`            | Hide the Applications section inside the App Hub.                                                         |
| `showSearch`        | `boolean` | `false`            | Show a search input in the sidebar that filters menu items by title.                                      |
| `searchPlaceholder` | `string`  | `"Search keyword"` | Placeholder text for the sidebar search input. Falls back to i18n key `SHELL.SIDEBAR.SEARCH_PLACEHOLDER`. |

## Slots

| Slot             | Props                                                                       | Description                                                                                                           |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `layout`         | `{ isMobile, sidebar, appsList, switchApp, openRoot, handleMenuItemClick }` | Override the entire layout (sidebar + navigation).                                                                    |
| `menu`           | `{ expanded, onItemClick, searchQuery }`                                    | Custom navigation menu. `searchQuery` contains the current search input value (empty string when search is inactive). |
| `sidebar-header` | `{ logo, expanded, isMobile }`                                              | Custom sidebar header.                                                                                                |
| `sidebar-footer` | `{ avatar, name, role }`                                                    | Custom sidebar footer (user info).                                                                                    |
| `workspace`      | `{ isAuthenticated }`                                                       | Override the blade navigation workspace.                                                                              |
| `app-hub`        | `{ appsList, switchApp }`                                                   | Custom content for the Applications section of the App Hub.                                                           |

## Architecture

VcApp orchestrates several internal systems:

1. **Layout** -- switches between `DesktopLayout` (sidebar) and `MobileLayout` (top bar) based on viewport width. The breakpoint is managed by the framework's responsive detection system.
2. **Blade Navigation** -- renders `VcBladeNavigation` for the stacked panel workspace. Blades open to the right and scroll horizontally.
3. **Module Loading** -- consumes `DynamicModulesKey` for runtime module registration; shows error notifications on failure. Modules declare routes, menu items, and services.
4. **Services** -- bootstraps shell services (Menu, Toolbar, Settings, Dashboard, GlobalSearch, etc.) via `useShellBootstrap`. These services are available to all child components through provide/inject.

## Features

### Responsive Layout Switching

On desktop viewports, VcApp renders a collapsible sidebar on the left with navigation menu items, user info in the footer, and the blade workspace on the right. On mobile viewports, the sidebar is replaced by a top bar with a hamburger menu that opens a slide-over navigation panel.

### Sidebar Menu Search

When `showSearch` is `true`, a search input appears at the top of the sidebar (desktop) or mobile navigation panel. It filters menu items in real time (300ms debounce) by matching the search query against translated item titles:

- **Standalone items** — shown if their title contains the query.
- **Group items** — if the group title matches, all accessible children are shown. Otherwise, only children whose titles match are displayed.
- The search query is automatically cleared when a menu item is clicked or when the sidebar collapses.

On desktop, the search input is visible only when the sidebar is expanded (pinned). On mobile, it appears inside the slide-out navigation panel.

If you use the `menu` slot to provide a custom menu, the `searchQuery` prop is passed to your slot so you can implement your own filtering logic.

```vue
<template>
  <VcApp
    :is-ready="true"
    logo="/logo.svg"
    title="Admin"
    show-search
    search-placeholder="Find a module..."
  >
    <!-- Default menu with built-in filtering — no extra code needed -->
  </VcApp>
</template>
```

#### Custom Menu with Search

```vue
<template>
  <VcApp
    :is-ready="true"
    logo="/logo.svg"
    title="Admin"
    show-search
  >
    <template #menu="{ expanded, onItemClick, searchQuery }">
      <MyCustomMenu
        :expanded="expanded"
        :filter="searchQuery"
        @select="onItemClick"
      />
    </template>
  </VcApp>
</template>
```

### Dynamic Module Registration

Modules registered via `useDynamicModules()` are loaded at runtime. Each module can contribute menu items, blades, toolbar actions, settings pages, and dashboard widgets. VcApp handles module loading errors gracefully by displaying notification toasts.

### App Hub

The App Hub is a popover panel (desktop) or a swipeable tab (mobile) that combines two sections:

- **Applications** — tile grid of registered apps (e.g., Vendor Portal, Marketplace Admin). Clicking an app switches context without a full page reload. This section can be hidden with `disableAppHub` or customized via the `app-hub` slot. The list is searchable via a built-in search input inside the hub.
- **Widgets** — registered app bar widgets (notifications, background tasks, etc.). Clicking a widget expands its content inline (desktop) or navigates to its panel (mobile). Widgets are registered via `useAppBarWidget()` and can display badges for unread counts.

On desktop, the App Hub opens from the sidebar header menu button (`AppHubPopover`). On mobile, it appears as a second tab ("Hub") in the slide-out navigation panel — users can swipe between Menu and Hub tabs.

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
  <VcApp
    :is-ready="true"
    logo="/logo.svg"
    title="Admin"
  >
    <template #sidebar-footer="{ avatar, name, role }">
      <div class="tw-flex tw-items-center tw-gap-3 tw-p-3">
        <img
          :src="avatar"
          class="tw-w-8 tw-h-8 tw-rounded-full"
        />
        <div>
          <div class="tw-text-sm tw-font-medium">{{ name }}</div>
          <div class="tw-text-xs tw-text-gray-500">{{ role }}</div>
        </div>
        <VcButton
          variant="ghost"
          size="icon"
          icon="lucide-log-out"
          @click="logout"
        />
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
