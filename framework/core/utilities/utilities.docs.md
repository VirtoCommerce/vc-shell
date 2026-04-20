# Framework Utilities

Utility functions exported from `@vc-shell/framework` via `core/utilities/index.ts`.

## Overview

The utilities module provides a collection of commonly needed functions: string case conversion, date formatting, error parsing, ID generation, and structured logging. These are pure utility functions with no Vue reactivity dependencies (except the logger, which is a simple factory). All are re-exported from `@vc-shell/framework` for convenient access.

## String Utilities

| Function        | Signature                 | Description                                                       |
| --------------- | ------------------------- | ----------------------------------------------------------------- |
| `camelToSnake`  | `(str: string) => string` | Converts camelCase to snake_case                                  |
| `camelize`      | `(str: string) => string` | Converts delimited string to camelCase (splits on non-word chars) |
| `kebabToCamel`  | `(str: string) => string` | Converts kebab-case to camelCase                                  |
| `kebabToPascal` | `(str: string) => string` | Converts kebab-case to PascalCase                                 |

### String utility examples

```typescript
import { camelToSnake, camelize, kebabToCamel, kebabToPascal } from "@vc-shell/framework";

camelToSnake("myPropName"); // "my_prop_name"
camelToSnake("backgroundColor"); // "background_color"

camelize("some-prop-name"); // "somePropName"
camelize("SOME_CONSTANT"); // "sOMECONSTANT" (splits on non-word chars)

kebabToCamel("vc-data-table"); // "vcDataTable"
kebabToCamel("my-component-name"); // "myComponentName"

kebabToPascal("vc-data-table"); // "VcDataTable"
kebabToPascal("dashboard-widget"); // "DashboardWidget"
```

## Date Utilities

Located in `date/`. Uses `date-fns` internally with lazy locale loading.

| Function                | Signature                                                                    | Description                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `formatDateRelative`    | `(value: DateInput, localeCode?: string) => string`                          | Formats date as relative time (e.g. "3 hours ago") via `formatDistanceToNow`                    |
| `formatDateWithPattern` | `(value: DateInput, momentFormatStr: string, localeCode?: string) => string` | Formats date using a Moment.js-style format string, auto-converted to date-fns tokens           |
| `convertMomentFormat`   | `(momentFormat: string) => string`                                           | Converts a Moment.js format string to date-fns format (e.g. `YYYY` to `yyyy`, `DD` to `dd`)     |
| `resolveLocale`         | `(localeCode: string) => Promise<Locale>`                                    | Async-loads a date-fns locale by code, with fallback to base language then `enUS`               |
| `resolveLocaleSync`     | `(localeCode: string) => Locale`                                             | Returns cached locale synchronously; triggers async load if missing, returns `enUS` as fallback |

`DateInput` is `string | number | Date | null | undefined`.

### Date utility examples

```typescript
import { formatDateRelative, formatDateWithPattern, convertMomentFormat } from "@vc-shell/framework";

// Relative time
formatDateRelative("2024-01-15"); // "about 2 years ago"
formatDateRelative(new Date(Date.now() - 3600000)); // "about 1 hour ago"
formatDateRelative("2024-01-15", "de"); // "vor etwa 2 Jahren"

// Formatted dates using Moment.js-style patterns (auto-converted to date-fns)
formatDateWithPattern("2024-01-15", "LL"); // "January 15, 2024"
formatDateWithPattern("2024-06-01", "DD/MM/YYYY"); // "01/06/2024"
formatDateWithPattern("2024-01-15", "LL", "de"); // "15. Januar 2024"

// Format conversion
convertMomentFormat("YYYY-MM-DD"); // "yyyy-MM-dd"
convertMomentFormat("DD/MM/YYYY"); // "dd/MM/yyyy"
convertMomentFormat("hh:mm A"); // "hh:mm a"
```

## Error Utilities

### Display errors (`error.ts`)

| Export             | Signature                                     | Description                                                                         |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `DisplayableError` | `class extends Error`                         | Normalized error with `details: string` and `originalError: unknown` properties     |
| `parseError`       | `(errorToParse: unknown) => DisplayableError` | Parses any error type (Axios, plain object, string, JSON) into a `DisplayableError` |

### Typed framework errors (`errorTypes.ts`)

| Class               | Code                 | Constructor                                               |
| ------------------- | -------------------- | --------------------------------------------------------- |
| `FrameworkError`    | custom               | `(message, code, context?)` -- base class with `toJSON()` |
| `ValidationError`   | `VALIDATION_ERROR`   | `(message, context?)`                                     |
| `ServiceError`      | `SERVICE_ERROR`      | `(message, context?)`                                     |
| `InjectionError`    | `INJECTION_ERROR`    | `(serviceName, context?)`                                 |
| `RegistrationError` | `REGISTRATION_ERROR` | `(componentName, reason, context?)`                       |
| `BladeError`        | `BLADE_ERROR`        | `(message, bladeId?, context?)`                           |
| `ModuleLoadError`   | `MODULE_LOAD_ERROR`  | `(moduleId, reason, context?)`                            |

| Function           | Signature                                           | Description                                                       |
| ------------------ | --------------------------------------------------- | ----------------------------------------------------------------- |
| `isFrameworkError` | `(error: unknown) => error is FrameworkError`       | Type guard for `FrameworkError` instances                         |
| `wrapError`        | `(error: unknown, code?: string) => FrameworkError` | Wraps any error into a `FrameworkError`, preserving existing ones |

### Error utility examples

```typescript
import { parseError, isFrameworkError, InjectionError } from "@vc-shell/framework";

try {
  await apiClient.save(data);
} catch (err) {
  const parsed = parseError(err);
  console.log(parsed.message); // "Request failed with status 422"
  console.log(parsed.details); // "Validation error: name is required"
}

if (isFrameworkError(err)) {
  console.log(err.code); // e.g. "INJECTION_ERROR"
}

throw new InjectionError("WidgetService"); // "WidgetService is not provided. ..."
```

## ID Generation

| Function     | Signature      | Description                                                                       |
| ------------ | -------------- | --------------------------------------------------------------------------------- |
| `generateId` | `() => string` | Returns a random 7-character alphanumeric string via `Math.random().toString(36)` |

```typescript
import { generateId } from "@vc-shell/framework";

const id = generateId(); // e.g. "k3x9f2a"
const widgetId = `widget-${generateId()}`; // e.g. "widget-m7p2x1b"
```

## Logger

Factory-based logger with level filtering. Default level: `debug` in dev, `warn` in production.

| Export         | Type                           | Description                                                                                                |
| -------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `createLogger` | `(context?: string) => Logger` | Creates a logger instance with `debug`, `info`, `warn`, `error`, `child`, `setLevel`, `setEnabled` methods |
| `logger`       | `Logger`                       | Default logger instance (no context prefix)                                                                |
| `loggers`      | `Record<string, Logger>`       | Pre-configured loggers: `core`, `ui`, `shared`, `plugins`, `services`, `composables`                       |
| `LogLevel`     | `type`                         | `"debug" \| "info" \| "warn" \| "error" \| "none"`                                                         |

### Logger examples

```typescript
import { createLogger, loggers } from "@vc-shell/framework";

const log = createLogger("OrdersModule");
log.info("Module initialized"); // [OrdersModule] Module initialized
log.error("Failed to load orders", error); // [OrdersModule] Failed to load orders Error: ...

const subLog = log.child("DataSync");
subLog.debug("Syncing 50 records"); // [OrdersModule:DataSync] Syncing 50 records

log.setLevel("error"); // Only errors will be logged
```

## Tip: Use createLogger Instead of console.log

Framework loggers include context prefixes, respect log level settings, and can be disabled per-module. Using raw `console.log` bypasses these controls:

```typescript
// Bad: no context, no level control
console.log("Order saved");

// Good: structured, filterable, respects log level
const log = createLogger("OrdersModule");
log.info("Order saved", { orderId: order.id });
```

## Common Mistake

The `convertMomentFormat` function maps common Moment.js tokens to date-fns tokens, but does not cover every edge case. Uncommon tokens (like `X` for Unix timestamp) may need manual handling:

```typescript
convertMomentFormat("YYYY-MM-DD"); // "yyyy-MM-dd" (correct)
convertMomentFormat("X"); // May not convert as expected
```

## Related

- `framework/core/plugins/global-error-handler/` -- uses `parseError()` for global error catching
- `framework/core/plugins/i18n/` -- date formatting respects the active locale
- `framework/core/constants/` -- `UI_CONSTANTS.DEBOUNCE_DEFAULT_MS` for standard delays
