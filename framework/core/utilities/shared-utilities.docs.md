# Shared Utilities

Helper functions and TypeScript type utilities used across the shared layer of the framework.

## Overview

This directory provides small, focused utility modules for asset handling, color manipulation, badge formatting, and Vue component type extraction.

## Exports

| Export | Module | Description |
|---|---|---|
| `isImage(name)` | `assets.ts` | Returns `true` if the file extension is an image (png, jpg, jpeg, svg, gif) |
| `getFileThumbnail(name)` | `assets.ts` | Returns a Bootstrap icon class for the file type (e.g., `bi-filetype-pdf`) |
| `readableSize(bytes)` | `assets.ts` | Formats byte count as human-readable string (e.g., `"1.5 MB"`) |
| `convertColorNameToHex(name)` | `colorUtils.ts` | Converts a CSS color name to hex using the Canvas API |
| `isValidHexColor(value)` | `colorUtils.ts` | Validates a 6-digit hex color string |
| `normalizeHexColor(hex)` | `colorUtils.ts` | Ensures hex string starts with `#` |
| `formatBadgeCount(value)` | `formatBadgeCount.ts` | Truncates numbers > 99 to `"99+"` for badge display |
| `ComponentProps<T>` | `vueUtils.ts` | Extracts props type from a Vue component |
| `ComponentSlots<T>` | `vueUtils.ts` | Extracts slots type from a Vue component |
| `ComponentEmit<T>` | `vueUtils.ts` | Extracts emit type from a Vue component |

## Usage

### Asset helpers

```typescript
import { isImage, getFileThumbnail, readableSize } from "@vc-shell/framework";

isImage("photo.jpg");           // true
isImage("document.pdf");        // false

getFileThumbnail("report.xlsx"); // "bi-filetype-xls"
getFileThumbnail("archive.zip"); // "bi-file-zip"
getFileThumbnail("unknown.abc"); // "bi-file-earmark"

readableSize(1536);             // "1.5 KB"
readableSize(0);                // "0 Bytes"
```

### Color utilities

```typescript
import { convertColorNameToHex, isValidHexColor, normalizeHexColor } from "@vc-shell/framework";

convertColorNameToHex("red");     // "#ff0000"
convertColorNameToHex("invalid"); // null

isValidHexColor("#ff0000");       // true
isValidHexColor("ff0000");        // true (checks with/without #)
isValidHexColor("#fff");          // false (only 6-digit supported)

normalizeHexColor("ff0000");      // "#ff0000"
```

### Badge formatting

```typescript
import { formatBadgeCount } from "@vc-shell/framework";

formatBadgeCount(5);         // "5"
formatBadgeCount(150);       // "99+"
formatBadgeCount(undefined); // undefined
```

### Vue type utilities

```typescript
import type { ComponentProps, ComponentSlots } from "@vc-shell/framework";

type MyProps = ComponentProps<typeof MyComponent>;
type MySlots = ComponentSlots<typeof MyComponent>;
```

## Tips

- `convertColorNameToHex` creates a temporary Canvas element -- only use in browser context, not SSR.
- `readableSize` defaults to 2 decimal places; pass a second argument to change precision.
- `formatBadgeCount` is used by `VcWidget` and `WidgetDropdownItem` for consistent badge truncation.
- The `vueUtils.ts` types work with both `defineComponent` and `<script setup>` components.

## Related

- `framework/shared/modules/assets-manager/` -- uses asset helpers for file display
- `framework/ui/components/organisms/vc-table/components/` -- VcWidget uses `formatBadgeCount`
