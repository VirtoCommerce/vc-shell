import { App, inject, shallowRef, computed, ComputedRef, readonly as vueReadonly } from "vue";
import type { BladeInstanceConstructor } from "@core/blade-navigation/types";
import { createLogger } from "@core/utilities";
import { getBladeConfig } from "@core/blade-navigation/bladeConfigRegistry";
import { addMenuItem } from "@core/composables/useMenuService";
import type { MenuItem } from "@core/types";

const logger = createLogger("blade-registry");

/**
 * Interface for blade registration data
 */
export interface IBladeRegistrationData {
  component: BladeInstanceConstructor;
  route?: string;
  isWorkspace?: boolean;
  routable?: boolean;
  permissions?: string | string[];
}

/**
 * Injection key for provide/inject pattern
 */
export const BladeRegistryKey = Symbol("BladeRegistry");

/**
 * Public interface for blade registry
 */
export interface UseBladeRegistryReturn {
  /** Readonly map of all registered blades */
  readonly registeredBladesMap: ComputedRef<ReadonlyMap<string, IBladeRegistrationData>>;
  /** Get blade registration data by name */
  getBlade: (name: string) => IBladeRegistrationData | undefined;
  /** Get blade component by name */
  getBladeComponent: (name: string) => BladeInstanceConstructor | undefined;
  /** Reverse lookup: find blade name + data by URL route segment (O(1)) */
  getBladeByRoute: (route: string) => { name: string; data: IBladeRegistrationData } | undefined;
}

/** @deprecated Use UseBladeRegistryReturn instead */
export type IBladeRegistry = UseBladeRegistryReturn;

/**
 * Extended interface for blade registry instance with internal registration function
 */
export interface IBladeRegistryInstance extends UseBladeRegistryReturn {
  _registerBladeFn: (name: string, registrationData: IBladeRegistrationData, allowOverwrite?: boolean) => void;
}

/**
 * Validates if a component is a valid blade component
 */
function isValidBladeComponent(component: unknown): component is BladeInstanceConstructor {
  if (!component || (typeof component !== "function" && typeof component !== "object")) {
    return false;
  }

  // Additional validation for blade-specific properties could be added here
  // For now, we accept any function or object that could be a Vue component
  return true;
}

/**
 * Creates a blade registry instance
 * This function should be called once during application initialization
 *
 * @param app - Vue application instance
 * @returns Blade registry instance with registration capabilities
 */
export function createBladeRegistry(app: App): IBladeRegistryInstance {
  const registeredBladesInternal = shallowRef<Map<string, IBladeRegistrationData>>(new Map());

  // Reverse index: normalized route → blade name (rebuilt on every registration)
  const _routeIndex = new Map<string, string>();

  function _normalizeRoute(route: string): string {
    return route.startsWith("/") ? route : `/${route}`;
  }

  /**
   * Registers a blade component in the registry
   *
   * @param name - Unique name for the blade
   * @param registrationData - Blade registration data including component and metadata
   */
  /**
   * Registers a blade component in the registry.
   *
   * @param name - Unique name for the blade
   * @param registrationData - Blade registration data including component and metadata
   * @param allowOverwrite - If true, allows overwriting an existing blade (default: false).
   *   Use for dynamic module hot-reload scenarios only.
   * @throws Error if blade name is already registered and allowOverwrite is false
   */
  function registerBlade(name: string, registrationData: IBladeRegistrationData, allowOverwrite = false): void {
    if (!name || typeof name !== "string") {
      throw new Error("BladeRegistry: Blade name must be a non-empty string");
    }

    if (!registrationData?.component) {
      throw new Error(`BladeRegistry: Registration data must include a component for blade '${name}'`);
    }

    if (!isValidBladeComponent(registrationData.component)) {
      throw new Error(`BladeRegistry: Invalid component provided for blade '${name}'`);
    }

    // ── Merge: blade config registry (defineBlade) > registrationData (legacy) ──
    const config = getBladeConfig(name);
    const component = registrationData.component;

    const route = config?.url ?? registrationData.route;
    const isWorkspace = config?.isWorkspace ?? registrationData.isWorkspace ?? false;
    const routable = config?.routable ?? (registrationData.routable !== false);
    const permissions = config?.permissions ?? registrationData.permissions;
    const menuItem = config?.menuItem ?? component.menuItem;

    // ── Duplicate check ──
    const newMap = new Map(registeredBladesInternal.value);

    if (newMap.has(name)) {
      if (!allowOverwrite) {
        throw new Error(
          `BladeRegistry: Blade '${name}' is already registered. ` +
            `Use allowOverwrite=true if intentional (e.g. dynamic module hot-reload).`,
        );
      }
      logger.warn(`Blade '${name}' is already registered. Overwriting (allowOverwrite=true).`);
    }

    // Register component globally
    const existingGlobalComponent = app.component(name);
    if (!existingGlobalComponent || existingGlobalComponent !== component) {
      if (existingGlobalComponent && existingGlobalComponent !== component) {
        logger.warn(
          `Global component '${name}' already exists and is different. Overwriting with new blade component.`,
        );
      }
      app.component(name, component);
    }

    // Store merged registration data
    const mergedData: IBladeRegistrationData = {
      component,
      route,
      isWorkspace,
      routable,
      permissions,
    };

    newMap.set(name, mergedData);
    registeredBladesInternal.value = newMap;

    // Maintain reverse route index
    if (route) {
      _routeIndex.set(_normalizeRoute(route), name);
    }

    // ── Menu registration (moved from defineAppModule) ──
    if (route && menuItem) {
      addMenuItem({
        ...menuItem,
        url: route,
        routeId: name,
        permissions: permissions || menuItem.permissions,
      } as MenuItem);
    }
  }

  /**
   * Gets blade registration data by name
   *
   * @param name - Blade name
   * @returns Registration data or undefined if not found
   */
  function getBlade(name: string): IBladeRegistrationData | undefined {
    if (!name || typeof name !== "string") {
      return undefined;
    }
    return registeredBladesInternal.value.get(name);
  }

  /**
   * Gets blade component by name
   * Checks registry first, then falls back to global components
   *
   * @param name - Blade name
   * @returns Blade component or undefined if not found
   */
  function getBladeComponent(name: string): BladeInstanceConstructor | undefined {
    if (!name || typeof name !== "string") {
      return undefined;
    }

    // First check registry
    const registration = registeredBladesInternal.value.get(name);
    if (registration) {
      return registration.component;
    }

    // Fallback to global components
    try {
      const globalComponent = app._context.components[name] as BladeInstanceConstructor | undefined;
      if (globalComponent && isValidBladeComponent(globalComponent)) {
        return globalComponent;
      }
    } catch (error) {
      logger.warn(`Error accessing global component '${name}':`, error);
    }

    return undefined;
  }

  /**
   * Reverse lookup: find a blade by its URL route segment.
   * Uses O(1) index maintained during registration.
   *
   * @param route - URL segment (e.g. "orders" or "/orders")
   * @returns Blade name and registration data, or undefined if not found
   */
  function getBladeByRoute(route: string): { name: string; data: IBladeRegistrationData } | undefined {
    if (!route) return undefined;
    const normalized = _normalizeRoute(route);
    const name = _routeIndex.get(normalized);
    if (!name) return undefined;
    const data = registeredBladesInternal.value.get(name);
    if (!data) return undefined;
    return { name, data };
  }

  // Cache the readonly map — computed is inherently read-only
  const readonlyBladesMap = computed<ReadonlyMap<string, IBladeRegistrationData>>(
    () => registeredBladesInternal.value,
  );

  const registryApi: UseBladeRegistryReturn = {
    registeredBladesMap: readonlyBladesMap,
    getBlade,
    getBladeComponent,
    getBladeByRoute,
  };

  return {
    ...registryApi,
    _registerBladeFn: registerBlade,
  };
}

/**
 * Composable function for accessing blade registry
 * Must be used after createBladeRegistry is called and provided with BladeRegistryKey
 *
 * @returns Blade registry interface
 * @throws Error if registry is not available
 */
export function useBladeRegistry(): UseBladeRegistryReturn {
  const registry = inject<UseBladeRegistryReturn>(BladeRegistryKey);
  if (!registry) {
    throw new Error(
      "useBladeRegistry must be used after createBladeRegistry is called and provided with BladeRegistryKey.",
    );
  }
  return registry;
}
