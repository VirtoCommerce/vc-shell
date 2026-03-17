# Framework Utilities

Utility functions exported from `@vc-shell/framework` via `core/utilities/index.ts`.

## String Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| `camelToSnake` | `(str: string) => string` | Converts camelCase to snake_case |
| `camelize` | `(str: string) => string` | Converts delimited string to camelCase (splits on non-word chars) |
| `kebabToCamel` | `(str: string) => string` | Converts kebab-case to camelCase |
| `kebabToPascal` | `(str: string) => string` | Converts kebab-case to PascalCase |

## Date Utilities

Located in `date/`. Uses `date-fns` internally with lazy locale loading.

| Function | Signature | Description |
|----------|-----------|-------------|
| `formatDateRelative` | `(value: DateInput, localeCode?: string) => string` | Formats date as relative time (e.g. "3 hours ago") via `formatDistanceToNow` |
| `formatDateWithPattern` | `(value: DateInput, momentFormatStr: string, localeCode?: string) => string` | Formats date using a Moment.js-style format string, auto-converted to date-fns tokens |
| `convertMomentFormat` | `(momentFormat: string) => string` | Converts a Moment.js format string to date-fns format (e.g. `YYYY` to `yyyy`, `DD` to `dd`) |
| `resolveLocale` | `(localeCode: string) => Promise<Locale>` | Async-loads a date-fns locale by code, with fallback to base language then `enUS` |
| `resolveLocaleSync` | `(localeCode: string) => Locale` | Returns cached locale synchronously; triggers async load if missing, returns `enUS` as fallback |

`DateInput` is `string | number | Date | null | undefined`.

## Error Utilities

### Display errors (`error.ts`)

| Export | Signature | Description |
|--------|-----------|-------------|
| `DisplayableError` | `class extends Error` | Normalized error with `details: string` and `originalError: unknown` properties |
| `parseError` | `(errorToParse: unknown) => DisplayableError` | Parses any error type (Axios, plain object, string, JSON) into a `DisplayableError` |

### Typed framework errors (`errorTypes.ts`)

| Class | Code | Constructor |
|-------|------|-------------|
| `FrameworkError` | custom | `(message, code, context?)` — base class with `toJSON()` |
| `ValidationError` | `VALIDATION_ERROR` | `(message, context?)` |
| `ServiceError` | `SERVICE_ERROR` | `(message, context?)` |
| `InjectionError` | `INJECTION_ERROR` | `(serviceName, context?)` |
| `RegistrationError` | `REGISTRATION_ERROR` | `(componentName, reason, context?)` |
| `BladeError` | `BLADE_ERROR` | `(message, bladeId?, context?)` |
| `ModuleLoadError` | `MODULE_LOAD_ERROR` | `(moduleId, reason, context?)` |

| Function | Signature | Description |
|----------|-----------|-------------|
| `isFrameworkError` | `(error: unknown) => error is FrameworkError` | Type guard for `FrameworkError` instances |
| `wrapError` | `(error: unknown, code?: string) => FrameworkError` | Wraps any error into a `FrameworkError`, preserving existing ones |

## ID Generation

| Function | Signature | Description |
|----------|-----------|-------------|
| `generateId` | `() => string` | Returns a random 7-character alphanumeric string via `Math.random().toString(36)` |

## Logger

Factory-based logger with level filtering. Default level: `debug` in dev, `warn` in production.

| Export | Type | Description |
|--------|------|-------------|
| `createLogger` | `(context?: string) => Logger` | Creates a logger instance with `debug`, `info`, `warn`, `error`, `child`, `setLevel`, `setEnabled` methods |
| `logger` | `Logger` | Default logger instance (no context prefix) |
| `loggers` | `Record<string, Logger>` | Pre-configured loggers: `core`, `ui`, `shared`, `plugins`, `services`, `composables` |
| `LogLevel` | `type` | `"debug" \| "info" \| "warn" \| "error" \| "none"` |

## Pending Error Notifications (internal)

Not re-exported from `index.ts` to avoid circular dependencies. Import directly from `@core/utilities/pendingErrorNotifications`.

| Function | Signature | Description |
|----------|-----------|-------------|
| `setPendingErrorNotification` | `(error: object, timerId: ReturnType<typeof setTimeout>, notifId: string) => void` | Registers a deferred toast for an error (called by `useAsync`) |
| `cancelPendingErrorNotification` | `(error: unknown) => boolean` | Cancels a pending toast if the error is caught by `ErrorInterceptor` for blade banner display |

## Usage Examples

```typescript
import {
  camelToSnake,
  kebabToPascal,
  generateId,
  createLogger,
  parseError,
  isFrameworkError,
  formatDateRelative,
  formatDateWithPattern,
} from "@vc-shell/framework";

camelToSnake("myPropName");          // "my_prop_name"
kebabToPascal("vc-data-table");      // "VcDataTable"
generateId();                        // e.g. "k3x9f2a"

const log = createLogger("MyModule");
log.info("initialized");
log.child("SubSystem").warn("slow query");

const err = parseError(axiosError);
console.log(err.message, err.details);

formatDateRelative("2024-01-15");           // "about 2 years ago"
formatDateWithPattern("2024-01-15", "LL");  // "January 15, 2024"
```
