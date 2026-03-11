import { onErrorCaptured, getCurrentInstance, ref, Ref, nextTick } from "vue";
import { useAppInsights } from "@core/composables/useAppInsights";
import { useUserManagement } from "@core/composables/useUserManagement";
import { DisplayableError, parseError } from "@core/utilities/error";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-error-handler");

export interface UseErrorHandlerReturn {
  error: Ref<DisplayableError | null>;
  reset(): void;
}

/** @deprecated Use UseErrorHandlerReturn instead */
export type IUseErrorHandler = UseErrorHandlerReturn;

/**
 * A composable to handle and normalize errors within a component's lifecycle.
 * It captures errors, tracks them with Application Insights, and emits them
 * for parent components to handle.
 *
 * @param capture - If true, prevents the error from propagating further up the component tree.
 * @returns An object with the reactive error and a reset function.
 */
export function useErrorHandler(capture?: boolean): UseErrorHandlerReturn {
  const error = ref<DisplayableError | null>(null);
  const instance = getCurrentInstance();
  const { appInsights } = useAppInsights();
  const { user } = useUserManagement();
  const isProcessing = ref(false);

  function reset() {
    error.value = null;

    if (instance) {
      instance.emit("reset");
    }
  }

  onErrorCaptured((err: unknown) => {
    if (isProcessing.value) {
      return !capture;
    }

    isProcessing.value = true;

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

    logger.error("Captured Error:", capturedError.originalError);

    if (instance) {
      instance.emit("error", capturedError);
    }

    nextTick(() => {
      isProcessing.value = false;
    });

    // if `capture` is true, stop the error from propagating further.
    return !capture;
  });

  return {
    error,
    reset,
  };
}
