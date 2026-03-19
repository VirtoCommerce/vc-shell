import { inject, type InjectionKey } from "vue";
import { AppInsightsPluginOptions } from "vue3-application-insights";
import { generateW3CId } from "@microsoft/applicationinsights-core-js";
import { useUserManagement } from "@core/composables/useUserManagement";
import { ApplicationInsights, Snippet } from "@microsoft/applicationinsights-web";

export const AppInsightsOptionsKey: InjectionKey<AppInsightsPluginOptions> = Symbol("AppInsightsOptions");
export const AppInsightsInstanceKey: InjectionKey<ApplicationInsights | null> = Symbol("AppInsightsInstance");

export interface UseAppInsightsReturn {
  setupPageTracking: {
    beforeEach: (route: { name: string }) => void;
    afterEach: (route: { name: string; fullPath: string }) => void;
  };
  appInsights: ApplicationInsights | null;
}

/** @deprecated Use UseAppInsightsReturn instead */
export type IUseAppInsights = UseAppInsightsReturn;

export function useAppInsights(): UseAppInsightsReturn {
  const appInsights = inject(AppInsightsInstanceKey, null);
  const { user } = useUserManagement();
  const appInsightsOptions = inject(AppInsightsOptionsKey, undefined);

  function setupPageTracking() {
    const appName = appInsightsOptions?.appName ? `[${appInsightsOptions.appName}] ` : "";

    const pageName = (route: { name: string }) => `${appName}${route.name as string}`;

    function beforeEach(route: { name: string }) {
      if (!appInsights) return;
      const name = pageName(route);
      appInsights.context.telemetryTrace.traceID = generateW3CId();
      appInsights.context.telemetryTrace.name = route.name as string;

      appInsights.startTrackPage(name);
    }

    function afterEach(route: { name: string; fullPath: string }) {
      if (!appInsights) return;
      const name = pageName(route);
      const url = location.protocol + "//" + location.host + route.fullPath;
      appInsights.stopTrackPage(name, url, {
        userId: user.value?.id ?? "",
        userName: user.value?.userName ?? "",
      });
    }

    return {
      beforeEach,
      afterEach,
    };
  }

  return {
    setupPageTracking: setupPageTracking(),
    appInsights,
  };
}
