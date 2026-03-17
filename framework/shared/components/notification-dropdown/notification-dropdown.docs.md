# NotificationDropdown

Dropdown panel that displays the push notification history in reverse chronological order. Backed by `useNotifications()` and automatically marks unread notifications as read on unmount.

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

This component has no props. Notification data comes from the shared notification store.

## Common Patterns

### Seeding notifications programmatically

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

Provide custom templates via the `NotificationTemplatesKey` injection key to render domain-specific notification layouts based on `notifyType`.

## Related Components

- [NotificationTemplate](../notification-template/notification-template.docs.md) -- base template for each notification row
