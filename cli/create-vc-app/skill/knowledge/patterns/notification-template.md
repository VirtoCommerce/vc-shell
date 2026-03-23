# Notification Template Pattern

Push notifications are displayed in the notification dropdown. Each notification type maps to a Vue SFC template component that receives the notification data via `useNotificationContext()` — a composable backed by `provide/inject`.

> **v1 note**: The generator does not produce notification files. This pattern is reference-only for developers extending the generated module manually.

---

## How it works

1. The framework provides the current notification via `NotificationContextKey` (an injection key)
2. The template component calls `useNotificationContext()` to receive it as a `ComputedRef`
3. The component renders `<NotificationTemplate>` with the notification data and custom styling
4. The notification type is registered in the module's `index.ts` under `notifications:`

---

## Template Component

```vue
<template>
  <NotificationTemplate
    :color="style.color"
    :title="notification.title ?? ''"
    :icon="style.icon"
    :notification="notification"
  >
    <VcHint v-if="notification.description" class="tw-mb-1">
      {{ notification.description }}
    </VcHint>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import { computed } from "vue";

const notificationRef = useNotificationContext();
const notification = computed(() => notificationRef.value);

const style = {
  color: "var(--success-400)",
  icon: "lucide-check",
};
</script>
```

### `NotificationTemplate` props

| Prop           | Type            | Description                                      |
|----------------|-----------------|--------------------------------------------------|
| `title`        | `string`        | Notification title text                          |
| `notification` | `IPushNotification` | Full notification object (for timestamp display) |
| `icon`         | `string`        | Lucide icon name, e.g., `"lucide-check"`         |
| `color`        | `string`        | CSS color or variable for the icon background    |

The default slot renders below the title/timestamp row. Use it for additional details.

### Icon + color conventions

| Event type    | Color                       | Icon                    |
|---------------|-----------------------------|-------------------------|
| Created       | `var(--success-400)`        | `lucide-check`          |
| Updated       | `var(--primary-500)`        | `lucide-pencil`         |
| Deleted       | `var(--danger-500)`         | `lucide-trash-2`        |
| Error/Failed  | `var(--danger-500)`         | `lucide-x-circle`       |
| Processing    | `var(--warning-400)`        | `lucide-loader`         |

---

## Typed Notifications

Extend `PushNotification` to add domain-specific fields:

```ts
import type { PushNotification } from "@vc-shell/framework";

interface IOrderNotification extends PushNotification {
  orderId?: string;
  orderNumber?: string;
}
```

Then use the generic overload of `useNotificationContext`:

```ts
const notificationRef = useNotificationContext<IOrderNotification>();
const notification = computed(() => notificationRef.value);

// notification.value.orderId is now typed
```

Full typed template example:

```vue
<template>
  <NotificationTemplate
    :color="style.color"
    :title="notification.title ?? ''"
    :icon="style.icon"
    :notification="notification"
  >
    <VcHint v-if="notification.orderId" class="tw-mb-1">
      Order #{{ notification.orderNumber }}
    </VcHint>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import type { PushNotification } from "@vc-shell/framework";
import { computed } from "vue";

interface IOrderNotification extends PushNotification {
  orderId?: string;
  orderNumber?: string;
}

const notificationRef = useNotificationContext<IOrderNotification>();
const notification = computed(() => notificationRef.value);

const style = { color: "var(--success-400)", icon: "lucide-check" };
</script>
```

---

## Registration in module `index.ts`

```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";
import XxxCreatedDomainEvent from "./notifications/XxxCreatedDomainEvent.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    XxxCreatedDomainEvent: {
      template: XxxCreatedDomainEvent,
      toast: { mode: "auto" },
    },
  },
});

export * from "./pages";
export * from "./composables";
```

- The **key** (`XxxCreatedDomainEvent`) must match the notification type string sent by the backend
- `toast: { mode: "auto" }` — the framework decides whether to show a toast based on whether the notification drawer is open

---

## notifications/ directory structure

```
src/modules/xxx/
└── notifications/
    ├── index.ts
    └── XxxCreatedDomainEvent.vue
```

`notifications/index.ts` barrel:
```ts
export { default as XxxCreatedDomainEvent } from "./XxxCreatedDomainEvent.vue";
```

---

## Key Rules

1. **Use `useNotificationContext()`** — do NOT receive the notification via component props. The framework injects it.
2. **`useNotificationContext()` throws** if called outside a notification template context (not inside the notification renderer).
3. **`notificationRef` is a `ComputedRef`** — wrap it in `computed(() => notificationRef.value)` before accessing fields to maintain reactivity.
4. **Notification keys are case-sensitive** — the key in `notifications: { ... }` must exactly match the domain event type name from the backend.
