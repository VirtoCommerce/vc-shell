import debounce from "@core/composables/useFunctions/debounce";
import delay from "@core/composables/useFunctions/delay";
import once from "@core/composables/useFunctions/once";
import throttle from "@core/composables/useFunctions/throttle";

export interface UseFunctionsReturn {
  debounce: typeof debounce;
  delay: typeof delay;
  once: typeof once;
  throttle: typeof throttle;
}

/** @deprecated Use UseFunctionsReturn instead */
export type IUseFunctions = UseFunctionsReturn;

export function useFunctions(): UseFunctionsReturn {
  return {
    debounce,
    delay,
    once,
    throttle,
  };
}
