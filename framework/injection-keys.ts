import { InjectionKey, ComputedRef } from "vue";
import { BladeVNode, IBladeInstance } from "./shared/components/blade-navigation/types";
import { NotificationTemplateConstructor } from "./core/types";
import { IWidgetContainer, IWidgetService } from "./core/services/widget-service";

export const navigationViewLocation: InjectionKey<BladeVNode> = Symbol("blade navigation view location");
export const BladeInstance: InjectionKey<ComputedRef<IBladeInstance>> = Symbol("BladeInstance");
export const NotificationTemplatesSymbol: InjectionKey<NotificationTemplateConstructor[]> =
  Symbol("NotificationTemplates");
export const WidgetServiceKey: InjectionKey<IWidgetService> = Symbol("WidgetService");
export const WidgetContainerKey: InjectionKey<IWidgetContainer> = Symbol("WidgetContainer");
export const BLADE_SCROLL_KEY = Symbol("blade-scroll");
