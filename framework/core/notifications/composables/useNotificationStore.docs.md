---
title: useNotificationStore
category: composables
group: notifications
---

# useNotificationStore

!!! warning "Advanced — most apps do not need this"
Reach for [useBladeNotifications](./useBladeNotifications.md), [useBroadcastFilter](./useBroadcastFilter.md), and the `notifications` option on `defineAppModule` first. The bell dropdown, unread badge, and toast pipeline are already wired by the shell. This composable is an **escape hatch** for the small set of cases where those facades do not fit.

Returns the singleton store that backs the framework's notification system. Direct access exposes the full reactive state plus low-level actions: subscribing, ingesting synthetic messages, controlling the broadcast filter, paging history.

## When to use

There are only two cases where this composable belongs in app code:

- **A test or scripted harness** that needs to push synthetic messages through the same pipeline SignalR uses, via `ingest`. Real-time production code never calls `ingest` directly.
- **A custom shell** that replaces the framework's bell dropdown entirely — typically a module-federation host with its own chrome — and therefore needs to bind to `history`, `unreadCount`, and `markAllAsRead` outside the default surface. Apps that use the standard `VcApp` shell do not need this; the dropdown is already there.

For everything else — reacting in a blade, gating broadcasts, registering types, displaying a toast — use the facades. Direct store mutations can bypass invariants the facades enforce (broadcast filter, scope-aware cleanup, type validation).

## Quick Start

```ts
import { useNotificationStore } from "@vc-shell/framework";

const store = useNotificationStore();

await store.loadHistory(50);
```

## API

The store exposes the full reactive state plus actions. The shape is summarized below; the underlying types live in `core/notifications/store.ts` and `core/notifications/types.ts`.

| Member                   | Type                                                   | Description                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registry`               | `Map<string, NotificationTypeConfig>`                  | Notification types registered through `defineAppModule({ notifications })`.                                                                                                |
| `history`                | `Ref<PushNotification[]>`                              | Full history (server-loaded plus ingested), newest first.                                                                                                                  |
| `realtime`               | `Ref<PushNotification[]>`                              | Session-only realtime queue from the SignalR hub. Drives `messages` in `useBladeNotifications`.                                                                            |
| `unreadCount`            | `ComputedRef<number>`                                  | Count of unread items in `history`. Drives the bell badge.                                                                                                                 |
| `hasUnread`              | `ComputedRef<boolean>`                                 | Convenience boolean over `unreadCount`.                                                                                                                                    |
| `registerType(t, cfg)`   | `(string, NotificationTypeConfig) => void`             | Register a type. Called by the framework when `defineAppModule({ notifications })` runs — rarely needed manually.                                                          |
| `ingest(msg, opts?)`     | `(PushNotification, { broadcast?: boolean }?) => void` | Push a message through the same pipeline SignalR uses. Broadcasts pass through the active broadcast filter.                                                                |
| `setBroadcastFilter(fn)` | `((PushNotification) => boolean) => void`              | Install a filter for broadcast messages. Prefer [useBroadcastFilter](./useBroadcastFilter.md) — same method.                                                               |
| `clearBroadcastFilter()` | `() => void`                                           | Remove the broadcast filter.                                                                                                                                               |
| `markAsRead(msg)`        | `(PushNotification) => void`                           | Mark one message as read. Mirrors to the server.                                                                                                                           |
| `markAllAsRead()`        | `() => Promise<void>`                                  | Optimistic mark-all with rollback on failure.                                                                                                                              |
| `loadHistory(take?)`     | `(number?) => Promise<void>`                           | Fetch history from the platform. Default page size is 10. The shell already calls this at bootstrap.                                                                       |
| `subscribe(opts)`        | `({ types, filter?, handler? }) => () => void`         | Low-level pub/sub. Returns an `unsub` function. Inside blades use [useBladeNotifications](./useBladeNotifications.md) — it wraps this and registers cleanup automatically. |
| `getByType(type)`        | `(string) => PushNotification[]`                       | Filter `history` by `notifyType`.                                                                                                                                          |

## Escape-hatch patterns

### Manually ingest a message (tests, scripted replay)

```ts
const store = useNotificationStore();

store.ingest({
  id: "test-1",
  notifyType: "OrderCreatedDomainEvent",
  title: "Test order",
  isNew: true,
  created: new Date().toISOString(),
} as PushNotification);
```

The ingest pipeline runs the configured toast logic and notifies subscribers exactly like a real SignalR message would, so you can verify the end-to-end behavior of `defineAppModule({ notifications })` + `useBladeNotifications` without a live hub.

`ingest` with `{ broadcast: true }` simulates `SendSystemEvents` and runs the broadcast filter; without it the message is treated as targeted and bypasses the filter.

### Custom shell surface (replace the bell dropdown)

When you are building a shell variant that omits the framework's bell dropdown — for example, a module-federation host that renders its own header — bind to the store directly:

```ts
import { useNotificationStore } from "@vc-shell/framework";
import { onMounted } from "vue";

const store = useNotificationStore();

onMounted(() => store.loadHistory(100));
// Use store.history, store.unreadCount, store.markAllAsRead in your own components.
```

If you are using `VcApp` (the default shell), do **not** do this — the dropdown is already mounted and binding to the same store, so a second surface duplicates what is already on screen.

## Resolution

`useNotificationStore()` resolves in this order:

1. If called inside a Vue component's `setup` (or `app.runWithContext()`), it uses `inject(NotificationStoreKey)`.
2. Otherwise it returns a module-level singleton created on first call.

The fallback exists so module-federation remotes and standalone scripts see the same store the host app uses.

## Tips

- **Prefer facades.** Every time you find yourself writing `store.subscribe(...)` inside a blade, you want `useBladeNotifications`. Every time you write `store.setBroadcastFilter(...)`, you want `useBroadcastFilter`. The facades exist to keep cleanup, typing, and invariants in one place.
- **Do not iterate `realtime` for unread counts inside a blade.** That is what `useBladeNotifications` does correctly. Touching `realtime` directly couples your component to shell internals.
- **`loadHistory` replaces, then merges.** Calling it again pages in more entries and merges them with the existing history.
- **`markAllAsRead` is optimistic.** The local state flips immediately; if the server call fails the change is rolled back and an error toast surfaces.
- **Direct store mutations can bypass invariants.** The broadcast filter only runs through `ingest({ broadcast: true })`. Pushing arrays around `history.value` directly is not supported.

## Related

- [useBladeNotifications](./useBladeNotifications.md) — recommended scope-aware subscription. **Start here.**
- [useBroadcastFilter](./useBroadcastFilter.md) — broadcast acceptance gate.
- [useNotificationContext](./useNotificationContext.md) — payload access inside templates.
- [Notifications concept page.](../../concepts/notifications.md)
- [Notifications plugin reference.](../../plugins/notifications.md)
