# 46. VcButton: Removed Props and Size Value Changes

## What Changed

Several deprecated `VcButton` props were removed, and the size value vocabulary was normalized. The `variant` system was also expanded to cover cases that previously required dedicated boolean props.

### Removed Props (breaking)

| Old Prop  | Replacement          |
| --------- | -------------------- |
| `small`   | `size="sm"`          |
| `outline` | `variant="outline"`  |
| `raised`  | (removed — no direct replacement; the default `variant="primary"` already provides elevation) |

These three props were marked `@deprecated` in v1.x and have now been deleted from the `Props` interface. Passing them has no effect and will surface as a Vue "extraneous non-props attribute" warning.

### Renamed Size Values (soft-deprecated)

| Old Value      | New Value        |
| -------------- | ---------------- |
| `size="base"`  | `size="default"` |
| `size="xs"`    | `size="sm"`      |

The old values still work — an internal `SIZE_ALIAS` map in `vc-button.vue` transparently remaps `base → default` and `xs → sm` at render time, and both remain in the `ButtonSize` union as legacy aliases. You should still migrate: the aliases are only kept for backward compatibility and should be treated as deprecated.

Other size values unchanged: `lg`. New in v2: `icon`, `icon-sm`.

## Who Is Affected

Any template that uses `VcButton` with:

- The attribute `small` (boolean)
- The attribute `outline` (boolean)
- The attribute `raised` (boolean)
- `size="base"` or `size="xs"` (still renders correctly, but should be updated)

## Migration Steps

### Before (v1.x)

```vue
<VcButton small>Cancel</VcButton>
<VcButton outline>Secondary</VcButton>
<VcButton raised variant="primary">Save</VcButton>
<VcButton size="base">Default</VcButton>
<VcButton size="xs">Tiny</VcButton>
```

### After (v2.0)

```vue
<VcButton size="sm">Cancel</VcButton>
<VcButton variant="outline">Secondary</VcButton>
<VcButton variant="primary">Save</VcButton>
<!-- raised removed — primary already has elevation -->
<VcButton size="default">Default</VcButton>
<VcButton size="sm">Tiny</VcButton>
```

## How to Find Usages

```bash
# Removed boolean props
grep -rn '<VcButton[^>]*\bsmall\b' src/ --include='*.vue'
grep -rn '<VcButton[^>]*\boutline\b' src/ --include='*.vue'
grep -rn '<VcButton[^>]*\braised\b' src/ --include='*.vue'

# Deprecated size aliases
grep -rn '<VcButton[^>]*size="base"' src/ --include='*.vue'
grep -rn '<VcButton[^>]*size="xs"' src/ --include='*.vue'
```

## New Variants Available

The `ButtonVariant` union expanded significantly in v2.0. Full list from `framework/ui/components/atoms/vc-button/types.ts`:

- `primary` (default)
- `secondary`
- `danger`
- `warning`
- `success`
- `info`
- `outline`
- `ghost`
- `link`

This means several patterns that previously needed custom styling or multiple props can now be expressed with a single `variant`:

```vue
<VcButton variant="danger">Delete</VcButton>
<VcButton variant="warning">Proceed with caution</VcButton>
<VcButton variant="ghost" icon="lucide-x" />
<VcButton variant="link">View details</VcButton>
```

## Related

- [Guide #44: createModule() Removal](./44-create-module-removal.md) — another v2 API normalization
