# SignalR Notifications Pattern

Real-time push notifications from the VirtoCommerce platform to vc-shell modules via SignalR WebSocket transport.

---

## Notification Flow

```
Platform backend
  |  (domain event fires)
  v
ASP.NET SignalR hub  (/pushNotificationHub)
  |
  +-- "Send" channel          (broadcast to all clients)
  +-- "SendSystemEvents"      (filtered by creator ID)
  |
  v
SignalR plugin (framework auto-installed)
  |
  v
NotificationStore.ingest(message)
  |
  +---> history[]              (persistent, loaded from API)
  +---> realtime[]             (session-only, from SignalR)
  +---> ToastController        (Level 1: module-level toasts)
  +---> subscriber callbacks   (Level 2: blade-scoped handlers)
```

The SignalR plugin connects on login, disconnects on logout, and auto-reconnects on connection loss. Module developers never interact with SignalR directly.

---

## Step 1: Create a Notification Template

Each notification type can have a custom Vue SFC that controls how it renders in the dropdown and toasts. The component receives its data via `useNotificationContext()`, not props.

```vue
<!-- notifications/OrderShippedEvent.vue -->
<template>
  <NotificationTemplate
    :color="color"
    :title="notification.title ?? ''"
    :icon="'lucide-truck'"
    :notification="notification"
    @click="onClick"
  >
    <VcHint
      v-if="notification.description"
      class="tw-mb-1"
    >
      {{ notification.description }}
    </VcHint>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { NotificationTemplate, useNotificationContext, useBlade } from "@vc-shell/framework";
import type { PushNotification } from "@vc-shell/framework";
import { computed } from "vue";

interface IOrderShippedNotification extends PushNotification {
  orderId?: string;
  trackingNumber?: string;
}

const notificationRef = useNotificationContext<IOrderShippedNotification>();
const notification = computed(() => notificationRef.value);

const color = computed(() => (notification.value.trackingNumber ? "var(--success-400)" : "var(--primary-500)"));

const { openBlade } = useBlade();

async function onClick() {
  await openBlade({ name: "OrderDetails", param: notification.value.orderId });
}
</script>
```

### `NotificationTemplate` props

| Prop           | Type               | Description                                   |
| -------------- | ------------------ | --------------------------------------------- |
| `title`        | `string`           | Notification title text                       |
| `notification` | `PushNotification` | Full notification object (used for timestamp) |
| `icon`         | `string`           | Lucide icon name, e.g. `"lucide-truck"`       |
| `color`        | `string`           | CSS color/variable for the icon circle        |

The default slot renders below the title/timestamp. Use it for description text, progress bars, or action links.

---

## Step 2: Register in the Module

Pass a `notifications` record to `defineAppModule`. Each key must exactly match the `notifyType` string sent by the platform backend.

```ts
// modules/orders/index.ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";
import OrderShippedEvent from "./notifications/OrderShippedEvent.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    OrderShippedEvent: {
      template: OrderShippedEvent,
      toast: { mode: "auto" },
    },
  },
});
```

### Toast configuration

The `toast` object controls how the notification appears as a popup.

| Property        | Type                               | Description                                                                             |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| `mode`          | `"auto" \| "progress" \| "silent"` | `auto` = fire-and-forget; `progress` = persistent until complete; `silent` = no toast   |
| `severity`      | `Severity \| (msg) => Severity`    | Static or dynamic: `"info"`, `"warning"`, `"error"`, `"critical"`                       |
| `timeout`       | `number`                           | Override default timeout (ms). Defaults: info=5s, warning=8s, error/critical=persistent |
| `isComplete`    | `(msg) => boolean`                 | For `"progress"` mode: returns true when the operation finishes                         |
| `completedType` | `(msg) => string`                  | For `"progress"` mode: final toast variant (`"success"` or `"error"`)                   |

#### Toast mode examples

```ts
// Fire-and-forget toast with default severity (info, 5s timeout)
toast: { mode: "auto" }

// Warning toast with custom timeout
toast: { mode: "auto", severity: "warning", timeout: 8000 }

// Long-running operation with progress tracking
toast: {
  mode: "progress",
  severity: (msg) => msg.finished ? "info" : "warning",
  isComplete: (msg) => !!msg.finished,
  completedType: (msg) => msg.errorCount ? "error" : "success",
}

// No toast -- notification only appears in the dropdown
toast: { mode: "silent" }
```

### `groupBy` option

For notification types that emit multiple messages for the same logical operation (e.g. export progress updates), set `groupBy` to the field name that identifies the operation. The store upserts instead of appending:

```ts
notifications: {
  CatalogExportProgress: {
    template: ExportProgressTemplate,
    toast: { mode: "progress", isComplete: (msg) => !!msg.finished },
    groupBy: "jobId",
  },
}
```

---

## Step 3: React to Notifications in a Blade

Use `useBladeNotifications()` inside `<script setup>` to subscribe to specific notification types. Subscriptions auto-cleanup when the blade unmounts.

```ts
import { useBladeNotifications } from "@vc-shell/framework";

const { messages, unreadCount, markAsRead } = useBladeNotifications({
  types: ["OrderShippedEvent"],
  filter: (msg) => msg.orderId === currentOrderId.value,
  onMessage: (msg) => {
    // Refresh blade data when a relevant notification arrives
    reloadOrder();
  },
});
```

### `useBladeNotifications` API

**Parameters:**

| Field       | Type               | Description                                   |
| ----------- | ------------------ | --------------------------------------------- |
| `types`     | `string[]`         | Notification type(s) to subscribe to          |
| `filter`    | `(msg) => boolean` | Optional: further filter by message fields    |
| `onMessage` | `(msg) => void`    | Callback fired for each matching notification |

**Returns:**

| Field         | Type                  | Description                                      |
| ------------- | --------------------- | ------------------------------------------------ |
| `messages`    | `ComputedRef<T[]>`    | Matching unread messages from the realtime queue |
| `unreadCount` | `ComputedRef<number>` | Count of matching unread messages                |
| `markAsRead`  | `(msg) => void`       | Mark a specific message as read                  |

---

## Directory Structure

```
src/modules/orders/
├── index.ts                          # defineAppModule with notifications
├── notifications/
│   ├── index.ts                      # barrel export
│   └── OrderShippedEvent.vue         # template component
└── pages/
    └── ...
```

`notifications/index.ts` barrel:

```ts
export { default as OrderShippedEvent } from "./OrderShippedEvent.vue";
```

---

## Key Rules

1. **Notification keys are case-sensitive** -- the key in `notifications: { ... }` must exactly match the `notifyType` string from the platform backend.
2. **Use `useNotificationContext()`** inside template components, not props. The framework injects the notification via provide/inject.
3. **Use `useBladeNotifications()`** for blade-level subscriptions (preferred). The deprecated `useNotifications()` still works but logs a warning.
4. **Do not interact with SignalR directly.** The plugin is auto-installed by the framework. Use the notification store and composables instead.
5. **`Send` vs `SendSystemEvents`** -- broadcast notifications use the `Send` channel; user-scoped notifications use `SendSystemEvents` filtered by the `creator` field on the server side.

---

## Related Patterns

- [notification-template](./notification-template.md) -- detailed template component authoring guide
- [module-structure](./module-structure.md) -- overall module layout including notifications directory
