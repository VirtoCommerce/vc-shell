import { type Ref, type ComputedRef, ref, computed } from "vue";
import { PushNotification, PushNotificationClient, PushNotificationSearchCriteria } from "@core/api/platform";
import { createLogger } from "@core/utilities";
import { NotificationTypeConfig, NotificationSubscription, EXCLUDED_NOTIFICATION_TYPES } from "./types";
import { createToastController } from "./toast-controller";

const logger = createLogger("notification-store");

export interface NotificationStoreOptions {
  /** Injected toast handler. Defaults to createToastController().handle */
  toastHandle?: (msg: PushNotification, config: NotificationTypeConfig) => void;
}

export interface NotificationStore {
  // State
  readonly registry: Map<string, NotificationTypeConfig>;
  readonly history: Ref<PushNotification[]>;
  readonly realtime: Ref<PushNotification[]>;

  // Computed
  readonly unreadCount: ComputedRef<number>;
  readonly hasUnread: ComputedRef<boolean>;

  // Actions
  registerType(type: string, config: NotificationTypeConfig): void;
  ingest(message: PushNotification): void;
  markAsRead(message: PushNotification): void;
  markAllAsRead(): Promise<void>;
  loadHistory(take?: number): Promise<void>;
  subscribe(opts: {
    types: string[];
    filter?: (msg: PushNotification) => boolean;
    handler?: (msg: PushNotification) => void;
  }): () => void;
  getByType(type: string): PushNotification[];
}

export function createNotificationStore(options?: NotificationStoreOptions): NotificationStore {
  const registry = new Map<string, NotificationTypeConfig>();
  const history = ref<PushNotification[]>([]);
  const realtime = ref<PushNotification[]>([]);
  const subscribers = new Map<number, NotificationSubscription>();
  let subscriberCounter = 0;

  const toastHandle = options?.toastHandle ?? createToastController().handle;
  const notificationsClient = new PushNotificationClient();

  // --- Computed ---

  const unreadCount = computed(() => history.value.filter((n) => n.isNew).length);

  const hasUnread = computed(() => unreadCount.value > 0);

  // --- Actions ---

  function registerType(type: string, config: NotificationTypeConfig) {
    registry.set(type, config);
  }

  function ingest(message: PushNotification) {
    if (message.notifyType && EXCLUDED_NOTIFICATION_TYPES.includes(message.notifyType)) {
      return;
    }

    // Upsert into history
    let effectiveIsNew = message.isNew;
    const existingIdx = history.value.findIndex((x) => x.id === message.id);
    if (existingIdx !== -1) {
      const existing = history.value[existingIdx];
      effectiveIsNew = existing.isNew; // preserve read state
      Object.assign(existing, message);
      existing.isNew = effectiveIsNew;
    } else {
      history.value.push({ ...message } as PushNotification);
    }

    // Upsert into realtime
    const existingRtIdx = realtime.value.findIndex((x) => x.id === message.id);
    if (existingRtIdx !== -1) {
      const existingRt = realtime.value[existingRtIdx];
      Object.assign(existingRt, message);
      existingRt.isNew = effectiveIsNew;
    } else {
      realtime.value.push({ ...message } as PushNotification);
    }

    // Toast (Level 1: always-on) — use stored isNew, not incoming
    const config = message.notifyType ? registry.get(message.notifyType) : undefined;
    if (config && effectiveIsNew) {
      toastHandle(message, config);
    }

    // Notify subscribers (Level 2: blade-level) — use stored isNew
    if (effectiveIsNew && message.notifyType) {
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
    // Local update — always applied regardless of server response
    history.value.forEach((x) => {
      x.isNew = false;
    });
    realtime.value.forEach((x) => {
      x.isNew = false;
    });

    try {
      await notificationsClient.markAllAsRead();
    } catch (e) {
      // Server failure is non-critical — local state stays "read"
      // Next loadHistory() will reconcile with server state
      logger.error("markAllAsRead failed:", e);
    }
  }

  async function loadHistory(take = 10) {
    try {
      const criteria: PushNotificationSearchCriteria = { take };
      const result = await notificationsClient.searchPushNotification(criteria);
      history.value = result.notifyEvents ?? [];
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
