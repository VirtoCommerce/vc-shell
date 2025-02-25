import debounce from "./debounce";
import delay from "./delay";
import once from "./once";
import throttle from "./throttle";

interface IUseFunctions {
  debounce: typeof debounce;
  delay: typeof delay;
  once: typeof once;
  throttle: typeof throttle;
}

export function useFunctions(): IUseFunctions {
  console.debug("useFunctions entry point");
  return {
    debounce,
    delay,
    once,
    throttle,
  };
}
