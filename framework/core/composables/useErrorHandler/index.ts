import { onErrorCaptured, getCurrentInstance, ref, Ref } from "vue";
import { useAppInsights, useUser } from "..";

interface IUseErrorHandler {
  error: Ref<string | null>;
  reset(): void;
}

export function useErrorHandler(capture?: boolean): IUseErrorHandler {
  const error = ref<string | null>(null);
  const instance = getCurrentInstance();
  const { appInsights } = useAppInsights();
  const { user } = useUser();

  function reset() {
    error.value = null;

    if (instance) {
      instance.emit("reset");
    }
  }

  onErrorCaptured((err) => {
    if (err) {
      if (err instanceof Error) {
        if (typeof err === "object" && "isApiException" in err && "response" in err) {
          const res = JSON.parse(String(err.response));
          if (res && "message" in res) {
            error.value = res.message;
          } else if (err.message) {
            error.value = err.message;
          } else {
            error.value = err.toString();
          }
        } else {
          error.value = err.message || err.toString();
        }
      } else {
        error.value = String(err);
      }

      if (appInsights) {
        appInsights.trackException({
          exception: err instanceof Error ? err : new Error(String(err)),
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
