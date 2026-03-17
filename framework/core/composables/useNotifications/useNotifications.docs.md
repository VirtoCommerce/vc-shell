# useNotifications

Provides access to the push-notification system: reading notification history, filtering by type, marking as read, and registering handlers for real-time notifications.

**Deprecated**: Use `useBladeNotifications()` for blade-level subscriptions or `useNotificationStore()` for direct store access.

## When to Use

- Legacy code that needs to subscribe to specific notification types and handle them
- When NOT to use: in new code, prefer `useBladeNotifications()` which integrates with blade lifecycle

## Basic Usage

```typescript
import { useNotifications } from '@vc-shell/framework';

const {
  notifications,
  moduleNotifications,
  loadFromHistory,
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotificationHandler,
} = useNotifications('OrderChanged');
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notifyType` | `string \| string[]` | No | Notification type(s) to subscribe to. Omit for all notifications. |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `notifications` | `ComputedRef<PushNotification[]>` | All notification history, sorted newest first |
| `moduleNotifications` | `ComputedRef<PushNotification[]>` | New real-time notifications matching the subscribed types |
| `loadFromHistory` | `(take?: number) => Promise<void>` | Loads notification history from the server |
| `addNotification` | `(message: PushNotification) => void` | Manually ingests a notification into the store |
| `markAsRead` | `(message: PushNotification) => void` | Marks a single notification as read |
| `markAllAsRead` | `() => void` | Marks all notifications as read |
| `setNotificationHandler` | `(handler: (notification: PushNotification) => void) => void` | Registers a callback for incoming real-time notifications matching subscribed types |

## Common Patterns

### Reacting to order changes

```vue
<script setup lang="ts">
import { useNotifications } from '@vc-shell/framework';
import { onMounted } from 'vue';

const { moduleNotifications, loadFromHistory, setNotificationHandler } =
  useNotifications('OrderStatusChanged');

setNotificationHandler((notification) => {
  console.log('Order updated:', notification);
});

onMounted(() => loadFromHistory(50));
</script>
```

## Related

- [useBladeNotifications](../useBladeNotifications/) -- preferred replacement with blade lifecycle integration
- `useNotificationStore()` -- direct Pinia-based store access
