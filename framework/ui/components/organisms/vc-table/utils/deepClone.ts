import { toRaw } from "vue";

/**
 * Safe deep clone utility for Vue 3 reactive objects.
 *
 * Handles Vue reactive proxies and non-serializable types like Date objects.
 * Uses structuredClone when available, with a JSON-based fallback.
 *
 * @typeParam T - The type of object to clone
 * @param obj - The object to clone (can be a Vue reactive proxy)
 * @returns A deep clone of the object with all reactivity stripped
 *
 * @example
 * ```ts
 * const original = reactive({ name: "John", date: new Date() });
 * const cloned = deepClone(original);
 * // cloned is a plain object, not reactive
 * ```
 */
export function deepClone<T>(obj: T): T {
  try {
    // structuredClone handles most types including Date, Map, Set, etc.
    // toRaw unwraps Vue reactive proxies
    return structuredClone(toRaw(obj));
  } catch {
    // Fallback: JSON serialization with custom Date handling
    // This is needed for objects that structuredClone can't handle
    // (e.g., functions, DOM nodes, or certain circular references)
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => {
        if (value instanceof Date) {
          return { __type: "Date", value: value.toISOString() };
        }
        return value;
      }),
      (_key, value) => {
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      }
    );
  }
}

export default deepClone;
