import { provide, inject, computed, toValue, isRef, type MaybeRefOrGetter, type ComputedRef } from "vue";
import { BladeContextKey } from "@framework/injection-keys";
import { InjectionError } from "@core/utilities";

/**
 * Shallow-unwraps all ref/computed values in a record.
 * Plain values pass through unchanged.
 */
function unwrapRecord(record: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    const val = record[key];
    result[key] = isRef(val) ? val.value : val;
  }
  return result;
}

/**
 * Exposes blade data for external widgets, extensions, and nested components.
 * Must be called in blade's `<script setup>`.
 *
 * All ref/computed values in the provided object are **automatically unwrapped**
 * so consumers can access them directly without `.value`.
 *
 * @example
 * ```ts
 * defineBladeContext({ item, disabled });
 * // consumer: ctx.value.item — already unwrapped, no .value needed
 * ```
 */
export function defineBladeContext(data: MaybeRefOrGetter<Record<string, unknown>>): void {
  provide(
    BladeContextKey,
    computed(() => unwrapRecord(toValue(data))),
  );
}

/**
 * Injects blade context provided by the nearest ancestor blade via `defineBladeContext`.
 * Returns a ComputedRef — access fields via `.value`.
 * Nested refs are already unwrapped by `defineBladeContext`.
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
