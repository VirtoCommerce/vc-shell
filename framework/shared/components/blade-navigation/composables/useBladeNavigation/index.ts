import { computed, getCurrentInstance, inject, warn, Component, ComputedRef, Ref, shallowRef, unref } from "vue";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSharedComposable } from "@vueuse/core";
import * as _ from "lodash-es";
import { RouteLocationNormalized, useRoute, NavigationFailure, RouteLocationRaw } from "vue-router";
import { bladeNavigationInstance as globalBladeNavigationPluginInstanceFallback } from "../../plugin";
import { useBladeRegistry, IBladeRegistry } from "../../../../../core/composables/useBladeRegistry";
import {
  BladeComponentInternalInstance,
  BladeNavigationPlugin,
  BladeVNode,
  IBladeEvent,
  IParentCallArgs,
  BladeInstanceConstructor,
  CoreBladeAdditionalSettings,
} from "../../types";
import { navigationViewLocation } from "../../../../../injection-keys";
import { useAppInsights, usePermissions } from "../../../../../core/composables";
import { notification as notificationService } from "./../../../notifications";
import "core-js/actual/array/find-last";
import "core-js/actual/array/find-last-index";
import { i18n } from "../../../../../core/plugins/i18n";
import { createLogger } from "../../../../../core/utilities";

const logger = createLogger("use-blade-navigation");

// Internal modules
import { _createBladeStateManagement } from "./internal/bladeState";
import { _createRouterUtils } from "./internal/routerUtils";
import { _createBladeActions } from "./internal/bladeActions";
import { _createBladeRouteResolver } from "./internal/bladeRouteResolver";
import { _createBladeWatchers } from "./internal/bladeWatchers";

interface IUseBladeNavigation {
  readonly blades: ComputedRef<BladeVNode[]>;
  readonly activeWorkspace: ComputedRef<BladeVNode | undefined>;
  readonly currentBladeNavigationData: ComputedRef<BladeVNode["props"]["navigation"] | undefined>;
  openBlade: <Blade extends Component>(
    args: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ) => Promise<void | NavigationFailure>;
  closeBlade: (index: number) => Promise<boolean>;
  goToRoot: () => RouteLocationRaw;
  onParentCall: (args: IParentCallArgs, currentBladeIndex?: number) => void;
  onBeforeClose: (cb: () => Promise<boolean | undefined>) => void;
  resolveBladeByName: (name: string) => BladeInstanceConstructor | undefined;
  routeResolver: (to: RouteLocationNormalized) => Promise<RouteLocationRaw | undefined> | RouteLocationRaw | undefined;
  setNavigationQuery: (query: Record<string, string | number>) => void;
  getNavigationQuery: () => Record<string, string | number> | undefined;

  // TODO: add to docs
  setBladeError: (bladeIdx: number, error: unknown) => void;
  clearBladeError: (bladeIdx: number) => void;
}

// --- Singleton for useBladeNavigation ---
const useBladeNavigationSingleton = createSharedComposable(() => {
  const route = useRoute();
  const injectedPlugin = inject<BladeNavigationPlugin>("bladeNavigationPlugin");
  const router = injectedPlugin?.router || globalBladeNavigationPluginInstanceFallback.router;

  if (!router) {
    throw new Error("[@vc-shell/framework#useBladeNavigation] Vue Router instance is not available.");
  }

  const bladeRegistry: IBladeRegistry = useBladeRegistry();

  // Base modules initialization
  const bladeState = _createBladeStateManagement(router);
  const routerUtils = _createRouterUtils(router, route);

  const { setupPageTracking } = useAppInsights();
  const { hasAccess } = usePermissions();
  const currentInstance = getCurrentInstance() as BladeComponentInternalInstance | null;

  function ensureBladeComponent<Blade extends Component>(
    bladeInput: BladeInstanceConstructor<Blade> | { name: string } | null | undefined,
  ): BladeInstanceConstructor<Blade> {
    if (!bladeInput) {
      throw new Error("ensureBladeComponent: bladeInput cannot be null or undefined.");
    }
    if (typeof bladeInput === "object" && "name" in bladeInput) {
      if (!bladeInput.name) {
        throw new Error("ensureBladeComponent: bladeInput.name cannot be empty when resolving by name.");
      }
      const resolvedComponent = bladeRegistry.getBladeComponent(bladeInput.name);
      if (!resolvedComponent) {
        throw new Error(
          `ensureBladeComponent: Failed to resolve blade by name '${bladeInput.name}' via BladeRegistry. Blade component not registered or plugin issue.`,
        );
      }
      return resolvedComponent as BladeInstanceConstructor<Blade>;
    }
    return bladeInput as BladeInstanceConstructor<Blade>;
  }

  const bladeActions = _createBladeActions(
    router,
    route,
    bladeState,
    routerUtils,
    ensureBladeComponent,
    hasAccess,
    notificationService,
    i18n,
    setupPageTracking,
  );

  const routeResolverInstance = _createBladeRouteResolver(
    router,
    route,
    bladeRegistry,
    routerUtils,
    bladeActions,
    bladeState,
    ensureBladeComponent,
    hasAccess,
  );

  _createBladeWatchers(router, route, bladeState, routerUtils, setupPageTracking);

  return {
    blades: bladeState.blades,
    activeWorkspace: bladeState.activeWorkspace,
    _internal_openBlade: bladeActions.openBlade,
    closeBlade: bladeState.removeBladesStartingFrom,
    goToRoot: routerUtils.goToRoot,
    routeResolver: routeResolverInstance,
    setBladeError: bladeState.setBladeError,
    clearBladeError: bladeState.clearBladeError,
    onBeforeClose: (cb: () => Promise<boolean | undefined>) => {
      const targetBlade = bladeState.activeWorkspace.value;
      if (targetBlade && targetBlade.props.navigation) {
        targetBlade.props.navigation.onBeforeClose = cb;
      } else {
        warn("Singleton onBeforeClose: Could not identify a target blade (e.g., active workspace).");
      }
    },
    setNavigationQuery: (query: Record<string, string | number>) => {
      if (!currentInstance) {
        warn("Singleton's setNavigationQuery called in a context without a component instance.");
        return;
      }
      const typeName = (currentInstance.vnode.type as CoreBladeAdditionalSettings).name?.toLowerCase();
      if (
        typeName &&
        bladeState.activeWorkspace.value &&
        bladeState.activeWorkspace.value.props.navigation?.idx === 0
      ) {
        const namedQuery = _.mapKeys(_.mapValues(query, String), (v, k) => `${typeName}_${k}`);
        const cleanQuery = _.omitBy(namedQuery, _.isNil);
        router.options.history.replace(
          decodeURIComponent(
            `${window.location.hash.substring(1).split("?")[0]}?${new URLSearchParams(cleanQuery).toString()}`,
          ),
        );
      }
    },
    getNavigationQuery: () => {
      if (!currentInstance) {
        warn("Singleton's getNavigationQuery called in a context without a component instance.");
        return undefined;
      }
      const typeName = (currentInstance.vnode.type as CoreBladeAdditionalSettings).name?.toLowerCase();
      if (
        typeName &&
        bladeState.activeWorkspace.value &&
        bladeState.activeWorkspace.value.props.navigation?.idx === 0
      ) {
        const queryKeys = Object.keys(route.query);
        const bladeQueryKeys = queryKeys.filter((key) => key.startsWith(typeName));
        const namedQuery = _.mapKeys(_.pick(route.query, bladeQueryKeys), (v, k) => k.replace(`${typeName}_`, ""));

        const result: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(namedQuery)) {
          const numValue = Number(value);
          result[key] = isNaN(numValue) ? (value as string) : numValue;
        }
        return result;
      }
      return undefined;
    },
    currentBladeNavigationData: computed(() => {
      return bladeState.activeWorkspace.value?.props?.navigation ?? undefined;
    }),
  };
});

export function useBladeNavigation(): IUseBladeNavigation {
  const singleton = useBladeNavigationSingleton() as typeof useBladeNavigationSingleton extends () => infer R
    ? R
    : never;
  const currentCallingInstance = getCurrentInstance() as BladeComponentInternalInstance | null;
  const bladeRegistry = useBladeRegistry();

  // Find the closest parent blade in the component hierarchy
  const findParentBlade = (instance: BladeComponentInternalInstance | null): BladeVNode | undefined => {
    if (!instance) return undefined;

    // Check if current instance provides navigationViewLocation
    const viewNode = (instance as any).provides[navigationViewLocation as any] as BladeVNode | undefined;
    if (viewNode) {
      return viewNode;
    }

    // Check if current instance is a blade itself
    if (
      instance.vnode &&
      singleton.activeWorkspace.value &&
      _.isEqual(instance.vnode.type, singleton.activeWorkspace.value.type)
    ) {
      return singleton.activeWorkspace.value;
    }

    // Check if current instance is in the blades list
    const matchingBlade = singleton.blades.value.find(
      (blade) => blade && instance.vnode && _.isEqual(blade.type, instance.vnode.type),
    );
    if (matchingBlade) {
      return matchingBlade;
    }

    // Recursively check parent instance
    return findParentBlade(instance.parent as BladeComponentInternalInstance | null);
  };

  const currentBladeNavigationData = computed(() => {
    const parentBlade = findParentBlade(currentCallingInstance);
    return parentBlade?.props?.navigation;
  });

  const onBeforeClose = (cb: () => Promise<boolean | undefined>) => {
    if (!currentCallingInstance) {
      warn("onBeforeClose called outside of a component setup context.");
      return;
    }
    const parentBlade = findParentBlade(currentCallingInstance);
    if (parentBlade && parentBlade.props.navigation) {
      parentBlade.props.navigation.onBeforeClose = cb;
    } else {
      warn("Context-specific onBeforeClose: Could not identify the target blade in the global list.");
    }
  };

  const onParentCall = async (args: IParentCallArgs, currentBladeIndex?: number) => {
    let bladeIndex = currentBladeIndex;

    // If currentBladeIndex is not provided, try to find it from the component hierarchy
    if (bladeIndex === undefined) {
      if (!currentCallingInstance) {
        warn("onParentCall called outside of a component setup context and without currentBladeIndex.");
        return;
      }

      // Find current blade in the blades list
      const currentBlade = findParentBlade(currentCallingInstance);
      if (!currentBlade) {
        logger.error("onParentCall: Could not identify current blade in the global list.");
        return;
      }

      bladeIndex = currentBlade.props.navigation?.idx ?? -1;
    }

    if (bladeIndex <= 0) {
      logger.error("onParentCall: Current blade is workspace (index 0) or invalid, no parent blade available.");
      return;
    }

    // Find parent blade (blade with index bladeIndex - 1)
    const parentBlade = singleton.blades.value.find((blade) => blade && blade.props.navigation?.idx === bladeIndex - 1);

    if (!parentBlade) {
      logger.error(`onParentCall: Parent blade with index ${bladeIndex - 1} not found.`);
      return;
    }

    const parentExposedMethods = parentBlade.props.navigation?.instance;

    if (!parentExposedMethods) {
      logger.error("onParentCall: Parent blade has no exposed methods (navigation.instance is undefined).");
      return;
    }

    // Try to get the method from exposed methods with Vue refs handling
    const targetMethod = parentExposedMethods[args.method];

    if (args.method && typeof targetMethod === "function") {
      const result = await targetMethod(args.args);
      if (typeof args.callback === "function") args.callback(result);
    } else {
      logger.error(
        `onParentCall: Method '${args.method}' is not available or not a function in parent blade '${parentBlade.type?.name}'.`,
      );
      logger.error("Available properties:", Object.keys(parentExposedMethods));
      logger.error(`Requested method '${args.method}' type:`, typeof targetMethod);
      logger.error(`Requested method '${args.method}' value:`, targetMethod);
      logger.error(
        `Please ensure that the method '${args.method}' is defined and exposed using defineExpose() in the parent blade component.`,
      );
    }
  };

  return {
    blades: singleton.blades,
    activeWorkspace: singleton.activeWorkspace,
    openBlade: <Blade extends Component>(
      args: IBladeEvent<Blade>,
      isWorkspace?: boolean,
    ): Promise<void | NavigationFailure> => {
      // Find the closest parent blade in the component hierarchy
      let sourceBladeInstanceForOpening: BladeVNode | undefined = findParentBlade(currentCallingInstance);

      if (!sourceBladeInstanceForOpening) {
        sourceBladeInstanceForOpening = singleton.activeWorkspace.value;
      }

      if (typeof singleton._internal_openBlade === "function") {
        return singleton._internal_openBlade(args, isWorkspace, sourceBladeInstanceForOpening);
      } else {
        logger.error("Internal _internal_openBlade method not found on singleton.");
        return Promise.reject(new Error("Blade navigation internal error."));
      }
    },
    closeBlade: singleton.closeBlade,
    goToRoot: singleton.goToRoot,
    onParentCall,
    resolveBladeByName: (name: string) => bladeRegistry.getBladeComponent(name),
    routeResolver: singleton.routeResolver,
    currentBladeNavigationData,
    onBeforeClose,
    setNavigationQuery: singleton.setNavigationQuery,
    getNavigationQuery: singleton.getNavigationQuery,
    setBladeError: singleton.setBladeError,
    clearBladeError: singleton.clearBladeError,
  };
}
