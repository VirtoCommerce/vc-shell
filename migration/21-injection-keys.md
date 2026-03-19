# 21. Injection Keys

## What Changed

Several injection keys were renamed for consistency:

| Old | New |
|-----|-----|
| `BladeInstance` | `BladeInstanceKey` |
| `navigationViewLocation` | `NavigationViewLocationKey` |
| `BLADE_BACK_BUTTON` | `BladeBackButtonKey` |
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |
| `TOOLBAR_SERVICE` | `ToolbarServiceKey` |
| `EMBEDDED_MODE` | `EmbeddedModeKey` |

### String keys → typed Symbol keys

| Old (string inject) | New (Symbol key) |
|---------------------|-----------------|
| `inject("isMobile")` | `inject(IsMobileKey)` |
| `inject("isDesktop")` | `inject(IsDesktopKey)` |
| `inject("isPhone")` | `inject(IsPhoneKey)` |
| `inject("isTablet")` | `inject(IsTabletKey)` |
| `inject("isTouch")` | `inject(IsTouchKey)` |
| `inject("bladeRoutes")` | `inject(BladeRoutesKey)` |

## Backward Compatibility

- Renamed Symbol keys: import the new name from `@vc-shell/framework`
- String keys: **still provided** with dev-mode deprecation warnings. Your code won't break but you'll see console warnings

## Migration

```diff
-import { TOOLBAR_SERVICE, BladeInstance, BLADE_BACK_BUTTON } from "@vc-shell/framework";
+import { ToolbarServiceKey, BladeInstanceKey, BladeBackButtonKey } from "@vc-shell/framework";

-const toolbar = inject(TOOLBAR_SERVICE);
+const toolbar = inject(ToolbarServiceKey);

-const isMobile = inject("isMobile") as Ref<boolean>;
+import { IsMobileKey } from "@vc-shell/framework";
+const isMobile = inject(IsMobileKey);
```

## How to Find
```bash
grep -rn "TOOLBAR_SERVICE\|BLADE_BACK_BUTTON\|BladeInstance\b\|EMBEDDED_MODE\|NotificationTemplatesSymbol\|navigationViewLocation" src/
grep -rn 'inject("isMobile")\|inject("isDesktop")\|inject("isPhone")\|inject("isTablet")\|inject("isTouch")\|inject("bladeRoutes")' src/
```
