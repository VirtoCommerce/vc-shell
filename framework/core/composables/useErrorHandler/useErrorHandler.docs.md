# useErrorHandler

Captures and normalizes errors within a component's subtree using Vue's `onErrorCaptured` hook. Tracks errors to Application Insights and emits them for parent components to handle.

## When to Use

- In blade or container components to catch and display errors from child components
- When you want automatic Application Insights tracking of errors with user context
- When NOT to use: for manual try/catch error handling in composables or async functions

## Basic Usage

```typescript
import { useErrorHandler } from '@vc-shell/framework';

const { error, reset } = useErrorHandler(true);
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capture` | `boolean` | No | If `true`, prevents the error from propagating further up the component tree. Defaults to `undefined` (error continues propagating). |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `error` | `Ref<DisplayableError \| null>` | The most recently captured error, or `null` |
| `reset` | `() => void` | Clears the error state and emits a `reset` event on the component |

### DisplayableError

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Short, user-facing error message |
| `details` | `string` | Detailed technical description |
| `originalError` | `unknown` | The original thrown value |

### Emitted Events

The composable emits events on the current component instance:
- `error` -- emitted with the `DisplayableError` when an error is captured
- `reset` -- emitted when `reset()` is called

## Common Patterns

### Error boundary blade

```vue
<template>
  <div v-if="error" class="tw-p-4 tw-text-red-500">
    <p>{{ error.message }}</p>
    <button @click="reset">Dismiss</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { useErrorHandler } from '@vc-shell/framework';

const { error, reset } = useErrorHandler(true);
</script>
```

## Related

- `DisplayableError` -- error class from `@core/utilities/error`
- [useAppInsights](../useAppInsights/) -- Application Insights telemetry
