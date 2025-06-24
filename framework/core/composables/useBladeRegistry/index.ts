import { App, inject, shallowRef, computed, ComputedRef, readonly as vueReadonly } from "vue";
import { BladeInstanceConstructor } from "../../../shared/components/blade-navigation/types";

/**
 * Interface for blade registration data
 */
export interface IBladeRegistrationData {
  component: BladeInstanceConstructor;
  route?: string;
  isWorkspace?: boolean;
  // ... other metadata
}

/**
 * Injection key for provide/inject pattern
 */
export const BladeRegistryKey = Symbol("BladeRegistry");

/**
 * Public interface for blade registry
 */
export interface IBladeRegistry {
  /** Readonly map of all registered blades */
  readonly registeredBladesMap: ComputedRef<ReadonlyMap<string, IBladeRegistrationData>>;
  /** Get blade registration data by name */
  getBlade: (name: string) => IBladeRegistrationData | undefined;
  /** Get blade component by name */
  getBladeComponent: (name: string) => BladeInstanceConstructor | undefined;
}

/**
 * Extended interface for blade registry instance with internal registration function
 */
export interface IBladeRegistryInstance extends IBladeRegistry {
  _registerBladeFn: (name: string, registrationData: IBladeRegistrationData) => void;
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

  /**
   * Registers a blade component in the registry
   *
   * @param name - Unique name for the blade
   * @param registrationData - Blade registration data including component and metadata
   */
  function registerBlade(name: string, registrationData: IBladeRegistrationData): void {
    if (!name || typeof name !== "string") {
      throw new Error("BladeRegistry: Blade name must be a non-empty string");
    }

    if (!registrationData?.component) {
      throw new Error(`BladeRegistry: Registration data must include a component for blade '${name}'`);
    }

    if (!isValidBladeComponent(registrationData.component)) {
      throw new Error(`BladeRegistry: Invalid component provided for blade '${name}'`);
    }

    // Create new map to trigger reactivity
    const newMap = new Map(registeredBladesInternal.value);

    if (newMap.has(name)) {
      console.warn(`BladeRegistry: Blade '${name}' is already registered. It will be overwritten.`);
    }

    // Register component globally if not already registered or different
    const existingGlobalComponent = app.component(name);
    if (!existingGlobalComponent || existingGlobalComponent !== registrationData.component) {
      if (existingGlobalComponent && existingGlobalComponent !== registrationData.component) {
        console.warn(
          `BladeRegistry: Global component '${name}' already exists and is different. Overwriting with new blade component.`,
        );
      }
      app.component(name, registrationData.component);
    }

    newMap.set(name, registrationData);
    registeredBladesInternal.value = newMap;
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
      console.warn(`BladeRegistry: Error accessing global component '${name}':`, error);
    }

    return undefined;
  }

  // Cache the readonly map to avoid recreating it on every access
  const readonlyBladesMap = computed(() => vueReadonly(registeredBladesInternal.value));

  const registryApi: IBladeRegistry = {
    registeredBladesMap: readonlyBladesMap,
    getBlade,
    getBladeComponent,
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
export function useBladeRegistry(): IBladeRegistry {
  const registry = inject<IBladeRegistry>(BladeRegistryKey);
  if (!registry) {
    throw new Error(
      "useBladeRegistry must be used after createBladeRegistry is called and provided with BladeRegistryKey.",
    );
  }
  return registry;
}
