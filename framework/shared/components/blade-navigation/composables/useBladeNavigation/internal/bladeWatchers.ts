import { watch, isVNode } from "vue";
import { watchDebounced } from "@vueuse/core";
import * as _ from "lodash-es";
import { RouteLocationNormalized, Router } from "vue-router";
import { useAppInsights } from "../../../../../../core/composables";
import type { BladeVNode } from "../../../types";
import type { _createBladeStateManagement } from "./bladeState";
import type { _createRouterUtils } from "./routerUtils";

// --- Watchers Module ---
export function _createBladeWatchers(
  router: Router,
  route: RouteLocationNormalized,
  bladeState: ReturnType<typeof _createBladeStateManagement>,
  routerUtils: ReturnType<typeof _createRouterUtils>,
  setupPageTracking: ReturnType<typeof useAppInsights>["setupPageTracking"],
) {
  watch(
    () => route.path,
    async (newPath, oldPath) => {
      const newWorkspaceUrlSegment = routerUtils.parseWorkspaceUrlPath(newPath);
      const currentActiveWorkspaceUrl = bladeState.activeWorkspace.value?.type.url;

      if (newWorkspaceUrlSegment && newWorkspaceUrlSegment !== currentActiveWorkspaceUrl) {
        const wsRouteComponent =
          routerUtils.getResolvedRouteComponent(newWorkspaceUrlSegment) ||
          (router.resolve({ path: newWorkspaceUrlSegment }).matched?.[1]?.components?.default as BladeVNode);

        if (wsRouteComponent && isVNode(wsRouteComponent) && wsRouteComponent.type.isBlade) {
          const isPrevented = await bladeState.removeBladesStartingFrom(0);
          if (!isPrevented) {
            bladeState.setActiveWorkspaceBlade(wsRouteComponent);
          } else {
            if (oldPath && oldPath !== newPath) router.push({ path: oldPath });
          }
        } else {
          const isPrevented = await bladeState.removeBladesStartingFrom(0);
          if (!isPrevented) {
            bladeState.clearActiveWorkspaceState();
          } else {
            if (oldPath && oldPath !== newPath) router.push({ path: oldPath });
          }
        }
      } else if (!newWorkspaceUrlSegment && bladeState.activeWorkspace.value) {
        const isPrevented = await bladeState.removeBladesStartingFrom(0);
        if (!isPrevented) {
          bladeState.clearActiveWorkspaceState();
        } else {
          if (oldPath && oldPath !== newPath) router.push({ path: oldPath });
        }
      }
    },
    { immediate: true },
  );

  watchDebounced(
    bladeState.blades,
    (newBlades) => {
      const workspace = newBlades[0];

      const visibleBladesWithUrls = newBlades.filter(
        (b): b is BladeVNode => !!(b && b.type && b.type.url && b.props?.navigation?.isVisible !== false),
      );
      const lastBladeWithUrl: BladeVNode | undefined =
        visibleBladesWithUrls.length > 0 ? visibleBladesWithUrls[visibleBladesWithUrls.length - 1] : undefined;

      if (workspace?.type?.url) {
        const constructedPath = routerUtils.constructBladePath(workspace, lastBladeWithUrl);

        if (constructedPath) {
          const query = routerUtils.getURLQuery();
          const pathPrefix =
            routerUtils.mainRouteBaseParamURL.value &&
            !constructedPath.startsWith(routerUtils.mainRouteBaseParamURL.value)
              ? routerUtils.mainRouteBaseParamURL.value
              : "";
          const querySuffix = query.params ? "?" + query.params : "";

          const finalFullPathToSet = pathPrefix + constructedPath + querySuffix;

          router.options.history.replace(finalFullPathToSet);

          if (lastBladeWithUrl && lastBladeWithUrl.type.name) {
            setupPageTracking.afterEach({
              name: lastBladeWithUrl.type.name!,
              fullPath: finalFullPathToSet,
            });
          } else if (workspace.type.name) {
            setupPageTracking.afterEach({ name: workspace.type.name, fullPath: finalFullPathToSet });
          }
        }
      }
    },
    { deep: true, debounce: 10, flush: "post" },
  );
}
