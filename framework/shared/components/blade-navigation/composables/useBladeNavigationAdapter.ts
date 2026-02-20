/**
 * useBladeNavigation adapter — maps the legacy IUseBladeNavigation API
 * onto the new BladeStack + BladeMessaging system.
 *
 * Drop-in replacement for the old useBladeNavigation.
 * Consumer code keeps working; deprecation warnings guide migration.
 */
import {
  computed,
  getCurrentInstance,
  inject,
  warn,
  Component,
  ComputedRef,
  Ref,
  ref,
} from "vue";
import {
  RouteLocationNormalized,
  RouteLocationRaw,
  NavigationFailure,
} from "vue-router";
import {
  bladeNavigationInstance as globalBladeNavigationPluginInstanceFallback,
  bladeStackInstance,
  bladeMessagingInstance,
  bladeRegistryInstance,
} from "@shared/components/blade-navigation/plugin-v2";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";
import {
  BladeVNode,
  IBladeEvent,
  IParentCallArgs,
  BladeInstanceConstructor,
  BladeDescriptor,
  BladeDescriptorKey,
} from "@shared/components/blade-navigation/types";
import { buildUrlFromStack, createUrlSync, getTenantPrefix } from "@shared/components/blade-navigation/utils/urlSync";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-blade-navigation-adapter");

// ── Deprecation helpers ────────────────────────────────────────────────────────

const _deprecationWarned = new Set<string>();

function warnDeprecated(method: string, replacement?: string): void {
  if (_deprecationWarned.has(method)) return;
  _deprecationWarned.add(method);
  const msg = `[useBladeNavigation] "${method}" is deprecated.`;
  console.warn(replacement ? `${msg} Use ${replacement} instead.` : msg);
}

// ── IUseBladeNavigation interface (matches old API) ────────────────────────────

export interface IUseBladeNavigation {
  readonly blades: ComputedRef<BladeVNode[]>;
  readonly activeWorkspace: ComputedRef<BladeVNode | undefined>;
  readonly currentBladeNavigationData: ComputedRef<
    BladeVNode["props"]["navigation"] | undefined
  >;
  openBlade: <Blade extends Component>(
    args: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ) => Promise<void | NavigationFailure>;
  closeBlade: (index: number) => Promise<boolean>;
  goToRoot: () => RouteLocationRaw;
  onParentCall: (args: IParentCallArgs, currentBladeIndex?: number) => void;
  onBeforeClose: (cb: () => Promise<boolean | undefined>) => void;
  resolveBladeByName: (
    name: string,
  ) => BladeInstanceConstructor | undefined;
  routeResolver: (
    to: RouteLocationNormalized,
  ) =>
    | Promise<RouteLocationRaw | undefined>
    | RouteLocationRaw
    | undefined;
  setNavigationQuery: (query: Record<string, string | number>) => void;
  getNavigationQuery: () => Record<string, string | number> | undefined;
  setBladeError: (bladeIdx: number, error: unknown) => void;
  clearBladeError: (bladeIdx: number) => void;
}

// ── BladeVNode shim ────────────────────────────────────────────────────────────

/**
 * Creates a minimal BladeVNode-compatible object from a BladeDescriptor.
 * Only satisfies property reads — NOT a real VNode for rendering.
 */
function descriptorToShim(
  descriptor: BladeDescriptor,
  index: number,
  activeId?: string,
): BladeVNode {
  return {
    props: {
      navigation: {
        idx: index,
        instance: descriptor.title != null ? { title: descriptor.title } : undefined as any,
        isVisible: descriptor.visible,
        error: ref(
          descriptor.error ? new Error(String(descriptor.error)) : null,
        ) as Ref<Error | null>,
      },
      param: descriptor.param,
      options: descriptor.options,
      expanded: descriptor.id === activeId,
      closable: index > 0,
    },
    type: { name: descriptor.name },
  } as unknown as BladeVNode;
}

// ── Shared state (module-level, no inject needed) ───────────────────────────────
// Lazily created computeds cached for all calls to useBladeNavigation().
// Call _resetAdapterState() in test teardown to prevent cross-test leaks.

let _blades: ComputedRef<BladeVNode[]> | undefined;
let _activeWorkspace: ComputedRef<BladeVNode | undefined> | undefined;

/**
 * Reset adapter's cached computeds. For use in test teardown only.
 * @internal
 */
export function _resetAdapterState(): void {
  _blades = undefined;
  _activeWorkspace = undefined;
  _deprecationWarned.clear();
}

function getSharedState() {
  const bladeStack = bladeStackInstance;
  const messaging = bladeMessagingInstance;
  const bladeRegistry = bladeRegistryInstance;

  if (!bladeStack || !messaging) {
    throw new Error(
      "[useBladeNavigation adapter] BladeStack or BladeMessaging not available. " +
        "Ensure plugin-v2 is installed before calling useBladeNavigation().",
    );
  }

  const router = globalBladeNavigationPluginInstanceFallback?.router;

  if (!router) {
    throw new Error(
      "[@vc-shell/framework#useBladeNavigation] Vue Router instance is not available.",
    );
  }

  // Lazily create computeds once
  if (!_blades) {
    _blades = computed<BladeVNode[]>(() => {
      const activeId = bladeStack.activeBlade.value?.id;
      return bladeStack.blades.value.map((d, i) =>
        descriptorToShim(d, i, activeId),
      );
    });
  }

  if (!_activeWorkspace) {
    _activeWorkspace = computed<BladeVNode | undefined>(() => {
      const ws = bladeStack.workspace.value;
      if (!ws) return undefined;
      return descriptorToShim(ws, 0, bladeStack.activeBlade.value?.id);
    });
  }

  return {
    bladeStack,
    messaging,
    bladeRegistry: bladeRegistry!,
    router,
    blades: _blades,
    activeWorkspace: _activeWorkspace,
  };
}

// ── Utility: extract blade name from IBladeEvent.blade ─────────────────────────

function extractBladeName<Blade extends Component>(
  blade: IBladeEvent<Blade>["blade"],
): string {
  if (!blade) {
    throw new Error("Blade cannot be null or undefined.");
  }

  // { name: "SomeBlade" } shorthand
  if (
    typeof blade === "object" &&
    "name" in blade &&
    typeof (blade as any).name === "string"
  ) {
    return (blade as any).name;
  }

  // Component constructor — extract .name or .__name
  const comp = blade as any;
  return comp.name || comp.__name || "UnknownBlade";
}

// ── Per-caller function ────────────────────────────────────────────────────────

export function useBladeNavigation(): IUseBladeNavigation {
  const {
    bladeStack,
    messaging,
    bladeRegistry,
    router,
    blades,
    activeWorkspace,
  } = getSharedState();

  // Try to get current blade descriptor from the new render layer (VcBladeSlot)
  // Only call inject() when inside a component setup — avoids Vue warning in route guards
  const currentDescriptor = getCurrentInstance()
    ? inject(BladeDescriptorKey, undefined)
    : undefined;

  // ── URL sync helpers (centralized in urlSync.ts) ────────────────────────────

  const { syncUrlPush, syncUrlReplace } = createUrlSync(router, bladeStack);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function getCurrentBladeId(): string | undefined {
    if (currentDescriptor) return currentDescriptor.value.id;
    // Fallback: active blade (for app-level code outside any blade)
    return bladeStack.activeBlade.value?.id;
  }

  function getBladeIdByIndex(index: number): string | undefined {
    const allBlades = bladeStack.blades.value;
    if (index >= 0 && index < allBlades.length) {
      return allBlades[index].id;
    }
    return undefined;
  }

  // ── openBlade ──────────────────────────────────────────────────────────────

  async function openBlade<Blade extends Component>(
    args: IBladeEvent<Blade>,
    isWorkspace?: boolean,
  ): Promise<void | NavigationFailure> {
    const name = extractBladeName(args.blade);

    const event = {
      name,
      param: args.param,
      options: args.options,
      onOpen: args.onOpen,
      onClose: args.onClose,
      replaceCurrentBlade: args.replaceCurrentBlade,
    };

    if (isWorkspace) {
      await bladeStack.openWorkspace(event);
    } else if (args.replaceCurrentBlade) {
      // replaceCurrentBlade inherits the replaced blade's parent automatically
      await bladeStack.replaceCurrentBlade(event);
    } else {
      const parentId = getCurrentBladeId();
      await bladeStack.openBlade({ ...event, parentId });
    }

    // Sync URL only if the opened blade has a URL segment.
    // Blades without URLs (e.g. third-level detail panels) should not
    // change the address bar — the previous blade's URL stays.
    const openedBlade = bladeStack.activeBlade.value;
    if (openedBlade?.url) {
      syncUrlPush();
    }
  }

  // ── closeBlade ─────────────────────────────────────────────────────────────

  async function closeBlade(index: number): Promise<boolean> {
    warnDeprecated(
      "closeBlade(index)",
      "useBladeContext().closeSelf()",
    );
    const bladeId = getBladeIdByIndex(index);
    if (!bladeId) {
      logger.error(`closeBlade: No blade found at index ${index}.`);
      return false;
    }
    const prevented = await bladeStack.closeBlade(bladeId);
    if (!prevented) {
      // Blade was closed — sync URL (replace, no new history entry)
      syncUrlReplace();
    }
    return prevented;
  }

  // ── goToRoot ───────────────────────────────────────────────────────────────

  function goToRoot(): RouteLocationRaw {
    warnDeprecated("goToRoot()");

    // Navigate by route name, preserving current params (tenant prefix).
    // Using { path: "/" } would drop the tenant prefix from the URL.
    const routes = router.getRoutes();
    const mainRoute = routes.find((r) => r.meta?.root);
    const mainRouteAlias =
      routes.find((r) => r.aliasOf?.path === mainRoute?.path) || mainRoute;

    if (mainRouteAlias?.name) {
      return {
        name: mainRouteAlias.name,
        params: router.currentRoute.value.params,
      };
    }

    // Fallback: construct path with tenant prefix
    const tenantPrefix = getTenantPrefix(router);
    return { path: tenantPrefix ? `/${tenantPrefix}` : "/" };
  }

  // ── onParentCall ───────────────────────────────────────────────────────────

  async function onParentCall(
    args: IParentCallArgs,
    currentBladeIndex?: number,
  ): Promise<void> {
    warnDeprecated(
      "onParentCall(args, index)",
      "useBladeContext().callParent(method, args)",
    );

    let callerId: string | undefined;

    if (currentBladeIndex !== undefined) {
      callerId = getBladeIdByIndex(currentBladeIndex);
    } else {
      callerId = getCurrentBladeId();
    }

    if (!callerId) {
      logger.error(
        "onParentCall: Could not determine caller blade.",
      );
      return;
    }

    try {
      const result = await messaging.callParent(
        callerId,
        args.method as string,
        args.args,
      );
      if (typeof args.callback === "function") {
        args.callback(result);
      }
    } catch (error) {
      logger.error(
        `onParentCall: Failed to call parent method "${args.method}":`,
        error,
      );
    }
  }

  // ── onBeforeClose ──────────────────────────────────────────────────────────

  function onBeforeClose(
    cb: () => Promise<boolean | undefined>,
  ): void {
    warnDeprecated(
      "onBeforeClose(cb)",
      "useBladeContext().onBeforeClose(guard)",
    );

    const bladeId = getCurrentBladeId();
    if (!bladeId) {
      warn("onBeforeClose: Could not determine current blade.");
      return;
    }

    // ⚠️ Guard boolean inversion between legacy and new API:
    //   Legacy onBeforeClose: return `false` → PREVENT close; `undefined`/`true` → allow
    //   New registerBeforeClose: return `true` → PREVENT close; `false` → allow
    // The adapter inverts the result to bridge the two APIs.
    bladeStack.registerBeforeClose(bladeId, async () => {
      const result = await cb();
      return result === false;
    });
  }

  // ── resolveBladeByName ─────────────────────────────────────────────────────

  function resolveBladeByName(
    name: string,
  ): BladeInstanceConstructor | undefined {
    return bladeRegistry.getBladeComponent(
      name,
    ) as BladeInstanceConstructor | undefined;
  }

  // ── routeResolver (noop — handled by plugin-v2) ────────────────────────────

  function routeResolver(
    _to: RouteLocationNormalized,
  ): undefined {
    warnDeprecated(
      "routeResolver",
      "plugin-v2 handles URL resolution automatically",
    );
    return undefined;
  }

  // ── setNavigationQuery / getNavigationQuery ────────────────────────────────

  function setNavigationQuery(
    query: Record<string, string | number>,
  ): void {
    warnDeprecated("setNavigationQuery");

    const ws = bladeStack.workspace.value;
    if (!ws) return;

    const prefix = ws.name.toLowerCase();
    const cleanQuery: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v != null) cleanQuery[`${prefix}_${k}`] = String(v);
    }

    router.options.history.replace(
      decodeURIComponent(
        `${window.location.hash.substring(1).split("?")[0]}?${new URLSearchParams(
          cleanQuery,
        ).toString()}`,
      ),
    );
  }

  function getNavigationQuery():
    | Record<string, string | number>
    | undefined {
    warnDeprecated("getNavigationQuery");

    const ws = bladeStack.workspace.value;
    if (!ws) return undefined;

    const prefix = ws.name.toLowerCase();
    const urlParams = new URLSearchParams(
      window.location.hash.split("?")[1] || "",
    );
    const result: Record<string, string | number> = {};

    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith(`${prefix}_`)) {
        const cleanKey = key.replace(`${prefix}_`, "");
        const numValue = Number(value);
        result[cleanKey] = isNaN(numValue) ? value : numValue;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  // ── Error management ───────────────────────────────────────────────────────

  function setBladeError(bladeIdx: number, error: unknown): void {
    const bladeId = getBladeIdByIndex(bladeIdx);
    if (bladeId) {
      bladeStack.setBladeError(bladeId, error);
    }
  }

  function clearBladeError(bladeIdx: number): void {
    const bladeId = getBladeIdByIndex(bladeIdx);
    if (bladeId) {
      bladeStack.clearBladeError(bladeId);
    }
  }

  // ── currentBladeNavigationData ─────────────────────────────────────────────

  const currentBladeNavigationData = computed(() => {
    if (!currentDescriptor) return undefined;
    const d = currentDescriptor.value;
    const allBlades = bladeStack.blades.value;
    const idx = allBlades.findIndex((b) => b.id === d.id);
    return {
      idx,
      instance: d.title != null ? { title: d.title } : undefined as any,
      isVisible: d.visible,
      error: ref(
        d.error ? new Error(String(d.error)) : null,
      ) as Ref<Error | null>,
    } as BladeVNode["props"]["navigation"];
  });

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    blades,
    activeWorkspace,
    openBlade,
    closeBlade,
    goToRoot,
    onParentCall,
    onBeforeClose,
    resolveBladeByName,
    routeResolver,
    setNavigationQuery,
    getNavigationQuery,
    setBladeError,
    clearBladeError,
    currentBladeNavigationData,
  };
}
