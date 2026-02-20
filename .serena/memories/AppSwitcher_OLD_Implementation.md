# OLD App-Switcher Implementation Analysis

## Overview
The OLD app-switcher implementation is a relatively simple, self-contained component system that manages application switching in the VcApp shell. It consists of UI components and a composable for data/logic management.

## Directory Structure
```
framework/shared/components/app-switcher/
├── index.ts                           # Module registration & re-exports
├── components/
│   ├── index.ts                       # Component barrel export
│   └── vc-app-switcher/
│       ├── index.ts                   # Component export
│       └── vc-app-switcher.vue        # Main UI component (SFC)
└── composables/
    ├── index.ts                       # Composable barrel export
    └── useAppSwitcher/
        └── index.ts                   # Main composable logic
```

## Component: VcAppSwitcher
**File**: `framework/shared/components/app-switcher/components/vc-app-switcher/vc-app-switcher.vue`

### Template Structure
```vue
<template>
  <div
    v-if="appsList && appsList.length"
    ref="container"
    class="vc-app-switcher"
    @contextmenu.prevent
  >
    <VcDropdown
      :model-value="true"
      :items="appsList"
      :is-item-active="(item) => locationHandler(item.relativeUrl ?? '')"
      max-height="auto"
      :padded="false"
      @item-click="switchApp"
    >
      <template #item="{ item }">
        <div class="vc-app-switcher__item">
          <img
            :src="imageUrl(item.iconUrl ?? '')"
            :alt="`icon_${item.id}`"
            class="vc-app-switcher__item-icon"
          />
          <p class="vc-app-switcher__item-title">
            {{ item.title }}
          </p>
        </div>
      </template>
    </VcDropdown>
  </div>
</template>
```

### Props
```typescript
export interface Props {
  appsList: AppDescriptor[];
}
```

### Emits
```typescript
interface Emits {
  (event: "onClick", item: AppDescriptor): void;
}
```

### Methods
- **`imageUrl(url: string)`**: Passthrough function that returns the URL as-is
- **`locationHandler(url: string)`**: Determines if a URL matches the current pathname
  - Cleans current pathname by removing trailing slashes
  - Uses regex match to check if URL is active
  - Returns boolean indicating if item is "active"
- **`switchApp(app: AppDescriptor)`**: Emits onClick event with the selected app

### Styling
```scss
.vc-app-switcher {
  @apply tw-relative tw-flex tw-shrink-0 tw-h-full;

  &__item {
    @apply tw-flex tw-items-center tw-w-full tw-p-3 tw-w-full;
  }

  &__item-icon {
    @apply tw-w-5 tw-h-5 tw-mr-2 tw-shrink-0;
  }

  &__item-title {
    @apply tw-font-normal tw-text-sm tw-leading-5 tw-truncate;
    color: var(--app-switcher-item-text-color);
    transition: opacity 0.3s ease;
  }
}
```

CSS Custom Properties:
- `--app-switcher-item-text-color`: Default is `var(--additional-950)` (dark text)
- `--app-switcher-height`: Default is `var(--app-bar-height)`

## Composable: useAppSwitcher
**File**: `framework/shared/components/app-switcher/composables/useAppSwitcher/index.ts`

### Interface
```typescript
interface IUseAppSwitcher {
  readonly appsList: Ref<AppDescriptor[]>;
  getApps: () => Promise<void>;
  switchApp: (app: AppDescriptor) => void;
}
```

### Return Type
```typescript
{
  appsList: computed(() => appsList.value),  // Computed ref (read-only)
  getApps,                                     // Async function to fetch apps
  switchApp,                                   // Function to switch app
}
```

### Implementation Details

#### `getApps()` Function
- Creates an `AppsClient` instance
- Calls `client.getApps()` to fetch the app list from API
- Updates the `appsList.value` with the result
- Logs errors if fetch fails

#### `switchApp(app: AppDescriptor)` Function
- Checks if user has permission to access the app using `hasAccess(app.permission)`
- If permitted:
  - Performs navigation: `window.location.href = window.location.origin + app.relativeUrl`
  - This is a hard page navigation (full page reload)
- If NOT permitted:
  - Shows error notification: `"PERMISSION_MESSAGES.ACCESS_RESTRICTED"`
  - Timeout: 3000ms

### Dependencies
- `@core/api/platform`: `AppDescriptor`, `AppsClient`
- `@core/composables`: `usePermissions()`
- `@shared/components/notifications`: notification service
- `@core/plugins`: i18n
- `@core/utilities`: createLogger

### API Integration
- Uses `AppsClient` (auto-generated from API specification)
- Calls `client.getApps()` to fetch available applications
- Each app has permission requirements that are validated

## AppDescriptor Type (from core/api/platform.ts)
```typescript
export interface IAppDescriptor {
  title?: string | undefined;
  description?: string | undefined;
  iconUrl?: string | undefined;
  relativeUrl?: string | undefined;
  permission?: string | undefined;
  id?: string | undefined;
}

export class AppDescriptor implements IAppDescriptor {
  title?: string | undefined;
  description?: string | undefined;
  iconUrl?: string | undefined;
  relativeUrl?: string | undefined;
  permission?: string | undefined;
  id?: string | undefined;
}
```

## Module Registration
**File**: `framework/shared/components/app-switcher/index.ts`

```typescript
export const VcAppSwitcherComponent = createModule(components);
```

The component is registered as a Vue module and installed in the SharedModule:

**File**: `framework/shared/index.ts`
```typescript
export const SharedModule = {
  install(app: App, args: { router: Router }): void {
    app
      .use(VcAppSwitcherComponent)
      // ... other modules
  },
};
```

When installed, `VcAppSwitcher` is registered as a global component and automatically available throughout the app.

## Integration in VcApp Shell

### Entry Point: useShellLifecycle Hook
**File**: `framework/ui/components/organisms/vc-app/composables/useShellLifecycle.ts`

```typescript
export function useShellLifecycle(props: { isReady: boolean }) {
  // ... other composables
  const { appsList, switchApp, getApps } = useAppSwitcher();

  // Bootstrap flow: once authenticated, load apps
  watch(
    [() => props.isReady, isAuthenticated],
    async ([isReady, isAuth]) => {
      if (!isBootstrapped.value && isReady && isAuth) {
        isBootstrapped.value = true;
        await loadFromHistory();
        await getApps();  // <-- Loads app list on bootstrap
      }
    },
    { immediate: true },
  );

  return { isAppReady, isAuthenticated, appsList, switchApp };
}
```

### Flow in vc-app.vue
1. VcApp component injects `useShellLifecycle()` composable
2. Gets `appsList` and `switchApp` function
3. Passes them to layout components (DesktopLayout/MobileLayout) via props
4. Layouts pass them to AppHubPopover or as slot scopes

### DesktopLayout Component Integration
**File**: `framework/ui/components/organisms/vc-app/_internal/layouts/DesktopLayout.vue`

```vue
<AppHubPopover
  :show="sidebar.isMenuOpen.value"
  :apps-list="appsList"
  :show-applications="!disableAppSwitcher"
  @switch-app="handleSwitchApp"
>
  <template #applications="{ appsList: slotAppsList, switchApp: slotSwitchApp }">
    <slot
      name="app-switcher"
      :apps-list="slotAppsList"
      :switch-app="slotSwitchApp"
    />
  </template>
</AppHubPopover>
```

The AppHubPopover component displays the app switcher interface in a popover.

### MobileLayout Integration
**File**: `framework/ui/components/organisms/vc-app/_internal/layouts/MobileLayout.vue`

Mobile layout uses MenuSidebar component which has an `app-switcher` slot:

```vue
<div class="menu-sidebar__app-switcher-wrapper">
  <slot name="app-switcher" />
</div>
```

## Key Characteristics

### Simplicity
- Minimal component structure: one Vue component + one composable
- Single responsibility: display apps and handle switching

### Navigation Model
- Hard navigation via `window.location.href`
- Full page reload when switching apps
- Works across domain/protocol boundaries

### Permission-Based Access
- Each app has an optional `permission` property
- Permission is checked before allowing app switch
- Shows error notification if access denied

### UI Integration
- Uses VcDropdown for display
- Shows icon + title for each app
- Highlights current app based on URL matching
- Minimal styling, uses CSS custom properties for customization

### Lifecycle
- Apps are fetched during shell bootstrap (once authenticated)
- List is cached in ref and passed down component tree
- No reactive updates to app list during session

## Exports Summary

### From `framework/shared/components/app-switcher/index.ts`
- `VcAppSwitcherComponent`: The Vue module
- `useAppSwitcher`: The composable function
- Global component: `VcAppSwitcher`

### Available Throughout App
Via `SharedModule` installation:
- Component: `<VcAppSwitcher :apps-list="appsList" @on-click="handleAppClick" />`
- Composable: `const { appsList, getApps, switchApp } = useAppSwitcher()`

## Current Usage Pattern
In real applications, the old implementation is NOT typically used directly. Instead:
1. Shell bootstrap calls `useAppSwitcher().getApps()`
2. `appsList` is passed to layout components
3. Layouts pass it to AppHubPopover or similar UI components
4. Custom slot implementations can override default rendering
5. User clicks trigger `switchApp(app)` which performs hard navigation
