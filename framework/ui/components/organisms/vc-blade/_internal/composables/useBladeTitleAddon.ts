import { shallowRef, type InjectionKey, type ShallowRef, type VNode } from "vue";

/** One component registered to render next to the blade title. Internal: not part of the public API */
export interface BladeTitleAddonRegistry {
  /** Returns an unregister function, or null when rejected (the first registration wins). */
  register(render: () => VNode): (() => void) | null;
}
export const BladeTitleAddonKey: InjectionKey<BladeTitleAddonRegistry> = Symbol("BladeTitleAddon");

export function createBladeTitleAddonRegistry(): {
  registry: BladeTitleAddonRegistry;
  render: ShallowRef<(() => VNode) | null>;
} {
  const render = shallowRef<(() => VNode) | null>(null);

  const registry: BladeTitleAddonRegistry = {
    register(fn) {
      if (render.value) {
        if (import.meta.env.DEV) {
          console.warn(
            "[VcBlade] A title addon is already registered in this blade header; the second one is ignored.",
          );
        }
        return null;
      }
      render.value = fn;
      return () => {
        if (render.value === fn) render.value = null;
      };
    },
  };

  return { registry, render };
}
