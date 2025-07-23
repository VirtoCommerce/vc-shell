import { InjectionKey, ComputedRef, type Component } from "vue";
import { BladeVNode, IBladeInstance } from "./shared/components/blade-navigation/types";
import { NotificationTemplateConstructor } from "./core/types";

import {
  IWidgetService,
  IDashboardService,
  GlobalSearchState,
  MenuService,
  ISettingsMenuService,
  IAppBarWidgetService,
  IAppBarMobileButtonsService,
} from "./core/services";

export const navigationViewLocation: InjectionKey<BladeVNode> = Symbol("blade navigation view location");
export const BladeInstance: InjectionKey<ComputedRef<IBladeInstance>> = Symbol("BladeInstance");
export const NotificationTemplatesSymbol: InjectionKey<NotificationTemplateConstructor[]> =
  Symbol("NotificationTemplates");
export const WidgetServiceKey = Symbol("WidgetService") as InjectionKey<IWidgetService>;
export const BLADE_BACK_BUTTON = Symbol("blade-back-button") as InjectionKey<Component | undefined>;
export const DashboardServiceKey = Symbol("DashboardService") as InjectionKey<IDashboardService>;
export const DynamicModulesKey = Symbol("DynamicModules") as InjectionKey<
  typeof window.VcShellDynamicModules | undefined
>;
export const GlobalSearchKey = Symbol("GlobalSearch") as InjectionKey<GlobalSearchState>;
export const MenuServiceKey = Symbol("MenuService") as InjectionKey<MenuService>;
export const SettingsMenuServiceKey: InjectionKey<ISettingsMenuService> = Symbol("SettingsMenuService");
export const AppBarWidgetServiceKey = Symbol("AppBarWidgetService") as InjectionKey<IAppBarWidgetService>;
export const AppBarMobileButtonsServiceKey = Symbol(
  "AppBarMobileButtonsService",
) as InjectionKey<IAppBarMobileButtonsService>;
export const TOOLBAR_SERVICE = Symbol("toolbar-service");
export const EMBEDDED_MODE = Symbol("embedded-mode") as InjectionKey<boolean>;
