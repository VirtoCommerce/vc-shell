import { inject } from "vue";
import { AppInsightsPluginOptions, useAppInsights as useInsights } from "vue3-application-insights";
import { generateW3CId } from "@microsoft/applicationinsights-core-js";
import { useUser } from "..";

export const useAppInsights = () => {
  const appInsights = useInsights();
  const { user } = useUser();
  const appInsightsOptions = inject<AppInsightsPluginOptions>("appInsightsOptions");

  function setupPageTracking() {
    const appName = appInsightsOptions?.appName ? `[${appInsightsOptions.appName}] ` : "";

    const pageName = (route: { name: string }) => `${appName}${route.name as string}`;

    function beforeEach(route: { name: string }) {
      const name = pageName(route);
      appInsights.context.telemetryTrace.traceID = generateW3CId();
      appInsights.context.telemetryTrace.name = route.name as string;

      appInsights.startTrackPage(name);
    }

    function afterEach(route: { name: string; fullPath: string }) {
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
  };
};
