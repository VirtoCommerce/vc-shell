# NotificationTemplate

Base template for rendering a single push notification with title, relative timestamp, optional icon, and a default slot for extra detail content.

## When to Use

- Use as the base layout when building custom notification templates for specific `notifyType` values
- Use inside the notification dropdown to render individual notification rows
- Do NOT use for toast/snackbar messages

## Basic Usage

```vue
<script setup lang="ts">
import { NotificationTemplate } from "@vc-shell/framework";
import type { IPushNotification } from "@vc-shell/framework";

const props = defineProps<{
  notification: IPushNotification;
}>();
</script>

<template>
  <NotificationTemplate
    :title="notification.title ?? ''"
    :notification="notification"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | -- | Notification headline text |
| `notification` | `IPushNotification` | -- | Full notification object (required for timestamp) |
| `icon` | `string` | `undefined` | Icon name displayed in a circular badge |
| `color` | `string` | `undefined` | Background color for the icon badge |
| `severity` | `string` | `undefined` | Semantic severity level |

## Common Patterns

### Custom template with detail slot

```vue
<NotificationTemplate
  :title="notification.title ?? ''"
  :notification="notification"
  icon="lucide-package"
  color="var(--success-500)"
>
  <p>Order #{{ notification.description }} shipped successfully.</p>
</NotificationTemplate>
```

## Related Components

- [NotificationDropdown](../notification-dropdown/notification-dropdown.docs.md) -- parent dropdown container
