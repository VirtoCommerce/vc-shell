import { createDashboardService, IDashboardService, registerDashboardWidget } from "../../services/dashboard-service";
import { provide, inject } from "vue";
import { DashboardServiceKey } from "../../../injection-keys";

export function provideDashboardService(): IDashboardService {
  const service = createDashboardService();
  provide(DashboardServiceKey, service);
  return service;
}

export function useDashboard(): IDashboardService {
  const service = inject(DashboardServiceKey);
  if (!service) {
    throw new Error("DashboardService not provided");
  }
  return service;
}

export { registerDashboardWidget };
