import { ref, computed } from "vue";
import { PushNotification, PushNotificationClient } from "@core/api/platform";
import { createLogger } from "@core/utilities";
import {
  NotificationTypeConfig,
  NotificationSubscription,
  EXCLUDED_NOTIFICATION_TYPES,
} from "./types";

const logger = createLogger("notification-store");

export function createNotificationStore() {
  const registry = new Map<string, NotificationTypeConfig>();
  const history = ref<PushNotification[]>([]);
  const realtime = ref<PushNotification[]>([]);
  const subscribers = new Map<number, NotificationSubscription>();
  let subscriberCounter = 0;

  const notificationsClient = new PushNotificationClient();

  // --- Computed ---

  const unreadCount = computed(() =>
    history.value.filter((n) => n.isNew).length,
  );

  const hasUnread = computed(() => unreadCount.value > 0);

  // --- Actions ---

  function registerType(type: string, config: NotificationTypeConfig) {
    registry.set(type, config);
  }

  function ingest(message: PushNotification) {
    if (
      message.notifyType &&
      EXCLUDED_NOTIFICATION_TYPES.includes(message.notifyType)
    ) {
      return;
    }

    // Upsert into history
    const existingIdx = history.value.findIndex((x) => x.id === message.id);
    if (existingIdx !== -1) {
      const existing = history.value[existingIdx];
      const preservedIsNew = existing.isNew;
      Object.assign(existing, message);
      existing.isNew = preservedIsNew;
    } else {
      history.value.push(new PushNotification(message));
    }

    // Upsert into realtime
    const existingRtIdx = realtime.value.findIndex((x) => x.id === message.id);
    if (existingRtIdx !== -1) {
      const existingRt = realtime.value[existingRtIdx];
      const preservedIsNew = existingRt.isNew;
      Object.assign(existingRt, message);
      existingRt.isNew = preservedIsNew;
    } else {
      realtime.value.push(new PushNotification(message));
    }

    // Notify subscribers
    if (message.isNew && message.notifyType) {
      for (const sub of subscribers.values()) {
        if (!sub.types.includes(message.notifyType)) continue;
        if (sub.filter && !sub.filter(message)) continue;
        sub.handler?.(message);
      }
    }
  }

  function markAsRead(message: PushNotification) {
    const inHistory = history.value.find((x) => x.id === message.id);
    if (inHistory) inHistory.isNew = false;

    const inRealtime = realtime.value.find((x) => x.id === message.id);
    if (inRealtime) inRealtime.isNew = false;
  }

  async function markAllAsRead() {
    history.value.forEach((x) => {
      x.isNew = false;
    });
    realtime.value.forEach((x) => {
      x.isNew = false;
    });

    try {
      await notificationsClient.markAllAsRead();
    } catch (e) {
      logger.error("markAllAsRead failed:", e);
      throw e;
    }
  }

  async function loadHistory(take = 10) {
    try {
      const result = await fetch("/api/platform/pushnotifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
        body: JSON.stringify({ take }),
      });
      const response = await result.text();
      history.value = (JSON.parse(response).notifyEvents as PushNotification[]) ?? [];
    } catch (e) {
      logger.error("loadHistory failed:", e);
      throw e;
    }
  }

  function subscribe(opts: {
    types: string[];
    filter?: (msg: PushNotification) => boolean;
    handler?: (msg: PushNotification) => void;
  }): () => void {
    const id = ++subscriberCounter;
    subscribers.set(id, { id, ...opts });
    return () => {
      subscribers.delete(id);
    };
  }

  function getByType(type: string): PushNotification[] {
    return history.value.filter((n) => n.notifyType === type);
  }

  return {
    // State
    registry,
    history,
    realtime,

    // Computed
    unreadCount,
    hasUnread,

    // Actions
    registerType,
    ingest,
    markAsRead,
    markAllAsRead,
    loadHistory,
    subscribe,
    getByType,
  };
}

export type NotificationStore = ReturnType<typeof createNotificationStore>;
