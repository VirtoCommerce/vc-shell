# useFunctions

Provides lightweight utility functions for timing control: debounce, throttle, delay, and once.

## When to Use

- Need a simple debounce/throttle without pulling in a full utility library
- When NOT to use: prefer `@vueuse/core` equivalents (`useDebounceFn`, `useThrottleFn`) when you need reactive integration or cancellation support

## Basic Usage

```typescript
import { useFunctions } from '@vc-shell/framework';

const { debounce, throttle, delay, once } = useFunctions();

const debouncedSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

const throttledScroll = throttle(() => {
  updatePosition();
}, 100);

// Fire-and-forget delayed execution
delay(() => showTooltip(), 500);

// Ensure a function runs only once
const initOnce = once(() => expensiveSetup());
initOnce(); // runs
initOnce(); // returns cached result
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `debounce` | `(fn, delay: number) => (...args) => void` | Delays invocation until `delay` ms after the last call |
| `throttle` | `(fn, delay: number) => (...args) => void` | Invokes at most once per `delay` ms (leading edge) |
| `delay` | `(fn, ms?: number) => void` | Runs `fn` after `ms` milliseconds (default 0) |
| `once` | `(fn) => (...args) => unknown` | Ensures `fn` executes only once; subsequent calls return the cached result |

## Related

- `@vueuse/core` `useDebounceFn`, `useThrottleFn` -- reactive alternatives with cancel support
