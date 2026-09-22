---
title: useSlowNetworkDetection
category: composables
group: ui-state
internal: true
---

# useSlowNetworkDetection

Detects slow network conditions and publishes them as the `vc-slow-network` class on `<html>`, which the framework renders as a 2px sweep along the top edge of the viewport. Two detection channels work together: a **proactive** channel reads `navigator.connection.effectiveType` to catch weak connections before any request is made, and a **reactive** channel flags idempotent API requests that have been pending for more than 10 seconds. The class is removed with a 3-second delay after conditions clear, preventing flicker. When the browser goes fully offline, the class is dropped in favor of the offline notification from `useConnectionStatus`.

A slow network is a state, not an event, so it is never announced as a toast: a dismissable one reappears on every action that outruns the threshold, and a sticky one sits on the screen for the whole session on a 2g connection (VCST-6045).

Like `useConnectionStatus`, this is a module-level singleton — calling it from multiple components shares the same state and listeners.

## When to Use

- Reactively check `isSlowNetwork` to show skeleton loaders, disable auto-refresh, or display inline warnings
- The `vc-slow-network` class is automatic — no extra code needed beyond calling the composable once at app startup (already done in `framework/index.ts`)
- Use `trackRequest` / `untrackRequest` only if you have custom fetch logic outside the standard interceptor (the built-in fetch interceptor already tracks idempotent `/api/*` requests)
- When NOT to use: for offline detection (use `useConnectionStatus` instead) or for measuring exact latency/bandwidth

## Quick Start

The composable is initialized automatically at app startup. To reactively read the slow-network state in a component:

```vue
<script setup lang="ts">
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

const { isSlowNetwork } = useSlowNetworkDetection();
</script>

<template>
  <VcBlade title="Products">
    <VcBanner
      v-if="isSlowNetwork"
      variant="warning"
      icon="lucide-wifi"
    >
      <template #title>Slow connection</template>
      Loading may take longer than usual.
    </VcBanner>

    <!-- blade content -->
  </VcBlade>
</template>
```

## API

### Returns

| Property         | Type                     | Description                                                                     |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `isSlowNetwork`  | `Readonly<Ref<boolean>>` | `true` when the network is slow (either channel active). Read-only.             |
| `trackRequest`   | `(id: string) => void`   | Start tracking a request. If it isn't untracked within 10 s, it counts as slow. |
| `untrackRequest` | `(id: string) => void`   | Stop tracking a request. Cancels the timer or decrements the slow count.        |

<!-- internal:start -->

### Internal Constants

These are module-private `const` declarations, not exported symbols — do not `import` them. They document the thresholds baked into the composable.

| Name                        | Value               | Purpose                                          |
| --------------------------- | ------------------- | ------------------------------------------------ |
| `SLOW_REQUEST_THRESHOLD_MS` | `10000`             | Time before a pending request is considered slow |
| `DISMISS_DELAY_MS`          | `3000`              | Delay before dropping the class after recovery   |
| `SLOW_EFFECTIVE_TYPES`      | `["slow-2g", "2g"]` | Connection types flagged as slow                 |
| `SLOW_NETWORK_CLASS`        | `"vc-slow-network"` | Class the state is published as, on `<html>`     |

## How It Works

### Channel 1: effectiveType (proactive)

On first call, the composable checks `navigator.connection.effectiveType` (Network Information API). If the browser reports `slow-2g` or `2g`, `isSlowNetwork` becomes `true` immediately. A `change` event listener keeps the state in sync. Browsers without this API (Firefox, Safari) silently skip this channel.

### Channel 2: Request timers (reactive)

The fetch interceptor in `framework/core/interceptors/index.ts` calls `trackRequest(id)` before every idempotent `/api/*` request (GET and HEAD) and `untrackRequest(id)` in the `finally` block. An upload or any other mutation is left out: its duration is the operator's uplink, not a stalled server, and a large file would otherwise claim the network is slow every time. Each tracked request gets a 10-second timer. If the response arrives in time, the timer is cancelled. If not, `isSlowNetwork` becomes `true` and stays `true` until all slow requests complete.

### Class lifecycle

1. `isSlowNetwork` becomes `true` → add `vc-slow-network` to `<html>`, and the bar appears
2. `isSlowNetwork` becomes `false` → start a 3-second removal timer
3. If `isSlowNetwork` goes back to `true` within those 3 seconds → cancel removal, the class stays
4. If the browser goes offline → remove the class at once (the offline notification takes over)
5. If the browser comes back online and `isSlowNetwork` is still `true` → add it again
<!-- internal:end -->

## Recipe: Custom Slow-Network Behavior in a Blade

```vue
<script setup lang="ts">
import { watch } from "vue";
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

const { isSlowNetwork } = useSlowNetworkDetection();

// Switch to a lightweight polling interval when the network is slow
const pollInterval = computed(() => (isSlowNetwork.value ? 30000 : 5000));

// Warn before navigating away during slow network + unsaved changes
watch(isSlowNetwork, (slow) => {
  if (slow) {
    console.info("Network is slow — consider disabling auto-refresh");
  }
});
</script>
```

## Recipe: Tracking a Custom Request Outside the Interceptor

If you bypass the standard fetch interceptor (e.g., direct `XMLHttpRequest` or third-party SDK), you can manually track the request:

```ts
import { useSlowNetworkDetection } from "@core/composables/useSlowNetworkDetection";

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
- **The state cannot stack.** A class is present or it is not, so concurrent slow requests read as one state.
- **The 3-second removal delay prevents flicker.** Without it, a burst of requests completing one-by-one would toggle the class on and off rapidly.
- **The bar lives in one CSS rule.** `framework/assets/styles/index.scss` draws it next to the `html.vc-offline` rule, so an app can restyle or suppress it without touching the composable. Under `prefers-reduced-motion` it becomes a static line.
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
- [`registerInterceptors`](https://github.com/VirtoCommerce/vc-shell/blob/main/framework/core/interceptors/index.ts) — the fetch wrapper that calls `trackRequest`/`untrackRequest`
- `framework/assets/styles/index.scss` — the top-edge sweep this class renders as, alongside the `html.vc-offline` rule
