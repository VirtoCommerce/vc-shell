import { inject, provide, getCurrentScope, onScopeDispose } from "vue";
import { createAppBarWidgetService, IAppBarWidgetService, appBarWidgetBus } from "@core/services/app-bar-menu-service";
import { AppBarWidgetServiceKey } from "@framework/injection-keys";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-app-bar-widget");

export function provideAppBarWidget(): IAppBarWidgetService {
  const existingService = inject(AppBarWidgetServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createAppBarWidgetService();
  provide(AppBarWidgetServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => appBarWidgetBus.dispose(service));
  }

  return service;
}

export function useAppBarWidget(): IAppBarWidgetService {
  const service = inject(AppBarWidgetServiceKey);
  if (!service) {
    logger.error("AppBarWidgetService not found");
    throw new InjectionError("AppBarWidgetService");
  }
  return service;
}
