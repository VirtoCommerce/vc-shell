# useConnectionStatus

Monitors the browser's network connectivity and shows a persistent notification when the user goes offline. This composable wraps `@vueuse/core`'s `useNetwork()` and adds framework-specific behavior: it displays a warning notification via the vc-shell notification system, applies a `vc-offline` CSS class to `<html>` for global styling hooks, and logs state changes through the framework logger. The state is a module-level singleton, so only one set of event listeners is ever created regardless of how many components call the composable.

## When to Use

- Reactively check online/offline status anywhere in the app to disable buttons, show banners, or skip network requests
- Automatically notify users when they lose connectivity (happens out of the box)
- When NOT to use: for server-side health checks or API availability monitoring (this only detects browser-level network state via `navigator.onLine`)

## Quick Start

```vue
<script setup lang="ts">
import { useConnectionStatus } from '@vc-shell/framework';

const { isOnline } = useConnectionStatus();
</script>

<template>
  <VcBlade title="Order Details">
    <div v-if="!isOnline" class="tw-bg-yellow-100 tw-p-2 tw-rounded tw-mb-4">
      You are offline. Changes will not be saved until connectivity is restored.
    </div>

    <VcButton :disabled="!isOnline" @click="save">Save Order</VcButton>
  </VcBlade>
</template>
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `isOnline` | `Readonly<Ref<boolean>>` | `true` when the browser has network connectivity, `false` when offline. Read-only to prevent external mutation. |

## How It Works

On the very first call to `useConnectionStatus()`, the composable initializes a watcher on `@vueuse/core`'s `useNetwork().isOnline`. This watcher runs with `{ immediate: true }`, so the state is correct from the start. Subsequent calls skip initialization and return the same shared reactive state.

When the network drops:
1. A warning notification is shown with a stable ID (`vc-framework-offline-status`) so it cannot be duplicated.
2. The CSS class `vc-offline` is added to `document.documentElement`.
3. A warning is logged via `createLogger`.

When connectivity is restored, the notification is removed, the CSS class is cleared, and an info message is logged.

## Recipe: Disabling Auto-Save While Offline

```vue
<script setup lang="ts">
import { useConnectionStatus } from '@vc-shell/framework';
import { watch, ref } from 'vue';

const { isOnline } = useConnectionStatus();
const pendingSave = ref(false);
const formData = ref({ name: '' });

// Auto-save on changes, but only when online
watch(formData, () => {
  if (isOnline.value) {
    saveToServer(formData.value);
  } else {
    pendingSave.value = true;
  }
}, { deep: true });

// Flush pending save when connectivity returns
watch(isOnline, (online) => {
  if (online && pendingSave.value) {
    saveToServer(formData.value);
    pendingSave.value = false;
  }
});

async function saveToServer(data: typeof formData.value) {
  await api.updateItem(data);
}
</script>
```

## Recipe: Custom Offline Styling with the CSS Class

The composable adds `vc-offline` to `<html>` when offline. You can use this in your global styles:

```scss
// In your app's global stylesheet
html.vc-offline {
  .vc-app-bar {
    border-bottom: 2px solid var(--warning-500);
  }
}
```

## Tips

- **Singleton by design.** You can call `useConnectionStatus()` in 50 different components and they all share the same underlying `useNetwork()` watcher and reactive state. There is zero overhead from multiple calls.
- **`navigator.onLine` has limitations.** The browser considers itself "online" if it has any network interface active, even if that interface cannot reach the internet. A connected WiFi with no gateway will still report `isOnline: true`.
- **The notification cannot be dismissed while offline.** Because it uses `timeout: false`, it stays visible until the `notification.remove()` call fires on reconnection. This is intentional -- users should always know they are offline.

## Related

- `@vueuse/core` `useNetwork` -- underlying browser API wrapper
- `notification` from `@shared/components/notifications` -- the notification system used to display the offline warning
