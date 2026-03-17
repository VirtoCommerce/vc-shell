# useConnectionStatus

Monitors the browser's network connectivity and shows a persistent notification when offline.

## When to Use

- Reactively check online/offline status anywhere in the app
- When NOT to use: for server-side health checks (this only detects browser network state)

## Basic Usage

```typescript
import { useConnectionStatus } from '@vc-shell/framework';

const { isOnline } = useConnectionStatus();

watchEffect(() => {
  if (!isOnline.value) {
    disableSubmitButton();
  }
});
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `isOnline` | `Readonly<Ref<boolean>>` | `true` when the browser has network connectivity |

## Details

- Singleton: the network watcher is set up once on first call; subsequent calls share the same state.
- When offline, a warning notification appears and the `vc-offline` CSS class is added to `<html>`.
- When connectivity is restored, the notification is removed and the CSS class is cleared.
- Uses `@vueuse/core` `useNetwork()` internally.

## Related

- `@vueuse/core` `useNetwork` -- underlying browser API wrapper
