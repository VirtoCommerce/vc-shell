import debounce from "@core/composables/useFunctions/debounce";
import delay from "@core/composables/useFunctions/delay";
import once from "@core/composables/useFunctions/once";
import throttle from "@core/composables/useFunctions/throttle";

interface IUseFunctions {
  debounce: typeof debounce;
  delay: typeof delay;
  once: typeof once;
  throttle: typeof throttle;
}

export function useFunctions(): IUseFunctions {
  return {
    debounce,
    delay,
    once,
    throttle,
  };
}
