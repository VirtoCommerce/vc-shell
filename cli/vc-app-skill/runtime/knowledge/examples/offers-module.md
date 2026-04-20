# Example: Offers Module (Notifications + Dashboard Widget)

This example covers patterns NOT shown in team-module.md:

- `registerDashboardWidget` — registering a dashboard widget from module index
- `notifications` registration in `defineAppModule` — mapping event names to Vue templates
- `useNotificationContext` — accessing notification data inside a notification template

---

## `index.ts` — Module with notifications and dashboard widget

<!-- PATTERN: registerDashboardWidget — called at module scope, before defineAppModule -->
<!-- PATTERN: notifications map in defineAppModule — keys are backend domain event class names -->
<!-- PATTERN: toast.mode "auto" = auto-dismiss, "manual" = user must dismiss -->
<!-- PATTERN: toast.severity controls toast color: default=info, "warning", "error", "success" -->

```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import * as components from "./components";
import OfferCreatedDomainEvent from "./notifications/OfferCreatedDomainEvent.vue";
import OfferDeletedDomainEvent from "./notifications/OfferDeletedDomainEvent.vue";
import { defineAppModule, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";

// PATTERN: registerDashboardWidget — registers a Vue component as a dashboard card
// Must be called before defineAppModule. markRaw prevents Vue from making it reactive.
// size.width and size.height are grid units (1-12).
registerDashboardWidget({
  id: "offers-widget",
  name: "Offers",
  component: markRaw(components.OffersDashboardCard),
  size: { width: 6, height: 6 },
});

export default defineAppModule({
  blades: pages,
  locales,
  // PATTERN: notifications object — keys match backend domain event class names exactly
  notifications: {
    OfferCreatedDomainEvent: {
      template: OfferCreatedDomainEvent,
      toast: { mode: "auto" }, // auto-dismiss toast
    },
    OfferDeletedDomainEvent: {
      template: OfferDeletedDomainEvent,
      toast: { mode: "auto", severity: "warning" }, // warning severity
    },
  },
});

export * from "./pages";
export * from "./composables";
```

---

## `notifications/OfferCreatedDomainEvent.vue` — Notification template

<!-- PATTERN: useNotificationContext — the ONLY way to access notification data in templates -->
<!-- PATTERN: notification is a ComputedRef — use computed() to derive display values -->
<!-- PATTERN: NotificationTemplate — framework component that renders the notification shell -->
<!-- PATTERN: VcHint inside NotificationTemplate for secondary description text -->

```vue
<template>
  <NotificationTemplate
    :color="notificationStyle.color"
    :title="notification.title ?? ''"
    :icon="notificationStyle.icon"
    :notification="notification"
  >
    <VcHint
      v-if="notification.description"
      class="tw-mb-1"
      >{{ notification.description }}</VcHint
    >
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import { computed } from "vue";

// PATTERN: useNotificationContext() — returns a Ref<PushNotification>
// This is injected by the framework renderer; do NOT use props for notification data.
const notificationRef = useNotificationContext();
const notification = computed(() => notificationRef.value);

// Static style config for this notification type
const notificationStyle = {
  color: "var(--success-400)",
  icon: "lucide-percent",
};
</script>
```

---

## Notes on notification severity values

| severity    | use case                            |
| ----------- | ----------------------------------- |
| `"success"` | Positive completion (default green) |
| `"warning"` | Non-critical issue (yellow)         |
| `"error"`   | Failure (red)                       |
| (omitted)   | Informational (blue/neutral)        |

## Notes on toast mode values

| mode       | behavior                                                 |
| ---------- | -------------------------------------------------------- |
| `"auto"`   | Dismisses automatically after timeout                    |
| `"manual"` | User must click to dismiss                               |
| `"none"`   | No toast shown; notification only in notification center |
