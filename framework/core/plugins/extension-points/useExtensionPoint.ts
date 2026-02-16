import { getPoint } from "./store";
import type { ExtensionComponent } from "./types";

/**
 * Access an extension point (plugin-side).
 *
 * Used in module `install()` to register components into a host's extension point.
 *
 * @example
 * ```ts
 * const { add } = useExtensionPoint("auth:after-form");
 * add({
 *   id: "registration-button",
 *   component: RegistrationButton,
 *   props: { text: "Register" },
 *   meta: { type: "action" },
 * });
 * ```
 */
export function useExtensionPoint(name: string) {
  const state = getPoint(name);

  /** Register or replace a component (matched by id). */
  const add = (entry: ExtensionComponent): void => {
    const idx = state.components.findIndex((c) => c.id === entry.id);
    if (idx !== -1) {
      state.components[idx] = entry;
    } else {
      state.components.push(entry);
    }
  };

  /** Remove a component by id. */
  const remove = (id: string): void => {
    const idx = state.components.findIndex((c) => c.id === id);
    if (idx !== -1) {
      state.components.splice(idx, 1);
    }
  };

  return { add, remove };
}
