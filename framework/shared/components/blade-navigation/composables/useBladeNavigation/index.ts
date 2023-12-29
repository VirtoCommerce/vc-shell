/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactiveComputed } from "@vueuse/core";
import { computed, getCurrentInstance, inject, warn, Component, watch, isVNode, h, shallowRef, ComputedRef } from "vue";
import * as _ from "lodash-es";
import { RouteLocationNormalized, useRoute, RouteRecordNormalized, NavigationFailure } from "vue-router";
import { bladeNavigationInstance } from "../../plugin";
import {
  BladeComponentInternalInstance,
  BladeNavigationPlugin,
  BladeVNode,
  IBladeEvent,
  IParentCallArgs,
  BladeInstanceConstructor,
  BladeRouteRecordLocationNormalized,
} from "../../types";
import { navigationViewLocation } from "../../injectionKeys";
import { generateId } from "../../../../../core/utilities";

type TParsedRoute = {
  blade: string;
  param: string | null;
  name: string;
};

interface IUseBladeNavigation {
  readonly blades: ComputedRef<BladeRouteRecordLocationNormalized | undefined>;
  readonly currentBladeNavigationData: ComputedRef<BladeVNode["props"]["navigation"]>;
  openBlade: <Blade extends Component>(
    { blade, param, options, onOpen, onClose }: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ) => Promise<void | NavigationFailure>;
  closeBlade: (index: number, changeLocation?: boolean) => Promise<false | void | NavigationFailure>;
  onParentCall: (parentExposedMethods: Record<string, any>, args: IParentCallArgs) => void;
  resolveBladeByName: (name: string) => BladeInstanceConstructor;
  routeResolver: (to: RouteLocationNormalized) => Promise<void | NavigationFailure | undefined> | undefined;
  getCurrentBlade: () => BladeVNode;
}

const activeWorkspace = shallowRef<BladeVNode>();

export function useBladeNavigation(): IUseBladeNavigation {
  const navigationView = inject(navigationViewLocation, undefined) as BladeVNode;

  const route = useRoute();

  const instance: BladeComponentInternalInstance = getCurrentInstance() as BladeComponentInternalInstance;
  const navigationInstance =
    (instance !== null && inject<BladeNavigationPlugin>("bladeNavigationPlugin")) || bladeNavigationInstance;

  const router = navigationInstance?.router;

  const routes = router.getRoutes();

  const mainRouteName = router.getRoutes().find((r) => r.meta?.root)?.name as string;

  const blades = computed(() => {
    return router.getRoutes().find((routeItem) => {
      return route.name === routeItem.name;
    });
  }) as ComputedRef<BladeRouteRecordLocationNormalized>;

  watch(
    () => route.path,
    (newVal) => {
      const workspaceUrl = newVal.split("/").slice(0, 2).join("/");

      const wsRouteComponent = routes.find((x) => x.path === workspaceUrl)?.components?.default as BladeVNode;

      if (wsRouteComponent && wsRouteComponent.type?.isWorkspace) {
        activeWorkspace.value = wsRouteComponent;
      }
    },
    { immediate: true },
  );

  async function openWorkspace<Blade extends Component>({ blade, param, options }: IBladeEvent<Blade>) {
    const createdComponent = h(blade, { param, options }) as BladeVNode;

    try {
      if (createdComponent.type?.url) {
        router.addRoute(mainRouteName, {
          name: createdComponent.type?.name,
          path: createdComponent.type?.url,
          components: {
            default: createdComponent,
          },
          meta: {
            permissions: createdComponent.type?.permissions,
          },
        });

        return await router.push({ path: createdComponent.type?.url as string });
      }
    } catch (e) {
      console.log(e);
      throw new Error(`Opening workspace '${blade.type.name}' is prevented`);
    }
  }

  async function openBlade<Blade extends Component>(
    { blade, param, options, onOpen, onClose }: IBladeEvent<Blade>,
    isWorkspace = false,
    // update = true,
  ) {
    if (!blade) {
      throw new Error("You should pass blade component as openBlade argument");
    }

    if (isWorkspace) {
      return await openWorkspace({ blade, param, options });
    }

    const allRoutes = router.getRoutes();

    try {
      const instanceComponent = navigationView || activeWorkspace.value;

      if (instanceComponent) {
        const initialBlade = allRoutes.find(
          (x) =>
            x?.path ===
            (instanceComponent.props?.navigation?.fullPath
              ? instanceComponent.props?.navigation?.fullPath
              : activeWorkspace.value?.type.url),
        );

        const url = initialBlade?.path + (blade.url ? blade.url + (param ? "/" + param : "") : "");

        /**
         * Removes routes without paths and default route from next route.
         */
        const alreadyAdded = _.omitBy(initialBlade?.components, (value: BladeVNode, key) =>
          blade.url ? !value?.props?.navigation?.bladePath : false || key === "default",
        );

        const currentBladeIdx = instanceComponent.props?.navigation?.idx ? instanceComponent.props?.navigation?.idx : 0;

        /**
         * Closes all child blades in current route to prevent blades without url to preserve.
         */
        await closeBlade(currentBladeIdx + 1, false);

        const isInitialBlade = activeWorkspace.value?.type.url === url;

        const bladeNode = h(
          blade,
          Object.assign(
            {},
            reactiveComputed(() => ({ options, param })),
            {
              navigation: {
                bladePath: blade.url ? blade.url + (param ? "/" + param : "") : undefined,
                fullPath: url,
                onClose,
                onOpen,
                idx: currentBladeIdx + 1,
                uniqueRouteKey: generateId(),
              },
            },
          ),
        );

        router.addRoute(mainRouteName, {
          name: isInitialBlade ? activeWorkspace.value?.type.name : url,
          path: url,
          components: Object.assign(
            {},
            { default: activeWorkspace.value },
            { ...alreadyAdded },
            blade.url
              ? {
                  [url]: bladeNode,
                }
              : {
                  [blade.name]: bladeNode,
                },
          ),
          meta: {
            permissions: activeWorkspace.value && mergePermissions(activeWorkspace.value, blade),
          },
        });

        return await router.push({
          path: url,
          replace: !blade.url,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  function mergePermissions(workspaceBlade: BladeVNode, childBlade: BladeVNode | BladeInstanceConstructor) {
    const child = (isVNode(childBlade) ? childBlade : h(childBlade)) as BladeVNode;
    if (child && child.type?.permissions) {
      const childPermissionsArr =
        typeof child.type.permissions === "string" ? [child.type.permissions] : child.type.permissions;
      if (workspaceBlade.type.permissions) {
        const workspacePermissionsArr =
          typeof workspaceBlade.type.permissions === "string"
            ? [workspaceBlade.type.permissions]
            : workspaceBlade.type.permissions;
        return workspacePermissionsArr.concat(childPermissionsArr);
      } else {
        return childPermissionsArr;
      }
    } else return workspaceBlade.type.permissions;
  }

  function removeSubstring(inputString: string, substringToRemove: string) {
    const regex = new RegExp(`${substringToRemove}+$`);
    return inputString.replace(regex, "");
  }

  async function closeBlade(index: number, changeLocation = true) {
    console.debug(`[@vc-shell/framework#useBladeNavigation] - closeBlade called.`);

    const bladeByIndex = Object.values(blades.value?.components || {}).find(
      (x) => "props" in x && x.props?.navigation?.idx === index,
    ) as BladeVNode;

    if (bladeByIndex && bladeByIndex?.props?.navigation?.bladePath) {
      const path = removeSubstring(bladeByIndex.props.navigation.fullPath, bladeByIndex.props.navigation?.bladePath);

      return changeLocation && (await router.replace(path));
    }

    const routeWithNamedBlade = router.getRoutes().find((r) => r.path === bladeByIndex?.props?.navigation?.fullPath);

    if (routeWithNamedBlade) {
      const isInitialBlade = activeWorkspace.value?.type.name === routeWithNamedBlade.name;

      router.addRoute(mainRouteName, {
        name: isInitialBlade ? routeWithNamedBlade?.name : routeWithNamedBlade?.path,
        path: routeWithNamedBlade?.path,
        components: _.omitBy(routeWithNamedBlade?.components, (value: BladeVNode) => {
          if (value.props && value.props.navigation && bladeByIndex.props) {
            return value.props.navigation.idx >= bladeByIndex.props.navigation.idx;
          }
        }) as Record<string, BladeVNode>,
      });

      return changeLocation && (await router.replace(routeWithNamedBlade?.path));
    }
  }

  async function onParentCall(parentExposedMethods: Record<string, any>, args: IParentCallArgs) {
    console.debug(`vc-app#onParentCall({ method: ${args.method} }) called.`);

    if (args.method && typeof parentExposedMethods[args.method] === "function") {
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
      return generateRoute(to, router.getRoutes());
    }
  }

  function hasNecessaryRoute(to: RouteLocationNormalized) {
    return routes.find((route) => route.path === to.path);
  }

  async function generateRoute(to: RouteLocationNormalized, routes: RouteRecordNormalized[]) {
    const parsedRoutes: TParsedRoute[] = parseRoutes(to.path, routes);

    const workspace = parsedRoutes[0];
    const workspaceComponent = routes.find((route) => route.path === workspace.blade)?.components
      ?.default as BladeVNode;

    if (workspaceComponent) {
      const children: Record<string, BladeVNode> = {};

      parsedRoutes
        .filter((r) => r !== workspace)
        .forEach((parsedRoute, index) => {
          const registeredRouteComponent = routes.find((route) => route.path === parsedRoute.blade)?.components
            ?.default;

          if (registeredRouteComponent && parsedRoute.name) {
            children[parsedRoute.name] = _.merge(registeredRouteComponent, {
              props: {
                param: parsedRoute.param,
                navigation: {
                  bladePath: parsedRoute.blade + (parsedRoute.param ? "/" + parsedRoute.param : ""),
                  fullPath: parsedRoute.name,
                  idx: index + 1,
                  uniqueRouteKey: generateId(),
                },
              },
            }) as BladeVNode;

            // Add routes one by one
            router.addRoute(mainRouteName, {
              name: parsedRoute.name,
              path: parsedRoute.name,
              components: {
                default: workspaceComponent,
                ...children,
              },
              meta: {
                permissions: children[parsedRoute.name].type?.permissions,
              },
            });
          }
        });

      const mergedPermissions = Object.values(children)
        .filter((childComponent) => childComponent.type.permissions)
        .flatMap((comp) => mergePermissions(workspaceComponent, comp));

      // Add summary route
      router.addRoute(mainRouteName, {
        name: to.path,
        path: to.path,
        components: {
          default: _.merge(workspaceComponent, { props: { param: Object.values(children)[0].props?.param } }),
          ...children,
        },
        meta: {
          permissions: mergedPermissions.length ? mergedPermissions : undefined,
        },
      });

      return router.push(to.path);
    } else return router.push({ name: mainRouteName });
  }

  function parseRoutes(route: string, commonRoutes: RouteRecordNormalized[]) {
    const parts: string[] = route.split("/").filter((part) => part !== "");
    const result = [];
    let currentBlade = "";
    let currentName = "";

    for (let i = 0; i < parts.length; i++) {
      currentBlade = "/" + parts[i];
      let currentParam = null;

      if (i + 1 < parts.length) {
        const nextPart = "/" + parts.slice(i + 1, i + 2).join("/");
        currentName += currentBlade;

        if (!commonRoutes.some((route) => nextPart === route.path)) {
          currentParam = parts[i + 1];
          currentName += "/" + currentParam;
          i++; // Skip the next part as it's a param
        }
      } else if (i < parts.length) {
        const nextPart = "/" + parts.slice(i).join("/");
        currentName += nextPart;
      }

      result.push({
        blade: currentBlade,
        param: currentParam,
        name: currentName,
      });
    }

    return result;
  }

  function getCurrentBlade(): BladeVNode {
    return instance.vnode;
  }

  const currentBladeNavigationData = computed(
    () => (instance && (instance.vnode.props?.navigation as BladeVNode["props"]["navigation"])) ?? undefined,
  );

  return {
    blades,
    openBlade,
    closeBlade,
    onParentCall,
    resolveBladeByName,
    routeResolver,
    getCurrentBlade,
    currentBladeNavigationData,
  };
}
