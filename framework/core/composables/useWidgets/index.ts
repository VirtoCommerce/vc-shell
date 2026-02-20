import { getCurrentInstance, inject, provide, getCurrentScope, onScopeDispose } from "vue";
import {
  createWidgetService,
  IWidgetService,
  registerWidget,
  registerExternalWidget,
  widgetBus,
} from "@core/services/widget-service";
import { WidgetServiceKey } from "@framework/injection-keys";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-widgets");

export function provideWidgetService(): IWidgetService {
  const existingService = inject(WidgetServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createWidgetService();
  provide(WidgetServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => widgetBus.dispose(service));
  }

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
