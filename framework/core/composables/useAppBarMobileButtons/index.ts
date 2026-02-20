import { inject, provide, getCurrentScope, onScopeDispose } from "vue";
import { AppBarMobileButtonsServiceKey } from "@framework/injection-keys";
import { createAppBarMobileButtonsService, IAppBarMobileButtonsService } from "@core/services/app-bar-mobile-buttons-service";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-app-bar-mobile-buttons");

export function provideAppBarMobileButtonsService(): IAppBarMobileButtonsService {
  const existingService = inject(AppBarMobileButtonsServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createAppBarMobileButtonsService();
  provide(AppBarMobileButtonsServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => {
      // Service cleanup on scope disposal
    });
  }

  return service;
}

export function useAppBarMobileButtons() {
  const service = inject(AppBarMobileButtonsServiceKey);
  if (!service) {
    logger.error("AppBarMobileButtonsService not found");
    throw new InjectionError("AppBarMobileButtonsService");
  }
  return service;
}
