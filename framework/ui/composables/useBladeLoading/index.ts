import { inject, ref } from "vue";
import { BladeLoadingKey } from "@framework/injection-keys";

/**
 * Returns the blade loading state from the nearest VcBlade ancestor.
 * When `true`, components should render their skeleton variant.
 */
export function useBladeLoading() {
  return inject(BladeLoadingKey, ref(false));
}
