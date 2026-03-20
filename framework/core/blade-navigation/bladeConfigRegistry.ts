import type { BladeConfig } from "./types";

const registry = new Map<string, BladeConfig>();

/**
 * Register blade config in global registry.
 * Called by Vite-compiled defineBlade() at module import time.
 * @internal — not part of the public API. Used by viteBladePlugin output.
 */
export function __registerBladeConfig(name: string, config: BladeConfig): void {
  if (registry.has(name)) {
    console.warn(`[defineBlade] Duplicate blade name: "${name}". Overwriting.`);
  }
  registry.set(name, config);
}

/**
 * Get blade config by registered name.
 */
export function getBladeConfig(name: string): BladeConfig | undefined {
  return registry.get(name);
}

/**
 * Get all registered blade configs (readonly).
 */
export function getAllBladeConfigs(): ReadonlyMap<string, BladeConfig> {
  return registry;
}

/**
 * Clear registry — for testing only.
 * @internal
 */
export function __clearBladeConfigRegistry(): void {
  registry.clear();
}
