# 30. Type Shims → Framework Globals

## What Changed

Manual `shims-vue.d.ts` and `vue-i18n.d.ts` files in consumer apps are no longer needed. The framework now ships `globals.d.ts` with all type augmentations (`*.vue` module declaration, `ComponentCustomProperties` for `$t`, `$hasAccess`, `$isMobile`, etc.).

| Old | New |
|-----|-----|
| `src/shims-vue.d.ts` (manual file) | `@vc-shell/framework/globals` in tsconfig types |
| `src/vue-i18n.d.ts` (manual file) | `@vc-shell/framework/globals` in tsconfig types |

## Backward Compatibility

Keeping the old shim files alongside the new `types` entry works but may cause duplicate augmentation warnings. Remove the old files after adding the types entry.

## Migration

**Step 1:** Add `@vc-shell/framework/globals` to your `tsconfig.json`:

```diff
 {
   "compilerOptions": {
-    "types": ["vite/client"]
+    "types": ["vite/client", "@vc-shell/framework/globals"]
   }
 }
```

**Step 2:** Delete the manual shim files:

```bash
rm src/shims-vue.d.ts src/vue-i18n.d.ts
```

> **Note:** If your shim files contain custom augmentations beyond the standard framework globals, move those custom parts to a separate `.d.ts` file before deleting.

## How to Find

```bash
# Find shim files
find src/ -name "shims-vue.d.ts" -o -name "vue-i18n.d.ts"
# Check if already using globals
grep -r "@vc-shell/framework/globals" tsconfig.json
```

## Automated Migration

```bash
npx vc-shell-migrate --transform shims-to-globals
```
