import { PushNotification } from "@core/api/platform";
import { useNotificationStore } from "./useNotificationStore";

export interface UseBroadcastFilterReturn {
  setBroadcastFilter(fn: (msg: PushNotification) => boolean): void;
  clearBroadcastFilter(): void;
}

export function useBroadcastFilter(): UseBroadcastFilterReturn {
  const store = useNotificationStore();
  return {
    setBroadcastFilter: store.setBroadcastFilter,
    clearBroadcastFilter: store.clearBroadcastFilter,
  };
}
