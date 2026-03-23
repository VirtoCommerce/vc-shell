# Notification System

Centralized push notification handling for the vc-shell framework. Provides a two-level architecture: **Level 1** (module-level, always-on toasts and dropdown) and **Level 2** (blade-level, scoped subscriptions that auto-cleanup on unmount).

## Overview

The notification system receives `PushNotification` messages from the platform SignalR hub, stores them in a reactive singleton store, fires toast popups based on per-type configuration, and exposes blade-scoped composables for subscribing to specific notification types.

### When to Use

- **Module authors**: Register notification types with toast/template config during module `install()`.
- **Blade authors**: Use `useBladeNotifications()` to react to specific notification types within a blade lifecycle.
- **App shell**: The store is provided at the app root and drives the notification dropdown, unread badge, and mark-all-as-read actions.

## Architecture

```
PushNotification (SignalR)
        |
        v
  NotificationStore.ingest()
        |
        +---> history[]  (persistent, loaded from API)
        +---> realtime[] (session-only, from SignalR)
        +---> ToastController.handle()   [Level 1: always-on]
        +---> subscriber callbacks        [Level 2: blade-scoped]
```

## API

### `useNotificationStore()`

Returns the shared `NotificationStore` singleton. Resolution order:
1. Vue `inject()` (inside component setup or `app.runWithContext()`)
2. Module-level singleton fallback (ensures microfrontend modules share state)

**File:** `composables/useNotificationStore.ts`

### `NotificationStore` Interface

| Member | Type | Description |
|--------|------|-------------|
| `registry` | `Map<string, NotificationTypeConfig>` | Registered notification type configurations |
| `history` | `Ref<PushNotification[]>` | All notifications (loaded from API + ingested) |
| `realtime` | `Ref<PushNotification[]>` | Session-only notifications from SignalR |
| `unreadCount` | `ComputedRef<number>` | Count of unread notifications in history |
| `hasUnread` | `ComputedRef<boolean>` | Whether any unread notifications exist |
| `registerType(type, config)` | `(string, NotificationTypeConfig) => void` | Register a notification type with toast/template config |
| `ingest(message)` | `(PushNotification) => void` | Process an incoming notification (upsert, toast, notify subscribers) |
| `markAsRead(message)` | `(PushNotification) => void` | Mark a single notification as read |
| `markAllAsRead()` | `() => Promise<void>` | Optimistic mark-all-as-read with server sync and rollback on failure |
| `loadHistory(take?)` | `(number?) => Promise<void>` | Load notification history from the API (default: 10) |
| `subscribe(opts)` | `({types, filter?, handler?}) => () => void` | Subscribe to notification types; returns unsubscribe function |
| `getByType(type)` | `(string) => PushNotification[]` | Filter history by `notifyType` |

**File:** `store.ts`

### `useBladeNotifications<T>(options)`

Blade-level notification subscription (Level 2). Automatically unsubscribes when the blade's effect scope is disposed.

**File:** `composables/useBladeNotifications.ts`

#### Parameters

```typescript
interface BladeNotificationOptions<T extends PushNotification> {
  types: string[];                // Notification types to subscribe to
  filter?: (msg: T) => boolean;   // Optional message filter
  onMessage?: (msg: T) => void;   // Callback for each matching message
}
```

#### Returns

```typescript
interface BladeNotificationReturn<T extends PushNotification> {
  messages: ComputedRef<T[]>;     // Filtered unread messages from realtime
  unreadCount: ComputedRef<number>; // Count of matching unread messages
  markAsRead: (msg: T) => void;   // Mark a specific message as read
}
```

### `useNotificationContext<T>()`

Returns the current notification object inside a custom notification template. Uses Vue's `inject()` under the hood — must be called inside a component rendered as a notification template.

**File:** `composables/useNotificationContext.ts`

#### Returns

`ComputedRef<T>` — reactive reference to the current `PushNotification` (or extended type via generic).

#### Example

```typescript
import { useNotificationContext } from "@vc-shell/framework";

interface IOrderNotification extends PushNotification {
  orderId?: string;
}

const notificationRef = useNotificationContext<IOrderNotification>();
// notificationRef.value.orderId, notificationRef.value.title, etc.
```

### Toast Controller

Handles toast popup display based on `NotificationTypeConfig.toast` settings. Created internally by the store.

**File:** `toast-controller.ts`

#### Toast Modes

| Mode | Behavior |
|------|----------|
| `"auto"` | Single fire-and-forget toast with severity-based timeout |
| `"progress"` | Persistent toast updated on each message; auto-completes when `isComplete()` returns `true` |
| `"silent"` | No toast displayed |

### Types

**File:** `types.ts`

| Type | Description |
|------|-------------|
| `Severity` | `"info" \| "warning" \| "error" \| "critical"` |
| `ToastConfig` | Toast behavior: mode, severity (static or function), timeout, isComplete, completedType |
| `NotificationTypeConfig` | Per-type config: optional Vue `template` component, `toast` config, `groupBy` field |
| `ModuleNotificationsConfig` | Record mapping `notifyType` strings to `NotificationTypeConfig` |
| `NotificationAction` | Action button in notification UI: label, icon, handler, visibility |
| `NotificationSubscription` | Internal subscriber record: id, types, filter, handler |
| `SEVERITY_TIMEOUTS` | Default timeouts: info=5s, warning=8s, error=persistent, critical=persistent |
| `EXCLUDED_NOTIFICATION_TYPES` | Types excluded from ingestion (e.g. `"IndexProgressPushNotification"`) |

## Usage Examples

### Registering notification types (module install)

```typescript
import { useNotificationStore } from "@vc-shell/framework";

// Inside module install():
const store = useNotificationStore();

store.registerType("OrderStatusChanged", {
  toast: {
    mode: "auto",
    severity: "info",
    timeout: 5000,
  },
});

store.registerType("CatalogExportCompleted", {
  template: ExportNotificationTemplate,
  toast: {
    mode: "progress",
    severity: (msg) => msg.finished ? "info" : "warning",
    isComplete: (msg) => !!msg.finished,
    completedType: (msg) => msg.errorCount ? "error" : "success",
  },
  groupBy: "jobId",
});
```

Custom templates access the notification via `useNotificationContext()` composable — no props needed. See [NotificationTemplate docs](../../shell/components/notification-template/notification-template.docs.md) for template examples.

### Subscribing in a blade

```typescript
import { useBladeNotifications } from "@vc-shell/framework";

// Inside <script setup>:
const { messages, unreadCount, markAsRead } = useBladeNotifications({
  types: ["OrderStatusChanged"],
  filter: (msg) => msg.orderId === currentOrderId.value,
  onMessage: (msg) => {
    // Refresh blade data when a relevant notification arrives
    reloadOrder();
  },
});
```

### Loading history and marking all as read

```typescript
const store = useNotificationStore();

await store.loadHistory(20);
console.log(`${store.unreadCount.value} unread notifications`);

await store.markAllAsRead(); // optimistic update with rollback on failure
```

## Related

- `framework/injection-keys.ts` -- `NotificationStoreKey`, `NotificationTemplatesKey`
- `framework/shared/components/notifications/` -- Notification dropdown UI
- `framework/core/api/platform.ts` -- `PushNotification`, `PushNotificationClient`
