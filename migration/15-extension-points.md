# 15. Extension Points API

## What Changed

The extension points system was rewritten:

| Old | New |
|-----|-----|
| `useExtensionSlot(name)` | `defineExtensionPoint(name, options)` |
| `useExtensionData(name)` | Removed — use `injectBladeContext()` |
| `useExtensions()` | `useExtensionPoint(name)` |
| `<ExtensionSlot :name="...">` | `<ExtensionPoint :name="...">` |

## Migration

**Host side (page declaring an extension point):**
```diff
-import { useExtensionSlot } from "@vc-shell/framework";
-const { extensions } = useExtensionSlot("product-details-extra");
+import { defineExtensionPoint } from "@vc-shell/framework";
+const { extensions } = defineExtensionPoint("product-details-extra");
```

**Template:**
```diff
-<ExtensionSlot name="product-details-extra" />
+<ExtensionPoint name="product-details-extra" />
```

**Plugin side (registering into an extension point):**
```diff
-import { useExtensions } from "@vc-shell/framework";
-const { register } = useExtensions();
-register("product-details-extra", MyComponent);
+import { useExtensionPoint } from "@vc-shell/framework";
+const { register } = useExtensionPoint("product-details-extra");
+register(MyComponent);
```

## How to Find
```bash
grep -rn "useExtensionSlot\|useExtensionData\|useExtensions\|ExtensionSlot" src/ --include="*.ts" --include="*.vue"
```
