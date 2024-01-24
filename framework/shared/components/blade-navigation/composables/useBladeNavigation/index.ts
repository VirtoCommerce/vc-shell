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
const baseUrl = shallowRef<string>();

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
    if (!baseUrl.value) {
      baseUrl.value = "/" + (Object.values(route.params)?.[0] ?? "");
    }
    const pathWithoutBase = path.startsWith(baseUrl.value) ? path.slice(baseUrl.value.length) : path;
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
        if (isVNode(wsRouteComponent)) {
          navigationInstance.blades.value[0] = markRaw(wsRouteComponent);
          activeWorkspace.value = wsRouteComponent;
        } else {
          const isPrevented = await closeBlade(0);

          if (!isPrevented) {
            // add not blade page to blades array to show simple routes as
            // we use only one router-view for all routes
            navigationInstance.blades.value = [markRaw(wsRouteComponent)];
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

        if (url) history.replaceState({}, "", "#" + url);
      }
    },
    { deep: true },
  );

  async function closeBlade(index: number) {
    console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade called.`);

    if (navigationInstance.blades.value.length === 1) {
      return false;
    }

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
      }
    }

    if (!isPrevented) {
      navigationInstance.blades.value.splice(index);
    }

    return isPrevented;
  }

  return {
    navigationInstance,
    router,
    closeBlade,
  };
});

export function useBladeNavigation(): IUseBladeNavigation {
  const navigationView = inject(navigationViewLocation, undefined) as BladeVNode;

  const { hasAccess } = usePermissions();

  const instance: BladeComponentInternalInstance = getCurrentInstance() as BladeComponentInternalInstance;

  const { router, navigationInstance, closeBlade } = useBladeNavigationSingleton();

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
        navigationInstance.blades.value = [createdComponent];

        return await router.replace({ path: createdComponent.type?.url as string });
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

  async function generateRoute(to: RouteLocationNormalized, routes: BladeRoutesRecord[]) {
    const parsedRoutes = parseUrl(to.path);

    if (parsedRoutes) {
      // here we check if route is registered in bladeRoutes
      const registeredRouteComponent = routes.find((route) => route.route === "/" + parsedRoutes?.blade)?.component;

      if (registeredRouteComponent) {
        if (registeredRouteComponent.type?.isWorkspace) {
          // if route is workspace we just push it to router
          router.replace({ path: registeredRouteComponent.type.url as string });
        } else {
          // if route is not workspace we need to add it to router and push
          const url =
            "/" +
            parsedRoutes?.workspace +
            "/" +
            parsedRoutes.blade +
            (parsedRoutes.param ? "/" + parsedRoutes.param : "");

          // if route is not routable we will redirect to workspace
          if (!parsedRoutes.param && !registeredRouteComponent.type?.routable) {
            return router.replace("/" + parsedRoutes?.workspace);
          } else {
            router.addRoute(mainRoute.name as string, {
              name: url,
              path: url,
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

            return router.replace(url);
          }
        }
      } else {
        return router.replace({ name: mainRoute.name as string });
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
