import { getCurrentInstance, inject, provide } from "vue";
import { createWidgetService, IWidgetService } from "./../../services/widget-service";
import { WidgetServiceKey } from "./../../../injection-keys";

export function provideWidgetService(): IWidgetService {
  const service = createWidgetService();
  provide(WidgetServiceKey, service);
  return service;
}

export function useWidgets(): IWidgetService {
  const service = inject(WidgetServiceKey);
  if (!service) {
    console.error("Widget service not found in current context. Injection chain:", getCurrentInstance());
    throw new Error("WidgetService not provided");
  }
  return service;
}
