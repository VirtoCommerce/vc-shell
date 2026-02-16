import { computed } from "vue";
import { declarePoint, getPoint } from "./store";
import type { ExtensionPointOptions, ExtensionComponent } from "./types";

/**
 * Declare an extension point (host-side).
 *
 * Used in pages/components that accept plugin content.
 * Returns reactive computed refs for the registered components.
 *
 * @example
 * ```ts
 * const { hasComponents } = defineExtensionPoint("seller:commissions", {
 *   description: "Commission fee fields in seller details form",
 * });
 * ```
 */
export function defineExtensionPoint(name: string, options: ExtensionPointOptions = {}) {
  declarePoint(name, options);
  const state = getPoint(name);

  const components = computed<ExtensionComponent[]>(() =>
    [...state.components].sort((a, b) => (a.priority || 0) - (b.priority || 0)),
  );

  const hasComponents = computed(() => state.components.length > 0);

  return { components, hasComponents };
}
