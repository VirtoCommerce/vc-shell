import { shallowRef, type ShallowRef, type VNode } from "vue";
import type { BladeTitleAddonRegistry } from "@framework/injection-keys";

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
