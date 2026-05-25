---
title: useBroadcastFilter
category: composables
group: notifications
---

# useBroadcastFilter

Controls which **broadcast** push notifications reach the store. The platform SignalR hub delivers messages through two channels: `Send` (targeted to a specific user) and `SendSystemEvents` (broadcast to everyone connected). Broadcasts run through the filter installed here; targeted messages are always accepted.

This is the standard mechanism for scoping a multi-tenant app — show a seller only the broadcasts that mention them, hide events from other tenants. Without a filter every broadcast lands in every user's history.

## When to use

- Multi-tenant apps where the same broadcast topic carries events for different tenants (sellers, organizations, departments) and each user should only see their slice.
- Apps that want to drop noisy `IndexProgressPushNotification` or similar maintenance events for non-admin roles.
- When NOT to use: filtering targeted notifications. The platform already delivers `Send` messages only to the addressed user; `useBroadcastFilter` does not see them.

## Quick Start

```ts
import { useBroadcastFilter, useUser } from "@vc-shell/framework";
import { onMounted } from "vue";

const { user } = useUser();
const { setBroadcastFilter } = useBroadcastFilter();

onMounted(() => {
  setBroadcastFilter((msg) => msg.creator === user.value?.userName);
});
```

Install the filter once at app bootstrap (or whenever the active user changes). Every incoming broadcast is run through it; messages that return `false` are dropped before they touch history, toasts, or subscribers.

## API

### Returns

```typescript
interface UseBroadcastFilterReturn {
  setBroadcastFilter(fn: (msg: PushNotification) => boolean): void;
  clearBroadcastFilter(): void;
}
```

| Method                 | Type                                           | Description                                                                               |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `setBroadcastFilter`   | `((msg: PushNotification) => boolean) => void` | Install the filter. Replaces any previous filter — there is at most one active at a time. |
| `clearBroadcastFilter` | `() => void`                                   | Remove the filter. All subsequent broadcasts are accepted.                                |

The filter returns `true` to **accept** a message, `false` to **drop** it.

## Common patterns

### Scope by current user

```ts
onMounted(() => {
  setBroadcastFilter((msg) => msg.creator === user.value?.userName);
});
```

`creator` is the user that originated the event on the platform side. This is the canonical "show me my own broadcasts" filter used in the vendor portal.

### Scope by tenant id

```ts
onMounted(() => {
  setBroadcastFilter((msg) => (msg as TenantPush).sellerId === currentSellerId.value);
});
```

When your broadcast payloads carry a tenant id, gate on it instead of `creator`. The cast clarifies typing without expanding `PushNotification` for every caller.

### Re-install on user switch

```ts
import { watch } from "vue";

watch(
  () => user.value?.userName,
  (name) => {
    if (!name) clearBroadcastFilter();
    else setBroadcastFilter((msg) => msg.creator === name);
  },
  { immediate: true },
);
```

If the app supports user switching without a full reload (impersonation, multi-account), re-install the filter on every change. There is only one slot — installing again replaces the previous filter.

### Drop a noisy type entirely

```ts
setBroadcastFilter((msg) => msg.notifyType !== "IndexProgressPushNotification");
```

Broadcast-only suppression. To suppress targeted messages too, set `toast: false` or `toast: { mode: "silent" }` on the type's `defineAppModule({ notifications })` config — that controls the toast surface; the history still records the event.

## Behavior

- The filter applies only to messages ingested with the `broadcast: true` flag (the SignalR `SendSystemEvents` channel).
- Targeted messages (`Send`) bypass the filter entirely.
- Installing a filter mid-session does not retroactively prune `history` or `realtime`. Past broadcasts stay; only future ones are filtered.
- The filter is a single function. To compose multiple predicates, `&&` them inside one callback.

## Tips

- **Install once, early.** Setting the filter in `App.vue` `onMounted` (after authentication) is the canonical placement, so messages arriving before the first blade mounts are already scoped.
- **Filter exceptions go straight to the console.** If your predicate throws, the message is dropped. Wrap the logic if you are reading off potentially missing fields.
- **Do not query the store from inside the filter.** The store is `useBroadcastFilter`'s parent — calling back into it during ingestion causes re-entrancy.

## Related

- [useNotificationStore](./useNotificationStore.md) — exposes the same set/clear methods plus the rest of the store API.
- [useBladeNotifications](./useBladeNotifications.md) — blade-scoped subscription that sees broadcasts after filtering.
- [Notifications concept page — broadcasts.](../../concepts/notifications.md#broadcast-vs-targeted)
