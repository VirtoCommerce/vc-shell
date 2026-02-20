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
 * Get reactive state for an extension point.
 * Creates an undeclared entry if it doesn't exist (plugin registering before host).
 * Warns in dev mode if the point was never declared.
 */
export function getPoint(name: string): ExtensionPointState {
  if (!registry[name]) {
    registry[name] = { declared: false, options: {}, components: [] };
  }

  if (import.meta.env.DEV && !registry[name].declared) {
    const declared = Object.keys(registry).filter((k) => registry[k].declared);
    console.warn(
      `[vc-shell] Extension point "${name}" is not declared. ` +
        `Available: ${declared.join(", ") || "(none)"}`,
    );
  }

  return registry[name];
}

/**
 * Get the full registry (for dev tools / testing).
 */
export function getRegistry(): Record<string, ExtensionPointState> {
  return registry;
}
