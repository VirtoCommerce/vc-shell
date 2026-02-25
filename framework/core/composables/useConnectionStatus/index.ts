import { watch, readonly, ref } from "vue";
import { useNetwork } from "@vueuse/core";
import { notification } from "@shared/components/notifications/core/notification";
import { createLogger } from "@core/utilities";

const logger = createLogger("connection-status");

const OFFLINE_NOTIFICATION_ID = "vc-framework-offline-status";

// Module-level singleton state
const _isSetup = ref(false);
const _isOnline = ref(true);

export interface UseConnectionStatus {
  isOnline: Readonly<typeof _isOnline>;
}

export function useConnectionStatus(): UseConnectionStatus {
  if (!_isSetup.value && typeof window !== "undefined") {
    _isSetup.value = true;

    const { isOnline } = useNetwork();

    watch(isOnline, (online) => {
      _isOnline.value = online;

      if (!online) {
        logger.warn("Network connection lost");
        notification.warning(
          "You are currently offline. Some features may be unavailable.",
          {
            notificationId: OFFLINE_NOTIFICATION_ID,
            timeout: false,
          },
        );
        document.documentElement.classList.add("vc-offline");
      } else {
        logger.info("Network connection restored");
        notification.remove(OFFLINE_NOTIFICATION_ID);
        document.documentElement.classList.remove("vc-offline");
      }
    }, { immediate: true });
  }

  return {
    isOnline: readonly(_isOnline),
  };
}
