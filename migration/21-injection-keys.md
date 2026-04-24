# 21. Injection Keys

## What Changed

Several injection keys were renamed for consistency, and a number of keys were removed entirely.

### Renamed keys

| Old                           | New                                              |
| ----------------------------- | ------------------------------------------------ |
| `BLADE_BACK_BUTTON`           | `BladeBackButtonKey`                             |
| `TOOLBAR_SERVICE`             | `ToolbarServiceKey`                              |
| `EMBEDDED_MODE`               | `EmbeddedModeKey`                                |

### Removed keys

The following keys existed in v1.2.3 but have been **removed entirely** from `@vc-shell/framework`. There is no drop-in symbol replacement — switch to the composable or alternative listed below.

| Removed key                   | Replacement                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `BladeInstance`               | Use `useBlade()` composable, or `inject(BladeDescriptorKey)` from `@core/blade-navigation/types`           |
| `navigationViewLocation`      | None — removed as internal framework concern                                                               |
| `NotificationTemplatesSymbol` | Template system replaced by `NotificationStoreKey` + `useBladeNotifications()` composable                  |
| `GlobalSearchKey`             | None — internal concern now, no public replacement                                                         |

See [G18](#g18-globalsearchkey-removal) and the notes below for details.

### String keys → typed Symbol keys

| Old (string inject) | New (Symbol key) |
|---------------------|-----------------|
| `inject("isMobile")` | `inject(IsMobileKey)` |
| `inject("isDesktop")` | `inject(IsDesktopKey)` |
| `inject("isPhone")` | `inject(IsPhoneKey)` |
| `inject("isTablet")` | `inject(IsTabletKey)` |
| `inject("isTouch")` | `inject(IsTouchKey)` |
| `inject("bladeRoutes")` | `inject(BladeRoutesKey)` |

> **Note:** The breakpoint injection keys (`IsMobileKey`, `IsDesktopKey`, etc.) are themselves **deprecated** in favor of the `useResponsive()` composable. Prefer migrating directly to `useResponsive()` rather than stopping at `inject(IsMobileKey)`. See [migration guide #36](./36-use-responsive.md).

## Backward Compatibility

- Renamed Symbol keys: import the new name from `@vc-shell/framework`
- **String keys are no longer provided.** There is no shim layer. Code that still does `inject("isMobile")`, `inject("bladeRoutes")`, `inject("pages")`, etc. will receive `undefined`. You must migrate to the typed Symbol keys above (or the corresponding composable).

## Migration

```diff
-import { TOOLBAR_SERVICE, BladeInstance, BLADE_BACK_BUTTON } from "@vc-shell/framework";
+import { ToolbarServiceKey, BladeBackButtonKey, useBlade } from "@vc-shell/framework";

-const toolbar = inject(TOOLBAR_SERVICE);
+const toolbar = inject(ToolbarServiceKey);

-const blade = inject(BladeInstance);
+const blade = useBlade();

-const isMobile = inject("isMobile") as Ref<boolean>;
+import { IsMobileKey } from "@vc-shell/framework";
+const isMobile = inject(IsMobileKey);
```

## G18: `GlobalSearchKey` removal

`GlobalSearchKey` (v1.2.3: `Symbol("GlobalSearch")` typed as `InjectionKey<GlobalSearchState>`) has been removed as a **breaking change**. Global search state is now an internal framework concern and has no public replacement injection key. If your code injected `GlobalSearchKey` directly, that path is gone — use the framework-level global search integration points instead and file an issue if you need a supported public API.

## G19: `"pages"` string provide removal

In v1.2.3 the framework did `app.provide("pages", app.config.globalProperties.pages)` at bootstrap. That provide has been removed — `inject("pages")` now returns `undefined`.

If your code was doing:

```ts
const pages = inject("pages") as Record<string, BladeInstanceConstructor>;
```

replace it with the blade registry composable:

```ts
import { useBladeRegistry } from "@vc-shell/framework";

const registry = useBladeRegistry();
const MyBlade = registry.getBladeComponent("MyBlade");
```

The same applies to `inject("bladeRoutes")` — migrate to `inject(BladeRoutesKey)` (see table above).

## How to Find
```bash
grep -rn "TOOLBAR_SERVICE\|BLADE_BACK_BUTTON\|BladeInstance\b\|EMBEDDED_MODE\|NotificationTemplatesSymbol\|navigationViewLocation\|GlobalSearchKey" src/
grep -rn 'inject("isMobile")\|inject("isDesktop")\|inject("isPhone")\|inject("isTablet")\|inject("isTouch")\|inject("bladeRoutes")\|inject("pages")' src/
```
