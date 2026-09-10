import { reactive } from "vue";
import type { ExtensionPointState, ExtensionPointOptions } from "@core/plugins/extension-points/types";

const registry = reactive<Record<string, ExtensionPointState>>({});

/**
 * Declare an extension point (host-side).
 * Safe to call multiple times — subsequent calls are no-ops with a dev warning.
 * If a plugin already registered components before declaration, they are preserved.
 */
export function declarePoint(name: string, options: ExtensionPointOptions): void {
  if (registry[name]?.declared) {
    if (import.meta.env.DEV) {
      console.warn(`[vc-shell] Extension point "${name}" is already declared.`);
    }
    return;
  }

  if (registry[name]) {
    // Plugin registered before host declared — upgrade the entry
    registry[name].declared = true;
    registry[name].options = options;
  } else {
    registry[name] = { declared: true, options, components: [] };
  }
}

/**
 * Reactive state for an extension point, creating an undeclared entry if missing.
 * Registering before declaration is supported: plugins register in module `install()` at
 * startup, hosts declare lazily in setup.
 */
export function getPoint(name: string): ExtensionPointState {
  if (!registry[name]) {
    registry[name] = { declared: false, options: {}, components: [] };
  }

  return registry[name];
}

/**
 * Get the full registry (for dev tools / testing).
 */
export function getRegistry(): Record<string, ExtensionPointState> {
  return registry;
}
