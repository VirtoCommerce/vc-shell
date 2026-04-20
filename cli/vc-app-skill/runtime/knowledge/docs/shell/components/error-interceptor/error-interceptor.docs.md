# Error Interceptor

A renderless component that captures Vue `onErrorCaptured` errors and surfaces them to child slots or the blade error banner.

## Overview

`ErrorInterceptor` uses Vue's `onErrorCaptured` lifecycle hook (via the `useErrorHandler` composable) to catch errors thrown by descendant components. When used inside a blade, it automatically sets the blade's error state via the BladeStack, which displays an error banner in the blade header.

The component is renderless -- it renders its default slot and passes the current error and a reset function as slot props.

## How It Works

1. `ErrorInterceptor` injects `BladeDescriptorKey` and `BladeStackKey` to detect if it is inside a blade.
2. When inside a blade (`hasBlade = true`), errors are intercepted and forwarded to `bladeStack.setBladeError()`. This displays the error in the blade's built-in error banner and prevents the error from propagating to the global error handler (avoiding duplicate toast notifications).
3. When not inside a blade or when `capture` is true, errors are captured and exposed via the slot's `error` prop.
4. Pending `useAsync` error notifications are cancelled via `cancelPendingErrorNotification` when the blade banner takes over.

## Props

| Prop      | Type      | Default | Description                                      |
| --------- | --------- | ------- | ------------------------------------------------ |
| `capture` | `boolean` | `false` | Force error capture even outside a blade context |

## Slot Props

| Prop    | Type                       | Description                             |
| ------- | -------------------------- | --------------------------------------- |
| `error` | `DisplayableError \| null` | The captured error, or null if no error |
| `reset` | `() => void`               | Clears the error state                  |

## Usage

### Inside a blade (automatic error banner)

```vue
<ErrorInterceptor>
  <template #default="{ error, reset }">
    <MyBladeContent />
    <!-- Error is shown in the blade header automatically -->
  </template>
</ErrorInterceptor>
```

### Standalone error boundary

```vue
<ErrorInterceptor capture>
  <template #default="{ error, reset }">
    <div v-if="error" class="tw-p-4">
      <p>Something went wrong: {{ error }}</p>
      <VcButton @click="reset">Try Again</VcButton>
    </div>
    <MyComponent v-else />
  </template>
</ErrorInterceptor>
```

## Behavior

- **Inside a blade**: Errors set `BladeDescriptor.error` via the stack. The blade header renders the error banner. Calling `reset` clears the blade error.
- **Outside a blade** (with `capture`): Errors are stored in a local ref and exposed via slot props. No blade banner is involved.
- **Error propagation**: When inside a blade, the error is stopped from propagating (prevents duplicate toasts from the global handler). The `capture` prop also stops propagation.

## Exports

```typescript
import { ErrorInterceptor } from "@vc-shell/framework";
```

The component is registered globally -- it can be used in templates without importing.

## Tips

- Every blade template should wrap its content in `ErrorInterceptor` for automatic error banner display.
- The `reset` function is useful for retry patterns -- clear the error and let the user re-trigger the operation.
- `DisplayableError` can be an `Error` instance or a plain string.

## Related

- `framework/core/composables/useErrorHandler/` -- the underlying composable
- `framework/core/utilities/pendingErrorNotifications.ts` -- cancels deferred toasts
- `framework/shared/components/blade-navigation/` -- BladeStack error management
