# NotificationTemplate

Base template for rendering a single push notification with title, relative timestamp, optional icon, and a default slot for extra detail content. This component provides the standard layout that all notification types share, while allowing domain-specific content to be injected through the default slot.

The template displays the notification title, a "time ago" timestamp (e.g., "3 minutes ago"), and optionally a colored icon badge. Custom notification templates extend this base by wrapping it and filling the slot with type-specific content like progress bars, action buttons, or entity links.

## When to Use

- Use as the base layout when building custom notification templates for specific `notifyType` values
- Use inside the notification dropdown to render individual notification rows
- Do NOT use for toast/snackbar messages (use the `notification()` function instead)

## Basic Usage

```vue
<script setup lang="ts">
import { NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import { computed } from "vue";

const notificationRef = useNotificationContext();
const notification = computed(() => notificationRef.value);
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

## Recipe: Custom Notification for Order Events

Create a domain-specific notification template that extends the base with order details:

```vue
<!-- OrderNotification.vue -->
<script setup lang="ts">
import { NotificationTemplate, useNotificationContext, useBlade } from "@vc-shell/framework";
import type { PushNotification } from "@vc-shell/framework";
import { computed } from "vue";

interface IOrderNotification extends PushNotification {
  orderId?: string;
}

const notificationRef = useNotificationContext<IOrderNotification>();
const notification = computed(() => notificationRef.value);
const { openBlade } = useBlade();

function openOrderBlade(orderId: string) {
  openBlade({ name: "OrderDetails", param: orderId });
}
</script>

<template>
  <NotificationTemplate
    :title="notification.title ?? 'Order Update'"
    :notification="notification"
    icon="lucide-shopping-cart"
    color="var(--primary-500)"
  >
    <div class="tw-text-sm tw-text-gray-600">
      <p>{{ notification.description }}</p>
      <a
        v-if="notification.orderId"
        class="tw-text-blue-500 tw-underline"
        @click="openOrderBlade(notification.orderId)"
      >
        View order details
      </a>
    </div>
  </NotificationTemplate>
</template>
```

Then register the template in your module so the notification dropdown uses it for order-related notifications:

```ts
import OrderNotification from "./notifications/OrderNotification.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    OrderCreated: {
      template: OrderNotification,
      toast: { mode: "auto" },
    },
    OrderStatusChanged: {
      template: OrderNotification,
      toast: { mode: "auto" },
    },
  },
});
```

## Recipe: Progress Notification for Long-Running Tasks

For background tasks like catalog imports, show a progress bar inside the notification:

```vue
<!-- ImportNotification.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { NotificationTemplate, useNotificationContext } from "@vc-shell/framework";

const notificationRef = useNotificationContext();
const notification = computed(() => notificationRef.value);

const progress = computed(() => (notification.value as any).progressValue ?? 0);
const isRunning = computed(() => (notification.value as any).isRunning ?? false);
</script>

<template>
  <NotificationTemplate
    :title="notification.title ?? 'Import'"
    :notification="notification"
    icon="lucide-upload"
    color="var(--info-500)"
  >
    <div v-if="isRunning" class="tw-mt-1">
      <div class="tw-h-2 tw-bg-gray-200 tw-rounded">
        <div
          class="tw-h-full tw-bg-blue-500 tw-rounded tw-transition-all"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <span class="tw-text-xs tw-text-gray-500">{{ progress }}% complete</span>
    </div>
    <p v-else class="tw-text-sm tw-text-green-600">Import completed.</p>
  </NotificationTemplate>
</template>
```

## Details

- **Relative timestamps**: The template displays the time elapsed since the notification was created using a "time ago" format (e.g., "2 minutes ago", "1 hour ago"). This updates reactively.
- **Icon badge**: When the `icon` prop is provided, it renders in a small circular badge with the specified `color` background. This helps users quickly identify notification types visually.
- **Default slot**: The slot content appears below the title and timestamp, providing space for description text, progress indicators, action links, or any custom content.
- **Unread indicator**: New (unread) notifications have a subtle visual indicator (e.g., a dot or bold title) to distinguish them from read notifications.

## Tips

- Use `useNotificationContext()` to access notification data. No props needed — the renderer provides the notification automatically.
- Use CSS custom property values for the `color` prop (e.g., `var(--success-500)`) to stay consistent with the active theme.
- The `severity` prop can be used to apply predefined color schemes without specifying a custom `color`.
- When creating custom templates, keep the slot content concise. The notification dropdown shows many items in a scrollable list, and overly tall notifications push others out of view.

## Related Components

- [NotificationDropdown](../notification-dropdown/notification-dropdown.docs.md) -- parent dropdown container
- [Notifications](../notifications/notifications.docs.md) -- toast notification system (different from push notifications)
