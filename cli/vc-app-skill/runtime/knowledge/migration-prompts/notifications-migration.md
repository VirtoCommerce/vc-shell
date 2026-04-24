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

Replace `useNotifications()` with `useBladeNotifications()`. Remove `setNotificationHandler`, the entire `watch(moduleNotifications, ...)` block, manual toast management, and `notifyType` from `defineOptions`.

### What to DELETE (toast management is now automatic via module config):

- The entire `watch(moduleNotifications/messages, ..., { deep: true })` block
- All `notification()` / `notification.update()` calls related to notification messages
- The `notificationId` ref used for toast tracking
- `setNotificationHandler(...)` calls
- `markAsRead()` calls inside toast `onClose` handlers
- `notifyType` from `defineOptions`/`defineBlade`

### What to EXTRACT into `onMessage`:

- Only **data-reload logic** from the watch callback (e.g., `getTasks()`, `refreshData()`, `reload()`)
- Add `filter` if the callback had blade-specific conditions (e.g., `message.profileId === param.value`)

### Simple case: `setNotificationHandler`

**BEFORE:**

```typescript
const { markAsRead, setNotificationHandler } = useNotifications("MyDomainEvent");

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});
```

**AFTER:**

```typescript
useBladeNotifications({
  types: ["MyDomainEvent"],
});
```

### Complex case: `watch` with toast management + data reload

**BEFORE:**

```typescript
const { moduleNotifications, markAsRead } = useNotifications("ImportPushNotification");
const notificationId = ref();

watch(
  moduleNotifications,
  (newVal) => {
    (newVal as ImportPushNotification[]).forEach((message) => {
      const messageContent = message.profileName ? `${message.profileName}: ${message.title}` : message.title;

      // DATA RELOAD — extract this into onMessage
      if (!importStarted.value && message.profileId === param.value) {
        getTasks({ profileId: message.profileId, importJobId: message.jobId });
      }

      // TOAST MANAGEMENT — delete all of this (handled by module config)
      if (!message.finished) {
        if (!notificationId.value && messageContent) {
          notificationId.value = notification(messageContent, { timeout: false });
        } else {
          notification.update(notificationId.value, { content: messageContent });
        }
      } else {
        notification.update(notificationId.value, {
          timeout: 5000,
          content: messageContent,
          type: message.title === "Import failed" ? "error" : "success",
          onClose() {
            markAsRead(message);
            notificationId.value = undefined;
          },
        });
      }
    });
  },
  { deep: true },
);
```

**AFTER:**

```typescript
useBladeNotifications({
  types: ["ImportPushNotification"],
  filter: (msg) => (msg as ImportPushNotification).profileId === param.value,
  onMessage: (msg) => {
    if (!importStarted.value) {
      getTasks({
        profileId: (msg as ImportPushNotification).profileId,
        importJobId: (msg as ImportPushNotification).jobId,
      });
    }
  },
});
// DELETE: notificationId ref, watch block, notification()/notification.update() calls
```

Toast appearance is configured in `defineAppModule({ notifications: { ImportPushNotification: { toast: { mode: "progress" } } } })`. The `markAsRead` is handled automatically.

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
