# useNotifications

Provides access to the push-notification system: reading notification history, filtering by type, marking as read, and registering handlers for real-time notifications. This composable wraps the Pinia-based `useNotificationStore` and adds type-based filtering and subscription management. It subscribes to specific notification types via the store's pub/sub system and automatically unsubscribes when the component scope is disposed.

**Deprecated**: Use `useBladeNotifications()` for blade-level subscriptions or `useNotificationStore()` for direct store access. This composable remains for backward compatibility but emits a deprecation warning in development mode.

## When to Use

- Legacy code that needs to subscribe to specific notification types and handle them with a callback
- Quick prototyping where you want to react to real-time notifications without the blade lifecycle
- When NOT to use: in new code, prefer `useBladeNotifications()` which integrates with blade lifecycle and provides automatic cleanup, or `useNotificationStore()` for direct Pinia access

## Quick Start

```typescript
import { useNotifications } from '@vc-shell/framework';

// Subscribe to specific notification types
const {
  notifications,
  moduleNotifications,
  loadFromHistory,
  markAsRead,
  markAllAsRead,
  setNotificationHandler,
} = useNotifications('OrderStatusChanged');

// Register a handler for real-time notifications
setNotificationHandler((notification) => {
  console.log('Order status changed:', notification);
  refreshOrderList();
});

// Load historical notifications on mount
onMounted(() => loadFromHistory(50));
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notifyType` | `string \| string[]` | No | Notification type(s) to subscribe to (e.g., `'OrderStatusChanged'` or `['OrderCreated', 'OrderCancelled']`). Omit to receive all notifications. |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `notifications` | `ComputedRef<PushNotification[]>` | All notification history, sorted newest first. Includes both read and unread. |
| `moduleNotifications` | `ComputedRef<PushNotification[]>` | New real-time notifications matching the subscribed types. Only includes items where `isNew` is `true`. |
| `loadFromHistory` | `(take?: number) => Promise<void>` | Loads notification history from the server. `take` controls how many to fetch. |
| `addNotification` | `(message: PushNotification) => void` | Manually ingests a notification into the store (e.g., for testing or synthetic events). |
| `markAsRead` | `(message: PushNotification) => void` | Marks a single notification as read. |
| `markAllAsRead` | `() => void` | Marks all notifications as read. |
| `setNotificationHandler` | `(handler: (notification: PushNotification) => void) => void` | Registers a callback for incoming real-time notifications matching subscribed types. Only one handler per composable instance. |

## How It Works

1. **Subscription**: If `notifyType` is provided, the composable calls `store.subscribe({ types, handler })` to register for those notification types. The subscription returns an `unsub` function.

2. **Handler dispatch**: When a real-time notification arrives that matches the subscribed types, the store calls the handler. The composable forwards this to whatever function was registered via `setNotificationHandler`.

3. **Cleanup**: If the composable is called inside an effect scope (which it always is inside a component), `onScopeDispose` automatically calls the `unsub` function.

4. **Module notifications**: The `moduleNotifications` computed filters the store's real-time queue for items that are new (`isNew: true`) and match the subscribed types.

5. **History**: `loadFromHistory` delegates to the store, which fetches from the platform API and merges into the local history.

## Recipe: Notification Panel with Real-Time Updates

```vue
<script setup lang="ts">
import { useNotifications } from '@vc-shell/framework';
import { onMounted } from 'vue';

const {
  notifications,
  moduleNotifications,
  loadFromHistory,
  markAsRead,
  markAllAsRead,
  setNotificationHandler,
} = useNotifications(['OrderCreated', 'OrderStatusChanged', 'OrderCancelled']);

// Play a sound on new notifications
setNotificationHandler((notification) => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch(() => {});
});

onMounted(() => loadFromHistory(100));
</script>

<template>
  <div class="notification-panel">
    <div class="tw-flex tw-justify-between tw-items-center tw-p-2">
      <span class="tw-font-semibold">
        Notifications ({{ moduleNotifications.length }} new)
      </span>
      <VcButton size="sm" variant="ghost" @click="markAllAsRead">
        Mark all read
      </VcButton>
    </div>

    <div v-for="item in notifications" :key="item.id" class="tw-p-2 tw-border-b">
      <div class="tw-flex tw-justify-between">
        <span :class="{ 'tw-font-bold': item.isNew }">
          {{ item.title }}
        </span>
        <VcButton
          v-if="item.isNew"
          size="xs"
          variant="ghost"
          @click="markAsRead(item)"
        >
          Mark read
        </VcButton>
      </div>
      <p class="tw-text-sm tw-text-gray-500">{{ item.description }}</p>
    </div>
  </div>
</template>
```

## Recipe: Auto-Refresh Data on Notification

```vue
<script setup lang="ts">
import { useNotifications } from '@vc-shell/framework';
import { onMounted } from 'vue';

const { setNotificationHandler } = useNotifications('InventoryChanged');

const items = ref<InventoryItem[]>([]);

async function refreshInventory() {
  items.value = await api.getInventory();
}

// Automatically refresh when inventory changes
setNotificationHandler(() => {
  refreshInventory();
});

onMounted(refreshInventory);
</script>
```

## Tips

- **Deprecation warning in dev mode.** When you call `useNotifications()`, a warning is logged in development mode pointing you to `useBladeNotifications()`. This is informational only and does not affect functionality.
- **Only one handler per instance.** Calling `setNotificationHandler` a second time replaces the previous handler. If you need multiple handlers, orchestrate them in a single callback function.
- **`moduleNotifications` only shows new items.** Once a notification is marked as read, it disappears from `moduleNotifications` but remains in `notifications` (the full history).
- **Type filtering is case-sensitive.** The `notifyType` string must exactly match the notification's `notifyType` field from the platform. Common types include `'OrderStatusChanged'`, `'IndexationProgress'`, etc.
- **No types means no `moduleNotifications`.** If you omit the `notifyType` parameter, `moduleNotifications` is always an empty array. Use `notifications` for the full unfiltered history.

## Related

- [useBladeNotifications](../useBladeNotifications/) -- preferred replacement with blade lifecycle integration
- `useNotificationStore()` -- direct Pinia-based store access for full control
- `MIGRATION_GUIDE.md#notifications` -- migration guide from useNotifications to useBladeNotifications
