import { Component, isVNode } from "vue";
import * as _ from "lodash-es";
import { RouteLocationNormalized, Router, RouteLocationRaw } from "vue-router";
import { IBladeRegistry } from "../../../../../../core/composables/useBladeRegistry";
import type { BladeInstanceConstructor, BladeVNode } from "../../../types";
import type { _createBladeStateManagement } from "./bladeState";
import type { _createRouterUtils } from "./routerUtils";
import type { _createBladeActions } from "./bladeActions";

/**
 * Checks if a component is routable from URL
 */
function isComponentRoutable(component: BladeInstanceConstructor | undefined): boolean {
  return !(component && typeof component.routable === "boolean" && !component.routable);
}

// --- Blade Route Resolver Module ---
export function _createBladeRouteResolver(
  router: Router,
  route: RouteLocationNormalized,
  bladeRegistry: IBladeRegistry,
  routerUtils: ReturnType<typeof _createRouterUtils>,
  bladeActions: ReturnType<typeof _createBladeActions>,
  bladeState: ReturnType<typeof _createBladeStateManagement>,
  ensureBladeComponent: <Blade extends Component>(
    bladeInput: BladeInstanceConstructor<Blade> | { name: string } | null | undefined,
  ) => BladeInstanceConstructor<Blade>,
  hasAccess: (permissions?: string | string[]) => boolean,
) {
  // Internal helper to find a blade component based on a URL segment
  function findBladeComponentByUrlSegment(segment: string): BladeInstanceConstructor | undefined {
    try {
      const allRoutes = router.getRoutes();
      const segmentWithSlash = segment.startsWith("/") ? segment : `/${segment}`;
      const segmentWithoutSlash = segment.startsWith("/") ? segment.substring(1) : segment;

      // 1. Check router's resolved routes by path suffix.
      for (const r of allRoutes) {
        let resolvedComponent: unknown;
        let componentToCheck: unknown;

        try {
          const resolvedRoute = router.resolve({ name: r.name || undefined, path: !r.name ? r.path : undefined });

          if (resolvedRoute.matched.length > 0) {
            resolvedComponent = resolvedRoute.matched[resolvedRoute.matched.length - 1]?.components?.default;
          }

          componentToCheck = resolvedComponent;
          if (resolvedComponent && isVNode(resolvedComponent) && resolvedComponent.type) {
            componentToCheck = resolvedComponent.type;
          }
        } catch (e) {
          // Silently continue to next route if resolution fails
          continue;
        }

        const comp = componentToCheck as BladeInstanceConstructor;

        if (comp && comp.isBlade && typeof comp.url === "string") {
          const compUrlNormalized = comp.url.startsWith("/") ? comp.url : `/${comp.url}`;
          if (compUrlNormalized === segmentWithSlash) {
            return comp;
          }
        }
      }

      const potentialNames = [segmentWithoutSlash];
      if (segment && segment !== "/" && segment.includes("-")) potentialNames.push(segment);

      for (const nameToTry of _.uniq(potentialNames.filter(Boolean))) {
        const bladeByName = bladeRegistry.getBladeComponent(nameToTry);
        if (bladeByName && bladeByName.isBlade && typeof bladeByName.url === "string") {
          const bladeByNameUrlNormalized = bladeByName.url.startsWith("/") ? bladeByName.url : `/${bladeByName.url}`;
          if (bladeByNameUrlNormalized === segmentWithSlash) {
            return bladeByName;
          }
        }
      }

      const bladeByFullPath = bladeRegistry.getBlade(segmentWithSlash);
      if (bladeByFullPath && bladeByFullPath.component && bladeByFullPath.component.isBlade) {
        const componentUrlNormalized = bladeByFullPath.component.url?.startsWith("/")
          ? bladeByFullPath.component.url
          : `/${bladeByFullPath.component.url}`;
        if (componentUrlNormalized === segmentWithSlash) {
          return bladeByFullPath.component as BladeInstanceConstructor;
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error in findBladeComponentByUrlSegment:", error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  async function routeResolver(to: RouteLocationNormalized): Promise<RouteLocationRaw | undefined> {
    const { path: toPath, query: toQueryFromTo } = to;
    let currentConstructedPath: string | undefined;
    if (bladeState.activeWorkspace.value) {
      currentConstructedPath = routerUtils.constructBladePath(
        bladeState.activeWorkspace.value,
        _.last(bladeState.blades.value) as BladeVNode | undefined,
      );
    }
    const currentFullPath = currentConstructedPath
      ? (routerUtils.mainRouteBaseParamURL.value &&
        !currentConstructedPath.startsWith(routerUtils.mainRouteBaseParamURL.value)
          ? routerUtils.mainRouteBaseParamURL.value
          : "") + currentConstructedPath
      : undefined;

    if (
      currentFullPath &&
      decodeURIComponent(to.fullPath).startsWith(decodeURIComponent(currentFullPath)) &&
      bladeState.blades.value.length > 0
    ) {
      const toPathDecoded = decodeURIComponent(to.path);
      const currentPathDecoded = decodeURIComponent(currentFullPath);
      const toSegments = toPathDecoded.split("/").filter(Boolean);
      const currentSegments = currentPathDecoded.split("/").filter(Boolean);

      if (toPathDecoded.startsWith(currentPathDecoded) && toSegments.length === currentSegments.length) {
        const targetRoute = routerUtils.allRoutes.find((r) => r.name === to.name);
        if (
          targetRoute &&
          bladeState.activeWorkspace.value &&
          targetRoute.components?.default === bladeState.activeWorkspace.value.type
        ) {
          return undefined;
        }
      }
    }

    const parsedUrl = routerUtils.parseUrlParams(to.path, to.params);

    if (!parsedUrl || !parsedUrl.workspace) {
      const rootRoute = routerUtils.goToRoot();
      if (typeof rootRoute === "object" && rootRoute.name && rootRoute.name === to.name) {
        return undefined;
      }
      return rootRoute;
    }

    const workspaceSegment = parsedUrl.workspace;
    const bladeSegment = parsedUrl.blade;
    const paramSegment = parsedUrl.param;

    const workspaceComponent = findBladeComponentByUrlSegment(workspaceSegment);

    if (!isComponentRoutable(workspaceComponent)) {
      await bladeState.removeBladesStartingFrom(0);
      bladeState.clearActiveWorkspaceState();
      return routerUtils.goToRoot();
    }

    if (!workspaceComponent || !workspaceComponent.isWorkspace) {
      const rootRoute = routerUtils.goToRoot();
      if (typeof rootRoute === "object" && rootRoute.name && rootRoute.name === to.name) {
        return undefined;
      }
      return rootRoute;
    }

    if (!hasAccess(workspaceComponent.permissions)) {
      return routerUtils.goToRoot();
    }

    // Determine the parameter to pass to the workspace.
    // It depends on whether a bladeSegment exists and if that blade shares its param with the parent.
    let paramForWorkspace: string | undefined = undefined;
    if (bladeSegment) {
      const childBladeComponent = findBladeComponentByUrlSegment(bladeSegment);
      // Check if workspace and child blade are from the same module using moduleUid
      // and if the child blade is routable
      if (
        workspaceComponent &&
        childBladeComponent &&
        isComponentRoutable(childBladeComponent) &&
        Object.prototype.hasOwnProperty.call(workspaceComponent, "moduleUid") &&
        Object.prototype.hasOwnProperty.call(childBladeComponent, "moduleUid") &&
        (workspaceComponent as BladeInstanceConstructor & { moduleUid?: string }).moduleUid ===
          (childBladeComponent as BladeInstanceConstructor & { moduleUid?: string }).moduleUid
      ) {
        paramForWorkspace = paramSegment;
      } else {
        paramForWorkspace = undefined; // Default: child blade exists, its param is not for the workspace
      }
    } else {
      paramForWorkspace = paramSegment; // No child blade segment, workspace gets the param from URL if present
    }

    const openWorkspaceResult = await bladeActions.openWorkspace(
      {
        blade: ensureBladeComponent(workspaceComponent),
        param: paramForWorkspace,
      },
      to.query,
      to.params,
      true,
    );

    if (openWorkspaceResult && "redirectedFrom" in openWorkspaceResult) {
      return undefined;
    }

    let lastOpenedBladeComponent = workspaceComponent;
    let effectiveBladeSegment = bladeSegment;

    if (effectiveBladeSegment) {
      const bladeComponent = findBladeComponentByUrlSegment(effectiveBladeSegment);

      if (!isComponentRoutable(bladeComponent)) {
        effectiveBladeSegment = undefined;
      }

      if (effectiveBladeSegment && bladeComponent && bladeComponent.isBlade) {
        if (!hasAccess(bladeComponent.permissions)) {
          // No access to blade, workspace remains open
        } else {
          await bladeActions.openBlade({
            blade: ensureBladeComponent(bladeComponent),
            param: paramSegment,
          });
          lastOpenedBladeComponent = bladeComponent;
        }
      }
    }

    if (lastOpenedBladeComponent.name && String(lastOpenedBladeComponent.name) === String(to.name)) {
      return undefined;
    }

    const finalTargetRoute = routerUtils.allRoutes.find((r) => String(r.name) === String(to.name));
    if (finalTargetRoute && bladeState.blades.value.some((b) => b.type === finalTargetRoute.components?.default)) {
      return undefined;
    }

    return undefined;
  }
  return routeResolver;
}
