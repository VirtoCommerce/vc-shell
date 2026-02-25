import { computed, type ComputedRef } from "vue";
import type { IBladeInstance } from "@shared/components/blade-navigation/types";

/**
 * Encapsulates blade error state: reactive computeds for the banner
 * and a helper to copy full error details to clipboard.
 */
export function useBladeError(blade: ComputedRef<IBladeInstance>) {
  const error = computed(() => blade.value.error ?? null);

  const hasError = computed(() => Boolean(error.value));

  const shortErrorMessage = computed(() => {
    const err = error.value;
    if (!err) return "";
    return err instanceof Error ? err.message : String(err);
  });

  const errorDetails = computed(() => {
    const err = error.value;
    if (!err) return "";
    if (err instanceof Error) {
      return (err as Error & { details?: string }).details || err.stack || String(err);
    }
    return String(err);
  });

  async function copyError(): Promise<boolean> {
    try {
      const text = [shortErrorMessage.value, errorDetails.value].filter(Boolean).join("\n\n");
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return {
    hasError,
    shortErrorMessage,
    errorDetails,
    copyError,
  };
}
