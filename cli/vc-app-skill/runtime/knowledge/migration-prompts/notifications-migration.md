---
name: notifications-migration
description: AI transformation rules for notification template migration to new defineAppModule config.
---

# Notifications Migration: useNotifications → useBladeNotifications

Migrate from `createAppModule(pages, locales, notificationTemplates)` to `defineAppModule({ notifications })`, and from `useNotifications()` to `useBladeNotifications()`.

## RULE 1: Move Notification Directory

Move `components/notifications/` to `notifications/` at the module root. Remove the barrel `index.ts` that re-exports all templates.

**BEFORE:**

```
my-module/
  components/
    notifications/
      index.ts           ← barrel: export { default as MyEvent } from "./MyEvent.vue"
      MyEvent.vue
  pages/
  index.ts
```

**AFTER:**

```
my-module/
  notifications/
    MyEvent.vue          ← no barrel index.ts needed
  pages/
  index.ts
```

## RULE 2: Update Notification Template

Remove `defineProps`, remove `defineOptions({ inheritAttrs: false })`, and use `useNotificationContext()` composable instead of props.

**BEFORE:**

```vue
<template>
  <NotificationTemplate
    :color="color"
    :title="notification.title"
    :icon="icon"
    :notification="notification"
    @click="onClick"
  >
    <VcHint>{{ notification.description }}</VcHint>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { PushNotification, NotificationTemplate } from "@vc-shell/framework";

export interface Props {
  notification: PushNotification;
}

defineProps<Props>();
defineOptions({ inheritAttrs: false });

const color = computed(() => "var(--primary-500)");
const icon = "lucide-bell";

function onClick() {
  // handle click
}
</script>
```

**AFTER:**

```vue
<template>
  <NotificationTemplate
    :color="color"
    :title="notification.title"
    :icon="icon"
    :notification="notification"
    @click="onClick"
  >
    <VcHint>{{ notification.description }}</VcHint>
  </NotificationTemplate>
</template>

<script lang="ts" setup>
import { PushNotification, useBlade, NotificationTemplate, useNotificationContext } from "@vc-shell/framework";
import { computed } from "vue";

interface IMyNotification extends PushNotification {
  customField?: string;
}

const notificationRef = useNotificationContext<IMyNotification>();
const notification = computed(() => notificationRef.value);

const color = computed(() => "var(--primary-500)");
const icon = "lucide-bell";

function onClick() {
  // handle click
}
</script>
```

## RULE 3: Update Module index.ts

Replace `createAppModule(pages, locales, notificationTemplates)` with `defineAppModule({ notifications })`. Import each notification template individually instead of using a barrel `import *`.

**BEFORE:**

```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import * as notificationTemplates from "./components/notifications";

export default createAppModule(pages, locales, notificationTemplates);
```

**AFTER:**

```typescript
import * as pages from "./pages";
import * as locales from "./locales";
import MyCreatedEvent from "./notifications/MyCreatedEvent.vue";
import MyDeletedEvent from "./notifications/MyDeletedEvent.vue";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    MyCreatedDomainEvent: {
      template: MyCreatedEvent,
      toast: { mode: "auto" },
    },
    MyDeletedDomainEvent: {
      template: MyDeletedEvent,
      toast: { mode: "auto", severity: "warning" },
    },
  },
});
```

Toast options:
- `mode`: `"auto"` (show and auto-dismiss), `"progress"` (show with progress bar), `"silent"` (no toast)
- `severity`: `"info"` (default), `"warning"`, `"error"`, `"critical"`

## RULE 4: Replace useNotifications in Blades

Replace `useNotifications()` with `useBladeNotifications()`. Remove `setNotificationHandler`, `moduleNotifications` watch, and `notifyType` from `defineOptions`.

**BEFORE:**

```typescript
defineOptions({
  name: "MyBlade",
  notifyType: "MyDomainEvent",
});

const { markAsRead, setNotificationHandler, moduleNotifications } = useNotifications("MyDomainEvent");

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});

// or watch pattern:
watch(moduleNotifications, (newVal) => {
  // manual toast management
}, { deep: true });
```

**AFTER:**

```typescript
defineOptions({
  name: "MyBlade",
  // notifyType removed
});

const { messages } = useBladeNotifications({
  types: ["MyDomainEvent"],
  onMessage: () => reloadData(),
});
```

For progress notifications:

```typescript
// Module config: notifications: { MyProgressEvent: { toast: { mode: "progress" } } }
useBladeNotifications({
  types: ["MyProgressEvent"],
  filter: (msg) => msg.entityId === param.value,
  onMessage: (msg) => refreshData(msg),
});
```

## Verification

After migration:

1. Run `npx tsc --noEmit` to verify no TypeScript errors
2. Confirm notification templates render correctly in the notification panel
3. Confirm toast notifications appear for configured event types
4. Confirm `useBladeNotifications` triggers `onMessage` callback when events arrive
5. Confirm `notifyType` is removed from all `defineOptions` calls
6. Confirm `components/notifications/` directory is removed and `notifications/` exists at module root
7. Confirm no remaining imports of `useNotifications`, `setNotificationHandler`, or `moduleNotifications`
8. Confirm no remaining `defineProps` or `defineOptions({ inheritAttrs: false })` in notification templates
