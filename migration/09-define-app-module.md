# 09. createAppModule → defineAppModule

## What Changed

| Before | After |
|--------|-------|
| `createAppModule(pages, locales, templates)` | `defineAppModule({ blades, locales, notificationTemplates })` |
| Positional arguments | Named options object |
| `moduleComponents` (4th arg) | Removed |
| `moduleOptions` / `dependsOn` (5th arg) | Removed |

## Backward Compatibility

`createAppModule()` continues to work as a deprecated adapter. No immediate action required.

## Migration

**Basic module:**
```diff
-import { createAppModule } from "@vc-shell/framework";
+import { defineAppModule } from "@vc-shell/framework";
 import * as pages from "./pages";
 import * as locales from "./locales";

-export default createAppModule(pages, locales);
+export default defineAppModule({
+  blades: pages,
+  locales,
+});
```

**With notification templates:**
```diff
-export default createAppModule(pages, locales, notificationTemplates);
+export default defineAppModule({
+  blades: pages,
+  locales,
+  notificationTemplates,
+});
```

**With notifications config (new):**
```typescript
import MyEventTemplate from "./notifications/MyEventTemplate.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    MyDomainEvent: {
      template: MyEventTemplate,
      toast: { mode: "auto" },
    },
  },
});
```

See [14-notifications.md](./14-notifications.md) for the full notifications migration.

## moduleComponents (4th argument) — Removed

If you used the `moduleComponents` parameter, register components via direct import or `app.component()` in your module's `install()` function.
