# 14. Notifications System

## What Changed

| Old | New |
|-----|-----|
| `createAppModule(pages, locales, templates)` | `defineAppModule({ blades, locales, notifications: { ... } })` |
| `useNotifications(type)` | `useBladeNotifications({ types: [...] })` |
| `setNotificationHandler(fn)` | `onMessage` option |
| `moduleNotifications` watch | `messages` computed |
| `notifyType` in `defineOptions` | Remove — use `useBladeNotifications` or module config |

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

```diff
-const { markAsRead, setNotificationHandler } = useNotifications("MyDomainEvent");
-setNotificationHandler((message) => {
-  if (message.title) {
-    notification.success(message.title, { onClose() { markAsRead(message); } });
-  }
-});
+const { messages } = useBladeNotifications({
+  types: ["MyDomainEvent"],
+  onMessage: () => reloadData(),
+});
```

## Step 4: Progress Pattern

```diff
-const { moduleNotifications, markAsRead } = useNotifications("MyProgressEvent");
-watch(moduleNotifications, (newVal) => { /* manual toast management */ }, { deep: true });
+// Module config: notifications: { MyProgressEvent: { toast: { mode: "progress" } } }
+useBladeNotifications({
+  types: ["MyProgressEvent"],
+  filter: (msg) => msg.entityId === props.param,
+  onMessage: (msg) => refreshData(msg),
+});
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
