import { provide, inject, computed, toValue, type MaybeRefOrGetter, type ComputedRef } from "vue";
import { BladeContextKey } from "@framework/injection-keys";
import { InjectionError } from "@core/utilities";

/**
 * Exposes blade data for external widgets, extensions, and nested components.
 * Must be called in blade's `<script setup>`.
 *
 * Accepts a plain object or a computed/ref — consumers always get a reactive computed.
 *
 * @example
 * ```ts
 * defineBladeContext({ item, disabled });
 * // or
 * defineBladeContext(computed(() => ({ id: item.value?.id })));
 * ```
 */
export function defineBladeContext(data: MaybeRefOrGetter<Record<string, unknown>>): void {
  provide(BladeContextKey, computed(() => toValue(data)));
}

/**
 * Injects blade context provided by the nearest ancestor blade via `defineBladeContext`.
 * Returns a ComputedRef — access fields via `.value`.
 * Throws if no context is found.
 *
 * @example
 * ```ts
 * const ctx = injectBladeContext();
 * const entityId = computed(() => ctx.value.id as string);
 * ```
 */
export function injectBladeContext(): ComputedRef<Record<string, unknown>> {
  const ctx = inject<ComputedRef<Record<string, unknown>>>(BladeContextKey);
  if (!ctx) {
    throw new InjectionError("BladeContext");
  }
  return ctx;
}
