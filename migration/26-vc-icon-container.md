# 26. VcIcon `useContainer` Prop Deprecated

## What Changed

The `useContainer` prop on `VcIcon` is deprecated. Icons now render correctly without a fixed-size container wrapper. The prop is accepted but ignored (no-op).

## Backward Compatibility

The prop is silently ignored. No runtime error. A `console.warn` is emitted in development mode.

## Migration

```diff
-<VcIcon icon="lucide-save" use-container />
+<VcIcon icon="lucide-save" />

-<VcIcon icon="lucide-save" :use-container="true" />
+<VcIcon icon="lucide-save" />
```

## How to Find

```bash
grep -rn 'use-container\|useContainer' src/ --include="*.vue" | grep -i "vc-icon\|VcIcon"
```

## Automated Migration

```bash
npx vc-shell-migrate --transform icon-container-prop
```
