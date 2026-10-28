import { computed, ref, type ComputedRef } from "vue";
import type { PushNotification } from "@core/api/platform";
import { useBladeNotifications } from "@core/notifications";
import type { IWidgetAlert } from "@core/services/widget-service";

export interface UseWidgetPushAlertsOptions<T extends PushNotification = PushNotification> {
  /** Notification types to listen to */
  types: string[];
  /** Keep only messages for this blade, e.g. `(m) => m.entityId === item.value?.id` */
  filter?: (msg: T) => boolean;
  /** Builds the alert shown in the widget popup */
  toAlert: (msg: T) => Omit<IWidgetAlert, "onSeen">;
}

export interface UseWidgetPushAlertsReturn {
  /** Newest first. Pass to the widget's `alerts` field. */
  alerts: ComputedRef<IWidgetAlert[]>;
  clear: () => void;
}

/**
 * Turns matching push notifications into widget alerts. An alert is removed once the
 * popup has shown it. Independent from the notification bell: nothing is marked read.
 * Lives as long as the calling component or effect scope.
 */
export function useWidgetPushAlerts<T extends PushNotification = PushNotification>(
  options: UseWidgetPushAlertsOptions<T>,
): UseWidgetPushAlertsReturn {
  const items = ref<IWidgetAlert[]>([]);

  function remove(id: string) {
    items.value = items.value.filter((a) => a.id !== id);
  }

  useBladeNotifications<T>({
    types: options.types,
    filter: options.filter,
    onMessage: (msg) => {
      const alert = options.toAlert(msg);
      const next: IWidgetAlert = { ...alert, onSeen: () => remove(alert.id) };
      items.value = [next, ...items.value.filter((a) => a.id !== alert.id)];
    },
  });

  return {
    alerts: computed(() => items.value),
    clear: () => {
      items.value = [];
    },
  };
}
