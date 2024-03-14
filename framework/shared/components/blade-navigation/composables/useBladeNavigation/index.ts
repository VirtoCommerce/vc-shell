import {
  markRaw,
  computed,
  getCurrentInstance,
  inject,
  warn,
  Component,
  watch,
  isVNode,
  h,
  shallowRef,
  ComputedRef,
} from "vue";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSharedComposable, reactiveComputed } from "@vueuse/core";
import * as _ from "lodash-es";
import { RouteLocationNormalized, useRoute, NavigationFailure } from "vue-router";
import { bladeNavigationInstance } from "../../plugin";
import {
  BladeComponentInternalInstance,
  BladeNavigationPlugin,
  BladeVNode,
  IBladeEvent,
  IParentCallArgs,
  BladeInstanceConstructor,
  BladeRoutesRecord,
} from "../../types";
import { navigationViewLocation } from "../../injectionKeys";
import { usePermissions } from "../../../../../core/composables";
import { notification } from "./../../../notifications";
import "core-js/actual/array/find-last";
import "core-js/actual/array/find-last-index";
import { i18n } from "../../../../../core/plugins/i18n";

interface IUseBladeNavigation {
  readonly blades: ComputedRef<BladeVNode[]>;
  readonly currentBladeNavigationData: ComputedRef<BladeVNode["props"]["navigation"]>;
  openBlade: <Blade extends Component>(
    { blade, param, options, onOpen, onClose }: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ) => Promise<void | NavigationFailure>;
  closeBlade: (index: number) => Promise<boolean>;
  onParentCall: (parentExposedMethods: Record<string, any>, args: IParentCallArgs) => void;
  onBeforeClose: (cb: () => Promise<boolean | undefined>) => void;
  resolveBladeByName: (name: string) => BladeInstanceConstructor;
  routeResolver: (to: RouteLocationNormalized) => Promise<void | NavigationFailure | undefined> | undefined;
  getCurrentBlade: () => BladeVNode;
}

const activeWorkspace = shallowRef<BladeVNode>();
const mainRouteBaseParamURL = shallowRef<string>();

function parseUrl(url: string) {
  const urlRegex = /^\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?(?:\/([a-zA-Z0-9_-]+))?$/;
  const match = url.match(urlRegex);

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

const useBladeNavigationSingleton = createSharedComposable(() => {
  const route = useRoute();

  const instance: BladeComponentInternalInstance = getCurrentInstance() as BladeComponentInternalInstance;
  const navigationInstance =
    (instance !== null && inject<BladeNavigationPlugin>("bladeNavigationPlugin")) || bladeNavigationInstance;
  const router = navigationInstance?.router;

  function parseWorkspaceUrl(path: string): string {
    // Object.values(route.params)[0] will always be base path of the app
    if (!mainRouteBaseParamURL.value) {
      mainRouteBaseParamURL.value = "/" + (Object.values(route.params)?.[0] ?? "");
    }
    const pathWithoutBase = path.startsWith(mainRouteBaseParamURL.value)
      ? path.slice(mainRouteBaseParamURL.value.length)
      : path;
    const segments = pathWithoutBase.split("/").filter(Boolean);
    const workspaceUrl = segments.slice(0, 1).join("/");
    return "/" + workspaceUrl;
  }

  watch(
    () => route.path,
    async (newVal, oldVal) => {
      const workspaceUrl = parseWorkspaceUrl(newVal);

      const wsRouteComponent =
        (route?.matched?.[1]?.components?.default as BladeVNode) ??
        (router.resolve({ path: workspaceUrl })?.matched?.[1]?.components?.default as BladeVNode);

      if (wsRouteComponent !== undefined) {
        if (isVNode(wsRouteComponent) && wsRouteComponent.type.isBlade) {
          //&& wsRouteComponent.type.isBlade
          navigationInstance.blades.value[0] = markRaw(wsRouteComponent);
          activeWorkspace.value = wsRouteComponent;
        } else {
          const isPrevented = await closeBlade(0);

          if (!isPrevented) {
            // add not blade page to blades array to show simple routes as
            // we use only one router-view for all routes
            navigationInstance.blades.value = [];
          } else {
            if (oldVal) router.replace({ path: oldVal });
          }
        }
      }
    },
    { immediate: true },
  );

  watch(
    navigationInstance.blades,
    (newVal) => {
      const workspace = navigationInstance.blades.value[0];

      // method that checks if last item in newVal array has url and returns item. If it has no url - it returns previous item with url, but not first item from array as it's workspace
      const getLastItemWithUrl = () => {
        // Find the previous item with a URL
        for (let i = newVal.length - 1; i > 0; i--) {
          if (newVal[i].type.url) {
            return newVal[i]; // return the previous item with a URL
          }
        }
        return;
      };

      if (workspace?.type?.url) {
        let url: string;
        // when restoring blades we need to use full path of the blade to show last blade from the url as workspace.
        // fullPath is provided by generateRoute function
        const wsBladeUrl = workspace?.props?.navigation?.fullPath || workspace?.type.url;

        const lastBlade = getLastItemWithUrl();
        if (getLastItemWithUrl()) {
          url =
            "/" +
            parseUrl(wsBladeUrl)?.workspace +
            lastBlade?.type.url +
            (lastBlade?.props?.param ? "/" + lastBlade?.props.param : "");
        } else {
          url = wsBladeUrl;
        }

        if (url) {
          router.options.history.replace(
            (mainRouteBaseParamURL.value && !url.startsWith(mainRouteBaseParamURL.value)
              ? mainRouteBaseParamURL.value
              : "") + url,
          );
        }
      }
    },
    { deep: true },
  );

  async function closeBlade(index: number) {
    console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade called.`);

    if (navigationInstance.blades.value.length === 0) {
      return false;
    }

    try {
      const children = navigationInstance.blades.value.slice(index).reverse();
      let isPrevented = false;
      for (let index = 0; index < children.length; index++) {
        const element = children[index];

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
  };
});

export function useBladeNavigation(): IUseBladeNavigation {
  const navigationView = inject(navigationViewLocation, undefined) as BladeVNode;

  const { hasAccess } = usePermissions();

  const instance: BladeComponentInternalInstance = getCurrentInstance() as BladeComponentInternalInstance;

  const { router, route, navigationInstance, closeBlade } = useBladeNavigationSingleton();

  const mainRoute = router.getRoutes().find((r) => r.meta?.root)!;

  async function openWorkspace<Blade extends Component>({ blade, param, options }: IBladeEvent<Blade>) {
    const createdComponent = h(blade, {
      param,
      options,
      navigation: {
        idx: 0,
      },
    }) as BladeVNode;

    try {
      const isPrevented = await closeBlade(0);

      if (!isPrevented && createdComponent.type?.url) {
        if (hasAccess(blade.permissions)) {
          navigationInstance.blades.value = [createdComponent];

          // Find the route with the matching URL and update the components.default property with the new component
          const route = router.getRoutes().find((r) => r.path === createdComponent.type?.url);
          if (route && route.components) {
            route.components.default = createdComponent;
          }

          return await router.replace({ path: createdComponent.type?.url as string });
        } else
          notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
            timeout: 3000,
          });
      }
    } catch (e) {
      console.log(e);
      throw new Error(`Opening workspace '${blade.type.name}' is prevented`);
    }
  }

  async function openBlade<Blade extends Component>(
    { blade, param, options, onOpen, onClose }: IBladeEvent<Blade>,
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

      if (isVNode(instanceComponent) || activeWorkspace.value) {
        const instanceComponentIndex =
          navigationInstance.blades.value /* @ts-expect-error  - findLastIndex is not parsed correctly by ts */
            .findLastIndex((x) => _.isEqual(x.type, instanceComponent.type));

        const instanceComponentChild =
          instanceComponentIndex >= 0 ? navigationInstance.blades.value[instanceComponentIndex + 1] : undefined;

        let isPrevented = false;

        if (instanceComponentChild) {
          isPrevented = await closeBlade(instanceComponentChild.props?.navigation?.idx);
        }

        const currentBladeIdx = instanceComponent.props?.navigation?.idx ? instanceComponent.props?.navigation?.idx : 0;

        const bladeNode = h(
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

        if (!isPrevented) {
          if (hasAccess(blade.permissions)) navigationInstance.blades.value.push(bladeNode);
          else
            notification.error(i18n.global.t("PERMISSION_MESSAGES.ACCESS_RESTRICTED"), {
              timeout: 3000,
            });
        }
      } else {
        throw new Error("No workspace found");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onParentCall(parentExposedMethods: Record<string, any>, args: IParentCallArgs) {
    console.debug(`vc-app#onParentCall({ method: ${args.method} }) called.`);

    if (args.method && parentExposedMethods && typeof parentExposedMethods[args.method] === "function") {
      const method = parentExposedMethods[args.method] as (args: unknown) => Promise<unknown>;
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

      return null as any; // Return type inferred as any due to the early return
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
    return router.getRoutes().find((route) => route.path === to.path);
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
    const params = Object.entries(to.params)
      .filter(([key]) => key !== "pathMatch")
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string | string[]>,
      );

    // Get the raw path of the main route.
    const parentRawPath = router.getRoutes().find((route) => route.name === mainRoute.name)!.path!;

    // Determine the parent path based on the parameters.
    const parentPath = parentRawPath.includes(Object.keys(params)?.[0] as string)
      ? "/" + (Object.values(params)?.[0] ?? "")
      : "";

    // Set the base param value.
    mainRouteBaseParamURL.value = parentPath;

    // Check if the current path matches the parent path.
    const isCorrectParentPath = parentRawPath !== "/" && to.path.startsWith(parentPath);

    // Check if the current route is a parent route.
    const isRouteParent = router.getRoutes().find((x) => x.path.endsWith(parentPath));

    // Parse the URL to extract relevant route information.
    const parsedRoutes = parseUrl(!isRouteParent ? to.path.slice(parentPath.length) : to.path);

    if (parsedRoutes) {
      // Find the registered route component.
      const registeredRouteComponent = routes.find((route) => route.route === "/" + parsedRoutes?.blade)?.component;

      if (registeredRouteComponent) {
        if (registeredRouteComponent.type?.isWorkspace) {
          // If the route is a workspace, navigate to it directly.
          router.replace({ path: registeredRouteComponent.type.url as string });
        } else {
          // If the route is not a workspace, add it to the router and navigate to it.
          const url =
            (!isRouteParent ? parentPath : "") +
            "/" +
            parsedRoutes?.workspace +
            "/" +
            parsedRoutes.blade +
            (parsedRoutes.param ? "/" + parsedRoutes.param : "");

          // If the route is not routable, redirect to the workspace.
          if (!parsedRoutes.param && !registeredRouteComponent.type?.routable) {
            return router.replace("/" + parsedRoutes?.workspace);
          } else {
            // Add the route to the router.
            router.addRoute(mainRoute.name as string, {
              name: url,
              path: parentRawPath !== "/" ? parentRawPath + url : "" + url,
              components: {
                default: _.merge({}, registeredRouteComponent, {
                  props: {
                    param: parsedRoutes.param,
                    navigation: {
                      fullPath: url,
                      idx: 0,
                    },
                  },
                }),
              },
              meta: {
                permissions: registeredRouteComponent.type?.permissions,
              },
            });

            // Navigate to the newly added route.
            return router.replace({ name: url, params: isCorrectParentPath ? params : {} });
          }
        }
      } else {
        // If the registered route component is not found, navigate to the main route.
        const mainRoute = router.getRoutes().find((route) => route.meta?.root);
        const mainRouteAlias = router.getRoutes().find((route) => route.aliasOf?.path === mainRoute?.path) ?? mainRoute;

        router.replace({ name: mainRouteAlias?.name, params: route.params });
      }
    }
  }

  /**
   * The function getCurrentBlade returns the current BladeVNode instance's vnode.
   * @returns the `vnode` property of the `instance` object, which is of type `BladeVNode`.
   */
  function getCurrentBlade(): BladeVNode {
    return instance.vnode;
  }

  const currentBladeNavigationData = computed(() => navigationView?.props?.navigation ?? undefined);

  function onBeforeClose(cb: () => Promise<boolean | undefined>) {
    const instanceComponent = navigationView;

    const currentBlade = navigationInstance.blades.value.find((x: any) => _.isEqual(x, instanceComponent));

    if (currentBlade) {
      currentBlade.props.navigation.onBeforeClose = cb;
    }
  }

  return {
    blades: computed(() => navigationInstance.blades.value),
    openBlade,
    closeBlade,
    onParentCall,
    resolveBladeByName,
    routeResolver,
    getCurrentBlade,
    currentBladeNavigationData,
    onBeforeClose,
  };
}
