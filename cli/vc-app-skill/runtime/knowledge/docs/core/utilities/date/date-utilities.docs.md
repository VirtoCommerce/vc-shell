# Date Utilities

Pure functions for date formatting, relative time display, and Moment.js-to-date-fns format conversion. Built on `date-fns` with locale-aware output.

## Overview

The framework migrated from Moment.js to `date-fns`. These utilities handle the conversion of legacy Moment format strings and provide consistent date formatting across the application. All functions accept flexible date input (`string | number | Date | null | undefined`).

## Exports

| Export                  | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `formatDateRelative`    | Formats a date as relative time (e.g., "3 hours ago", "2 days ago")  |
| `formatDateWithPattern` | Formats a date using a Moment.js-compatible format string            |
| `convertMomentFormat`   | Converts a Moment.js format string to date-fns format                |
| `resolveLocale`         | Async: loads and caches a date-fns locale by code (e.g., "fr", "de") |
| `resolveLocaleSync`     | Sync: returns cached locale or falls back to `enUS` while loading    |

## Usage

### Relative dates

```typescript
import { formatDateRelative } from "@vc-shell/framework";

formatDateRelative("2024-01-15T10:00:00Z");
// => "3 months ago"

formatDateRelative("2024-01-15T10:00:00Z", "fr");
// => "il y a 3 mois"
```

### Pattern-based formatting

```typescript
import { formatDateWithPattern } from "@vc-shell/framework";

// Accepts Moment.js format strings -- converted internally
formatDateWithPattern("2024-03-15T14:30:00Z", "YYYY-MM-DD");
// => "2024-03-15"

formatDateWithPattern("2024-03-15T14:30:00Z", "LLL", "de");
// => "15. Marz 2024, 14:30" (localized)
```

### Moment format conversion

```typescript
import { convertMomentFormat } from "@vc-shell/framework";

convertMomentFormat("YYYY-MM-DD"); // => "yyyy-MM-dd"
convertMomentFormat("DD/MM/YYYY"); // => "dd/MM/yyyy"
convertMomentFormat("LLL"); // => "PPp"
convertMomentFormat("dddd"); // => "EEEE"
```

### Token mapping reference

| Moment | date-fns | Meaning                      |
| ------ | -------- | ---------------------------- |
| `YYYY` | `yyyy`   | 4-digit year                 |
| `YY`   | `yy`     | 2-digit year                 |
| `DD`   | `dd`     | Day of month (zero-padded)   |
| `D`    | `d`      | Day of month                 |
| `Do`   | `do`     | Day ordinal                  |
| `dddd` | `EEEE`   | Weekday name                 |
| `ddd`  | `EEE`    | Weekday abbreviation         |
| `A`    | `a`      | AM/PM                        |
| `L`    | `P`      | Localized date               |
| `LL`   | `PP`     | Localized date (long)        |
| `LLL`  | `PPp`    | Localized date + time        |
| `LLLL` | `PPPp`   | Localized date + time (full) |
| `LT`   | `p`      | Localized time               |
| `LTS`  | `pp`     | Localized time with seconds  |

### Locale resolution

```typescript
import { resolveLocale, resolveLocaleSync } from "@vc-shell/framework";

// Async -- loads locale dynamically, caches for subsequent calls
const locale = await resolveLocale("fr");

// Sync -- returns cached locale or enUS while the async load happens
const locale = resolveLocaleSync("de");
```

The locale resolver tries the full code first (e.g., `pt-BR`), then the base language (`pt`), and falls back to `enUS` if neither is available.

## Tips

- `formatDateWithPattern` automatically calls `convertMomentFormat` internally -- pass Moment format strings directly.
- `resolveLocaleSync` triggers an async load in the background. On the first call for a new locale, output will use `enUS`; subsequent renders will use the correct locale once loaded.
- All formatting functions return an empty string for null/undefined/invalid date input.
- Locale objects are cached in a module-level `Map` -- no duplicate network requests for the same locale.

## Related

- `framework/ui/components/organisms/vc-table/components/cells/` -- cell renderers use these for date/datetime/date-ago columns
- `framework/shared/modules/assets-manager/` -- uses `formatDateRelative` for asset timestamps
