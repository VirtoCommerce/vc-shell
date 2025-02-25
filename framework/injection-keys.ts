import { InjectionKey, ComputedRef, type Component } from "vue";
import { BladeVNode, IBladeInstance } from "./shared/components/blade-navigation/types";
import { NotificationTemplateConstructor } from "./core/types";
import { IWidgetService } from "./core/services/widget-service";

export const navigationViewLocation: InjectionKey<BladeVNode> = Symbol("blade navigation view location");
export const BladeInstance: InjectionKey<ComputedRef<IBladeInstance>> = Symbol("BladeInstance");
export const NotificationTemplatesSymbol: InjectionKey<NotificationTemplateConstructor[]> =
  Symbol("NotificationTemplates");
export const WidgetServiceKey: InjectionKey<IWidgetService> = Symbol("WidgetService");
export const BLADE_BACK_BUTTON = Symbol('blade-back-button') as InjectionKey<Component | undefined>;
