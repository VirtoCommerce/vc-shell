import { computed, getCurrentInstance, inject, warn, Component, ComputedRef, Ref, shallowRef } from "vue";
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
  onParentCall: (parentExposedMethods: Record<string, any>, args: IParentCallArgs) => void;
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
    onParentCall: async (parentExposedMethods: Record<string, any>, args: IParentCallArgs) => {
      if (args.method && parentExposedMethods && typeof parentExposedMethods[args.method] === "function") {
        const method = parentExposedMethods[args.method];
        const result = await method(args.args);
        if (typeof args.callback === "function") args.callback(result);
      } else {
        console.error(
          `No such method: ${args.method}. Please, add method with name ${args.method} and use defineExpose to expose it in parent blade`,
        );
      }
    },
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
  console.log("useBladeNavigation singleton", singleton);
  const currentCallingInstance = getCurrentInstance() as BladeComponentInternalInstance | null;
  console.log("useBladeNavigation currentCallingInstance", currentCallingInstance);
  const bladeRegistry = useBladeRegistry();
  console.log("useBladeNavigation bladeRegistry", bladeRegistry);

  const currentBladeNavigationData = computed(() => {
    if (!currentCallingInstance) return undefined;
    const viewNode = (currentCallingInstance as any).provides[navigationViewLocation as any] as BladeVNode | undefined;
    if (
      !viewNode &&
      singleton.activeWorkspace.value &&
      currentCallingInstance.vnode &&
      _.isEqual(currentCallingInstance.vnode.type, singleton.activeWorkspace.value.type)
    ) {
      return singleton.activeWorkspace.value.props?.navigation;
    }
    return viewNode?.props?.navigation;
  });

  const onBeforeClose = (cb: () => Promise<boolean | undefined>) => {
    if (!currentCallingInstance) {
      warn("onBeforeClose called outside of a component setup context.");
      return;
    }
    const viewNode = (currentCallingInstance as any).provides[navigationViewLocation as any] as BladeVNode | undefined;
    const targetBlade = singleton.blades.value.find(
      (b) =>
        (b && viewNode && _.isEqual(b, viewNode)) ||
        (b &&
          b.props?.navigation?.idx === 0 &&
          currentCallingInstance.vnode &&
          _.isEqual(b.type, currentCallingInstance.vnode.type)),
    );
    if (targetBlade && targetBlade.props.navigation) {
      targetBlade.props.navigation.onBeforeClose = cb;
    } else {
      warn("Context-specific onBeforeClose: Could not identify the target blade in the global list.");
    }
  };

  return {
    blades: singleton.blades,
    activeWorkspace: singleton.activeWorkspace,
    openBlade: <Blade extends Component>(
      args: IBladeEvent<Blade>,
      isWorkspace?: boolean,
    ): Promise<void | NavigationFailure> => {
      let sourceBladeInstanceForOpening: BladeVNode | undefined = undefined;
      if (currentCallingInstance) {
        sourceBladeInstanceForOpening = (currentCallingInstance as any).provides[navigationViewLocation as any] as
          | BladeVNode
          | undefined;
      }

      if (!sourceBladeInstanceForOpening) {
        sourceBladeInstanceForOpening = singleton.activeWorkspace.value;
      }

      if (typeof singleton._internal_openBlade === "function") {
        return singleton._internal_openBlade(args, isWorkspace, sourceBladeInstanceForOpening);
      } else {
        console.error("Internal _internal_openBlade method not found on singleton.");
        return Promise.reject(new Error("Blade navigation internal error."));
      }
    },
    closeBlade: singleton.closeBlade,
    goToRoot: singleton.goToRoot,
    onParentCall: singleton.onParentCall,
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
