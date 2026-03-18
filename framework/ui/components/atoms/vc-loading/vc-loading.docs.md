# VcLoading

A lightweight animated loading overlay that displays a sweeping progress bar over its parent container. The overlay uses a translucent backdrop with a subtle blur effect, drawing user attention to the animated bar while keeping the underlying content partially visible so users retain context about what is loading.

## When to Use

- Show loading state while fetching data for a blade, card, or section
- Overlay a form or table during save/submit operations
- Indicate background processing after a user action (e.g., bulk update)
- When NOT to use: full-page loading screens (use a page-level spinner instead); determinate progress with a known percentage (use [VcProgress](../vc-progress/) instead)

## Basic Usage

```vue
<template>
  <div style="position: relative; height: 300px;">
    <VcLoading :active="isLoading" />
    <p>Your content here</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLoading } from "@vc-shell/framework";

const isLoading = ref(true);
</script>
```

> **Important:** The parent container must have `position: relative` (or `absolute`/`fixed`) so the overlay positions correctly. VcLoading uses `position: absolute` internally.

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | Controls overlay visibility |

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--loading-bar-color` | `var(--primary-500)` | Progress bar fill color |
| `--loading-bar-track` | `var(--primary-100)` | Progress bar track background |
| `--loading-overlay-bg` | `rgba(255,255,255,0.6)` | Overlay background color |
| `--loading-bar-width` | `140px` | Width of the progress bar |
| `--loading-bar-height` | `4px` | Height of the progress bar |
| `--loading-z-index` | `9998` | Z-index of the overlay layer |

## Recipe: Loading State in a Blade

Blades have a built-in loading mechanism, but you can use VcLoading to cover a specific section within a blade body — for example, loading a chart or a related-items panel independently.

```vue
<template>
  <VcBlade title="Product Details">
    <div class="tw-relative tw-min-h-[200px]">
      <VcLoading :active="isLoadingChart" />
      <RevenueChart v-if="chartData" :data="chartData" />
    </div>

    <!-- The rest of the blade loads independently -->
    <VcInput v-model="product.name" label="Name" />
  </VcBlade>
</template>
```

## Recipe: Toggle Loading on Async Operations

```vue
<script setup lang="ts">
import { ref } from "vue";

const isLoading = ref(false);

async function fetchData() {
  isLoading.value = true;
  try {
    await api.loadProducts();
  } finally {
    isLoading.value = false;
  }
}
</script>
```

## Recipe: Custom Brand Color

Override the bar color to match a specific status or brand theme:

```vue
<template>
  <div class="tw-relative tw-h-40" style="--loading-bar-color: var(--success-500); --loading-bar-track: var(--success-100);">
    <VcLoading :active="isSaving" />
    <span>Saving changes...</span>
  </div>
</template>
```

## Tips

- VcLoading is hidden with `display: none` when inactive, so it adds zero layout cost when idle.
- The sweep animation runs on a 1.5-second infinite loop using CSS `@keyframes` — no JavaScript timers involved.
- The overlay applies `backdrop-filter: blur(3px)` for a frosted-glass effect. If you need a fully opaque overlay, set `--loading-overlay-bg: rgba(255,255,255,1)`.
- When using inside a scrollable container, the overlay covers only the visible viewport of that container because it is absolutely positioned.

## Accessibility

- `role="status"` announces loading state to screen readers
- `aria-busy` reflects the `active` prop
- `aria-live="polite"` provides non-intrusive announcements
- Screen-reader-only text reads "Loading..." when active

## Related Components

- **VcBlade** -- blades use VcLoading internally for their loading state
- [VcProgress](../vc-progress/) -- determinate progress bar when percentage is known
