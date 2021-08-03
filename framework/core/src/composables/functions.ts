import debounce from "./_functions/debounce";
import delay from "./_functions/delay";
import once from "./_functions/once";
import throttle from "./_functions/throttle";

interface IUseFunctions {
  debounce: typeof debounce;
  delay: typeof delay;
  once: typeof once;
  throttle: typeof throttle;
}

export default function useFunctions(): IUseFunctions {
  console.debug("useFunctions entry point");
  return {
    debounce,
    delay,
    once,
    throttle,
  };
}
