---
title: useWidgetPushAlerts
category: composables
group: blade-navigation
slug: useWidgetPushAlerts
---

# useWidgetPushAlerts

Turns matching push notifications into blade widget alerts. The widget shows a dot on its icon, and hovering the widget lists the alerts in a popup. An alert disappears once the popup has shown it.

The alerts are independent from the notification bell: nothing is marked as read, and reading a notification in the bell does not clear the widget. They live as long as the calling component (or effect scope), so they do not survive closing the blade or reloading the page.

## When to Use

- A widget should react to a push while its blade is open, e.g. "new message on this order", "shipment updated".
- When NOT to use: for problems that already follow from loaded data (out of stock, rejected offer). Compute those alerts from the data with a `computed` instead, so they stay while the problem exists.

## Basic Usage

```typescript
import { useWidgetPushAlerts } from "@vc-shell/framework";

const { alerts } = useWidgetPushAlerts<ShipmentPush>({
  types: ["ShipmentChangedEvent"],
  filter: (m) => m.orderId === order.value?.id,
  toAlert: (m) => ({
    id: m.id!,
    severity: "info",
    text: t("ORDERS.ALERTS.SHIPMENT_UPDATED", { number: m.shipmentNumber }),
    onOpen: () => openBlade({ name: "Shipping", options: { orderId: m.orderId } }),
  }),
});

useBladeWidgets([{ id: "ShippingWidget", icon: "lucide-truck", title: "...", alerts, onClick: openShipping }]);
```

## API

### Parameters

| Parameter | Type                                       | Required | Description                                  |
| --------- | ------------------------------------------ | -------- | -------------------------------------------- |
| `types`   | `string[]`                                 | Yes      | Notification types to listen to              |
| `filter`  | `(msg: T) => boolean`                      | No       | Keep only messages that belong to this blade |
| `toAlert` | `(msg: T) => Omit<IWidgetAlert, "onSeen">` | Yes      | Builds the alert. `severity` is a `Severity` |

### Returns

| Property | Type                          | Description                                    |
| -------- | ----------------------------- | ---------------------------------------------- |
| `alerts` | `ComputedRef<IWidgetAlert[]>` | Newest first. Pass it to the widget's `alerts` |
| `clear`  | `() => void`                  | Removes all alerts                             |

### Behaviour

- A message whose alert `id` is already in the list replaces it and moves it to the top.
- Each alert gets an `onSeen` callback that removes it. The widget popup calls it when the popup closes, for alerts that were visible for at least 300 ms, so the rows stay readable while the popup is open.
- In a component widget the alerts live in the component. When the widget remounts (moved between the strip and the dropdown in Customize, or refitted on mobile when the bar width changes), alerts received before the remount are lost. Keep alerts that must survive in a store outside the widget.
- The subscription is removed when the scope is disposed.

## Recipe: External Widget with Live Messages

A component widget registered with `registerExternalWidget` passes alerts through `useWidgetTrigger`. The badge is refetched on the same push, so the server stays the source of truth for the count.

```vue
<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { injectBladeContext, useBlade, useBladeNotifications, useWidgetPushAlerts, useWidgetTrigger } from "@vc-shell/framework";
import { VcWidget } from "@vc-shell/framework/ui";

const ctx = injectBladeContext();
const entityId = computed(() => (ctx.value.item as { id?: string })?.id ?? "");
const { openBlade } = useBlade();
const count = ref(0);

const openMessageBlade = () => openBlade({ name: "Messenger", options: { entityId: entityId.value } });
const populateCounter = async () => {
  count.value = await getUnreadCount(entityId.value);
};

const { alerts } = useWidgetPushAlerts<MessagePushNotification>({
  types: ["MessagePushNotification"],
  filter: (m) => m.entityId === entityId.value,
  toAlert: (m) => ({ id: m.messageId!, severity: "info", text: m.content ?? "", onOpen: openMessageBlade }),
});

useBladeNotifications<MessagePushNotification>({
  types: ["MessagePushNotification"],
  filter: (m) => m.entityId === entityId.value,
  onMessage: populateCounter,
});

useWidgetTrigger({ onRefresh: populateCounter, alerts });
onMounted(populateCounter);
</script>

<template>
  <VcWidget
    icon="lucide-message-circle"
    :title="$t('MESSENGER.WIDGET.TITLE')"
    :value="count"
    @click="openMessageBlade"
  />
</template>
```

## Related

- [useBladeWidgets / useWidgetTrigger](../useBladeWidgets/index.docs.md): the `alerts` field on widgets
- [useBladeNotifications](../../notifications/notifications.docs.md): the underlying subscription
