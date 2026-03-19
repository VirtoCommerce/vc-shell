# 27. Menu Item `groupConfig` Object

## What Changed

Flat group properties on `MenuItemConfig` are deprecated in favor of a structured `groupConfig` object:

| Old (deprecated) | New |
|---|---|
| `group: "Settings"` | `groupConfig: { id: "settings", title: "Settings" }` |
| `groupIcon: "lucide-settings"` | `groupConfig: { icon: "lucide-settings" }` |
| `inGroupPriority: 10` | `groupConfig: { priority: 10 }` |

The new `groupConfig` also supports `permissions` for group-level access control.

## Backward Compatibility

Old flat properties continue to work. The menu service reads `groupConfig` first, falls back to flat properties.

## Migration

```diff
 menuService.addMenuItem({
   title: "Users",
   url: "/users",
   icon: "lucide-users",
-  group: "Settings",
-  groupIcon: "lucide-settings",
-  inGroupPriority: 10,
+  groupConfig: {
+    id: "settings",
+    title: "Settings",
+    icon: "lucide-settings",
+    priority: 10,
+  },
 });
```

## How to Find

```bash
grep -rn "groupIcon\|inGroupPriority\|group:" src/ --include="*.ts" --include="*.vue"
```

## Automated Migration

This change requires manual migration (object restructuring). A diagnostic transform reports affected files:

```bash
npx vc-shell-migrate --transform menu-group-config
```
