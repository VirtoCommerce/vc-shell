import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
    // Determine the correct path to component-registry.json
    // In production (dist), schemas are copied to dist/schemas/
    // In development (src), they're in src/schemas/
    let registryPath: string;
    let currentDir: string;

    if (typeof __dirname !== 'undefined') {
      // CommonJS environment
      currentDir = __dirname;
    } else {
      // ESM environment
      const currentFilePath = fileURLToPath(import.meta.url);
      currentDir = dirname(currentFilePath);
    }

    // Check if we're in dist/ or src/
    // If in dist, schemas are in dist/schemas/
    // If in src, schemas are in src/schemas/ (one level up from src/core/)
    const schemasPath = currentDir.includes("/dist")
      ? join(currentDir, "schemas")
      : join(currentDir, "..", "schemas");

    registryPath = join(schemasPath, "component-registry.json");

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
    let currentDir: string;

    if (typeof __dirname !== 'undefined') {
      currentDir = __dirname;
    } else {
      const currentFilePath = fileURLToPath(import.meta.url);
      currentDir = dirname(currentFilePath);
    }

    const schemasPath = currentDir.includes("/dist")
      ? join(currentDir, "schemas")
      : join(currentDir, "..", "schemas");

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
 * @param componentName - Component name to check (e.g., 'VcTable')
 * @returns true if component exists in registry
 */
export function isValidComponent(componentName: string): boolean {
  const components = loadComponentNames();
  return components.includes(componentName);
}

/**
 * Get component count
 *
 * @returns Number of registered components
 */
export function getComponentCount(): number {
  return loadComponentNames().length;
}
