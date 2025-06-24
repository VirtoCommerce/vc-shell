import { computed, shallowRef, Ref, markRaw, watch } from "vue";
import { RouteLocationNormalized, Router, LocationQuery, RouteRecordNameGeneric, RouteParamsGeneric } from "vue-router";
import type { BladeVNode } from "../../../types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// --- Router and URL Utilities Module ---
export function _createRouterUtils(router: Router, route: RouteLocationNormalized) {
  const mainRouteBaseParamURL: Ref<string | undefined> = shallowRef<string>();
  const routes = markRaw(router.getRoutes());

  function _updateMainRouteBaseParamURL() {
    const firstParamValue = Object.values(route.params)?.[0] ?? "";
    mainRouteBaseParamURL.value = "/" + firstParamValue;
  }
  // Initial calculation
  _updateMainRouteBaseParamURL();
  // Update when route params change, as this might affect the base URL
  watch(() => route.params, _updateMainRouteBaseParamURL, { deep: true });

  function parseUrlParams(
    url: string,
    currentRouteParams: RouteParamsGeneric,
  ): { workspace?: string; blade?: string; param?: string } | undefined {
    let pathSegments = url.split("/").filter(Boolean);

    const firstParamFromCurrentRoute = Object.values(currentRouteParams)?.[0];
    let basePathFromCurrentRoute: string | undefined;

    if (typeof firstParamFromCurrentRoute === "string" && firstParamFromCurrentRoute) {
      basePathFromCurrentRoute = "/" + firstParamFromCurrentRoute;
    }

    // If the URL starts with the determined base path (like a UUID tenant ID from currentRouteParams),
    // we should parse the segments *after* it for workspace, blade, param.
    if (basePathFromCurrentRoute && basePathFromCurrentRoute !== "/" && url.startsWith(basePathFromCurrentRoute)) {
      const baseSegmentsCount = basePathFromCurrentRoute.split("/").filter(Boolean).length;
      pathSegments = pathSegments.slice(baseSegmentsCount);
    }
    // Now, pathSegments should contain parts of the URL after the base parameter,
    // e.g., ["workspace-name", "blade-name", "item-id"] or ["workspace-name"], etc.

    if (pathSegments.length === 0) {
      // This means the path was likely just the base parameter itself (e.g., "/some-uuid/")
      // or an empty path "/".
      // parseUrlParams returns undefined for workspace, blade, param in this case.
      // routeResolver will handle this, typically by navigating to a default workspace or root.
      return { workspace: undefined, blade: undefined, param: undefined };
    }

    // The first segment after the base is potentially the workspace.
    // The second is potentially the blade.
    // The third is potentially the param.
    // Validation of these segments against actual components happens later in routeResolver.
    const workspace = pathSegments[0];
    const blade = pathSegments[1];
    const param = pathSegments[2];

    return { workspace, blade, param };
  }

  function parseWorkspaceUrlPath(path: string): string {
    _updateMainRouteBaseParamURL(); // Ensure base URL is current
    const pathWithoutBase = path.startsWith(mainRouteBaseParamURL.value || "###") // Use unlikely string if base is undefined
      ? path.slice((mainRouteBaseParamURL.value || "").length)
      : path;
    const segments = pathWithoutBase.split("/").filter(Boolean);
    const workspaceUrl = segments.slice(0, 1).join("/");
    return "/" + workspaceUrl;
  }

  function getURLQuery(): { params: string; obj: LocationQuery } {
    if (route.query && Object.keys(route.query).length) {
      return {
        params: new URLSearchParams(route.query as Record<string, string>).toString(),
        obj: route.query,
      };
    }
    // Fallback for scenarios where route.query might not be populated (e.g., initial load before router is fully ready)
    const hash = window.location.hash || "#";
    const queryPart = hash.split("?")[1] || "";
    const params = new URLSearchParams(queryPart).toString();
    return { params, obj: Object.fromEntries(new URLSearchParams(queryPart)) };
  }

  function constructBladePath(workspace: BladeVNode, lastBlade?: BladeVNode): string | undefined {
    const wsBladeUrl = workspace?.type.url;

    if (!wsBladeUrl) {
      return undefined;
    }

    // Normalize workspace URL (e.g., "products" -> "/products")
    // Ensure basePath starts with a slash and does not end with one (unless it's just "/")
    let basePath = wsBladeUrl.startsWith("/") ? wsBladeUrl : "/" + wsBladeUrl;
    if (basePath.endsWith("/") && basePath.length > 1) {
      basePath = basePath.slice(0, -1);
    }

    if (lastBlade && lastBlade.type.url && lastBlade.type.url !== wsBladeUrl) {
      // This is a child blade different from the workspace
      let childPathSegment = lastBlade.type.url;
      const param = lastBlade.props?.param;

      // Normalize childPathSegment (e.g., "details" -> "/details")
      if (!childPathSegment.startsWith("/")) {
        childPathSegment = "/" + childPathSegment;
      }

      let fullPath = basePath + childPathSegment;

      if (param) {
        fullPath += "/" + String(param);
      }
      return fullPath;
    } else {
      // This is just the workspace, or lastBlade is the workspace itself, or lastBlade has no distinct URL.
      // The param should be taken from lastBlade if it's the one defining the current end of the path,
      // otherwise from the workspace's own props.
      const param = lastBlade ? lastBlade.props?.param : workspace.props?.param;
      if (param) {
        return basePath + "/" + String(param);
      }
      return basePath;
    }
  }

  function getResolvedRouteComponent(path: string): BladeVNode | undefined {
    return router.resolve({ path })?.matched?.[1]?.components?.default as BladeVNode | undefined;
  }

  return {
    mainRouteBaseParamURL: computed(() => mainRouteBaseParamURL.value),
    parseUrlParams,
    parseWorkspaceUrlPath,
    getURLQuery,
    constructBladePath,
    getResolvedRouteComponent,
    allRoutes: routes,
    goToRoot: () => {
      const mainRoute = routes.find((r) => r.meta?.root);
      const mainRouteAlias = routes.find((r) => r.aliasOf?.path === mainRoute?.path) || mainRoute;
      if (mainRouteAlias?.name) {
        return { name: mainRouteAlias.name as RouteRecordNameGeneric, params: route.params as RouteParamsGeneric };
      }
      console.error("goToRoot: Main route or its alias with a name not found!");
      return { path: "/" };
    },
  };
}
