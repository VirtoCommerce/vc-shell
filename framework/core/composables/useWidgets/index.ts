import { getCurrentInstance, inject, provide } from "vue";
import {
  createWidgetService,
  IWidgetService,
  registerWidget,
  registerExternalWidget,
} from "./../../services/widget-service";
import { WidgetServiceKey } from "./../../../injection-keys";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-widgets");

export function provideWidgetService(): IWidgetService {
  const service = createWidgetService();
  provide(WidgetServiceKey, service);
  return service;
}

export function useWidgets(): IWidgetService {
  const service = inject(WidgetServiceKey);
  if (!service) {
    logger.error("Widget service not found in current context. Injection chain:", getCurrentInstance());
    throw new InjectionError("WidgetService");
  }
  return service;
}

export { registerWidget, registerExternalWidget };
