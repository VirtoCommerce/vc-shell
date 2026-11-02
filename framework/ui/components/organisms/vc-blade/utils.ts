import { isRef, toValue } from "vue";
import type { BladeDescriptor } from "@core/blade-navigation/types";
import type { BladeContext } from "@core/types";

type BladeCallback = (blade: BladeDescriptor | undefined, context: BladeContext) => boolean | undefined;

/**
 * Resolves a visibility value: `undefined` defaults to visible, a boolean is used as is,
 * a ref or computed is unwrapped, and a function is called with the blade and its context.
 */
export function resolveVisibility(
  isVisible: boolean | BladeCallback | { value: boolean | undefined } | undefined,
  blade?: BladeDescriptor,
  context: BladeContext = {},
): boolean {
  if (isVisible === undefined) {
    return true;
  }

  if (typeof isVisible === "function") {
    return Boolean(isVisible(blade, context));
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
 * - a function → called with the blade and its context
 */
export function resolveReactiveBoolean(
  value: boolean | { value: boolean | undefined } | BladeCallback | undefined,
  blade?: BladeDescriptor,
  context: BladeContext = {},
): boolean {
  if (value === undefined) {
    return false;
  }

  if (typeof value === "function") {
    return Boolean(value(blade, context));
  }

  if (isRef(value)) {
    return Boolean(toValue(value));
  }

  return Boolean(value);
}
