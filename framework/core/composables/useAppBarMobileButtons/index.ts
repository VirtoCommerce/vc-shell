import { inject, provide } from "vue";
import { AppBarMobileButtonsServiceKey } from "../../../injection-keys";
import { createAppBarMobileButtonsService } from "../../services/app-bar-mobile-buttons-service";

export function provideAppBarMobileButtonsService() {
  const service = createAppBarMobileButtonsService();
  provide(AppBarMobileButtonsServiceKey, service);
  return service;
}

export function useAppBarMobileButtons() {
  const service = inject(AppBarMobileButtonsServiceKey);
  if (!service) {
    throw new Error("AppBarMobileButtonsService not found");
  }
  return service;
}
