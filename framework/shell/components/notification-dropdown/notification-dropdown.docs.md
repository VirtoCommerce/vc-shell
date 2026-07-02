---
title: NotificationDropdown
category: composables
group: utilities
internal: true
---

# NotificationDropdown

> **Note:** `useNotifications()` is deprecated (it logs a dev warning). Use `useBladeNotifications()` for blade-scoped subscriptions, or `useNotificationStore()` for direct store access — an advanced escape hatch that most apps do not need, since the shell already wires the bell and unread badge. The component itself uses `useNotificationStore()`.

Dropdown panel that displays the push notification history in reverse chronological order. This component renders a scrollable list of all received push notifications, backed by the `useNotificationStore()`. It automatically marks unread notifications as read when the dropdown is closed (unmounted), updating the unread badge count in the toolbar.

The dropdown is designed for persistent notification history (server-side push notifications via SignalR), not for transient toast messages.

## When to Use

- Use as the notification popover content in the shell header/toolbar
- When you need to display a scrollable list of recent push notifications
- Do NOT use for toast-style transient notifications (use `notification()` instead)

## Basic Usage

```vue
<script setup lang="ts">
import { NotificationDropdown } from "@vc-shell/framework";
</script>

<template>
  <NotificationDropdown />
</template>
```

## Key Props

This component has no props. Notification data comes from the shared notification store via `useNotificationStore()` — the same store the shell's bell is wired to.

## Recipe: Notification Bell with Unread Badge

> **Advanced — most apps do not need this.** The standard `VcApp` shell already renders the bell, dropdown, and unread badge. Build your own only in a custom shell that replaces the shell chrome. To _react_ to notifications inside a blade, use [`useBladeNotifications()`](../../../core/notifications/composables/useBladeNotifications.docs.md) instead; its `unreadCount` is scoped to the notify types you subscribe to. For a global count across all types you need the store, as shown here.

A custom bell pairs a toolbar button with the dropdown and reads the global unread count from the store:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { NotificationDropdown, useNotificationStore } from "@vc-shell/framework";

const store = useNotificationStore();
const unreadCount = computed(() => store.unreadCount.value);
const isOpen = ref(false);
</script>

<template>
  <div class="tw-relative">
    <button @click="isOpen = !isOpen">
      <VcIcon icon="lucide-bell" />
      <span
        v-if="unreadCount > 0"
        class="tw-absolute tw-top-0 tw-right-0 tw-bg-red-500 tw-text-white tw-rounded-full tw-text-xs tw-px-1"
      >
        {{ unreadCount }}
      </span>
    </button>

    <NotificationDropdown v-if="isOpen" />
  </div>
</template>
```

## Common Patterns

### Seeding notifications programmatically

For testing or injecting client-side notifications:

```ts
import { useNotificationStore } from "@vc-shell/framework";
import type { PushNotification } from "@vc-shell/framework";

const store = useNotificationStore();

store.ingest({
  id: "order-123",
  notifyType: "OrderCreated",
  title: "New order received",
  description: "Order #123 placed by customer.",
  isNew: true,
  created: new Date(),
} as PushNotification);
```

### Custom notification templates

Register custom templates through the module `notifications` config to render domain-specific notification layouts keyed by `notifyType`. Each module defines how its own notifications look:

```ts
import { defineAppModule } from "@vc-shell/framework";
import OrderNotification from "./OrderNotification.vue";
import ImportNotification from "./ImportNotification.vue";

export default defineAppModule({
  notifications: {
    OrderCreated: { template: OrderNotification, toast: { mode: "auto" } },
    OrderStatusChanged: { template: OrderNotification, toast: { mode: "auto" } },
    CatalogImportCompleted: { template: ImportNotification, toast: { mode: "auto" } },
  },
});
```

When a notification's `notifyType` matches a registered template, that component is rendered instead of the default `NotificationTemplate`. See [NotificationTemplate](../notification-template/notification-template.docs.md) for the full recipe.

## Details

- **Unread tracking**: Notifications have an `isNew` flag. When the dropdown is mounted, it displays all notifications. On unmount (dropdown closes), all visible notifications are marked as read (`isNew = false`), which updates the unread badge count.
- **Reverse chronological order**: Notifications are displayed newest-first, sorted by their `created` timestamp.
- **SignalR integration**: Push notifications arrive via SignalR from the VirtoCommerce Platform, delivered by the `signalR` plugin and ingested into the notification store; the dropdown renders from that store.
- **Scroll behavior**: The notification list is scrollable with a fixed maximum height to prevent the dropdown from growing beyond the viewport.

## Tips

- The dropdown shows all notifications, not just unread ones. Read notifications appear with reduced visual emphasis.
- There is no clear-history API. `useNotificationStore()` exposes `markAllAsRead()` (flip everything to read) and `loadHistory(take?)` (reload the latest page from the server); neither deletes history.
- For background task progress (e.g., catalog import), the progress/completion concept keys off a `finished` flag on the notification payload. When a type is configured with a progress toast (`toast: { mode: "progress" }`), `ToastConfig.isComplete` reads that flag (default `(msg) => !!msg.finished`) to decide when the operation is done.
- The dropdown does not poll for new notifications -- they arrive in real time via SignalR. If the connection drops, a reconnection is attempted automatically.

## Related Components

- [NotificationTemplate](../notification-template/notification-template.docs.md) -- base template for each notification row
- [Notifications](../../../core/notifications/notifications.docs.md) -- push notification system (store, registration, blade-scoped subscriptions)
