import { inject, provide } from "vue";
import { AppBarMobileButtonsServiceKey } from "../../../injection-keys";
import { createAppBarMobileButtonsService } from "../../services/app-bar-mobile-buttons-service";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-app-bar-mobile-buttons");

export function provideAppBarMobileButtonsService() {
  const existingService = inject(AppBarMobileButtonsServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createAppBarMobileButtonsService();
  provide(AppBarMobileButtonsServiceKey, service);
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
