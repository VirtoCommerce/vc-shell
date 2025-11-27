import { readFileSync } from "fs";
import { join } from "path";
import { getDirname, getSchemasPath } from "../utils/paths";

/**
 * Component Registry Loader
 *
 * Loads VC-Shell component names from component-registry.json
 * This ensures we always validate against the actual component list
 * instead of maintaining a hardcoded array.
 */

interface ComponentRegistryEntry {
  import: string;
  component: string;
  description: string;
  category: string;
  [key: string]: any;
}

type ComponentRegistry = Record<string, ComponentRegistryEntry>;

let cachedComponentNames: string[] | null = null;

/**
 * Load all component names from component-registry.json
 *
 * @returns Array of component names (e.g., ['VcBlade', 'VcTable', ...])
 */
export function loadComponentNames(): string[] {
  if (cachedComponentNames) {
    return cachedComponentNames;
  }

  try {
    const currentDir = getDirname(import.meta.url);
    const schemasPath = getSchemasPath(currentDir);
    const registryPath = join(schemasPath, "component-registry.json");

    const registryContent = readFileSync(registryPath, 'utf-8');
    const registry: ComponentRegistry = JSON.parse(registryContent);

    // Extract component names, excluding internal entries (starting with _)
    cachedComponentNames = Object.keys(registry)
      .filter(name => !name.startsWith('_'))
      .sort();

    return cachedComponentNames;
  } catch (error) {
    console.warn('Failed to load component registry, using fallback list:', error);

    // Fallback to a minimal list if registry cannot be loaded
    cachedComponentNames = [
      "VcBlade",
      "VcTable",
      "VcForm",
      "VcInput",
      "VcButton",
      "VcCard",
    ];

    return cachedComponentNames;
  }
}

/**
 * Load the full component registry
 *
 * @returns Component registry object
 */
export function loadComponentRegistry(): ComponentRegistry {
  try {
    const currentDir = getDirname(import.meta.url);
    const schemasPath = getSchemasPath(currentDir);
    const registryPath = join(schemasPath, "component-registry.json");

    const registryContent = readFileSync(registryPath, 'utf-8');
    return JSON.parse(registryContent);
  } catch (error) {
    console.warn('Failed to load component registry:', error);
    return {};
  }
}

/**
 * Check if a component exists in the registry
 *
 * @param componentName Component name to check
 * @returns true if component exists
 */
export function isValidComponent(componentName: string): boolean {
  const names = loadComponentNames();
  return names.includes(componentName);
}

/**
 * Get the number of components in the registry
 *
 * @returns Number of components
 */
export function getComponentCount(): number {
  return loadComponentNames().length;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cachedComponentNames = null;
}
