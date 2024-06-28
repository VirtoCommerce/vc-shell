import { onErrorCaptured, getCurrentInstance, ref, Ref } from "vue";
import { useAppInsights } from "vue3-application-insights";
import { useUser } from "..";

interface IUseErrorHandler {
  error: Ref<string | null>;
  reset(): void;
}

export function useErrorHandler(capture?: boolean): IUseErrorHandler {
  const error = ref<string | null>(null);
  const instance = getCurrentInstance();
  const appInsights = useAppInsights();
  const { user } = useUser();

  function reset() {
    error.value = null;

    if (instance) {
      instance.emit("reset");
    }
  }

  onErrorCaptured((err) => {
    if (err && err instanceof Error) {
      if ("isApiException" in err && "response" in err) {
        const stringifiedError = JSON.stringify(err);
        error.value = stringifiedError;
      } else {
        error.value = err.toString();
      }

      if (appInsights) {
        appInsights.trackException({
          exception: err,
          properties: {
            userId: user.value?.id ?? "",
            userName: user.value?.userName ?? "",
          },
        });
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
