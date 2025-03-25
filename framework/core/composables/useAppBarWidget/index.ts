import { inject, provide } from "vue";
import { addAppBarWidget, createAppBarWidgetService, IAppBarWidgetService } from "../../services/app-bar-menu-service";
import { AppBarWidgetServiceKey } from "../../../injection-keys";

export function provideAppBarWidget(): IAppBarWidgetService {
  const service = createAppBarWidgetService();
  provide(AppBarWidgetServiceKey, service);
  return service;
}

export function useAppBarWidget(): IAppBarWidgetService {
  const service = inject(AppBarWidgetServiceKey);
  if (!service) {
    throw new Error("AppBarWidgetService not found");
  }
  return service;
}

export { addAppBarWidget };
