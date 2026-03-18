import { inject, getCurrentInstance } from "vue";
import { NotificationStoreKey } from "@framework/injection-keys";
import { createNotificationStore, NotificationStore } from "../store";

/** Module-level singleton — shared by all callers when inject() is unavailable. */
let _singleton: NotificationStore | null = null;

/**
 * Returns the shared NotificationStore singleton.
 *
 * Resolution order:
 * 1. Vue inject() — works inside component setup() or app.runWithContext()
 * 2. Module-level singleton — ensures all plugin install() calls and
 *    remote microfrontend modules share the same store instance
 */
export function useNotificationStore(): NotificationStore {
  if (getCurrentInstance()) {
    const injected = inject(NotificationStoreKey, null);
    if (injected) {
      _singleton = injected;
      return injected;
    }
  }

  if (!_singleton) {
    _singleton = createNotificationStore();
  }
  return _singleton;
}
