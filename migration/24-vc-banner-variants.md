# 24. VcBanner Variant Names

## What Changed

Legacy variant names are deprecated and mapped to modern equivalents:

| Old (deprecated) | New |
|---|---|
| `"light-danger"` | `"danger"` |
| `"info-dark"` | `"info"` |
| `"primary"` | `"info"` |

Current variants: `"info"` | `"warning"` | `"danger"` | `"success"`.

## Backward Compatibility

Legacy variants continue to work — they are normalized internally. A `console.warn` is emitted in development mode.

## Migration

```diff
-<VcBanner variant="light-danger">Error occurred</VcBanner>
+<VcBanner variant="danger">Error occurred</VcBanner>

-<VcBanner variant="info-dark">Notice</VcBanner>
+<VcBanner variant="info">Notice</VcBanner>

-<VcBanner variant="primary">Info</VcBanner>
+<VcBanner variant="info">Info</VcBanner>
```

## How to Find

```bash
grep -rn 'variant="light-danger"\|variant="info-dark"\|variant="primary"' src/ --include="*.vue"
```

## Automated Migration

```bash
npx vc-shell-migrate --transform banner-variants
```
