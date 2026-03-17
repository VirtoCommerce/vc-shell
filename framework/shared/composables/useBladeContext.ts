import { provide, inject } from "vue";
import { BladeContextKey } from "@framework/injection-keys";
import { InjectionError } from "@core/utilities";

/**
 * Exposes blade data for external widgets, extensions, and nested components.
 * Must be called in blade's `<script setup>`.
 *
 * @example
 * ```ts
 * defineBladeContext({ item, disabled, loading });
 * ```
 */
export function defineBladeContext(data: Record<string, unknown>): void {
  provide(BladeContextKey, data);
}

/**
 * Injects blade context provided by the nearest ancestor blade via `defineBladeContext`.
 * Throws if no context is found.
 *
 * @example
 * ```ts
 * const ctx = injectBladeContext();
 * const item = ctx.item as Ref<Product>;
 * ```
 */
export function injectBladeContext(): Record<string, unknown> {
  const ctx = inject(BladeContextKey);
  if (!ctx) {
    throw new InjectionError("BladeContext");
  }
  return ctx;
}
