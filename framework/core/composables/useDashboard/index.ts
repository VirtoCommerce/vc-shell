import {
  createDashboardService,
  IDashboardService,
  registerDashboardWidget,
  dashboardBus,
} from "@core/services/dashboard-service";
import { provide, inject, getCurrentScope, onScopeDispose } from "vue";
import { DashboardServiceKey } from "@framework/injection-keys";
import { usePermissions } from "@core/composables/usePermissions";
import { createLogger, InjectionError } from "@core/utilities";

const logger = createLogger("use-dashboard");

export function provideDashboardService(): IDashboardService {
  const existingService = inject(DashboardServiceKey, null);
  if (existingService) {
    return existingService;
  }

  let hasAccessResolver: (permissions: string[] | undefined) => boolean = () => true;

  try {
    const { hasAccess } = usePermissions();
    hasAccessResolver = (permissions) => hasAccess(permissions);
  } catch (error) {
    logger.warn("Permissions composable unavailable, dashboard falls back to allow-all access check", error);
  }

  const service = createDashboardService({
    hasAccess: hasAccessResolver,
  });

  provide(DashboardServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => dashboardBus.dispose(service));
  }

  return service;
}

export function useDashboard(): IDashboardService {
  const service = inject(DashboardServiceKey);
  if (!service) {
    logger.error("Dashboard service not found");
    throw new InjectionError("DashboardService");
  }
  return service;
}

export { registerDashboardWidget };
