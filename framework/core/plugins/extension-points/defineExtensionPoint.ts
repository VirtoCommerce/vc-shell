import { computed, type ComputedRef } from "vue";
import { declarePoint, getPoint } from "@core/plugins/extension-points/store";
import type { ExtensionPointOptions, ExtensionComponent } from "@core/plugins/extension-points/types";

/**
 * Return type of {@link defineExtensionPoint}.
 *
 * @typeParam M - Shape of the `meta` field on registered extension components.
 *   Defaults to `Record<string, unknown>` for backward compatibility.
 */
export interface DefineExtensionPointReturn<M = Record<string, unknown>> {
  /** Sorted list of registered components for this extension point. */
  components: ComputedRef<Array<Omit<ExtensionComponent, "meta"> & { meta?: M }>>;
  /** True when at least one component is registered. */
  hasComponents: ComputedRef<boolean>;
}

/**
 * Declare an extension point (host-side).
 *
 * Used in pages/components that accept plugin content.
 * Returns reactive computed refs for the registered components.
 *
 * @typeParam M - Shape of the `meta` field on registered extension components.
 *   Defaults to `Record<string, unknown>` for backward compatibility.
 *
 * @example
 * ```ts
 * const { hasComponents } = defineExtensionPoint("seller:commissions", {
 *   description: "Commission fee fields in seller details form",
 * });
 * ```
 *
 * @example Typed meta
 * ```ts
 * interface MyMeta { type: "action" | "info" }
 * const { components } = defineExtensionPoint<MyMeta>("seller:commissions");
 * // components.value[0].meta?.type is typed as "action" | "info"
 * ```
 */
export function defineExtensionPoint<M = Record<string, unknown>>(
  name: string,
  options: ExtensionPointOptions = {},
): DefineExtensionPointReturn<M> {
  declarePoint(name, options);
  const state = getPoint(name);

  const components = computed(() =>
    [...state.components].sort((a, b) => (a.priority || 0) - (b.priority || 0)),
  ) as ComputedRef<Array<Omit<ExtensionComponent, "meta"> & { meta?: M }>>;

  const hasComponents = computed(() => state.components.length > 0);

  return { components, hasComponents };
}
