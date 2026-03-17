# VcSidebar

A slide-over panel for contextual workflows, settings, and detail views. Supports left, right, and bottom positions with animated transitions, focus trapping, scroll locking, and swipe-to-dismiss gestures.

## When to Use

- Settings panels, filter drawers, or contextual detail views.
- Bottom sheet on mobile (with `position="bottom"` and `draggable`).
- Full-screen takeover for complex sub-workflows (`size="full"`).
- When NOT to use: for confirmation dialogs use `VcPopup`; for primary content use `VcBlade`.

## Basic Usage

```vue
<template>
  <VcButton @click="open = true">Open Sidebar</VcButton>

  <VcSidebar v-model="open" title="Settings" position="right" size="md">
    <div class="tw-p-4">Sidebar content</div>

    <template #footer>
      <VcButton @click="open = false">Close</VcButton>
    </template>
  </VcSidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSidebar, VcButton } from "@vc-shell/framework";

const open = ref(false);
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | *required* | Open/close state (v-model). |
| `position` | `"left" \| "right" \| "bottom"` | `"right"` | Slide-in direction. |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | `"sm"` | Panel size preset (300/380/520px or full viewport). |
| `variant` | `"default" \| "elevated" \| "minimal"` | `"default"` | Visual style. |
| `width` | `number \| string` | -- | Custom width override (left/right positions). |
| `height` | `number \| string` | -- | Custom height override (bottom position). |
| `title` | `string` | `""` | Header title text. |
| `subtitle` | `string` | `""` | Header subtitle text. |
| `showOverlay` | `boolean` | `true` | Show backdrop overlay. |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking overlay. |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key. |
| `closeButton` | `boolean` | `true` | Show close button in header. |
| `trapFocus` | `boolean` | `true` | Trap keyboard focus inside panel. |
| `lockScroll` | `boolean` | `true` | Prevent body scroll while open. |
| `inset` | `boolean` | `true` | Add rounded inset gap from viewport edges. |
| `draggable` | `boolean` | `false` | Enable swipe-to-dismiss (bottom only). |
| `dragHandle` | `boolean` | `false` | Show iOS-style drag handle bar. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update. |
| `close` | `SidebarCloseReason` | Reason: `"overlay"`, `"escape"`, or `"action"`. |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Main content area. |
| `header` | `{ close }` | Custom header replacing title + close button. |
| `actions` | `{ close }` | Extra buttons in the header actions area. |
| `footer` | -- | Sticky footer area. |

## Common Patterns

**Bottom sheet with swipe-to-dismiss:**

```vue
<VcSidebar v-model="open" position="bottom" size="md" draggable drag-handle>
  <div class="tw-p-4">Swipe down to close</div>
</VcSidebar>
```

**Elevated variant with custom width:**

```vue
<VcSidebar v-model="open" variant="elevated" :width="480" title="Details">
  <div class="tw-p-5">Content</div>
</VcSidebar>
```

## Accessibility

- Uses `role="dialog"` with `aria-modal` when overlay is shown.
- Focus is trapped inside the panel and restored to the trigger element on close.
- Keyboard: Escape closes, Tab cycles through focusable elements.
- Reduced motion: transitions are disabled when `prefers-reduced-motion` is active.

## Related Components

- **VcPopup** -- centered modal dialog for confirmations and alerts.
- **VcBlade** -- primary content panel in the blade navigation stack.
