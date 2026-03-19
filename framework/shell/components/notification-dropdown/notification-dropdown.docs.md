# NotificationDropdown

Dropdown panel that displays the push notification history in reverse chronological order. This component renders a scrollable list of all received push notifications, backed by the `useNotifications()` composable. It automatically marks unread notifications as read when the dropdown is closed (unmounted), updating the unread badge count in the toolbar.

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

This component has no props. Notification data comes from the shared notification store via `useNotifications()`.

## Recipe: Notification Bell with Unread Badge

The typical integration pattern pairs a toolbar button with the dropdown:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { NotificationDropdown, useNotifications } from "@vc-shell/framework";

const { notifications, unreadCount } = useNotifications();
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
import { useNotifications } from "@vc-shell/framework";
import { PushNotification } from "@vc-shell/framework";

const { addNotification } = useNotifications();

addNotification(
  new PushNotification({
    id: "order-123",
    notifyType: "OrderCreated",
    title: "New order received",
    description: "Order #123 placed by customer.",
    isNew: true,
    created: new Date(),
  }),
);
```

### Custom notification templates

Provide custom templates via the `NotificationTemplatesKey` injection key to render domain-specific notification layouts based on `notifyType`. This allows each module to define how its notifications look:

```ts
import { provide } from "vue";
import { NotificationTemplatesKey } from "@vc-shell/framework";
import OrderNotification from "./OrderNotification.vue";
import ImportNotification from "./ImportNotification.vue";

provide(NotificationTemplatesKey, {
  OrderCreated: OrderNotification,
  OrderStatusChanged: OrderNotification,
  CatalogImportCompleted: ImportNotification,
});
```

When a notification's `notifyType` matches a registered template key, that component is rendered instead of the default `NotificationTemplate`.

## Details

- **Unread tracking**: Notifications have an `isNew` flag. When the dropdown is mounted, it displays all notifications. On unmount (dropdown closes), all visible notifications are marked as read (`isNew = false`), which updates the unread badge count.
- **Reverse chronological order**: Notifications are displayed newest-first, sorted by their `created` timestamp.
- **SignalR integration**: Push notifications arrive via SignalR from the VirtoCommerce Platform. The `useNotifications()` composable manages the SignalR connection and notification store.
- **Scroll behavior**: The notification list is scrollable with a fixed maximum height to prevent the dropdown from growing beyond the viewport.

## Tips

- The dropdown shows all notifications, not just unread ones. Read notifications appear with reduced visual emphasis.
- To clear the notification history, use `useNotifications().clearAll()`.
- For background task progress (e.g., catalog import), notifications include `progressValue` and `isRunning` fields. The `NotificationTemplate` can render a progress bar when these are present.
- The dropdown does not poll for new notifications -- they arrive in real time via SignalR. If the connection drops, a reconnection is attempted automatically.

## Related Components

- [NotificationTemplate](../notification-template/notification-template.docs.md) -- base template for each notification row
- [Notifications](../notifications/notifications.docs.md) -- toast notification system (different from push notifications)
