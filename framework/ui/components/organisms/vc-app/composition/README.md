# VcApp Composition API

This folder exposes building blocks for composing a custom shell while keeping `VcApp` as the ready-to-use default.

## Public entrypoints

Use `framework/ui/components/organisms/vc-app/index.ts` exports:

- `VcApp` - full shell component.
- `composition/layouts` - desktop/mobile layouts.
- `composition/sidebar` - sidebar UI primitives.
- `composition/menu` - menu components and menu active helpers.
- `composition/app-bar` - widgets/overlay/menu sidebar pieces.
- `composition/state` - shared state providers/composables.
- `composition/shell` - shell bootstrap/lifecycle/navigation composables.

## Minimal custom shell contract

1. Provide app-level injections in root setup:
- `provide("bladeRoutes", [])` (or real routes).
- `provide(AppRootElementKey, appRootRef)` for scoped teleports.
2. Call state providers once in root setup:
- `provideSidebarState()`
- `provideAppBarState()`
3. Run shell bootstrap:
- `useShellBootstrap(features, { isEmbedded, internalRoutes, dynamicModules, context })`
4. Handle shell lifecycle/navigation:
- `useShellLifecycle({ isReady })`
- `useShellNavigation()`
5. Render layout + workspace + popup container using `composition/*` blocks.

## Required events and slots

Layouts:
- `VcAppDesktopLayout` emits: `logo:click`, `item:click`, `switch-app`.
- `VcAppMobileLayout` emits: `item:click`, `switch-app`.
- Both expose `#app-switcher="{ appsList, switchApp }"` slot.

Menu sidebar (`VcAppMenuSidebar`):
- Required slots in desktop mode: `widgets`, `widgets-active-content`, `app-switcher`.
- Required slots in mobile mode: `widgets`, `widgets-active-content`, `navmenu`, `user-dropdown`.

## VcApp customization slots

`VcApp` exposes named slots for granular customization without full shell rebuild:

| Slot | Scope | Replaces |
|------|-------|----------|
| `#layout` | `{ isMobile, sidebar, appsList, switchApp, openRoot, handleMenuItemClick }` | Entire DesktopLayout/MobileLayout |
| `#menu` | `{ expanded, onItemClick }` | VcAppMenu navigation |
| `#sidebar-header` | `{ logo, expanded, isMobile }` | SidebarHeader |
| `#sidebar-footer` | `{ avatar, name, role }` | UserDropdownButton |
| `#workspace` | `{ isAuthenticated }` | VcBladeNavigation + VcAiAgentPanel |

Example — custom menu:
```vue
<VcApp :is-ready="true" logo="...">
  <template #menu="{ expanded, onItemClick }">
    <MyCustomNavigation :compact="!expanded" @navigate="onItemClick" />
  </template>
</VcApp>
```

## Customization ladder

1. `<VcApp />` — zero config, everything default
2. `<VcApp>` + `#menu`, `#sidebar-*` — selective part replacement
3. `<VcApp>` + `#layout` — full layout override
4. `composition/*` parts — complete shell rebuild

## Compatibility policy

`VcApp` stays backward compatible.

`composition/*` is the preferred API for new custom shell assembly.

Legacy `_internal/vc-app-bar/*` and `_internal/vc-app-menu/*` paths were removed.
Use `_internal/app-bar/*` and `_internal/menu/*` instead.
