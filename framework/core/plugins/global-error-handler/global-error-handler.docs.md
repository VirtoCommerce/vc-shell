# Global Error Handler Plugin

Catches unhandled errors across the application and displays user-facing toast notifications. Covers Vue component errors, unhandled promise rejections, and uncaught JavaScript errors.

## Overview

In a complex admin shell with dynamically loaded modules, errors can originate from many places: component render functions, lifecycle hooks, watchers, async API calls, or third-party libraries. Without centralized error handling, these errors either crash silently or produce cryptic console messages that users never see.

The global error handler solves this by installing three layers of error catching that cover all common error sources. Every caught error is parsed into a human-readable message and displayed as a toast notification, ensuring users always know when something goes wrong -- even if the module developer forgot to add error handling.

## When to Use

- This plugin is always active -- it catches unhandled errors from Vue components, async rejections, and uncaught JS errors automatically
- You don't need to install or configure it -- the framework does this during app setup
- When to be aware: if you handle errors manually in a composable (try/catch), the global handler won't fire for those -- which is the desired behavior

### Three Layers of Error Catching

1. **Vue `app.config.errorHandler`** -- catches errors thrown inside Vue components (render functions, lifecycle hooks, watchers, event handlers)
2. **`window.addEventListener("unhandledrejection")`** -- catches unhandled promise rejections (e.g., failed API calls without try/catch)
3. **`window.addEventListener("error")`** -- catches uncaught synchronous JavaScript errors

All caught errors are parsed into human-readable messages via `parseError()` and shown as toast notifications with an 8-second timeout. A deduplication window (3 seconds) prevents the same error from flooding the UI.

## Installation / Registration

```typescript
// Automatic -- called by the framework during app initialization.
import { setupGlobalErrorHandlers } from "@vc-shell/framework";
setupGlobalErrorHandlers(app);
```

Module developers do not need to call this function. It is invoked once during the framework bootstrap process.

## API

### `setupGlobalErrorHandlers(app: App): void`

Installs all error handlers on the given Vue app instance.

| Behavior                          | Description                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Chains to existing `errorHandler` | Does not replace a previously registered Vue error handler; calls it after processing                              |
| Idempotent for window listeners   | Uses `__VC_GLOBAL_ERROR_HANDLERS_INSTALLED__` guard to prevent duplicate listeners                                 |
| Deduplication                     | Same error (by `name:message` key) is suppressed for 3 seconds                                                     |
| Notification IDs                  | Each toast gets a unique `notificationId` prefixed by source (`global-vue-`, `global-rejection-`, `global-error-`) |
| SSR-safe                          | Skips `window` event listeners when `typeof window === "undefined"`                                                |
| Map cleanup                       | The deduplication map auto-prunes entries older than 3 seconds when it exceeds 50 entries                          |

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

```typescript
// This Vue component error will also trigger a toast:
const count = computed(() => {
  // TypeError if items is undefined -> caught by Vue errorHandler -> toast
  return items.value.length;
});
```

### Handling Errors Manually (Suppressing Global Handler)

To prevent the global handler from catching an error, handle it in your own code with try/catch:

```typescript
import { notification } from "@vc-shell/framework";

try {
  await riskyOperation();
} catch (error) {
  // Handle locally -- global handler won't see this
  notification.error("Failed to save: please check your input");
}
```

### Combining with useAsync

The `useAsync` composable integrates with the error handler. Errors from `useAsync` actions are caught and shown as toasts via the same mechanism. If you want to suppress the global toast and show a blade-level error banner instead, use the `ErrorInterceptor` component:

```vue
<template>
  <VcBlade title="Order Details">
    <ErrorInterceptor>
      <!-- Errors from async operations inside this tree
           are caught by ErrorInterceptor and shown as banners
           instead of global toasts -->
      <OrderForm :order="order" />
    </ErrorInterceptor>
  </VcBlade>
</template>
```

## Tip: Use parseError for custom error handling

The same `parseError()` utility used by the global handler is available for your own error handling code. It normalizes Axios errors, plain objects, strings, and JSON error responses into a consistent `DisplayableError` format:

```typescript
import { parseError } from "@vc-shell/framework";

try {
  await apiClient.updateOrder(order);
} catch (err) {
  const parsed = parseError(err);
  console.log(parsed.message); // Human-readable message
  console.log(parsed.details); // Additional details (e.g., validation errors)
}
```

## Common Mistake

Do not re-throw errors inside a catch block if you want to suppress the global toast. A re-thrown error becomes a new unhandled rejection and will be caught by the global handler:

```typescript
// Bad: re-throwing still triggers the global handler
try {
  await riskyOperation();
} catch (error) {
  logToAnalytics(error);
  throw error; // This becomes an unhandled rejection -> toast appears
}

// Good: handle completely or don't re-throw
try {
  await riskyOperation();
} catch (error) {
  logToAnalytics(error);
  notification.error("Operation failed");
  // No re-throw -> global handler stays quiet
}
```

## Related

- `framework/core/utilities/error.ts` -- `parseError()` function that extracts readable messages
- `framework/shared/components/notifications/core/notification.ts` -- `notification.error()` toast API
- `framework/core/utilities/logger.ts` -- `createLogger()` for structured console logging
- `framework/shared/components/error-interceptor/` -- blade-level error boundary that intercepts errors before the global handler
