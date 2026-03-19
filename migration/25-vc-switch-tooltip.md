# 25. VcSwitch `tooltip` Prop Renamed

## What Changed

The `tooltip` prop on `VcSwitch` is deprecated. It was misleading — it rendered hint text below the switch, not a tooltip.

| Old (deprecated) | New |
|---|---|
| `tooltip` | `hint` (for hint text below the switch) |
| `tooltip` | `labelTooltip` (for info icon tooltip on label) |

## Backward Compatibility

`tooltip` prop continues to work as `hint` text. A `console.warn` is emitted in development mode.

## Migration

```diff
-<VcSwitch v-model="enabled" tooltip="Enable notifications" />
+<VcSwitch v-model="enabled" hint="Enable notifications" />
```

If you intended it as a label tooltip (info icon):
```diff
-<VcSwitch v-model="enabled" tooltip="What this does" />
+<VcSwitch v-model="enabled" label-tooltip="What this does" />
```

## How to Find

```bash
grep -rn 'tooltip=' src/ --include="*.vue" | grep -i "vc-switch\|VcSwitch"
```

## Automated Migration

```bash
npx vc-shell-migrate --transform switch-tooltip-prop
```

The transform renames `tooltip` to `hint`. If you need `labelTooltip` instead, adjust manually after running.
