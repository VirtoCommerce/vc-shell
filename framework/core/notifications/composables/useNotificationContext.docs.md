---
title: useNotificationContext
category: composables
group: notifications
---

# useNotificationContext

Reads the current `PushNotification` payload inside a custom notification template. The framework provides the message via Vue's `inject()` from the dropdown or toast surface that hosts the template — the composable returns a reactive `ComputedRef` over it.

This is the one piece you write when a notification type registered with `defineAppModule({ notifications: { Type: { template } } })` needs a richer rendering than the default `NotificationTemplate` chrome — for example, formatting a domain-specific status, deriving a colored accent, or wiring a click handler that opens the relevant blade.

## When to use

- Implementing the `template` component for a notification type registered through `defineAppModule({ notifications })`.
- Reading typed payload fields (status, entity name, job id) to drive the template's layout, color, or actions.
- When NOT to use: anywhere outside a notification template. The composable throws if the inject context is not present.

## Quick Start

```vue
<script lang="ts" setup>
import { PushNotification, NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import { computed } from "vue";

interface IOrderPushNotification extends PushNotification {
  orderId: string;
  total: number;
}

const notificationRef = useNotificationContext<IOrderPushNotification>();
const notification = computed(() => notificationRef.value);
</script>

<template>
  <NotificationTemplate
    :title="notification.title ?? ''"
    :notification="notification"
  >
    <p>Order {{ notification.orderId }} — ${{ notification.total }}</p>
  </NotificationTemplate>
</template>
```

## API

### Parameters

None. The composable is always called without arguments. Generic type parameter narrows the payload shape:

```typescript
function useNotificationContext<T extends PushNotification = PushNotification>(): ComputedRef<T>;
```

### Returns

`ComputedRef<T>` — reactive reference to the current `PushNotification` (or your extended subtype via the generic). Update reactively if the same template instance is reused for a refreshed payload (for example, when a progress message is updated through `notification.update`).

## Common patterns

### Compute display strings from payload fields

```vue
<script lang="ts" setup>
import { PushNotification, useNotificationContext, NotificationTemplate } from "@vc-shell/framework";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProductPush extends PushNotification {
  productName?: string;
  newStatus?: string;
}

const ctx = useNotificationContext<IProductPush>();
const notification = computed(() => ctx.value);
const { t } = useI18n({ useScope: "global" });

const title = computed(() => (notification.value.productName ? `${t("PRODUCTS.PUSH.PRODUCT")} "${notification.value.productName}" ${t("PRODUCTS.PUSH.UPDATE")}` : (notification.value.title ?? "")));
</script>
```

### Open a blade on click

```vue
<script lang="ts" setup>
import { useBlade, useNotificationContext, NotificationTemplate } from "@vc-shell/framework";
import { computed } from "vue";

const { openBlade } = useBlade();
const ctx = useNotificationContext<IOrderPush>();
const notification = computed(() => ctx.value);

function onClick() {
  if (!notification.value.orderId) return;
  openBlade({ name: "OrderDetails", param: notification.value.orderId });
}
</script>

<template>
  <NotificationTemplate
    :title="notification.title ?? ''"
    :notification="notification"
    @click="onClick"
  >
    <p>{{ notification.description }}</p>
  </NotificationTemplate>
</template>
```

`NotificationTemplate` re-emits the click event so the host (dropdown row, toast) can close itself before your handler runs.

### Color the template by status

```ts
const notificationStyle = computed(() => {
  switch (notification.value.newStatus) {
    case "Approved":
      return { color: "var(--success-400)", icon: "lucide-check-circle" };
    case "RequestChanges":
      return { color: "var(--danger-400)", icon: "lucide-alert-circle" };
    case "WaitForApproval":
      return { color: "var(--warning-600)", icon: "lucide-clock" };
    default:
      return { color: "var(--primary-400)", icon: "lucide-bell" };
  }
});
```

`NotificationTemplate` accepts `:color` and `:icon` props that line up with these computeds — the dropdown row and the toast use the same template, so the styling stays consistent across surfaces.

## Where the template runs

Notification templates render in two places:

- **In the bell dropdown**, as one row in the history list.
- **As a toast**, when the type's `toast.mode` is `"auto"` or `"progress"` (set the mode to `"silent"` to render only in the dropdown).

The template component must be **the same** in both — register it once on `defineAppModule({ notifications })` and the framework reuses it everywhere.

## Tips

- **Always type the generic.** `useNotificationContext<MyPushType>()` enables autocompletion on payload fields. Without it everything degrades to `PushNotification`.
- **`computed(() => ctx.value)` is idiomatic** in the example apps because consumers want a regular `Ref` shape to pass into child components and template bindings. Direct access via `ctx.value` is fine too.
- **Do not subscribe inside a template.** The template renders one message; if you need to react to other notifications, do that in a blade with `useBladeNotifications`.

## Related

- [useBladeNotifications](./useBladeNotifications.md) — subscribe to types inside a blade.
- [useNotificationStore](./useNotificationStore.md) — access the underlying store.
- [Notifications concept page.](../../concepts/notifications.md)
