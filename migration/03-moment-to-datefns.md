# 03. moment.js → date-fns

## What Changed

The `moment` plugin has been completely removed from the framework:

- `import { moment } from "@vc-shell/framework"` — **removed**
- `window.moment` — **removed**
- The `moment` npm package is no longer a dependency

The framework now uses [date-fns](https://date-fns.org/) internally and exports utility functions for common date operations.

## Migration

### Step 1: Find all moment usage

```bash
grep -rn "moment\b" src/ --include="*.ts" --include="*.vue"
```

### Step 2: Replace with date-fns utilities

The framework provides drop-in replacements that accept moment format strings:

```typescript
import { formatDateRelative, formatDateWithPattern, convertMomentFormat } from "@vc-shell/framework";
```

#### Relative time ("3 hours ago")

```typescript
// Before
import { moment } from "@vc-shell/framework";
const relative = moment(date).fromNow(); // "3 hours ago"

// After
import { formatDateRelative } from "@vc-shell/framework";
const relative = formatDateRelative(date); // "3 hours ago"
```

#### Formatted date

```typescript
// Before
import { moment } from "@vc-shell/framework";
const formatted = moment(date).format("YYYY-MM-DD HH:mm");

// After
import { formatDateWithPattern } from "@vc-shell/framework";
const formatted = formatDateWithPattern(date, "YYYY-MM-DD HH:mm");
// ↑ Accepts moment format strings — converts them to date-fns format internally
```

#### Locale-aware formatting

```typescript
// Before
moment.locale("de");
const formatted = moment(date).format("LLL");

// After
import { formatDateWithPattern } from "@vc-shell/framework";
const formatted = formatDateWithPattern(date, "LLL", "de");
// ↑ Third argument is locale code — resolves to date-fns locale automatically
```

#### Format string conversion (advanced)

If you need to convert moment format strings to date-fns format strings for use with raw `date-fns`:

```typescript
import { convertMomentFormat } from "@vc-shell/framework";
import { format } from "date-fns";

const dateFnsFormat = convertMomentFormat("YYYY-MM-DD"); // → "yyyy-MM-dd"
const result = format(new Date(), dateFnsFormat);
```

### Step 3: For complex moment usage

If you used advanced moment features (durations, calendar time, manipulation), install `date-fns` directly in your app:

```bash
yarn add date-fns
```

Then use date-fns functions directly:

```typescript
import { addDays, differenceInHours, isAfter } from "date-fns";

// moment().add(7, "days") →
const nextWeek = addDays(new Date(), 7);

// moment(a).diff(b, "hours") →
const hours = differenceInHours(dateA, dateB);

// moment(a).isAfter(b) →
const later = isAfter(dateA, dateB);
```

## Format Token Reference

| moment | date-fns | Description |
|--------|----------|-------------|
| `YYYY` | `yyyy` | 4-digit year |
| `YY` | `yy` | 2-digit year |
| `MM` | `MM` | Month (same) |
| `DD` | `dd` | Day of month |
| `D` | `d` | Day (no padding) |
| `Do` | `do` | Day ordinal |
| `dddd` | `EEEE` | Weekday name |
| `ddd` | `EEE` | Weekday short |
| `HH` | `HH` | Hour 24h (same) |
| `mm` | `mm` | Minutes (same) |
| `ss` | `ss` | Seconds (same) |
| `A` | `a` | AM/PM |
| `LT` | `p` | Locale time |
| `LTS` | `pp` | Locale time with seconds |
| `L` | `P` | Locale date short |
| `LL` | `PP` | Locale date medium |
| `LLL` | `PPp` | Locale date + time |
| `LLLL` | `PPPp` | Locale date + time full |
