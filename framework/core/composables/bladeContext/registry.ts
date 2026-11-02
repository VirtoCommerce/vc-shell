import type { ComputedRef } from "vue";
import type { BladeContext } from "@core/types";

// Blade id -> context, for code outside the blade's component tree (keyboard shortcuts)
const contexts = new Map<string, ComputedRef<BladeContext>>();

/** Returns a function that removes the entry, unless another one replaced it since. */
export function registerBladeContext(bladeId: string, context: ComputedRef<BladeContext>): () => void {
  const key = bladeId.toLowerCase();
  contexts.set(key, context);
  return () => {
    if (contexts.get(key) === context) contexts.delete(key);
  };
}

export function getBladeContext(bladeId: string): BladeContext {
  return contexts.get(bladeId.toLowerCase())?.value ?? {};
}
