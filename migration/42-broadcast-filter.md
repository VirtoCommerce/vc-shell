# 42. Broadcast Filter (SignalR Creator Removal)

## What Changed

| Old                                      | New                                                     |
| ---------------------------------------- | ------------------------------------------------------- |
| `signalR: { creator }` in framework init | Removed — no config needed                              |
| `inject(updateSignalRCreatorSymbol)`     | `useBroadcastFilter()`                                  |
| `updateSignalRCreator?.(sellerId)`       | `setBroadcastFilter((msg) => msg.creator === sellerId)` |

## Why

The old two-step `creator` pattern (pass at init + update via inject) was error-prone. The SignalR plugin is now a dumb transport that always listens to both `Send` and `SendSystemEvents` channels. Filtering of broadcast messages is handled by the notification store.

## Migration

### Step 1: Remove signalR options from framework init

```diff
 app.use(VirtoShellFramework, {
   router,
   i18n: { locale, fallbackLocale },
-  signalR: { creator: "my-creator" },
 });
```

### Step 2: Replace updateSignalRCreator with useBroadcastFilter

```diff
-import { updateSignalRCreatorSymbol } from "@vc-shell/framework";
-import { inject } from "vue";
+import { useBroadcastFilter } from "@vc-shell/framework";

-const updateSignalRCreator = inject(updateSignalRCreatorSymbol);
-updateSignalRCreator?.(sellerId);
+const { setBroadcastFilter } = useBroadcastFilter();
+setBroadcastFilter((msg) => msg.creator === sellerId);
```

The filter is a function that receives a `PushNotification` and returns `true` to accept or `false` to reject. It only applies to broadcast messages (`SendSystemEvents`); targeted messages (`Send`) are always accepted.

### Dev Warning

If broadcast messages arrive without a filter set, a one-time console warning appears in dev mode:

```
[vc-shell] Broadcast notifications received without a filter.
Call useBroadcastFilter() in your App.vue to filter by creator/seller.
```
