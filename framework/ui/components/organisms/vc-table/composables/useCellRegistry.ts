import { shallowReactive, type Component, type DefineComponent } from "vue";

/**
 * Supported cell types for VcDataTable columns.
 * Maps to cell formatter components.
 */
export type CellType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "date-ago"
  | "time"
  | "datetime"
  | "image"
  | "link"
  | "html"
  | "status"
  | "status-icon";

/**
 * Configuration for cell type-specific props.
 * Different cell types may require additional props beyond the common ones.
 */
export interface CellTypeConfig {
  /** Whether this cell type supports inline editing */
  editable?: boolean;
  /** Additional props to pass to the cell component */
  additionalProps?: string[];
}

/**
 * Registration entry for a cell component in the registry.
 */
export interface CellRegistration {
  /** The cell type identifier */
  type: CellType | string;
  /** The Vue component to render for this cell type */
  component: Component | DefineComponent<any, any, any>;
  /** Optional configuration for this cell type */
  config?: CellTypeConfig;
}

// Reactive registry - changes trigger Vue reactivity
const registry = shallowReactive(new Map<string, CellRegistration>());

/**
 * useCellRegistry - Composable for managing cell type components.
 *
 * Implements the Registry pattern with Vue 3 reactivity:
 * 1. Decouples cell type definitions from the renderer
 * 2. Easy registration of custom cell types
 * 3. Open/Closed Principle: extend without modifying DataTableCellRenderer
 * 4. Reactive: changes trigger component updates
 *
 * @example
 * ```ts
 * const { register, get, has } = useCellRegistry();
 *
 * // Register a custom cell type
 * register({
 *   type: "rating",
 *   component: CellRating,
 *   config: { editable: false }
 * });
 *
 * // Get component for a type
 * const registration = get("rating");
 * ```
 */
export function useCellRegistry() {
  /**
   * Register a cell type with its component.
   * @param registration - The cell registration entry
   */
  const register = (registration: CellRegistration): void => {
    registry.set(registration.type, registration);
  };

  /**
   * Get the registration for a cell type.
   * @param type - The cell type to look up
   * @returns The registration entry or undefined if not found
   */
  const get = (type: string): CellRegistration | undefined => {
    return registry.get(type);
  };

  /**
   * Check if a cell type is registered.
   * @param type - The cell type to check
   */
  const has = (type: string): boolean => {
    return registry.has(type);
  };

  /**
   * Get all registered cell types.
   * @returns Array of registered type names
   */
  const getRegisteredTypes = (): string[] => {
    return Array.from(registry.keys());
  };

  /**
   * Unregister a cell type.
   * @param type - The cell type to remove
   */
  const unregister = (type: string): boolean => {
    return registry.delete(type);
  };

  /**
   * Clear all registrations.
   */
  const clear = (): void => {
    registry.clear();
  };

  return {
    register,
    get,
    has,
    getRegisteredTypes,
    unregister,
    clear,
  };
}

export type UseCellRegistryReturn = ReturnType<typeof useCellRegistry>;
