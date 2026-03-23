# useErrorHandler

Captures and normalizes errors within a component's subtree using Vue's `onErrorCaptured` hook. This composable acts as an error boundary: it catches errors thrown by any child component, normalizes them into a `DisplayableError` with a user-friendly `message` and technical `details`, automatically reports them to Application Insights with user context, and emits events so parent components can react. It also includes re-entrancy protection to prevent infinite error loops when the error display itself triggers an error.

## When to Use

- In blade or container components to catch and display errors from child components without crashing the entire app
- When you want automatic Application Insights tracking of errors with user ID and name
- To create error boundary components that show a fallback UI when children fail
- When NOT to use: for manual try/catch error handling in composables or async functions -- use standard try/catch there and handle errors explicitly

## Quick Start

```vue
<script setup lang="ts">
import { useErrorHandler } from '@vc-shell/framework';

// capture: true prevents the error from propagating further up the tree
const { error, reset } = useErrorHandler(true);
</script>

<template>
  <div v-if="error" class="tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded">
    <p class="tw-text-red-700 tw-font-semibold">{{ error.message }}</p>
    <p class="tw-text-red-500 tw-text-sm tw-mt-1">{{ error.details }}</p>
    <VcButton class="tw-mt-2" @click="reset">Dismiss</VcButton>
  </div>
  <slot v-else />
</template>
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capture` | `boolean` | No | If `true`, prevents the error from propagating further up the component tree (the error is "swallowed" at this level). If `false` or `undefined`, the error continues propagating to parent error handlers. |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `error` | `Ref<DisplayableError \| null>` | The most recently captured error, or `null` if no error has occurred or it has been reset. |
| `reset` | `() => void` | Clears the error state (sets `error` to `null`) and emits a `reset` event on the component instance. |

### DisplayableError

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Short, user-facing error message suitable for display in the UI. |
| `details` | `string` | Detailed technical description (stack trace, API error body, etc.). |
| `originalError` | `unknown` | The original thrown value, preserved for programmatic inspection. |

### Emitted Events

The composable emits events on the current component instance (accessible via `@error` and `@reset` in the parent template):
- `error` -- emitted with the `DisplayableError` when an error is captured
- `reset` -- emitted when `reset()` is called

## How It Works

1. **Capture**: Vue's `onErrorCaptured` hook fires whenever a descendant component throws. The composable normalizes the thrown value via `parseError()` into a `DisplayableError`.

2. **Re-entrancy guard**: An `isProcessing` ref prevents recursive error handling. If the error display template itself throws (e.g., a rendering bug), the inner error is not re-processed. The guard resets on `nextTick`.

3. **Telemetry**: If Application Insights is available, the error is tracked via `appInsights.trackException()` with the current user's `id` and `userName` as custom properties.

4. **Propagation**: The return value of `onErrorCaptured` controls propagation. When `capture` is `true`, the hook returns `false` (stop propagation). Otherwise, it returns `true` (continue propagation).

## Recipe: Error Boundary Wrapper Component

Create a reusable error boundary that wraps any blade content:

```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { useErrorHandler } from '@vc-shell/framework';

const props = defineProps<{
  fallbackMessage?: string;
}>();

const { error, reset } = useErrorHandler(true);
</script>

<template>
  <div v-if="error" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8">
    <VcIcon icon="fas fa-exclamation-triangle" class="tw-text-4xl tw-text-warning-500 tw-mb-4" />
    <h3 class="tw-text-lg tw-font-semibold">
      {{ fallbackMessage ?? 'Something went wrong' }}
    </h3>
    <p class="tw-text-sm tw-text-gray-500 tw-mt-2">{{ error.message }}</p>
    <VcButton class="tw-mt-4" @click="reset">Try Again</VcButton>
  </div>
  <slot v-else />
</template>
```

Usage in a blade:

```vue
<template>
  <VcBlade title="Product Details">
    <ErrorBoundary fallback-message="Failed to load product">
      <ProductForm :product-id="productId" />
    </ErrorBoundary>
  </VcBlade>
</template>
```

## Recipe: Listening to Error Events from a Parent

```vue
<template>
  <ChildBlade @error="onChildError" @reset="onChildReset" />
</template>

<script setup lang="ts">
function onChildError(error: DisplayableError) {
  console.error('Child blade error:', error.message);
  // Optionally show a notification or log to external service
}

function onChildReset() {
  console.log('Child blade error was dismissed');
}
</script>
```

## Tips

- **Use `capture: true` for top-level error boundaries.** Without it, the error propagates to Vue's global error handler and may be logged as an unhandled error in the console.
- **`reset()` does not retry the failed operation.** It only clears the error state. If you want retry behavior, combine `reset()` with re-fetching data or re-rendering the child component (e.g., via a `:key` change).
- **The re-entrancy guard resets on `nextTick`.** This means two errors thrown in the same synchronous microtask will only capture the first one. Errors in subsequent ticks are handled normally.
- **Application Insights must be configured.** If the `vue3-application-insights` plugin is not installed, `appInsights` will be `undefined` and telemetry is silently skipped. The composable still works for local error display.

## Related

- `DisplayableError` -- error class from `@core/utilities/error`
- [useAppInsights](../useAppInsights/useAppInsights.docs.md) -- Application Insights telemetry integration
- Vue `onErrorCaptured` -- the underlying Vue lifecycle hook
