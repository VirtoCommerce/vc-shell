# VcScrollableContainer

A container component that wraps overflowing content with auto-hiding scroll arrows at the top and bottom edges.

## When to Use

- Constrained-height menus, sidebars, or dropdown panels where a native scrollbar is undesirable
- Lists inside blades or popups that need subtle scroll affordance
- When NOT to use: full-page scroll areas where a native scrollbar is expected

## Basic Usage

```vue
<template>
  <VcScrollableContainer style="height: 200px;">
    <div v-for="i in 30" :key="i" class="tw-px-3 tw-py-2">
      Item {{ i }}
    </div>
  </VcScrollableContainer>
</template>

<script setup lang="ts">
import { VcScrollableContainer } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `2` | Scroll speed in px/frame. Captured once at mount (not reactive). |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Content rendered inside the scrollable viewport |
| `arrow-up` | Custom up-arrow indicator (replaces default chevron) |
| `arrow-down` | Custom down-arrow indicator (replaces default chevron) |

## Exposed

| Property | Type | Description |
|----------|------|-------------|
| `viewportRef` | `Ref<HTMLElement \| null>` | Direct reference to the viewport DOM element |
| `updateScrollState` | `() => void` | Manually recalculate arrow visibility |

## Accessibility

- `role="region"` with `aria-label="Scrollable content"` on the root element
- Viewport is focusable (`tabindex="0"`) for keyboard navigation
- Up/Down arrow keys scroll content in discrete steps (40px)
- Scroll-arrow indicators are `aria-hidden="true"`

## Related Components

- **VcIcon** -- used internally for the default chevron arrows
