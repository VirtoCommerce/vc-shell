import { computed, getCurrentInstance, inject, warn, Component, isVNode, h, shallowRef, ComputedRef, watch } from "vue";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSharedComposable, reactifyObject, reactiveComputed, toValue, watchDebounced } from "@vueuse/core";
import * as _ from "lodash-es";
import {
  RouteLocationNormalized,
  useRoute,
  NavigationFailure,
  RouteRecordName,
  RouteParams,
  Router,
  LocationQuery,
  RouteParamsGeneric,
  RouteRecordNameGeneric,
} from "vue-router";
import { bladeNavigationInstance } from "../../plugin";
import {
  BladeComponentInternalInstance,
  BladeNavigationPlugin,
  BladeVNode,
  IBladeEvent,
  IParentCallArgs,
  BladeInstanceConstructor,
  BladeRoutesRecord,
  ExtractedBladeOptions,
} from "../../types";
import { navigationViewLocation } from "../../../../../injection-keys";
import { useAppInsights, usePermissions } from "../../../../../core/composables";
import { notification } from "./../../../notifications";
import "core-js/actual/array/find-last";
import "core-js/actual/array/find-last-index";
import { i18n } from "../../../../../core/plugins/i18n";

interface IUseBladeNavigation {
  readonly blades: ComputedRef<BladeVNode[]>;
  readonly currentBladeNavigationData: ComputedRef<BladeVNode["props"]["navigation"]>;
  openBlade: <Blade extends Component>(
    { blade, param, options, onOpen, onClose, replaceCurrentBlade }: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ) => Promise<void | NavigationFailure>;
  closeBlade: (index: number) => Promise<boolean>;
  goToRoot: () => {
    name: RouteRecordNameGeneric;
    params: RouteParamsGeneric;
  };
  onParentCall: (parentExposedMethods: Record<string, any>, args: IParentCallArgs) => void;
  onBeforeClose: (cb: () => Promise<boolean | undefined>) => void;
  resolveBladeByName: (name: string) => BladeInstanceConstructor;
  routeResolver: (to: RouteLocationNormalized) =>
    | Promise<
        | {
            name: RouteRecordName | undefined;
            params: RouteParams;
          }
        | undefined
      >
    | undefined;
  setNavigationQuery: (query: Record<string, string | number>) => void;
  getNavigationQuery: () => Record<string, string | number> | undefined;
}

const activeWorkspace = shallowRef<BladeVNode>();
const mainRouteBaseParamURL = shallowRef<string>();

const utils = (router: Router) => {
  const route = useRoute();
  const routes = router.getRoutes();

  function parseUrl(url: string) {
    // remove parts of url that does not contain workspace, blade or param - everything before workspace
    const parts = url.split("/");
    const workspaceIndex = parts.findIndex((part) => {
      const route = routes.find(
        (r) => r.path.endsWith("/" + part) && (r.components?.default as BladeVNode)?.type?.isWorkspace,
      );

      return route !== undefined;
    });
    const cleanUrl = "/" + parts.slice(workspaceIndex).join("/");

    const urlRegex = /^\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?(?:\/([a-zA-Z0-9_-]+))?$/;
    const match = cleanUrl.match(urlRegex);

    if (!match) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, workspace, blade, param] = match;

    return {
      workspace,
      blade: blade || undefined,
      param: param || undefined,
    };
  }

  function parseWorkspaceUrl(path: string): string {
    // Object.values(route.params)[0] will always be base path of the app
    mainRouteBaseParamURL.value = "/" + (Object.values(route.params)?.[0] ?? "");

    const pathWithoutBase = path.startsWith(mainRouteBaseParamURL.value)
      ? path.slice(mainRouteBaseParamURL.value.length)
      : path;
    const segments = pathWithoutBase.split("/").filter(Boolean);
    const workspaceUrl = segments.slice(0, 1).join("/");
    return "/" + workspaceUrl;
  }

  function getURLQuery() {
    if (route.query && Object.keys(route.query).length) {
      return {
        params: new URLSearchParams(route.query as Record<string, string>).toString(),
        obj: route.query,
      };
    }

    const [, query] = window.location.href.split("#")[1].split("?");
    const params = new URLSearchParams(query).toString();

    return { params, obj: Object.fromEntries(new URLSearchParams(query)) };
  }

  return {
    parseUrl,
    parseWorkspaceUrl,
    getURLQuery,
    routes,
  };
};

const useBladeNavigationSingleton = createSharedComposable(() => {
  const route = useRoute();
  const { setupPageTracking } = useAppInsights();

  const instance = getCurrentInstance() as BladeComponentInternalInstance;
  const navigationInstance =
    (instance !== null && inject<BladeNavigationPlugin>("bladeNavigationPlugin")) || bladeNavigationInstance;
  const router = navigationInstance?.router;

  const { parseUrl, parseWorkspaceUrl, getURLQuery } = utils(router);

  watch(
    () => route.path,
    async (newVal, oldVal) => {
      const workspaceUrl = parseWorkspaceUrl(newVal);

      const wsRouteComponent = getWorkspaceRouteComponent(workspaceUrl);

      if (wsRouteComponent !== undefined) {
        if (isVNode(wsRouteComponent) && wsRouteComponent.type.isBlade) {
          updateActiveWorkspace(wsRouteComponent);
        } else {
          await handleNonBladePage(oldVal);
        }
      }
    },
    { immediate: true },
  );

  async function handleNonBladePage(oldVal?: string) {
    const isPrevented = await closeBlade(0);
    if (!isPrevented) {
      navigationInstance.blades.value = [];
      activeWorkspace.value = undefined;
    } else {
      if (oldVal) router.push({ path: oldVal });
    }
  }

  function updateActiveWorkspace(wsRouteComponent: BladeVNode) {
    if (wsRouteComponent.props?.navigation) {
      wsRouteComponent.props.navigation.idx = 0;
    }
    navigationInstance.blades.value[0] = wsRouteComponent;
    activeWorkspace.value = wsRouteComponent;
    closeBlade(1);
  }

  function getWorkspaceRouteComponent(workspaceUrl: string) {
    return (
      (route?.matched?.[1]?.components?.default as BladeVNode) ??
      (router.resolve({ path: workspaceUrl })?.matched?.[1]?.components?.default as BladeVNode)
    );
  }

  watchDebounced(
    navigationInstance.blades,
    async (newVal) => {
      const workspace = navigationInstance.blades.value[0];
      const lastBlade = getLastItemWithUrl(newVal);

      if (workspace?.type?.url) {
        const url = constructUrl(workspace, lastBlade);
        if (url) {
          updateRouterHistory(url, lastBlade?.type.name);
        }
      }
    },
    { deep: true, debounce: 1 },
  );

  function getLastItemWithUrl(newVal: BladeVNode[]) {
    for (let i = newVal.length - 1; i > 0; i--) {
      if (newVal[i].type.url) {
        return newVal[i];
      }
    }
  }

  function constructUrl(workspace: BladeVNode, lastBlade?: BladeVNode) {
    const wsBladeUrl = workspace?.type.url;
    const lastBladeUrl = lastBlade?.type.url;
    const param = lastBlade?.props?.param;
    const parsedWorkspaceUrl = parseUrl(wsBladeUrl || "")?.workspace;

    if (lastBlade && wsBladeUrl && parsedWorkspaceUrl) {
      return "/" + parsedWorkspaceUrl + lastBladeUrl + (param ? "/" + param : "");
    } else {
      return wsBladeUrl;
    }
  }

  function updateRouterHistory(url: string, name?: string) {
    const params = getURLQuery().params;

    const fullUrl =
      (mainRouteBaseParamURL.value && !url.startsWith(mainRouteBaseParamURL.value) ? mainRouteBaseParamURL.value : "") +
      url +
      (params ? "?" + params : "");

    router.options.history.replace(fullUrl);

    if (name) {
      setupPageTracking.afterEach({ name: name, fullPath: fullUrl });
    }
  }

  async function closeBlade(index: number) {
    console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade called.`);

    if (navigationInstance.blades.value.length === 0) {
      return false;
    }

    try {
      const children = navigationInstance.blades.value.slice(index).reverse();
      let isPrevented = false;
      for (let i = 0; i < children.length; i++) {
        const element = children[i];

        if (element.props?.navigation?.onBeforeClose) {
          const result = await element.props.navigation.onBeforeClose();

          if (result === false) {
            isPrevented = true;
            console.debug(`[@vc-shell/framework#useBladeNavigation] - Navigation is prevented`);
          }
          // we use break here to prevent running onBeforeClose for all children, cause it can be prevented by first child
          break;
        }
      }

      if (!isPrevented) {
        const prevBlade = navigationInstance.blades.value[index - 1];

        if (index > 0 && prevBlade?.props?.navigation?.isVisible === false) {
          prevBlade.props.navigation.isVisible = true;
        }

        // Clear param of table blade when closing child blade to prevent table row selection from being preserved
        if (
          prevBlade &&
          prevBlade.props.navigation.idx === 0 &&
          toValue(prevBlade.props?.param) === toValue(navigationInstance.blades.value[index]?.props?.param)
        ) {
          prevBlade.props.param = undefined;
        }

        navigationInstance.blades.value.splice(index);
      }

      return isPrevented;
    } finally {
      console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade finished.`);
    }
  }

  return {
    navigationInstance,
    router,
    route,
    closeBlade,
    setupPageTracking,
  };
});

export function useBladeNavigation(): IUseBladeNavigation {
  const navigationView = inject(navigationViewLocation, undefined) as BladeVNode;

  const { hasAccess } = usePermissions();

  const instance = getCurrentInstance() as BladeComponentInternalInstance;

  const { router, route, navigationInstance, closeBlade, setupPageTracking } = useBladeNavigationSingleton();

  const { parseUrl, getURLQuery, routes: routerRoutes } = utils(router);
  const mainRoute = routerRoutes.find((r) => r.meta?.root);
  if (!mainRoute) {
    throw new Error("Main route not found");
  }

  async function openWorkspace<Blade extends Component>(
    { blade, param, options }: IBladeEvent<Blade>,
    query: LocationQuery | undefined = undefined,
    params: RouteParams = {},
    replace = false,
  ) {
    const createdComponent = h(
      blade,
      reactifyObject({
        // param: computed(() => {
        //   const isChildWithSameParamOpened = navigationInstance.blades.value.some(
        //     (x) => x.props?.param === toValue(param),
        //   );
        //   if (isChildWithSameParamOpened) {
        //     return toValue(param);
        //   }
        //   return undefined;
        // }) as unknown as string,
        param,
        options,
        navigation: {
          idx: 0,
        },
      }),
    ) as BladeVNode;

    try {
      const isPrevented = await closeBlade(0);

      if (!isPrevented && createdComponent.type?.url) {
        if (hasAccess(blade.permissions)) {
          if (
            hasAccess(blade.permissions) &&
            navigationInstance.blades.value.length > 0 &&
            navigationInstance.blades.value[0].type.url === createdComponent.type.url
          ) {
            return;
          }
          navigationInstance.blades.value = [createdComponent];
          // Find the route with the matching URL and update the components.default property with the new component
          const wsroute = routerRoutes.find((r) => r.path.endsWith(createdComponent.type?.url as string));
          if (wsroute && wsroute.components) {
            wsroute.components.default = createdComponent;
          }

          return await router.push({
            name: wsroute?.name,
            params: { ...params, ...route.params },
            query,
            replace,
          });
        } else {
          notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
            timeout: 3000,
          });
        }
      }
    } catch (e) {
      console.error(e);
      throw new Error(`Opening workspace '${blade?.type?.name || "Unknown"}' is prevented`);
    }
  }

  async function openBlade<Blade extends Component>(
    { blade, param, options, onOpen, onClose, replaceCurrentBlade = false }: IBladeEvent<Blade>,
    isWorkspace = false,
  ) {
    if (!blade) {
      throw new Error("You should pass blade component as openBlade argument");
    }

    if (isWorkspace) {
      return await openWorkspace({ blade, param, options });
    }

    try {
      const instanceComponent = navigationView || activeWorkspace.value;

      if (!(isVNode(instanceComponent) || activeWorkspace.value)) {
        throw new Error("No workspace found");
      }

      const instanceComponentIndex = findInstanceComponentIndex(instanceComponent);
      const instanceComponentChild =
        instanceComponentIndex >= 0 ? navigationInstance.blades.value[instanceComponentIndex + 1] : undefined;

      let isPrevented = false;

      if (instanceComponentChild) {
        isPrevented = await closeBlade(instanceComponentChild.props?.navigation?.idx);
      }

      const currentBladeIdx = instanceComponent.props?.navigation?.idx ?? 0;

      const bladeNode = createBladeNode<Blade>({
        blade,
        currentBladeIdx,
        options,
        param,
        onClose,
        onOpen,
      });

      if (!isPrevented) {
        if (hasAccess(blade.permissions)) {
          if (replaceCurrentBlade) {
            navigationInstance.blades.value[currentBladeIdx].props.navigation.isVisible = false;
          }
          setupPageTracking.beforeEach({ name: bladeNode.type.name! });
          navigationInstance.blades.value.push(bladeNode);
        } else {
          notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), { timeout: 3000 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  function findInstanceComponentIndex(instanceComponent: BladeVNode) {
    return _.findLastIndex(navigationInstance.blades.value, (x) => _.isEqual(x.type, instanceComponent.type));
  }

  function createBladeNode<Blade extends Component>(args: {
    blade: BladeInstanceConstructor<Blade>;
    currentBladeIdx: number;
    options: ExtractedBladeOptions<InstanceType<BladeInstanceConstructor<Blade>>["$props"], "options"> | undefined;
    param?: string;
    onClose?: () => void;
    onOpen?: () => void;
  }) {
    const { blade, currentBladeIdx, options, param, onClose, onOpen } = args;
    return h(
      blade,
      Object.assign(
        {},
        reactiveComputed(() => ({ options, param })),
        {
          navigation: {
            onClose,
            onOpen,
            idx: currentBladeIdx + 1,
          },
        },
      ),
    ) as BladeVNode;
  }

  async function onParentCall(parentExposedMethods: Record<string, any>, args: IParentCallArgs) {
    console.debug(`vc-app#onParentCall({ method: ${args.method} }) called.`);

    if (args.method && parentExposedMethods && typeof parentExposedMethods[args.method] === "function") {
      const method = parentExposedMethods[args.method];
      const result = await method(args.args);

      if (typeof args.callback === "function") {
        args.callback(result);
      }
    } else {
      console.error(
        `No such method: ${args.method}. Please, add method with name ${args.method} and use defineExpose to expose it in parent blade`,
      );
    }
  }

  function resolveBladeByName(name: string): BladeInstanceConstructor {
    if (!instance) {
      warn("resolveComponentByName can only be used in setup().");

      return null as unknown as BladeInstanceConstructor;
    }

    if (!name) {
      throw new Error("Blade name is required.");
    }

    const components = instance?.appContext.components;
    if (components[name]) {
      return components[name] as BladeInstanceConstructor;
    } else {
      throw new Error(`Blade '${name}' not found.`);
    }
  }

  function routeResolver(to: RouteLocationNormalized) {
    if (!hasNecessaryRoute(to)) {
      return generateRoute(to, navigationInstance.internalRoutes);
    }
  }

  function hasNecessaryRoute(to: RouteLocationNormalized) {
    return routerRoutes.find((route) => route.path === to.path);
  }

  /**
   * Generates and handles navigation for dynamic routes based on the provided route information.
   *
   * Supports App component URLs with variable like '/:userId?'.
   * @link https://router.vuejs.org/guide/essentials/dynamic-matching.html
   *
   * @param to - The target route.
   * @param routes - The array of BladeRoutesRecord containing the registered routes.
   */
  async function generateRoute(to: RouteLocationNormalized, routes: BladeRoutesRecord[]) {
    // Extract parameters excluding "pathMatch". This is necessary if a variable is used as the App component URL, for example, /:userId?
    const params = Object.fromEntries(Object.entries(to.params).filter(([key]) => key !== "pathMatch"));

    // Get the raw path of the main route.
    const parentRawPath = routerRoutes.find((route) => route.name === mainRoute?.name)?.path;

    // Determine the parent path based on the parameters.
    const parentPath =
      parentRawPath && parentRawPath.includes(Object.keys(params)[0]) ? `/${Object.values(params)[0]}` : "";

    // Set the base param value.
    mainRouteBaseParamURL.value = parentPath;

    // Parse the URL to extract relevant route information.
    const parsedRoutes = parseUrl(parentPath !== "/" ? to.path.slice(parentPath.length) : to.path);

    if (parsedRoutes !== undefined) {
      const { workspace, blade, param } = parsedRoutes;

      // Find the registered route component.
      const registeredWorkspaceComponent = routes.find((route) => route.route === `/${workspace}`)?.component;
      const registeredRouteComponent = routes.find((route) => route.route === `/${blade}`)?.component;

      if (!hasAccess(registeredWorkspaceComponent?.type.permissions) || !registeredWorkspaceComponent) {
        return goToRoot();
      }

      // Open the workspace component or workspace route.
      if (registeredRouteComponent?.type.isWorkspace) {
        await openWorkspace(
          {
            blade: registeredRouteComponent as unknown as BladeInstanceConstructor,
          },
          undefined,
          undefined,
          true,
        );
        return { name: registeredRouteComponent?.type.name, params };
      }

      // Open the workspace component with param or workspace route.
      if (registeredWorkspaceComponent) {
        await openWorkspace(
          reactifyObject({
            blade: registeredWorkspaceComponent as unknown as BladeInstanceConstructor,
            param: computed(() => {
              if (registeredRouteComponent?.type.moduleUid === registeredWorkspaceComponent.type.moduleUid) {
                return param;
              }
              return undefined;
            }) as unknown as string,
          }),
          getURLQuery().obj,
          params,
          true,
        );

        // Open the route if it's routable.
        if (
          registeredRouteComponent?.type.routable &&
          registeredWorkspaceComponent.type.moduleUid === registeredRouteComponent.type.moduleUid
        ) {
          await openBlade({
            blade: registeredRouteComponent as unknown as BladeInstanceConstructor,
            param: param,
          });
        }

        return { name: registeredWorkspaceComponent?.type.name, params, query: to.query };
      }
    } else {
      return goToRoot();
    }
  }

  function goToRoot() {
    const mainRoute = routerRoutes.find((route) => route.meta?.root);
    const mainRouteAlias = routerRoutes.find((route) => route.aliasOf?.path === mainRoute?.path) || mainRoute;
    return { name: mainRouteAlias?.name, params: route.params };
  }

  const currentBladeNavigationData = computed(() => navigationView?.props?.navigation ?? undefined);

  function onBeforeClose(cb: () => Promise<boolean | undefined>) {
    const instanceComponent = navigationView;

    const currentBlade = navigationInstance.blades.value.find((x: any) => _.isEqual(x, instanceComponent));

    if (currentBlade) {
      currentBlade.props.navigation.onBeforeClose = cb;
    }
  }

  function setNavigationQuery(query: Record<string, string | number>) {
    const typeName = instance.vnode.type.name?.toLowerCase();
    if (typeName && instance.vnode.props.navigation.idx === 0) {
      // add blade name to query keys
      const namedQuery = _.mapKeys(
        _.mapValues(query, (value) => value?.toString()),
        (value, key) => typeName + "_" + key,
      );
      const cleanQuery = _.omitBy(namedQuery, _.isNil);

      router.options.history.replace(
        decodeURIComponent(
          `${window.location.hash.substring(1).split("?")[0]}?${new URLSearchParams(cleanQuery).toString()}`,
        ),
      );
    }
  }

  function getNavigationQuery() {
    const typeName = instance.vnode.type.name?.toLowerCase();
    if (typeName && instance.vnode.props.navigation.idx === 0) {
      const queryKeys = Array.from(Object.keys(route.query));
      const bladeQueryKeys = queryKeys.filter((key) => key.startsWith(typeName));

      const namedQuery = _.mapKeys(_.pick(route.query, bladeQueryKeys), (value, key) =>
        key.replace(typeName + "_", ""),
      ) as Record<string, string | number>;

      const obj: typeof namedQuery = {};
      for (const [key, value] of Object.entries(namedQuery)) {
        const numValue = Number(value);

        if (!isNaN(numValue)) {
          obj[key] = numValue;
        } else {
          obj[key] = value;
        }
      }

      return obj;
    }
  }

  return {
    blades: computed(() => navigationInstance.blades.value),
    openBlade,
    closeBlade,
    goToRoot,
    onParentCall,
    resolveBladeByName,
    routeResolver,
    currentBladeNavigationData,
    onBeforeClose,
    setNavigationQuery,
    getNavigationQuery,
  };
}
