# useFunctions

Provides lightweight utility functions for timing control: debounce, throttle, delay, and once. These are thin, dependency-free implementations that cover the most common use cases without pulling in lodash or other large utility libraries. The composable returns plain functions, not reactive wrappers, making them suitable for event handlers, API calls, and other imperative code paths where you do not need VueUse's reactive cancellation features.

## When to Use

- Need a simple debounce/throttle for search inputs, resize handlers, or scroll listeners
- Want a one-shot initializer that guarantees a function runs exactly once
- Need a quick fire-and-forget delayed execution
- When NOT to use: prefer `@vueuse/core` equivalents (`useDebounceFn`, `useThrottleFn`) when you need reactive integration, automatic cleanup on scope disposal, or cancellation support

## Quick Start

```typescript
import { useFunctions } from "@vc-shell/framework";

const { debounce, throttle, delay, once } = useFunctions();

// Debounce a search input handler
const debouncedSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Throttle a scroll handler to fire at most every 100ms
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// Fire-and-forget delayed execution
delay(() => showTooltip(), 500);

// Ensure a function runs only once (e.g., expensive initialization)
const initOnce = once(() => {
  console.log("This runs exactly once");
  return expensiveSetup();
});
initOnce(); // runs and caches the result
initOnce(); // returns cached result immediately
initOnce(); // still returns cached result
```

## API

### Returns

| Property   | Type                                       | Description                                                                                              |
| ---------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `debounce` | `(fn, delay: number) => (...args) => void` | Delays invocation until `delay` ms after the last call. Each new call resets the timer.                  |
| `throttle` | `(fn, delay: number) => (...args) => void` | Invokes at most once per `delay` ms on the leading edge. Subsequent calls within the window are ignored. |
| `delay`    | `(fn, ms?: number) => void`                | Runs `fn` after `ms` milliseconds (default 0, which defers to the next macrotask via `setTimeout`).      |
| `once`     | `(fn) => (...args) => unknown`             | Ensures `fn` executes only once; subsequent calls return the cached result of the first invocation.      |

## How They Work

- **debounce**: Uses `setTimeout` / `clearTimeout` internally. Each call clears the previous timeout and starts a new one. The function only fires when there is a pause of at least `delay` ms between calls.
- **throttle**: Uses a `Date.now()` timestamp check. The first call fires immediately and records the timestamp. Subsequent calls are silently dropped until enough time has passed.
- **delay**: A simple wrapper around `setTimeout`. Useful for readability when you want to express "do X after Y ms" without creating a raw timeout.
- **once**: Wraps the function with a boolean guard. After the first call, the result is cached and the original function reference is never called again.

## Recipe: Debounced Search in a Blade Toolbar

```vue
<script setup lang="ts">
import { useFunctions } from "@vc-shell/framework";
import { ref } from "vue";

const { debounce } = useFunctions();
const searchQuery = ref("");
const results = ref<Product[]>([]);

const performSearch = debounce(async (query: string) => {
  if (query.length < 2) {
    results.value = [];
    return;
  }
  results.value = await api.searchProducts({ keyword: query });
}, 350);

function onSearchInput(value: string) {
  searchQuery.value = value;
  performSearch(value);
}
</script>

<template>
  <VcBlade title="Products">
    <template #toolbar>
      <VcInput
        :model-value="searchQuery"
        placeholder="Search products..."
        @update:model-value="onSearchInput"
      />
    </template>
    <div
      v-for="product in results"
      :key="product.id"
    >
      {{ product.name }}
    </div>
  </VcBlade>
</template>
```

## Tips

- **No cancellation API.** Unlike `@vueuse/core`'s `useDebounceFn`, the `debounce` here does not return a cancel method. If you need to cancel a pending debounce on component unmount, use VueUse instead or manually clear the timeout.
- **Throttle uses leading-edge firing.** The first call always executes immediately. If you need trailing-edge throttle (fire after the window closes), this implementation does not support it -- use lodash `throttle` with `{ trailing: true }` instead.
- **`once` caches even `undefined` results.** If the wrapped function returns `undefined`, subsequent calls still skip execution and return `undefined`. The guard is based on "has it been called", not "did it return a truthy value".
- **`delay(fn, 0)` is not the same as `nextTick`.** `delay` uses `setTimeout(fn, 0)`, which defers to the next macrotask. Vue's `nextTick` defers to the next microtask, which fires sooner. Use `nextTick` for DOM update timing.

## Related

- `@vueuse/core` `useDebounceFn`, `useThrottleFn` -- reactive alternatives with cancel support and automatic scope cleanup
- `lodash-es` `debounce`, `throttle` -- feature-rich alternatives with leading/trailing edge options
