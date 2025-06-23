import { onErrorCaptured, getCurrentInstance, ref, Ref } from "vue";
import { useAppInsights } from "..";
import { useUserManagement } from "../useUserManagement";
import { DisplayableError, parseError } from "../../utilities/error";

interface IUseErrorHandler {
  error: Ref<DisplayableError | null>;
  reset(): void;
}

/**
 * A composable to handle and normalize errors within a component's lifecycle.
 * It captures errors, tracks them with Application Insights, and emits them
 * for parent components to handle.
 *
 * @param capture - If true, prevents the error from propagating further up the component tree.
 * @returns An object with the reactive error and a reset function.
 */
export function useErrorHandler(capture?: boolean): IUseErrorHandler {
  const error = ref<DisplayableError | null>(null);
  const instance = getCurrentInstance();
  const { appInsights } = useAppInsights();
  const { user } = useUserManagement();

  function reset() {
    error.value = null;

    if (instance) {
      instance.emit("reset");
    }
  }

  onErrorCaptured((err: unknown) => {
    const capturedError = parseError(err);
    error.value = capturedError;

    if (appInsights) {
      appInsights.trackException({
        exception: capturedError,
        properties: {
          userId: user.value?.id ?? "",
          userName: user.value?.userName ?? "",
        },
      });
    }

    console.error("Captured Error:", capturedError.originalError);

    if (instance) {
      instance.emit("error", capturedError);
    }

    // if `capture` is true, stop the error from propagating further.
    return !capture;
  });

  return {
    error,
    reset,
  };
}
