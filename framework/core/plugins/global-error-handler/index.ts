import type { App } from "vue";
import { notification } from "@shared/components/notifications/core/notification";
import { parseError } from "@core/utilities/error";
import { createLogger } from "@core/utilities";

const logger = createLogger("global-error-handler");

function errorKey(err: unknown): string {
  if (err instanceof Error) return `${err.name}:${err.message}`;
  return String(err);
}

const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 3000;
type WindowWithVcGlobalHandlers = Window & { __VC_GLOBAL_ERROR_HANDLERS_INSTALLED__?: boolean };

function isDuplicate(err: unknown): boolean {
  const key = errorKey(err);
  const now = Date.now();
  const last = recentErrors.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  recentErrors.set(key, now);
  if (recentErrors.size > 50) {
    for (const [k, t] of recentErrors) {
      if (now - t > DEDUP_WINDOW_MS) recentErrors.delete(k);
    }
  }
  return false;
}

export function setupGlobalErrorHandlers(app: App): void {
  // 1. Vue component errors — chain to existing handler
  const existingHandler = app.config.errorHandler;
  app.config.errorHandler = (err, instance, info) => {
    logger.error("Unhandled Vue error:", err, "\nInfo:", info);
    if (!isDuplicate(err)) {
      const parsed = parseError(err);
      notification.error(parsed.message, {
        timeout: 8000,
        notificationId: `global-vue-${errorKey(err)}`,
      });
    }
    existingHandler?.(err, instance, info);
  };

  if (typeof window === "undefined") return;
  const win = window as WindowWithVcGlobalHandlers;

  // Idempotency guard: prevent duplicated listeners when framework is installed multiple times
  if (win.__VC_GLOBAL_ERROR_HANDLERS_INSTALLED__) return;
  win.__VC_GLOBAL_ERROR_HANDLERS_INSTALLED__ = true;

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    logger.error("Unhandled rejection:", event.reason);
    if (!isDuplicate(event.reason)) {
      const parsed = parseError(event.reason);
      notification.error(parsed.message, {
        timeout: 8000,
        notificationId: `global-rejection-${errorKey(event.reason)}`,
      });
    }
  };

  // 2. Unhandled promise rejections
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  const onWindowError = (event: ErrorEvent) => {
    if (!event.error) return;
    logger.error("Uncaught error:", event.error);
    if (!isDuplicate(event.error)) {
      const parsed = parseError(event.error);
      notification.error(parsed.message, {
        timeout: 8000,
        notificationId: `global-error-${errorKey(event.error)}`,
      });
    }
  };

  // 3. Uncaught JS errors
  window.addEventListener("error", onWindowError);
}
