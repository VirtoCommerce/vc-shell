# useModificationTracker

Tracks deep changes to a value and reports whether it has been modified compared to its original (pristine) state.

## When to Use

- Detect unsaved changes in blade forms to enable/disable save buttons or show confirmation dialogs
- Track modifications to complex nested objects (arrays, nested properties)
- When NOT to use: for simple boolean flags (a plain `ref` is sufficient)

## Basic Usage

```typescript
import { useModificationTracker } from '@vc-shell/framework';

// With a static initial value
const { currentValue, isModified, resetModificationState } = useModificationTracker({ name: '', price: 0 });

// With a reactive source (e.g., data loaded from API)
const { currentValue, isModified, resetModificationState } = useModificationTracker(apiData);
// currentValue updates automatically when apiData changes (if user hasn't modified it yet)

// Bind to form
// <input v-model="currentValue.name" />

// After save
resetModificationState(); // currentValue becomes the new pristine baseline
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `initialValueProp` | `T \| Ref<T>` | Yes | Initial value or reactive ref to track |

### Returns

| Property | Type | Description |
|---|---|---|
| `currentValue` | `Ref<T>` | The working value (bind to v-model) |
| `pristineValue` | `Ref<T>` | The "clean" baseline value |
| `isModified` | `DeepReadonly<Ref<boolean>>` | `true` when `currentValue` differs from `pristineValue` |
| `resetModificationState` | `(newBaseline?: T \| Ref<T>) => void` | Reset modification tracking; optionally set a new baseline |

## Details

- Uses deep equality with semantic empty-value normalization: `null`, `undefined`, and `""` are treated as equal to avoid false positives from API responses.
- When `initialValueProp` is a `Ref` and changes externally, `pristineValue` updates automatically. If the user has not modified `currentValue`, it also updates to match.
- All values are deep-cloned to prevent shared references.

## Related

- `useBeforeUnload` -- pair with `isModified` to prevent tab close on unsaved changes
