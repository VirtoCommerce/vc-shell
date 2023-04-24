import { onErrorCaptured, getCurrentInstance, ref, Ref } from "vue";

interface IUseErrorHandler {
  error: Ref<string>;
  reset(): void;
}

export function useErrorHandler(capture?: boolean): IUseErrorHandler {
  const error = ref<string>(null);
  const instance = getCurrentInstance();

  function reset() {
    error.value = null;

    if (instance) {
      instance.emit("reset");
    }
  }

  onErrorCaptured((err) => {
    if (err && err instanceof Error) {
      if ("isApiException" in err && "response" in err) {
        const parsedError = JSON.stringify(err);
        error.value = parsedError;
      } else {
        error.value = err.toString();
      }
      console.error(err);
    }

    if (instance) {
      instance.emit("error", error.value);
    }

    if (capture) {
      return false;
    }
  });

  return {
    error,
    reset,
  };
}
