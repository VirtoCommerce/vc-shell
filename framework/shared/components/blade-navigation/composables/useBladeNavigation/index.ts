/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactiveComputed } from "@vueuse/core";
import { computed, getCurrentInstance, inject, warn, Component, watch, isVNode, h, shallowRef, ComputedRef } from "vue";
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
  BladeRouteRecordLocationNormalized,
  BladeRoutesRecord,
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
const baseUrl = shallowRef<string>();
export function useBladeNavigation(): IUseBladeNavigation {
  const navigationView = inject(navigationViewLocation, undefined) as BladeVNode;

  const route = useRoute();

  const instance: BladeComponentInternalInstance = getCurrentInstance() as BladeComponentInternalInstance;
  const navigationInstance =
    (instance !== null && inject<BladeNavigationPlugin>("bladeNavigationPlugin")) || bladeNavigationInstance;

  const router = navigationInstance?.router;

  const mainRoute = router.getRoutes().find((r) => r.meta?.root)!;

  const blades = computed(() => {
    return router.getRoutes().find((routeItem) => {
      return route.name === routeItem.name;
    });
  }) as ComputedRef<BladeRouteRecordLocationNormalized>;

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
    (newVal) => {
      const workspaceUrl = parseWorkspaceUrl(newVal);

      const wsRouteComponent = router.resolve({ path: workspaceUrl })?.matched?.[1]?.components?.default as BladeVNode;

      if (wsRouteComponent && wsRouteComponent.type?.isWorkspace) {
        activeWorkspace.value = wsRouteComponent;
      }
    },
    { immediate: true },
  );

  /**
   * The function `openWorkspace` adds a route to the router and pushes the route to navigate to a
   * specific workspace component.
   * @param  - - `blade`: The component to be rendered in the workspace.
   * @returns the result of the `router.push()` method, which is a Promise.
   */
  async function openWorkspace<Blade extends Component>({ blade, param, options }: IBladeEvent<Blade>) {
    const createdComponent = h(blade, { param, options }) as BladeVNode;

    try {
      if (createdComponent.type?.url) {
        router.addRoute(mainRoute.name as string, {
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

  /**
   * The `openBlade` function is used to open a blade component in a workspace or navigation view.
   * @param  - - `blade`: The component that represents the blade to be opened.
   * @param [isWorkspace=false] - A boolean value indicating whether the blade is being opened as a
   * workspace or not.
   * @returns a Promise that resolves to the result of the `router.push()` method.
   */
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

    try {
      const instanceComponent = navigationView || activeWorkspace.value;

      if (instanceComponent && activeWorkspace.value) {
        const initialBlade = router.resolve({
          path: instanceComponent.props?.navigation?.fullPath ?? instanceComponent.type.url,
        })?.matched[1];

        const base =
          router.resolve({ name: initialBlade?.name }).path + (blade.url ? blade.url + (param ? "/" + param : "") : "");

        const url = (baseUrl.value === "/" ? "" : baseUrl.value) + base;

        const rawRouterUrl = mainRoute.path + base;

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

        router.addRoute(mainRoute.name as string, {
          name: isInitialBlade ? activeWorkspace.value?.type.name : url,
          path: rawRouterUrl,
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
      } else {
        throw new Error("No workspace found");
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * The function merges the permissions of a workspace blade and a child blade.
   * @param {BladeVNode} workspaceBlade - The `workspaceBlade` parameter is a BladeVNode object
   * representing the workspace blade.
   * @param {BladeVNode | BladeInstanceConstructor} childBlade - The `childBlade` parameter is either a
   * `BladeVNode` or a `BladeInstanceConstructor`.
   * @returns an array of permissions.
   */
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

  /**
   * The function removes a specified substring from a given input string.
   * @param {string} inputString - The input string from which the substring will be removed.
   * @param {string} substringToRemove - The `substringToRemove` parameter is a string that represents
   * the substring that you want to remove from the `inputString`.
   * @returns the input string with the specified substring removed.
   */
  function removeSubstring(inputString: string, substringToRemove: string) {
    const regex = new RegExp(`${substringToRemove}+$`);
    return inputString.replace(regex, "");
  }

  /**
   * The `closeBlade` function is used to close a blade and update the router location if necessary.
   * @param {number} index - The `index` parameter is a number that represents the index of the blade
   * to be closed.
   * @param [changeLocation=true] - A boolean value indicating whether the location should be changed
   * when closing the blade. The default value is `true`.
   * @returns a Promise that resolves to a boolean value if `changeLocation` is true and the router
   * successfully replaces the path, otherwise it returns undefined.
   */
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

      router.addRoute(mainRoute.name as string, {
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

  /**
   * The function `onParentCall` handles method calls from a parent component and executes the
   * corresponding method if it exists, otherwise it logs an error message.
   * @param parentExposedMethods - parentExposedMethods is an object that contains the methods exposed
   * by the parent blade. Each method is represented as a key-value pair, where the key is the method
   * name and the value is the method itself.
   * @param {IParentCallArgs} args - The `args` parameter is an object that contains the following
   * properties:
   */
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

  /**
   * The function `resolveBladeByName` resolves a Blade component by its name and returns its
   * constructor.
   * @param {string} name - The `name` parameter is a string that represents the name of a Blade
   * component.
   * @returns a BladeInstanceConstructor, which is the constructor function for a Blade instance.
   */
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

  /**
   * The function `routeResolver` checks if a necessary route exists and generates a route if it
   * doesn't.
   * @param {RouteLocationNormalized} to - The `to` parameter is of type `RouteLocationNormalized`,
   * which represents the target route that needs to be resolved. It contains information about the
   * target route, such as the path, query parameters, and hash.
   * @returns the result of the `generateRoute` function if the `hasNecessaryRoute` function returns
   * false.
   */
  function routeResolver(to: RouteLocationNormalized) {
    if (!hasNecessaryRoute(to)) {
      return generateRoute(to, navigationInstance.internalRoutes);
    }
  }

  /**
   * The function checks if a given route exists in a list of routes.
   * @param {RouteLocationNormalized} to - The "to" parameter is of type RouteLocationNormalized, which
   * represents the destination route location.
   * @returns a route object from the `routes` array that has a matching `path` property with the
   * `to.path` value.
   */
  function hasNecessaryRoute(to: RouteLocationNormalized) {
    return router.getRoutes().find((route) => route.path === to.path);
  }

  /**
   * The function generates a route based on the provided destination and routes, and then pushes the
   * generated route to the router.
   * @param {RouteLocationNormalized} to - The `to` parameter is of type `RouteLocationNormalized` and
   * represents the destination route that we want to generate. It contains information about the path,
   * query parameters, and other route-related data.
   * @param {RouteRecordNormalized[]} routes - The `routes` parameter is an array of
   * `RouteRecordNormalized` objects. Each object represents a route in the application and contains
   * information such as the route path, components to render, and any meta information associated with
   * the route.
   * @returns the result of the `router.push()` method.
   */
  async function generateRoute(to: RouteLocationNormalized, routes: BladeRoutesRecord[]) {
    const parsedRoutes: TParsedRoute[] = parseRoutes(to.path, routes);

    const workspace = parsedRoutes[0];
    const workspaceComponent = routes.find((route) => route.route === workspace.blade)?.component;

    if (workspaceComponent) {
      const children: Record<string, BladeVNode> = {};

      parsedRoutes
        .filter((r) => r !== workspace)
        .forEach((parsedRoute, index) => {
          const registeredRouteComponent = routes.find((route) => route.route === parsedRoute.blade)?.component;

          if (registeredRouteComponent && parsedRoute.name) {
            children[parsedRoute.name] = _.merge({}, registeredRouteComponent, {
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
            router.addRoute(mainRoute.name as string, {
              name: parsedRoute.name,
              path: parsedRoute.name,
              components: {
                default: workspaceComponent, // { param: Object.values(children)[0].props?.param }),
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
      router.addRoute(mainRoute.name as string, {
        name: to.path,
        path: to.path,
        components: {
          default: workspaceComponent,
          ...children,
        },
        meta: {
          permissions: mergedPermissions.length ? mergedPermissions : undefined,
        },
      });

      return router.push(to.path);
    } else return router.push({ name: mainRoute.name as string });
  }

  /**
   * The function `parseRoutes` takes a route string and an array of common routes, and returns an
   * array of route objects with blade, param, and name properties.
   * @param {string} route - The `route` parameter is a string representing a route path. It is the
   * route that needs to be parsed into its individual parts.
   * @param {RouteRecordNormalized[]} commonRoutes - commonRoutes is an array of RouteRecordNormalized
   * objects. Each object represents a common route in the application and has properties like "path"
   * which represents the route path.
   * @returns The function `parseRoutes` returns an array of objects. Each object in the array
   * represents a part of the route and contains the following properties: blade, param, and name.
   */
  function parseRoutes(route: string, commonRoutes: BladeRoutesRecord[]) {
    const parts: string[] = route.split("/").filter((part) => part !== "");
    const result = [];
    let currentBlade = "";
    let currentName = "";

    for (let i = 0; i < parts.length; i++) {
      currentBlade = "/" + parts[i];

      /**
       * If current blade is not registered in routes, then it's a param
       */
      if (!navigationInstance.internalRoutes.some((x) => currentBlade === x?.route)) {
        baseUrl.value = currentBlade;
        continue;
      }

      let currentParam = null;

      if (i + 1 < parts.length) {
        const nextPart = "/" + parts.slice(i + 1, i + 2).join("/");
        currentName += currentBlade;

        if (!commonRoutes.some((route) => nextPart === route.route)) {
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

  /**
   * The function getCurrentBlade returns the current BladeVNode instance's vnode.
   * @returns the `vnode` property of the `instance` object, which is of type `BladeVNode`.
   */
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
