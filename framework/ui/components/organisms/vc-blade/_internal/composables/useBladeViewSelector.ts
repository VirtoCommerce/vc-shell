import { shallowRef, type ShallowRef, type VNode } from "vue";
import type { BladeViewSelectorRegistry } from "@framework/injection-keys";

export function createBladeViewSelectorRegistry(): {
  registry: BladeViewSelectorRegistry;
  render: ShallowRef<(() => VNode) | null>;
} {
  const render = shallowRef<(() => VNode) | null>(null);

  const registry: BladeViewSelectorRegistry = {
    register(fn) {
      if (render.value) {
        if (import.meta.env.DEV) {
          console.warn(
            "[VcBlade] A view selector is already registered in this blade header; the second one is ignored.",
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
