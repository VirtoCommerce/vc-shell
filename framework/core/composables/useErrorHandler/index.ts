import { onErrorCaptured, getCurrentInstance, ref } from "vue";

export function useErrorHandler(capture?: boolean) {
  const error = ref<Error | string>(null);
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
        const parsedError = JSON.parse(err.response as string);
        error.value = parsedError.message;
        return;
      } else {
        error.value = err.toString();
      }
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
    onErrorCaptured,
  };
}
