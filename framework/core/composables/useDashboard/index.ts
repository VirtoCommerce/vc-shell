import {
  createDashboardService,
  IDashboardService,
  registerDashboardWidget,
  dashboardBus,
} from "@core/services/dashboard-service";
import { DashboardServiceKey } from "@framework/injection-keys";
import { usePermissions } from "@core/composables/usePermissions";
import { createLogger } from "@core/utilities";
import { createServiceRegistry } from "@core/composables/createServiceRegistry";

export type UseDashboardReturn = IDashboardService;

const logger = createLogger("use-dashboard");

const registry = createServiceRegistry<IDashboardService>({
  key: DashboardServiceKey,
  bus: dashboardBus,
  name: "DashboardService",
  create: () => {
    let hasAccessResolver: (permissions: string[] | undefined) => boolean = () => true;

    try {
      const { hasAccess } = usePermissions();
      hasAccessResolver = (permissions) => hasAccess(permissions);
    } catch (error) {
      logger.warn("Permissions composable unavailable, dashboard falls back to allow-all access check", error);
    }

    return createDashboardService({
      hasAccess: hasAccessResolver,
    });
  },
  onMissing: () => logger.error("Dashboard service not found"),
});

export function provideDashboardService(): IDashboardService {
  return registry.provide();
}

export function useDashboard(): UseDashboardReturn {
  return registry.use();
}

export { registerDashboardWidget };
