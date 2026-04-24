# 14. Notifications System

## What Changed

| Old                                          | New                                                            |
| -------------------------------------------- | -------------------------------------------------------------- |
| `createAppModule(pages, locales, templates)` | `defineAppModule({ blades, locales, notifications: { ... } })` |
| `useNotifications(type)`                     | `useBladeNotifications({ types: [...] })`                      |
| `setNotificationHandler(fn)`                 | `onMessage` option                                             |
| `moduleNotifications` watch                  | `messages` computed                                            |
| `notifyType` in `defineOptions`              | Remove — use `useBladeNotifications` or module config          |

## Backward Compatibility

All old APIs work via deprecated wrappers.

## Step 1: Module Registration

```diff
-import * as notificationTemplates from "./components/notifications";
-export default createAppModule(pages, locales, notificationTemplates);
+import MyEventTemplate from "./notifications/MyEventTemplate.vue";
+export default defineAppModule({
+  blades: pages,
+  locales,
+  notifications: {
+    MyDomainEvent: {
+      template: MyEventTemplate,
+      toast: { mode: "auto" },
+    },
+  },
+});
```

Toast options: `mode` (`"auto"` | `"progress"` | `"silent"`), `severity` (`"info"` | `"warning"` | `"error"` | `"critical"`).

## Step 2: Remove notifyType from defineOptions

```diff
 defineOptions({
   name: "MyBlade",
-  notifyType: "MyDomainEvent",
 });
```

## Step 3: Replace useNotifications in Blades

Toast display is now automatic (configured via `defineAppModule` in Step 1). In blades, only use `useBladeNotifications` for **data reload** and **filtering**.

**Delete entirely:**

- `watch(moduleNotifications, ...)` blocks
- `notification()` / `notification.update()` toast calls
- `notificationId` refs for tracking toast state
- `markAsRead()` inside toast `onClose` handlers
- `setNotificationHandler(...)` calls

**Extract into `onMessage`:** only data-reload logic (e.g., `getTasks()`, `refreshData()`).

```diff
-const { markAsRead, setNotificationHandler } = useNotifications("MyDomainEvent");
-setNotificationHandler((message) => {
-  if (message.title) {
-    notification.success(message.title, { onClose() { markAsRead(message); } });
-  }
-});
+useBladeNotifications({
+  types: ["MyDomainEvent"],
+  onMessage: () => reloadData(),
+});
```

## Step 4: Watch Pattern with Toast Management

The most common pattern: `watch(moduleNotifications, ...)` with manual toast creation/update and data reloading mixed together. The toast logic is now handled by module config — only extract the data reload part.

```diff
-const { moduleNotifications, markAsRead } = useNotifications("MyEvent");
-const notificationId = ref();
-
-watch(
-  moduleNotifications,
-  (newVal) => {
-    newVal.forEach((message) => {
-      // Data reload — KEEP, move to onMessage
-      if (message.entityId === param.value) {
-        getTasks({ id: message.entityId, jobId: message.jobId });
-      }
-      // Toast management — DELETE (handled by module config toast settings)
-      if (!message.finished) {
-        notificationId.value = notification(message.title, { timeout: false });
-      } else {
-        notification.update(notificationId.value, {
-          type: message.title === "failed" ? "error" : "success",
-          onClose() { markAsRead(message); notificationId.value = undefined; },
-        });
-      }
-    });
-  },
-  { deep: true },
-);
+// Toast: defineAppModule({ notifications: { MyEvent: { toast: { mode: "progress" } } } })
+useBladeNotifications({
+  types: ["MyEvent"],
+  filter: (msg) => msg.entityId === param.value,
+  onMessage: (msg) => {
+    getTasks({ id: msg.entityId, jobId: msg.jobId });
+  },
+});
+// DELETE: notificationId ref, watch block, notification()/notification.update()
```

## Step 5: Notification Template Props → Composable

Custom notification templates no longer receive `notification` as a prop. Use `useNotificationContext()` instead.

```diff
 <script lang="ts" setup>
-import { PushNotification, NotificationTemplate } from "@vc-shell/framework";
-
-export interface Props {
-  notification: PushNotification;
-}
-
-defineProps<Props>();
-
-defineOptions({ inheritAttrs: false });
+import { useNotificationContext, NotificationTemplate } from "@vc-shell/framework";
+import { computed } from "vue";
+
+const notificationRef = useNotificationContext();
+const notification = computed(() => notificationRef.value);
 </script>
```

Remove `defineProps`, `defineOptions({ inheritAttrs: false })`, and any `variant` prop.

For typed notifications, pass a generic:

```ts
interface IMyNotification extends PushNotification {
  customField?: string;
}
const notificationRef = useNotificationContext<IMyNotification>();
```

## Directory Structure

Move `components/notifications/` → `notifications/` at module root:

```
my-module/
  notifications/    ← was components/notifications/
  pages/
  composables/
  widgets/
  index.ts
```
