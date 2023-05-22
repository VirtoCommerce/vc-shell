import { NotificationTemplateConstructor } from "./core/types";
import { BladePageComponent } from "./shared/components/blade-navigation/types";
import { InjectionKey } from "vue";

export const pagesSymbol = Symbol("pages") as InjectionKey<BladePageComponent[]>;
export const notificationTemplatesSymbol = Symbol("notificationTemplates") as InjectionKey<
  NotificationTemplateConstructor[]
>;
