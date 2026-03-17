# Global Error Handler Plugin

Catches unhandled errors across the application and displays user-facing toast notifications. Covers Vue component errors, unhandled promise rejections, and uncaught JavaScript errors.

## Overview

The global error handler installs three layers of error catching:

1. **Vue `app.config.errorHandler`** -- catches errors thrown inside Vue components (render, lifecycle, watchers)
2. **`window.addEventListener("unhandledrejection")`** -- catches unhandled promise rejections
3. **`window.addEventListener("error")`** -- catches uncaught synchronous JavaScript errors

All caught errors are parsed into human-readable messages via `parseError()` and shown as toast notifications with an 8-second timeout. A deduplication window (3 seconds) prevents the same error from flooding the UI.

## Installation / Registration

```typescript
// Automatic -- called by the framework during app initialization.
import { setupGlobalErrorHandlers } from "@vc-shell/framework";
setupGlobalErrorHandlers(app);
```

## API

### `setupGlobalErrorHandlers(app: App): void`

Installs all error handlers on the given Vue app instance.

| Behavior | Description |
|----------|-------------|
| Chains to existing `errorHandler` | Does not replace a previously registered Vue error handler |
| Idempotent for window listeners | Uses `__VC_GLOBAL_ERROR_HANDLERS_INSTALLED__` guard to prevent duplicate listeners |
| Deduplication | Same error (by `name:message` key) is suppressed for 3 seconds |
| Notification IDs | Each toast gets a unique `notificationId` prefixed by source (`global-vue-`, `global-rejection-`, `global-error-`) |
| SSR-safe | Skips `window` event listeners when `typeof window === "undefined"` |

## Usage

### Automatic Error Display

No action needed from module developers. Any unhandled error in component code, async operations, or global scope will automatically show a toast:

```typescript
// This unhandled rejection will trigger a toast notification:
async function loadData() {
  const response = await fetch("/api/orders"); // network error -> toast
  return response.json();
}
```

### Handling Errors Manually (Suppressing Global Handler)

To prevent the global handler from catching an error, handle it in your own code:

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Handle locally -- global handler won't see this
  notification.error("Custom error message");
}
```

## Related

- `framework/core/utilities/error.ts` -- `parseError()` function that extracts readable messages
- `framework/shared/components/notifications/core/notification.ts` -- `notification.error()` toast API
- `framework/core/utilities/logger.ts` -- `createLogger()` for structured console logging
