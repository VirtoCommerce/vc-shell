# useSlowNetworkDetection

Detects slow network conditions and shows a persistent warning notification so users know why the UI is unresponsive. Two detection channels work together: a **proactive** channel reads `navigator.connection.effectiveType` to catch weak connections before any request is made, and a **reactive** channel flags API requests that have been pending for more than 5 seconds. The notification auto-dismisses with a 3-second delay after conditions clear, preventing flicker. When the browser goes fully offline, the slow-network notification is suppressed in favor of the existing offline notification from `useConnectionStatus`.

Like `useConnectionStatus`, this is a module-level singleton — calling it from multiple components shares the same state and listeners.

## When to Use

- Reactively check `isSlowNetwork` to show skeleton loaders, disable auto-refresh, or display inline warnings
- The notification is automatic — no extra code needed beyond calling the composable once at app startup (already done in `framework/index.ts`)
- Use `trackRequest` / `untrackRequest` only if you have custom fetch logic outside the standard interceptor (the built-in fetch interceptor already tracks all `/api/*` requests)
- When NOT to use: for offline detection (use `useConnectionStatus` instead) or for measuring exact latency/bandwidth

## Quick Start

The composable is initialized automatically at app startup. To reactively read the slow-network state in a component:

```vue
<script setup lang="ts">
import { useSlowNetworkDetection } from '@vc-shell/framework';

const { isSlowNetwork } = useSlowNetworkDetection();
</script>

<template>
  <VcBlade title="Products">
    <VcBanner v-if="isSlowNetwork" variant="warning" icon="lucide-wifi">
      <template #title>Slow connection</template>
      Loading may take longer than usual.
    </VcBanner>

    <!-- blade content -->
  </VcBlade>
</template>
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `isSlowNetwork` | `Readonly<Ref<boolean>>` | `true` when the network is slow (either channel active). Read-only. |
| `trackRequest` | `(id: string) => void` | Start tracking a request. If it isn't untracked within 5 s, it counts as slow. |
| `untrackRequest` | `(id: string) => void` | Stop tracking a request. Cancels the timer or decrements the slow count. |

### Constants

| Name | Value | Purpose |
|---|---|---|
| `SLOW_REQUEST_THRESHOLD_MS` | `5000` | Time before a pending request is considered slow |
| `DISMISS_DELAY_MS` | `3000` | Delay before hiding the notification after recovery |
| `SLOW_EFFECTIVE_TYPES` | `["slow-2g", "2g"]` | Connection types flagged as slow |

## How It Works

### Channel 1: effectiveType (proactive)

On first call, the composable checks `navigator.connection.effectiveType` (Network Information API). If the browser reports `slow-2g` or `2g`, `isSlowNetwork` becomes `true` immediately. A `change` event listener keeps the state in sync. Browsers without this API (Firefox, Safari) silently skip this channel.

### Channel 2: Request timers (reactive)

The fetch interceptor in `framework/core/interceptors/index.ts` calls `trackRequest(id)` before every `/api/*` request and `untrackRequest(id)` in the `finally` block. Each tracked request gets a 5-second timer. If the response arrives in time, the timer is cancelled. If not, `isSlowNetwork` becomes `true` and stays `true` until all slow requests complete.

### Notification lifecycle

1. `isSlowNetwork` becomes `true` → show `notification.warning` (deduplicated by fixed ID, persists until removed)
2. `isSlowNetwork` becomes `false` → start a 3-second dismiss timer
3. If `isSlowNetwork` goes back to `true` within those 3 seconds → cancel dismiss, notification stays
4. If the browser goes offline → immediately hide the slow notification (the offline notification takes over)
5. If the browser comes back online and `isSlowNetwork` is still `true` → re-show

## Recipe: Custom Slow-Network Behavior in a Blade

```vue
<script setup lang="ts">
import { watch } from 'vue';
import { useSlowNetworkDetection } from '@vc-shell/framework';

const { isSlowNetwork } = useSlowNetworkDetection();

// Switch to a lightweight polling interval when the network is slow
const pollInterval = computed(() => isSlowNetwork.value ? 30000 : 5000);

// Warn before navigating away during slow network + unsaved changes
watch(isSlowNetwork, (slow) => {
  if (slow) {
    console.info('Network is slow — consider disabling auto-refresh');
  }
});
</script>
```

## Recipe: Tracking a Custom Request Outside the Interceptor

If you bypass the standard fetch interceptor (e.g., direct `XMLHttpRequest` or third-party SDK), you can manually track the request:

```ts
import { useSlowNetworkDetection } from '@vc-shell/framework';

const { trackRequest, untrackRequest } = useSlowNetworkDetection();

async function fetchFromExternalApi(url: string) {
  const id = `custom-${Date.now()}`;
  trackRequest(id);
  try {
    const response = await fetch(url);
    return response.json();
  } finally {
    untrackRequest(id);
  }
}
```

## Tips

- **Singleton by design.** Multiple calls to `useSlowNetworkDetection()` share the same state. No overhead from calling it in many components.
- **The notification cannot stack.** It uses a fixed `notificationId`, so even if multiple requests become slow simultaneously, only one notification is shown.
- **The 3-second dismiss delay prevents flicker.** Without it, a burst of requests completing one-by-one would cause the notification to flash on and off rapidly.
- **`navigator.connection` has limited support.** Only Chromium-based browsers support it. Firefox and Safari users will only get the request-timer channel, which is still effective.
- **The composable does not block requests.** Unlike the offline guard in the interceptor, slow-network detection is purely informational — it never prevents or delays a fetch.

## Common Mistakes

### Calling `trackRequest` without a matching `untrackRequest`

```ts
// Wrong — if the request fails, untrackRequest never runs → permanent slow count
trackRequest(id);
const response = await fetch(url);
untrackRequest(id);

// Correct — always untrack in finally
trackRequest(id);
try {
  const response = await fetch(url);
} finally {
  untrackRequest(id);
}
```

### Using the same ID for multiple requests

```ts
// Wrong — second trackRequest overwrites the first timer
trackRequest("my-request");
trackRequest("my-request");

// Correct — unique IDs
trackRequest("my-request-1");
trackRequest("my-request-2");
```

## Related

- [`useConnectionStatus`](../useConnectionStatus/useConnectionStatus.docs.md) — offline detection (binary online/offline)
- [`registerInterceptors`](../../interceptors/index.ts) — the fetch wrapper that calls `trackRequest`/`untrackRequest`
- `notification` from `@shared/components/notifications` — the notification system used to display the warning
