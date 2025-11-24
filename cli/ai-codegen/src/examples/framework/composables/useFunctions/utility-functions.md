---
id: useFunctions-utility-functions
type: FRAMEWORK_API
category: composable
tags: [composable, utility, debounce, throttle, delay, once]
complexity: MODERATE
title: "useFunctions - Complete Utility Functions Guide"
description: "Comprehensive guide to all utility functions: debounce, throttle, delay, and once"
---

# useFunctions - Complete Utility Functions Guide

The `useFunctions` composable provides a collection of utility functions for common operations: `debounce`, `throttle`, `delay`, and `once`. Each serves a specific purpose for controlling function execution timing.

## Overview

```typescript
import { useFunctions } from '@vc-shell/framework';

const { debounce, throttle, delay, once } = useFunctions();
```

**Available Functions:**
- `debounce` - Delay execution until events stop
- `throttle` - Limit execution frequency
- `delay` - Execute after specified time
- `once` - Execute only once, cache result

## Function Comparison

| Function | When to Use | Example Use Case | Execution Pattern |
|----------|-------------|------------------|-------------------|
| **debounce** | Events that stop | Search input | Waits for pause, then executes once |
| **throttle** | Continuous events | Scroll handler | Executes at regular intervals |
| **delay** | Deferred execution | Delayed toast | Executes once after timeout |
| **once** | One-time operations | Initialization | Executes first time, caches result |

## debounce - Wait for Events to Stop

**Signature:**
```typescript
debounce(func: Function, delay: number): Function
```

**Use Case:** Search input, auto-save, validation

**Example:**
```typescript
const { debounce } = useFunctions();

// Search handler - waits 1s after typing stops
const onSearch = debounce(async (keyword: string) => {
  await searchAPI({ keyword });
}, 1000);
```

**Timing Diagram:**
```
User types: h...e...l...l...o..[pause 1s]...[API CALL]
            ↑   ↑   ↑   ↑   ↑              ↑
            Events continue, timer resets  Finally executes
```

## throttle - Limit Execution Frequency

**Signature:**
```typescript
throttle(func: Function, delay: number): Function
```

**Use Case:** Scroll events, mouse move, resize

**Example:**
```typescript
const { throttle } = useFunctions();

// Scroll handler - executes max once per 300ms
const onScroll = throttle((event: Event) => {
  handleScrollPosition();
}, 300);
```

**Timing Diagram:**
```
Scroll events: ||||||||||||||||||||||||||||||||
Executions:    ↑      ↑      ↑      ↑      ↑
               0ms    300ms  600ms  900ms  1200ms
```

## delay - Simple Delayed Execution

**Signature:**
```typescript
delay(func: Function, delay?: number): void
```

**Use Case:** Delayed notifications, timeouts, sequential operations

**Example:**
```typescript
const { delay } = useFunctions();

// Show toast after 2 seconds
delay(() => {
  notification.info('Welcome back!');
}, 2000);

// Immediate execution (delay = 0)
delay(() => {
  console.log('Runs on next tick');
});
```

**Use Cases:**
```typescript
// 1. Delayed notification
async function saveData() {
  await api.save(data);
  delay(() => {
    notification.success('Saved!');
  }, 500);
}

// 2. Sequential animations
function showElements() {
  element1.show();
  delay(() => element2.show(), 200);
  delay(() => element3.show(), 400);
}

// 3. Cleanup after operation
function closeDialog() {
  dialog.hide();
  delay(() => {
    dialog.destroy();
  }, 300); // Wait for animation
}
```

## once - Execute Only Once

**Signature:**
```typescript
once(func: Function): Function
```

**Use Case:** One-time initialization, expensive operations caching

**Example:**
```typescript
const { once } = useFunctions();

// Initialize only on first call
const initialize = once(async () => {
  const config = await loadConfig();
  setupApplication(config);
  return config;
});

// First call - executes and caches result
await initialize(); // Loads config

// Subsequent calls - returns cached result
await initialize(); // Returns cached config immediately
```

**Use Cases:**
```typescript
// 1. Lazy initialization
const initializePlugin = once(async () => {
  const plugin = await loadHeavyPlugin();
  return plugin.init();
});

// 2. One-time event handler
const handleFirstClick = once(() => {
  trackEvent('first_interaction');
  showTutorial();
});

// 3. Singleton pattern
const getAppInstance = once(() => {
  return new Application();
});
```

## Complete Example - All Functions Together

```vue
<template>
  <VcBlade :title="title">
    <!-- Search with debounce -->
    <VcInput
      v-model="searchKeyword"
      :placeholder="$t('SEARCH')"
      @update:model-value="onSearch"
    />

    <!-- Scrollable list with throttle -->
    <div
      ref="scrollContainer"
      class="tw-overflow-auto"
      @scroll="onScroll"
    >
      <div v-for="item in items" :key="item.id">
        {{ item.name }}
      </div>
    </div>

    <!-- Button with once (prevent double-click) -->
    <VcButton @click="onInitialize">
      Initialize
    </VcButton>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFunctions, notification } from '@vc-shell/framework';

const { debounce, throttle, delay, once } = useFunctions();

const searchKeyword = ref('');
const items = ref<any[]>([]);

// DEBOUNCE: Search after user stops typing
const onSearch = debounce(async (keyword: string) => {
  items.value = await searchAPI({ keyword });
}, 1000);

// THROTTLE: Handle scroll events efficiently
const onScroll = throttle((event: Event) => {
  const element = event.target as HTMLElement;
  const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;

  if (nearBottom) {
    loadMore();
  }
}, 300);

// ONCE: Initialize only on first click
const onInitialize = once(async () => {
  const config = await loadConfiguration();
  setupApplication(config);

  // DELAY: Show success after initialization
  delay(() => {
    notification.success('Initialized successfully!');
  }, 500);
});

// Load initial data
onMounted(async () => {
  items.value = await loadInitialData();
});
</script>
```

## Choosing the Right Function

### Decision Tree

```
Need to control function execution timing?
│
├─ Events that stop (input, typing)?
│  └─ Use DEBOUNCE
│     Example: Search input, auto-save
│
├─ Continuous events (scroll, move)?
│  └─ Use THROTTLE
│     Example: Scroll handler, resize
│
├─ Need delayed execution?
│  └─ Use DELAY
│     Example: Delayed notification, cleanup
│
└─ Should execute only once?
   └─ Use ONCE
      Example: Initialization, expensive caching
```

### Quick Reference

```typescript
import { useFunctions } from '@vc-shell/framework';
const { debounce, throttle, delay, once } = useFunctions();

// DEBOUNCE - Wait for pause
const search = debounce(apiCall, 1000);        // Search input
const autoSave = debounce(save, 3000);         // Auto-save
const validate = debounce(check, 500);         // Validation

// THROTTLE - Limit frequency
const scroll = throttle(handleScroll, 300);    // Scroll
const resize = throttle(handleResize, 250);    // Resize
const move = throttle(trackMouse, 100);        // Mouse move

// DELAY - Execute later
delay(() => notify(), 2000);                   // Delayed toast
delay(cleanup, 300);                           // After animation

// ONCE - Execute once
const init = once(initialize);                 // Initialization
const load = once(loadHeavyData);             // Expensive op
```

## Performance Guidelines

### Recommended Delays

| Operation | Debounce | Throttle | Reasoning |
|-----------|----------|----------|-----------|
| Search input | 800-1000ms | N/A | User pauses between words |
| Auto-save | 2000-3000ms | N/A | Longer pause ensures intent |
| Validation | 500-800ms | N/A | Quick feedback |
| Scroll | N/A | 250-300ms | Balance smooth/performant |
| Mouse move | N/A | 50-100ms | Needs responsiveness |
| Window resize | N/A | 200-300ms | Layout is expensive |

### Performance Impact Example

```typescript
// ❌ BAD: No control
element.addEventListener('scroll', handleScroll);
// Result: 60+ calls per second, UI lag

// ✅ GOOD: With throttle
const throttled = throttle(handleScroll, 300);
element.addEventListener('scroll', throttled);
// Result: ~3 calls per second, smooth UI
```

## Common Patterns

### Pattern 1: Search with Debounce + Loading State

```typescript
const loading = ref(false);

const onSearch = debounce(async (keyword: string) => {
  loading.value = true;
  try {
    items.value = await searchAPI({ keyword });
  } finally {
    loading.value = false;
  }
}, 1000);
```

### Pattern 2: Scroll with Throttle + Infinite Load

```typescript
const hasMore = ref(true);

const onScroll = throttle((e: Event) => {
  const el = e.target as HTMLElement;
  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

  if (nearBottom && hasMore.value) {
    loadMore();
  }
}, 300);
```

### Pattern 3: Once + Delay Combination

```typescript
const initializeApp = once(async () => {
  await loadConfig();
  await setupPlugins();

  // Show welcome message after initialization
  delay(() => {
    notification.info('Welcome!');
  }, 1000);
});
```

### Pattern 4: Error Handler with Debounce

```typescript
const showError = debounce((message: string) => {
  notification.error(message);
}, 500);

// Multiple errors will be batched
try {
  await operation1();
} catch (e) {
  showError(e.message); // Debounced
}
```

## Important Notes

**DO:**
- ✅ Choose the right function for your use case
- ✅ Use appropriate delay times (see guidelines)
- ✅ Clean up event listeners in onUnmounted
- ✅ Test performance on different devices

**DON'T:**
- ❌ Don't mix up debounce and throttle use cases
- ❌ Don't use very short delays (< 50ms)
- ❌ Don't debounce critical user actions
- ❌ Don't forget to handle cleanup

## TypeScript Types

```typescript
interface IUseFunctions {
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => (...args: Parameters<T>) => void;

  throttle: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => (...args: Parameters<T>) => void;

  delay: (func: (...args: unknown[]) => void, delay?: number) => void;

  once: <T extends (...args: any[]) => void>(
    func: T
  ) => (...args: Parameters<T>) => ReturnType<T>;
}
```

## Related APIs

- `sleep` - Promise-based delay (async/await compatible)
- `useAsync` - Wrapper for async operations with loading states
- `useLoading` - Combine multiple loading states

## Real-World Usage

These patterns are extensively used in vendor-portal:
- Search in lists: `offers-list.vue`, `orders-list.vue`
- Scroll handling: Product galleries, infinite lists
- Initialization: Plugin setup, configuration loading
- Auto-save: Form data, draft saving
