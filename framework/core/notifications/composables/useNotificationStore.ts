import { inject, getCurrentInstance } from "vue";
import { NotificationStoreKey } from "@framework/injection-keys";
import { createNotificationStore, NotificationStore } from "../store";

/** Module-level singleton — shared by all callers when inject() is unavailable. */
let _singleton: NotificationStore | null = null;

/**
 * The shared NotificationStore singleton. Resolved through inject() inside setup() or
 * app.runWithContext(), otherwise through the module-level singleton, which keeps plugin
 * install() calls and remote microfrontend modules on the same instance.
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
