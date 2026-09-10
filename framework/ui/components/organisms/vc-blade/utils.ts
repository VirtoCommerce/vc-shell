import { isRef, toValue } from "vue";
import type { BladeDescriptor } from "@core/blade-navigation/types";

/**
 * Resolves a visibility value: `undefined` defaults to visible, a boolean is used as is,
 * a ref or computed is unwrapped, and a function is called with the blade context.
 */
export function resolveVisibility(
  isVisible: boolean | ((...args: any[]) => boolean | undefined) | { value: boolean | undefined } | undefined,
  bladeInstance?: BladeDescriptor,
): boolean {
  if (isVisible === undefined) {
    return true;
  }

  if (typeof isVisible === "function") {
    return Boolean(isVisible(bladeInstance));
  }

  if (isRef(isVisible)) {
    return Boolean(toValue(isVisible));
  }

  return Boolean(isVisible);
}

/**
 * Resolves a reactive boolean that can be:
 * - `undefined` → defaults to `false`
 * - `boolean` → used directly
 * - `Ref<boolean>` or `ComputedRef<boolean>` → unwrapped
 */
export function resolveReactiveBoolean(value: boolean | { value: boolean | undefined } | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  if (isRef(value)) {
    return Boolean(toValue(value));
  }

  return Boolean(value);
}
