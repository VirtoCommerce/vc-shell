---
title: useBladeNotifications
category: composables
group: notifications
---

# useBladeNotifications

Subscribes a blade to one or more push-notification types from the platform's SignalR stream. The composable returns a reactive list of matching unread messages, an unread count, and a `markAsRead` action. The subscription is bound to the current effect scope, so it disappears the moment the blade closes — no manual unsubscribe.

This is the **Level 2** entry point in the notification system. Level 1 — `defineAppModule({ notifications })` — registers types globally with their toast configuration and is the always-on path. Level 2 layers blade-specific behavior on top of that: refresh a list, update a progress UI, mark a job complete.

## When to use

- A list blade needs to refresh when an entity is created, updated, or deleted elsewhere.
- A long-running operation has a dedicated blade and the blade should update as `processedCount` / `errorCount` flow in.
- A blade wants to surface an inline "N new" badge for messages of a specific type.
- When NOT to use: app-wide toasts already come from the Level 1 module config — the blade does not need to subscribe just to show a toast. Reach for the blade subscription only when you also need to _react_ to the event in code.

## Quick Start

```ts
import { useBladeNotifications } from "@vc-shell/framework";

useBladeNotifications({
  types: ["OfferDeletedDomainEvent"],
  onMessage: () => reload(),
});
```

That is the full recipe for "refresh this list when an offer is deleted somewhere in the app." The handler runs once per matching message; the framework cleans up the subscription when the blade unmounts.

## API

### Parameters

```typescript
interface BladeNotificationOptions<T extends PushNotification = PushNotification> {
  types: string[];
  filter?: (msg: T) => boolean;
  onMessage?: (msg: T) => void;
}
```

| Field       | Type                  | Required | Description                                                                                             |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `types`     | `string[]`            | Yes      | Notification types to subscribe to. Must match the `notifyType` field on incoming messages.             |
| `filter`    | `(msg: T) => boolean` | No       | Narrow the subscription further (for example, only events for the entity this blade is editing).        |
| `onMessage` | `(msg: T) => void`    | No       | Callback fired once per matching message. Use it to refresh data, mark progress, or update local state. |

### Returns

```typescript
interface BladeNotificationReturn<T extends PushNotification = PushNotification> {
  messages: ComputedRef<T[]>;
  unreadCount: ComputedRef<number>;
  markAsRead: (msg: T) => void;
}
```

| Property      | Type                  | Description                                                                                                             |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `messages`    | `ComputedRef<T[]>`    | Realtime messages matching `types` and `filter` that are still unread. Updates reactively as new messages arrive.       |
| `unreadCount` | `ComputedRef<number>` | `messages.value.length`. Bind to a badge.                                                                               |
| `markAsRead`  | `(msg: T) => void`    | Mark a specific message as read. Removes it from `messages` (and reduces the global unread badge in the bell dropdown). |

## Typed payloads

Notification payloads often extend `PushNotification` with domain fields. Pass the type parameter so `onMessage` and `messages` are typed:

```ts
import type { PushNotification } from "@vc-shell/framework";

interface ImportPushNotification extends PushNotification {
  jobId: string;
  profileId: string;
  profileName?: string;
  processedCount: number;
  errorCount: number;
  finished: boolean;
}

const { messages, markAsRead } = useBladeNotifications<ImportPushNotification>({
  types: ["ImportPushNotification"],
  onMessage: (message) => {
    if (message.finished) {
      reload();
      markAsRead(message);
    }
  },
});
```

## Common patterns

### Refresh a list on any matching event

```ts
useBladeNotifications({
  types: ["OfferDeletedDomainEvent"],
  onMessage: () => reload(),
});
```

Drop-in for a list blade that needs to stay in sync with deletions happening anywhere in the app.

### Filter to the entity this blade owns

```ts
useBladeNotifications<ImportPushNotification>({
  types: ["ImportPushNotification"],
  onMessage: (message) => {
    if (message.profileId !== param.value) return; // not our job
    if (!message.finished) updateProgress(message);
    else finalizeImport(message);
  },
});
```

Two open import blades will both receive the stream; each one filters by its own `profileId` so they do not step on each other.

### Drive a manual progress toast

When the platform sends progress updates for a long-running job, you may want to render one persistent toast that you update as messages arrive — instead of letting Level 1 spawn a new toast per event.

Set the Level 1 type to `silent` and drive the toast yourself:

```ts title="src/modules/import/index.ts"
defineAppModule({
  notifications: {
    ImportPushNotification: { toast: { mode: "silent" } },
  },
  // ...
});
```

```ts title="pages/import-process.vue"
import { useBladeNotifications, notification } from "@vc-shell/framework";

let toastId: string | undefined;

useBladeNotifications<ImportPushNotification>({
  types: ["ImportPushNotification"],
  onMessage: (message) => {
    const content = message.profileName ? `${message.profileName}: ${message.title}` : message.title;

    if (!toastId) {
      toastId = notification(content, { timeout: false });
    } else if (!message.finished) {
      notification.update(toastId, { content });
    } else {
      notification.update(toastId, {
        content,
        timeout: 5000,
        type: message.errorCount ? "error" : "success",
        onClose: () => (toastId = undefined),
      });
    }
  },
});
```

The `notification()` helper returns the toast id; `notification.update` mutates it in place. The bell-dropdown history still grows — `silent` only suppresses the auto-toast.

## Lifecycle

`useBladeNotifications` calls `useNotificationStore().subscribe(...)` and registers `onScopeDispose(unsub)` against the current effect scope. Inside a Vue `setup()` (component or `<script setup>`) the scope is the component's; the subscription dies with the component.

If you call the composable from a manually managed `effectScope()`, the cleanup runs when that scope is stopped. Calling it outside any scope is a bug — the subscription would never be released.

## Tips

- **Listen, do not declare.** `useBladeNotifications` does not register the notification type with the framework. Types must already be declared by some module via `defineAppModule({ notifications })`, otherwise nothing reaches `onMessage`.
- **`messages` shows only unread.** `markAsRead(msg)` removes a message from `messages` (and from the global unread count). The notification stays in history.
- **One subscription per call.** Calling `useBladeNotifications` multiple times in the same blade creates independent subscriptions. Combine handlers if you only need one.
- **Type strings are case-sensitive.** The string in `types` must exactly equal the `notifyType` field on incoming messages.

## Related

- [useNotificationStore](./useNotificationStore.md) — direct store access for app-shell features (dropdown, badge).
- [useNotificationContext](./useNotificationContext.md) — read the current notification inside a custom template.
- [useBroadcastFilter](./useBroadcastFilter.md) — control which `SendSystemEvents` broadcasts reach the store.
- [Notifications concept page.](../../concepts/notifications.md)
- [Notifications plugin reference.](../../plugins/notifications.md)
