---
title: Shared Utilities
category: reference
group: api
slug: shared-utilities
---

# Shared Utilities

Helper functions and TypeScript type utilities used across the shared layer of the framework.

## Overview

This directory provides small, focused utility modules for asset handling, color manipulation, and badge formatting.

## Exports

| Export                        | Module                | Description                                                                  |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| `isImage(name)`               | `assets.ts`           | Returns `true` if the file extension is an image (png, jpg, jpeg, svg, gif)  |
| `readableSize(bytes)`         | `assets.ts`           | Formats byte count as human-readable string (e.g., `"1.5 MB"`)               |
| `getExtensionColor(name)`     | `assets.ts`           | Returns a CSS color for the file type, falling back to `var(--neutrals-400)` |
| `getExtensionLabel(name)`     | `assets.ts`           | Returns the uppercased file extension, or `"FILE"` when unknown              |
| `convertColorNameToHex(name)` | `colorUtils.ts`       | Converts a CSS color name to hex using the Canvas API                        |
| `isValidHexColor(value)`      | `colorUtils.ts`       | Validates a 6-digit hex color string                                         |
| `normalizeHexColor(hex)`      | `colorUtils.ts`       | Ensures hex string starts with `#`                                           |
| `formatBadgeCount(value)`     | `formatBadgeCount.ts` | Truncates numbers > 99 to `"99+"` for badge display                          |

## Usage

### Asset helpers

```typescript
import { isImage, readableSize, getExtensionColor, getExtensionLabel } from "@vc-shell/framework";

isImage("photo.jpg"); // true
isImage("document.pdf"); // false

readableSize(1536); // "1.5 KB"
readableSize(0); // "0 Bytes"

getExtensionColor("report.pdf"); // "#e74c3c"
getExtensionColor("unknown.abc"); // "var(--neutrals-400)"

getExtensionLabel("report.xlsx"); // "XLSX"
getExtensionLabel(undefined); // "FILE"
```

### Color utilities

```typescript
import { convertColorNameToHex, isValidHexColor, normalizeHexColor } from "@vc-shell/framework";

convertColorNameToHex("red"); // "#ff0000"
convertColorNameToHex("invalid"); // null

isValidHexColor("#ff0000"); // true
isValidHexColor("ff0000"); // true (checks with/without #)
isValidHexColor("#fff"); // false (only 6-digit supported)

normalizeHexColor("ff0000"); // "#ff0000"
```

### Badge formatting

```typescript
import { formatBadgeCount } from "@vc-shell/framework";

formatBadgeCount(5); // "5"
formatBadgeCount(150); // "99+"
formatBadgeCount(undefined); // undefined
```

## Tips

- `convertColorNameToHex` creates a temporary Canvas element -- only use in browser context, not SSR.
- `readableSize` defaults to 2 decimal places; pass a second argument to change precision.
- `formatBadgeCount` is used by `VcWidget` and `WidgetDropdownItem` for consistent badge truncation.
- `getExtensionColor` / `getExtensionLabel` back the non-image file badges in assets-manager and assets-details.

## Related

- `framework/modules/assets-manager/` -- uses asset helpers for file display
- `framework/ui/components/atoms/vc-widget/` -- VcWidget uses `formatBadgeCount`
