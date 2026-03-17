# VcPopup

A modal dialog component built on HeadlessUI `Dialog`. Supports semantic variants (success, error, warning, info), animated transitions, and configurable dismissal behavior.

## When to Use

- Confirmation dialogs ("Are you sure you want to delete?").
- Alert messages with an icon variant (error, warning, success, info).
- Forms or content that require focused user attention.
- When NOT to use: for side panels use `VcSidebar`; for inline expandable content use blade expansion.

## Basic Usage

```vue
<template>
  <VcButton @click="showPopup = true">Open</VcButton>

  <VcPopup v-model="showPopup" title="Confirm Delete" variant="warning">
    <template #content>
      Are you sure you want to delete this item?
    </template>
    <template #footer="{ close }">
      <VcButton @click="close">Cancel</VcButton>
      <VcButton variant="danger" @click="deleteItem(); close()">Delete</VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcPopup, VcButton } from "@vc-shell/framework";

const showPopup = ref(false);
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | -- | Controlled visibility (v-model). |
| `title` | `string` | -- | Dialog title text. |
| `closable` | `boolean` | `true` | Show close button and allow dismiss. |
| `variant` | `"default" \| "error" \| "warning" \| "success" \| "info"` | `"default"` | Semantic variant with matching icon. |
| `modalWidth` | `string` | `"tw-max-w-md"` | Tailwind max-width class for the panel. |
| `isMobileFullscreen` | `boolean` | `false` | Full-screen mode on mobile. |
| `isFullscreen` | `boolean` | `false` | Full-screen mode on all viewports. |
| `closeOnOverlay` | `boolean` | inherits `closable` | Close when clicking the backdrop. |
| `closeOnEscape` | `boolean` | inherits `closable` | Close when pressing Escape. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update on close. |
| `close` | `PopupCloseReason` | Reason: `"overlay"`, `"escape"`, or `"action"`. |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `header` | -- | Custom header replacing the title. |
| `content` | -- | Dialog body content. |
| `footer` | `{ close }` | Footer area with a `close` function. |

## Accessibility

- Built on HeadlessUI `Dialog` with proper focus trap and `aria-labelledby`.
- Escape key handling respects `closeOnEscape` setting.
- Overlay click respects `closeOnOverlay` setting.

## Related Components

- **VcSidebar** -- slide-over panel for contextual workflows (not modal-centered).
- **VcPopupContainer** -- internal service that manages programmatic popup rendering.
