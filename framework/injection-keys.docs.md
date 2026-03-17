# Injection Keys

Centralized Vue `InjectionKey` symbols for the vc-shell framework's provide/inject dependency injection system. All keys are typed via `InjectionKey<T>` for full TypeScript safety.

## Overview

Framework services, navigation state, and configuration are shared across the component tree using Vue's provide/inject mechanism. Keys are defined here to avoid symbol duplication and ensure type safety. The app shell provides these at the root; components and composables inject them.

## Keys

### Blade Navigation

| Key | Type | Description |
|-----|------|-------------|
| `NavigationViewLocationKey` | `BladeVNode` | Current blade VNode location in navigation |
| `BladeInstanceKey` | `ComputedRef<IBladeInstance>` | Current blade instance metadata |
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
| `WidgetIdKey` | `string` | Widget identity (provided by WidgetProvider) |
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
| `BladeInstance` | `BladeInstanceKey` |
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |
| `BLADE_BACK_BUTTON` | `BladeBackButtonKey` |
| `TOOLBAR_SERVICE` | `ToolbarServiceKey` |
| `EMBEDDED_MODE` | `EmbeddedModeKey` |

## Usage Examples

```typescript
import { inject } from "vue";
import { MenuServiceKey, WidgetServiceKey } from "@vc-shell/framework";

// In component setup:
const menuService = inject(MenuServiceKey)!;
const widgetService = inject(WidgetServiceKey)!;
```

```typescript
// Extending DynamicModuleRegistry via declaration merging:
declare module "@vc-shell/framework" {
  interface DynamicModuleRegistry {
    myModule: MyModuleApi;
  }
}
```

## Related

- `framework/core/services/` -- Service implementations provided via these keys
- `framework/core/notifications/store.ts` -- NotificationStore provided via `NotificationStoreKey`
- `framework/shared/components/blade-navigation/types.ts` -- Blade types for navigation keys
