/* eslint-disable @typescript-eslint/no-explicit-any */
import { readonly, ref, type Ref, type DeepReadonly } from "vue";
import { HasLoading } from "@core/composables/useLoading";
import { notification } from "@shared/components/notifications/core/notification";
import { parseError, DisplayableError } from "@core/utilities/error";
import { setPendingErrorNotification } from "@core/utilities/pendingErrorNotifications";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-async");

export type AsyncAction<Payload = void, Result = void> = (payload?: Payload, ...rest: any[]) => Promise<Result>;

export interface UseAsyncOptions {
  /**
   * Show error notification on failure. Default: true.
   *
   * Notifications are deferred via setTimeout(0) so that ErrorInterceptor
   * can cancel them when it catches the same error for blade banner display.
   * This prevents duplicate toast+banner for load errors while still
   * showing toasts for save/delete errors caught by module try/catch.
   */
  notify?: boolean;
  /** Notification timeout in ms. Default: 8000 */
  notifyTimeout?: number;
}

export interface UseAsync<Payload = void, Result = void> extends HasLoading {
  action: AsyncAction<Payload, Result>;
  /** Reactive error state — set on failure, cleared on next invocation */
  error: DeepReadonly<Ref<DisplayableError | null>>;
}

export function useAsync<Payload = void, Result = void>(
  innerAction: AsyncAction<Payload, Result>,
  options?: UseAsyncOptions,
): UseAsync<Payload, Result> {
  const loading = ref(false);
  const error = ref<DisplayableError | null>(null);

  const shouldNotify = options?.notify !== false;
  const notifyTimeout = options?.notifyTimeout ?? 8000;

  async function action(payload?: Payload, ...rest: any[]): Promise<Result> {
    loading.value = true;
    error.value = null;

    try {
      return await innerAction(payload, ...rest);
    } catch (e) {
      const parsed = parseError(e);
      error.value = parsed;
      logger.error("Async action failed:", e);

      if (shouldNotify && e && typeof e === "object") {
        const notifId = `async-error-${parsed.message.slice(0, 80)}`;

        // Defer notification so ErrorInterceptor can cancel it
        // when onErrorCaptured fires (synchronously, before setTimeout(0) callback)
        const timerId = setTimeout(() => {
          notification.error(parsed.message, {
            timeout: notifyTimeout,
            notificationId: notifId,
          });
        }, 0);

        setPendingErrorNotification(e, timerId, notifId);
      }

      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    action,
  };
}
