---
id: useFunctions-throttle-scroll
type: FRAMEWORK_API
category: composable
tags: [composable, throttle, scroll, performance, events]
complexity: SIMPLE
title: "useFunctions - Throttle for Scroll Events"
description: "Limiting scroll event handler execution for better performance"
---

# useFunctions - Throttle for Scroll Events

The `throttle` function from `useFunctions` limits function execution to once per specified time period. Unlike debounce which waits for events to stop, throttle executes at regular intervals regardless of event frequency.

## Overview

**Key Benefits:**
- Guarantees function executes at most once per time period
- Better for continuous events (scroll, mousemove, resize)
- Maintains responsiveness while controlling execution rate
- Prevents performance degradation from rapid events

**Common Use Cases:**
- Scroll event handlers
- Mouse move tracking
- Window resize handlers
- API rate limiting
- Button click protection

## Debounce vs Throttle

| Feature | Debounce | Throttle |
|---------|----------|----------|
| **Timing** | Waits for events to stop | Executes at regular intervals |
| **Use Case** | Search input, auto-save | Scroll, mousemove, resize |
| **Behavior** | Delays until pause | Limits frequency |
| **Example** | Wait 1s after typing stops | Execute once per 300ms while scrolling |

## Basic Usage

```typescript
import { useFunctions } from '@vc-shell/framework';

const { throttle } = useFunctions();

// Create throttled scroll handler (300ms interval)
const onScroll = throttle((event: Event) => {
  // This will execute at most once every 300ms
  handleScrollPosition();
}, 300);
```

## Complete Example - Infinite Scroll

```vue
<template>
  <VcBlade :title="$t('PRODUCTS.TITLE')">
    <div
      ref="scrollContainer"
      class="tw-overflow-auto tw-h-full"
      @scroll="onScroll"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="tw-p-4 tw-border-b"
      >
        {{ item.name }}
      </div>

      <div v-if="loading" class="tw-text-center tw-p-4">
        {{ $t("PRODUCTS.LOADING") }}
      </div>

      <div v-if="hasMore" ref="loadMoreTrigger" class="tw-h-4" />
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useFunctions } from '@vc-shell/framework';

const { throttle } = useFunctions();

const scrollContainer = ref<HTMLElement>();
const items = ref<any[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);

/**
 * Throttled scroll handler
 * Executes at most once every 300ms while scrolling
 */
const onScroll = throttle((event: Event) => {
  const element = event.target as HTMLElement;
  const scrollHeight = element.scrollHeight;
  const scrollTop = element.scrollTop;
  const clientHeight = element.clientHeight;

  // Check if scrolled near bottom (within 100px)
  const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

  if (nearBottom && !loading.value && hasMore.value) {
    loadMore();
  }
}, 300);

async function loadMore() {
  loading.value = true;
  try {
    const response = await fetchItems({
      page: currentPage.value + 1,
      take: 20,
    });

    items.value.push(...response.items);
    currentPage.value++;
    hasMore.value = response.hasMore;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Load initial data
  const response = await fetchItems({ page: 1, take: 20 });
  items.value = response.items;
  hasMore.value = response.hasMore;
});
</script>
```

## Complete Example - Scroll Position Tracking

```vue
<template>
  <VcBlade>
    <div
      ref="content"
      class="tw-overflow-auto tw-h-full"
      @scroll="onScroll"
    >
      <!-- Show scroll indicator -->
      <div
        v-if="scrollPercentage > 0"
        class="tw-fixed tw-top-0 tw-left-0 tw-h-1 tw-bg-primary"
        :style="{ width: `${scrollPercentage}%` }"
      />

      <!-- Content -->
      <div class="tw-p-4">
        <p>Scrolled: {{ scrollPercentage }}%</p>
        <!-- Long content... -->
      </div>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFunctions } from '@vc-shell/framework';

const { throttle } = useFunctions();

const content = ref<HTMLElement>();
const scrollPercentage = ref(0);

/**
 * Throttled scroll tracker
 * Updates progress bar at most once every 100ms
 */
const onScroll = throttle((event: Event) => {
  const element = event.target as HTMLElement;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight - element.clientHeight;

  scrollPercentage.value = Math.round((scrollTop / scrollHeight) * 100);
}, 100);
</script>
```

## API Parameters

```typescript
throttle(
  func: (...args: any[]) => void,  // Function to throttle
  delay: number                     // Minimum interval in milliseconds
): (...args: unknown[]) => void
```

**Parameters:**
- `func` - Function to execute at intervals
- `delay` - Minimum time between executions in milliseconds

**Returns:** Throttled version of the function

## Common Patterns

### Pattern 1: Scroll with Lazy Loading

```typescript
const onScroll = throttle((event: Event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;

  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadNextPage();
  }
}, 300);
```

### Pattern 2: Window Resize Handler

```typescript
const onResize = throttle(() => {
  // Recalculate layout
  updateDimensions();
  repositionElements();
}, 250);

onMounted(() => {
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});
```

### Pattern 3: Mouse Move Tracking

```typescript
const onMouseMove = throttle((event: MouseEvent) => {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY,
  };
}, 50);
```

### Pattern 4: API Rate Limiting

```typescript
const saveProgress = throttle(async (data: any) => {
  await api.saveProgress(data);
}, 5000); // Save at most once per 5 seconds
```

## Delay Guidelines

| Use Case | Recommended Delay | Reason |
|----------|------------------|--------|
| Scroll events | 250-300ms | Balance between smooth and performant |
| Mouse move | 50-100ms | Needs to feel responsive |
| Window resize | 200-300ms | Layout calculations are expensive |
| API rate limiting | 1000-5000ms | Depends on API limits |
| Button clicks | 1000-2000ms | Prevent double-submission |

## Performance Impact

**Without throttle (scroll event):**
- 60 fps = 60 handler calls per second
- 100+ calls while scrolling 2 seconds
- Can cause UI lag and janky scrolling

**With throttle (300ms):**
- ~3 calls per second
- Smooth scrolling maintained
- 95% reduction in handler executions

## Important Notes

**DO:**
- ✅ Use throttle for continuous events (scroll, mousemove, resize)
- ✅ Choose delay based on use case (50-300ms for UI, 1000+ for API)
- ✅ Clean up event listeners in onUnmounted
- ✅ Test on mobile devices (different scroll performance)

**DON'T:**
- ❌ Don't use throttle for input events (use debounce)
- ❌ Don't set delay too low (< 50ms, defeats purpose)
- ❌ Don't forget to remove event listeners
- ❌ Don't throttle critical user interactions

## Comparison Example

```typescript
// ❌ BAD: Without throttle (executes 100+ times)
element.addEventListener('scroll', (e) => {
  updateScrollIndicator();  // Called continuously
});

// ✅ GOOD: With throttle (executes ~3 times per second)
const { throttle } = useFunctions();
const onScroll = throttle(() => {
  updateScrollIndicator();  // Called max once per 300ms
}, 300);
element.addEventListener('scroll', onScroll);
```

## Related APIs

- `debounce` - Wait for events to stop (search input, auto-save)
- `delay` - Simple delayed execution
- `once` - Execute function only once

## When to Use What

```typescript
// Use DEBOUNCE for:
const onSearch = debounce(search, 1000);        // Search input
const onAutoSave = debounce(save, 3000);        // Auto-save
const onValidate = debounce(validate, 500);     // Form validation

// Use THROTTLE for:
const onScroll = throttle(handleScroll, 300);   // Scroll events
const onResize = throttle(handleResize, 250);   // Window resize
const onMouseMove = throttle(track, 100);       // Mouse tracking
const onSave = throttle(saveAPI, 5000);         // API rate limiting
```

## TypeScript Types

```typescript
interface IUseFunctions {
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => (...args: Parameters<T>) => void;
}
```
