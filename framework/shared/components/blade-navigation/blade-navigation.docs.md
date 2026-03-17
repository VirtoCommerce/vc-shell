# BladeNavigation

The core navigation system for the vc-shell admin UI. Manages a horizontal stack of blade panels (similar to the Azure Portal pattern) with routing, breadcrumbs, and parent-child messaging.

## When to Use

- Automatically used as the top-level navigation container in every vc-shell application
- You do not instantiate this directly; it is installed as a plugin and rendered by the app shell
- Interact with the blade stack through `useBladeContext()` or `useBladeStack()`

## Architecture

```
VcBladeNavigation
  +-- VcBladeSlot (per blade in stack)
       +-- VcBlade (the actual blade chrome: toolbar, header, content)
```

### Key Composables

| Composable | Purpose |
|------------|---------|
| `useBladeStack` | Low-level stack state: push, pop, replace blades |
| `useBladeMessaging` | Parent-child messaging between blades (`callParent`, `onParentCall`) |
| `useBladeNavigationAdapter` | Legacy adapter bridging old blade API to the new stack |

## Key Components

| Component | Description |
|-----------|-------------|
| `VcBladeNavigation` | Root container rendering the blade stack with mobile back-button support |
| `VcBladeSlot` | Wrapper for each blade handling visibility, expand/collapse, and breadcrumbs |
| `VcBladeView` | Render function resolving a blade component from the blade registry |

## Features

- Stacked panel navigation with expand/collapse
- URL synchronization (blade state reflected in the URL)
- Breadcrumb trail for navigating back through the stack
- Mobile-responsive with back-button navigation
- Before-close guards to prevent unsaved data loss
- Parent-child blade communication via messaging

## Related Components

- **VcBlade** - Individual blade panel (toolbar, header, scrollable content)
- **useBlade / useBladeContext** - Composables for opening child blades and blade lifecycle
- **VcApp** - The application shell that hosts blade navigation
