import { computed, onScopeDispose, getCurrentScope } from "vue";
import { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "./useNotificationStore";
import type { BladeNotificationOptions, BladeNotificationReturn } from "../types";

/**
 * Blade-level notification subscription.
 *
 * Level 2 (additive): provides blade-specific behavior on top of
 * the always-on module config (Level 1). When the blade unmounts,
 * only blade-specific behavior stops — dropdown and toasts continue.
 *
 * Must be called within a component setup or effectScope.
 */
export function useBladeNotifications<T extends PushNotification = PushNotification>(
  options: BladeNotificationOptions<T>,
): BladeNotificationReturn<T> {
  const store = useNotificationStore();

  // Subscribe with handler
  const unsub = store.subscribe({
    types: options.types,
    filter: options.filter as ((msg: PushNotification) => boolean) | undefined,
    handler: options.onMessage as ((msg: PushNotification) => void) | undefined,
  });

  // Auto-cleanup if within a scope
  if (getCurrentScope()) {
    onScopeDispose(unsub);
  }

  // Filtered messages from realtime
  const messages = computed(() =>
    store.realtime.value.filter((msg): msg is T => {
      if (!msg.notifyType || !options.types.includes(msg.notifyType)) return false;
      if (!msg.isNew) return false;
      if (options.filter && !(options.filter as (m: PushNotification) => boolean)(msg)) return false;
      return true;
    }),
  );

  const unreadCount = computed(() => messages.value.length);

  function markAsRead(msg: T) {
    store.markAsRead(msg);
  }

  return {
    messages,
    unreadCount,
    markAsRead,
  };
}
