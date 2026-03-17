# useBeforeUnload

Prevents the browser tab from closing when unsaved changes exist by hooking into the `beforeunload` event.

## When to Use

- Protect forms or blades with unsaved edits from accidental tab/window close
- When NOT to use: for in-app navigation guards (use Vue Router `beforeRouteLeave` or blade `onBeforeClose` instead)

## Basic Usage

```typescript
import { useBeforeUnload } from '@vc-shell/framework';

const isModified = computed(() => hasUnsavedChanges.value);
useBeforeUnload(isModified);
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `modified` | `ComputedRef<boolean>` | Yes | When `true`, the browser shows a leave-confirmation dialog |

### Returns

| Property | Type | Description |
|---|---|---|
| `modified` | `ComputedRef<boolean>` | Pass-through of the input ref |

## Details

- Registers the listener on `onBeforeMount` and removes it on `onBeforeUnmount`.
- The browser's native confirmation dialog text cannot be customized (browser security restriction).

## Related

- `useModificationTracker` -- tracks whether a value has been modified
