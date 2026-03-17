# VcLoading

A lightweight animated loading overlay that displays a sweeping progress bar over its parent container.

## When to Use

- Show loading state while fetching data for a blade, card, or section
- Overlay a form or table during save/submit operations
- When NOT to use: full-page loading screens (use a page-level spinner instead)

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

## Accessibility

- `role="status"` announces loading state to screen readers
- `aria-busy` reflects the `active` prop
- `aria-live="polite"` provides non-intrusive announcements
- Screen-reader-only text reads "Loading..." when active

## Related Components

- **VcBlade** -- blades use VcLoading internally for their loading state
