# Injection Keys

Centralized Vue `InjectionKey` symbols for the vc-shell framework's provide/inject dependency injection system. All keys are typed via `InjectionKey<T>` for full TypeScript safety.

## Overview

The vc-shell framework uses Vue's provide/inject mechanism extensively to share services, navigation state, and configuration across the component tree. Instead of relying on global singletons or Pinia stores, the framework creates typed injection keys for each service, allowing components to declare their dependencies explicitly.

All keys are defined in a single file (`framework/injection-keys.ts`) to avoid symbol duplication and ensure type safety. The app shell provides these values at the root during bootstrap; components and composables inject them using the corresponding key.

This centralized approach has several advantages:
- **Type safety**: `inject(MenuServiceKey)` returns `MenuService | undefined`, not `unknown`
- **No symbol collisions**: each key is a unique `Symbol`, preventing accidental overwrites
- **Testability**: services can be mocked by providing different values in test wrappers
- **Discoverability**: all injectable dependencies are listed in one place

## Keys

### Blade Navigation

| Key | Type | Description |
|-----|------|-------------|
| `NavigationViewLocationKey` | `BladeVNode` | Current blade VNode location in navigation |
| `BladeDescriptorKey` | `ComputedRef<BladeDescriptor>` | Current blade descriptor metadata |
| `BladeBackButtonKey` | `Component \| undefined` | Custom back button component for a blade |
| `BladeDataKey` | *(from blade-navigation types)* | Data passed between parent/child blades |
| `BladeContextKey` | `ComputedRef<Record<string, unknown>>` | Blade-exposed context for widgets/extensions |
| `BladeRoutesKey` | `BladeRoutesRecord[]` | Registered blade routes |
| `InternalRoutesKey` | `BladeRoutesRecord[]` | Internal framework routes |

### Notifications

| Key | Type | Description |
|-----|------|-------------|
| `NotificationTemplatesKey` | `NotificationTemplateConstructor[]` | Registered notification template components |
| `NotificationStoreKey` | `NotificationStore` | Shared notification store singleton |

### Services

| Key | Type | Description |
|-----|------|-------------|
| `WidgetServiceKey` | `IWidgetService` | Widget registration and lookup |
| `DashboardServiceKey` | `IDashboardService` | Dashboard widget management |
| `GlobalSearchKey` | `GlobalSearchState` | Global search state |
| `MenuServiceKey` | `MenuService` | Main navigation menu |
| `SettingsMenuServiceKey` | `ISettingsMenuService` | Settings sidebar menu |
| `AppBarWidgetServiceKey` | `IAppBarWidgetService` | App bar widget slots |
| `AppBarMobileButtonsServiceKey` | `IAppBarMobileButtonsService` | Mobile app bar buttons |
| `LanguageServiceKey` | `ILanguageService` | Localization service |
| `ToolbarServiceKey` | `IToolbarService` | Blade toolbar actions |
| `AiAgentServiceKey` | `IAiAgentService` | AI agent integration |

### Module System

| Key | Type | Description |
|-----|------|-------------|
| `DynamicModulesKey` | `DynamicModuleRegistry \| undefined` | Registry of loaded dynamic modules (extensible via declaration merging) |
| `ModulesReadyKey` | `Ref<boolean>` | Whether all modules have finished loading |
| `ModulesLoadErrorKey` | `Ref<boolean>` | Whether all modules failed to load |

### UI State

| Key | Type | Description |
|-----|------|-------------|
| `WidgetScopeKey` | `IWidgetScope` | Widget scope (provided by WidgetContainer for component-based widgets via `WidgetScope.vue`) |
| `AppRootElementKey` | `Ref<HTMLElement \| undefined>` | App root element for scoped Teleport |
| `EmbeddedModeKey` | `boolean` | Whether the app runs in embedded mode |
| `ShellIndicatorsKey` | `ComputedRef<boolean>` | Unread indicator state for sidebar |
| `CloseSettingsMenuKey` | `() => void` | Callback to close the settings menu |

### Breakpoints

| Key | Type | Description |
|-----|------|-------------|
| `IsMobileKey` | `Ref<boolean>` | Mobile breakpoint |
| `IsDesktopKey` | `Ref<boolean>` | Desktop breakpoint |
| `IsPhoneKey` | `Ref<boolean>` | Phone breakpoint |
| `IsTabletKey` | `Ref<boolean>` | Tablet breakpoint |
| `IsTouchKey` | `boolean` | Touch device detection |

### Legacy Aliases (Deprecated)

| Deprecated | Use Instead |
|------------|-------------|
| `navigationViewLocation` | `NavigationViewLocationKey` |
| `BladeDescriptor` | `BladeDescriptorKey` |
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |
| `BLADE_BACK_BUTTON` | `BladeBackButtonKey` |
| `TOOLBAR_SERVICE` | `ToolbarServiceKey` |
| `EMBEDDED_MODE` | `EmbeddedModeKey` |

## Usage Examples

### Injecting a service in a component

```typescript
import { inject } from "vue";
import { MenuServiceKey, WidgetServiceKey } from "@vc-shell/framework";

// In component setup:
const menuService = inject(MenuServiceKey)!;
const widgetService = inject(WidgetServiceKey)!;
```

### Safe injection with fallback

```typescript
import { inject } from "vue";
import { IsMobileKey, IsDesktopKey } from "@vc-shell/framework";

// Provide a default value to avoid undefined checks
const isMobile = inject(IsMobileKey, ref(false));
const isDesktop = inject(IsDesktopKey, ref(true));
```

### Providing values in a test wrapper

```typescript
import { mount } from "@vue/test-utils";
import { MenuServiceKey, WidgetServiceKey } from "@vc-shell/framework";

const wrapper = mount(MyComponent, {
  global: {
    provide: {
      [MenuServiceKey as symbol]: mockMenuService,
      [WidgetServiceKey as symbol]: mockWidgetService,
    },
  },
});
```

### Extending DynamicModuleRegistry via declaration merging

```typescript
declare module "@vc-shell/framework" {
  interface DynamicModuleRegistry {
    orders: { refreshOrders: () => Promise<void>; orderCount: ComputedRef<number> };
  }
}

const modules = inject(DynamicModulesKey);
const orderCount = modules?.orders.orderCount; // Typed as ComputedRef<number>
```

## Tip: Prefer Composables Over Direct Injection

Most injection keys have a corresponding composable wrapper (e.g., `useMenuService()`, `useWidgets()`, `useToolbar()`) that handles injection, error reporting, and provides a cleaner API. Prefer using the composable unless you need low-level access to the raw service:

```typescript
// Preferred: composable handles injection and error reporting
import { useMenuService } from "@vc-shell/framework";
const menuService = useMenuService();

// Low-level: direct injection (you handle undefined checks)
import { inject } from "vue";
import { MenuServiceKey } from "@vc-shell/framework";
const menuService = inject(MenuServiceKey);
if (!menuService) throw new Error("MenuService not provided");
```

## Common Mistake

Do not create your own `Symbol` for an injection key that already exists in the framework. Two different symbols with the same description are not equal, so `inject()` will return `undefined`:

```typescript
// Bad: new Symbol is a different key, inject will return undefined
const MyMenuKey = Symbol("MenuService");
const service = inject(MyMenuKey); // undefined!

// Good: use the framework's key
import { MenuServiceKey } from "@vc-shell/framework";
const service = inject(MenuServiceKey); // MenuService instance
```

## Related

- `framework/core/services/` -- Service implementations provided via these keys
- `framework/core/notifications/store.ts` -- NotificationStore provided via `NotificationStoreKey`
- `framework/shared/components/blade-navigation/types.ts` -- Blade types for navigation keys
- `framework/core/composables/` -- Composable wrappers for most injection keys
