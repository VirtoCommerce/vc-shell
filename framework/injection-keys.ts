import { InjectionKey, ComputedRef, type Component, type Ref } from "vue";
import { BladeDataKey } from "@core/blade-navigation/types";
import type { BladeRoutesRecord } from "@core/blade-navigation/types";
import type { NotificationStore } from "@core/notifications/store";
import { IToolbarService } from "@core/services/toolbar-service";
import { IAiAgentService } from "@core/plugins/ai-agent/types";
import type { BladeFormInjection } from "@core/composables/useBladeForm/types";

import type { IWidgetService } from "@core/services/widget-service";
import type { IWidgetScope } from "@core/services/widget-service";
import type { IDashboardService } from "@core/services/dashboard-service";
import type { GlobalSearchState as _GlobalSearchState } from "@core/services/global-search-service";
import type { MenuService } from "@core/services/menu-service";
import type { ISettingsMenuService } from "@core/services/settings-menu-service";
import type { IAppBarWidgetService } from "@core/services/app-bar-menu-service";
import type { IAppBarMobileButtonsService } from "@core/services/app-bar-mobile-buttons-service";
import type { ILanguageService } from "@core/services/language-service";

// Blade navigation keys
export const BladeBackButtonKey: InjectionKey<Component | undefined> = Symbol("BladeBackButton");
export { BladeDataKey };

// Notification keys
export const NotificationStoreKey: InjectionKey<NotificationStore> = Symbol("NotificationStore");

// Service keys
export const WidgetServiceKey: InjectionKey<IWidgetService> = Symbol("WidgetService");
export const DashboardServiceKey: InjectionKey<IDashboardService> = Symbol("DashboardService");
export const MenuServiceKey: InjectionKey<MenuService> = Symbol("MenuService");
export const SettingsMenuServiceKey: InjectionKey<ISettingsMenuService> = Symbol("SettingsMenuService");
export const AppBarWidgetServiceKey: InjectionKey<IAppBarWidgetService> = Symbol("AppBarWidgetService");
export const AppBarMobileButtonsServiceKey: InjectionKey<IAppBarMobileButtonsService> =
  Symbol("AppBarMobileButtonsService");
export const LanguageServiceKey: InjectionKey<ILanguageService> = Symbol("LanguageService");
export const ToolbarServiceKey: InjectionKey<IToolbarService> = Symbol("ToolbarService");

/**
 * Registry of dynamic modules available via provide/inject.
 * Consumers can extend this interface via declaration merging:
 *
 * @example
 * ```typescript
 * declare module '@vc-shell/framework' {
 *   interface DynamicModuleRegistry {
 *     myModule: MyModuleApi;
 *   }
 * }
 * ```
 */
export interface DynamicModuleRegistry {
  [key: string]: unknown;
}

// Module keys
export const DynamicModulesKey: InjectionKey<DynamicModuleRegistry | undefined> = Symbol("DynamicModules");

// Module loading completion state (Phase 2: two-phase bootstrap)
export const ModulesReadyKey: InjectionKey<Ref<boolean>> = Symbol("ModulesReady");

// Module loading total failure state (Phase 2: all modules failed to load)
export const ModulesLoadErrorKey: InjectionKey<Ref<boolean>> = Symbol("ModulesLoadError");

// App root element key (for scoped Teleport targets)
export const AppRootElementKey: InjectionKey<Ref<HTMLElement | undefined>> = Symbol("AppRootElement");

// App mode keys
export const EmbeddedModeKey: InjectionKey<boolean> = Symbol("EmbeddedMode");

// Shell indicators (computed boolean for SidebarHeader unread dot)
export const ShellIndicatorsKey: InjectionKey<ComputedRef<boolean>> = Symbol("ShellIndicators");

// AI Agent keys
export const AiAgentServiceKey: InjectionKey<IAiAgentService> = Symbol("AiAgentService");

// Breakpoint keys
export const IsMobileKey: InjectionKey<Ref<boolean>> = Symbol("IsMobile");
export const IsDesktopKey: InjectionKey<Ref<boolean>> = Symbol("IsDesktop");
export const IsPhoneKey: InjectionKey<Ref<boolean>> = Symbol("IsPhone");
export const IsTabletKey: InjectionKey<Ref<boolean>> = Symbol("IsTablet");
export const IsTouchKey: InjectionKey<boolean> = Symbol("IsTouch");

// Routing keys
export const BladeRoutesKey: InjectionKey<BladeRoutesRecord[]> = Symbol("BladeRoutes");
export const InternalRoutesKey: InjectionKey<BladeRoutesRecord[]> = Symbol("InternalRoutes");

// Settings menu close callback
export const CloseSettingsMenuKey: InjectionKey<() => void> = Symbol("CloseSettingsMenu");

// Blade context (data exposed by blade for external widgets / extensions)
export const BladeContextKey: InjectionKey<ComputedRef<Record<string, unknown>>> = Symbol("BladeContext");

// Widget scope (provided by WidgetContainer for component-based widgets)
export const WidgetScopeKey: InjectionKey<IWidgetScope> = Symbol("WidgetScope");

// Blade form keys
export const BladeFormKey: InjectionKey<BladeFormInjection> = Symbol("BladeForm");

// Blade loading state (skeleton mode for child components)
export const BladeLoadingKey: InjectionKey<Ref<boolean>> = Symbol("BladeLoading");
